# Rhema BTC Q&A Portal — Product Documentation

**Document type:** Product & Functional Specification  
**Audience:** Product Managers, Stakeholders, Onboarding Team  
**Last updated:** 2025  

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Access Levels](#2-user-roles--access-levels)
3. [System Setup — Super Admin](#3-system-setup--super-admin)
4. [Running a Session — Campus Admin](#4-running-a-session--campus-admin)
5. [Participating in a Session — Student](#5-participating-in-a-session--student)
6. [The Projector View](#6-the-projector-view)
7. [Real-Time Behaviour](#7-real-time-behaviour)
8. [Session Lifecycle](#8-session-lifecycle)
9. [Data & Privacy](#9-data--privacy)
10. [Constraints & Business Rules](#10-constraints--business-rules)
11. [Error States & Edge Cases](#11-error-states--edge-cases)
12. [Glossary](#12-glossary)

---

## 1. Product Overview

The Rhema BTC Q&A Portal is a live, web-based question-and-answer platform designed for use during classroom sessions at Rhema Bible Training Center. It replaces paper-based or verbal question collection with a structured, real-time digital system.

### The core problem it solves

In a large classroom, students are often reluctant to ask questions verbally, questions get lost, and instructors have no way to prioritise what the class most wants answered. This platform gives every student a voice, surfaces the most popular questions automatically, and gives instructors a clean interface to manage and present them.

### How it works in one paragraph

A campus admin opens a session before class begins. Students scan a QR code or visit a URL on their phone, enter their name (or stay anonymous), and submit a question. Other students can upvote questions they also want answered. The admin sees all questions in real time, can project any question to a screen at the front of the room, and can export the full list to a PowerPoint file after class. Sessions close automatically at a pre-set time, or the admin can close them early.

---

## 2. User Roles & Access Levels

There are three distinct roles in the system. Each has a separate login flow and a separate set of capabilities.

---

### 2.1 Student

**How they access the system**  
Students do not create accounts and do not log in. They visit a URL in the format `/student/{campus}/{level}` — either by scanning a QR code displayed in the classroom or by typing the URL directly. The first time they visit, they are asked for their name. They can provide one or choose to remain anonymous. This preference is saved in their browser and remembered on future visits.

**What they can do**
- Submit one question per open session
- See all questions submitted by the class in real time
- Upvote questions submitted by other students (one upvote per question)
- See which question is currently being projected on the classroom screen

**What they cannot do**
- Submit more than one question per session
- Upvote their own question
- Delete or edit their question after submission
- Access any admin functionality

**Identity**  
Each student is assigned a random unique identifier (UUID) that is stored in their browser's local storage. This is how the system knows which questions belong to them and which questions they have already voted on. This identifier is not linked to any personal account — it exists only in the student's browser.

---

### 2.2 Campus Admin

**How they access the system**  
Campus admins log in at `/admin/login`. They select their campus, select their level (e.g. Level 1 or Level 2), and enter a password. Passwords are set by the Super Admin. Upon successful login, a secure token is stored in the browser and the admin is redirected to the dashboard. The token expires according to the JWT configuration.

**What they can do**
- Open a new session with a topic, instructor name, class dates, and an auto-close time
- View and manage the most recent session in real time
- Project any question to the classroom screen
- Open a fullscreen projector view in a separate browser window
- Project the session QR code to the screen so students can join
- Download a QR code image with joining instructions
- Export all questions to a PowerPoint (.pptx) file, sorted by votes
- Close a session early
- Browse all past sessions and view their questions
- Delete individual questions
- Delete past sessions

**Scope of access**  
A campus admin can only see and manage sessions and questions for their specific campus and level. An admin for "Ikeja Campus — Level 1" cannot see anything from "Ikeja Campus — Level 2" or any other campus.

---

### 2.3 Super Admin

**How they access the system**  
The Super Admin logs in at `/super-admin/login` using a single global password configured on the server. There is only one Super Admin account for the entire system.

**What they can do**
- View a live overview dashboard showing stats across all campuses: total campuses, active sessions, questions submitted today, upvotes today
- See the status (open/closed) of every level at every campus in real time
- Create new campuses
- Set or reset the login password for any campus admin (any campus, any level)

**What they cannot do**
- View the content of individual questions
- Manage sessions directly
- Delete campuses or levels

---

## 3. System Setup — Super Admin

Before any campus admin can log in or any student can participate, the Super Admin must complete the initial setup. This is a one-time process per campus.

### Step 1 — Log in as Super Admin

Navigate to `/super-admin/login` and enter the Super Admin password. This password is set by the technical team in the server environment and cannot be changed from within the application.

### Step 2 — Create a campus

Go to the **Campuses & Admins** page. Enter the campus name (e.g. "Ikeja") and click **Create**. The system automatically generates a URL-safe identifier from the name (e.g. `ikeja`) and creates the campus with two default levels: Level 1 and Level 2.

> Every campus is created with Level 1 and Level 2 by default. Additional levels require a code change by the development team.

### Step 3 — Set admin passwords

On the same **Campuses & Admins** page, each campus card shows its configured levels. Click **Set password** next to a level, enter a password (minimum 6 characters), confirm it, and save. This password is what the campus admin for that level will use to log in.

Passwords can be reset at any time by the Super Admin using the same flow. The old password is immediately invalidated.

### Step 4 — Share credentials with campus admins

The Super Admin communicates the campus name, level, and password to the relevant campus admin through a secure channel outside the application (e.g. in person or via a secure message). The application has no built-in mechanism for distributing credentials.

---

## 4. Running a Session — Campus Admin

### 4.1 Logging in

Navigate to `/admin/login`. Select the campus from the dropdown, select the level, enter the password, and click **Sign in**. On success, the admin is taken to the dashboard.

### 4.2 The Admin Dashboard

The dashboard has three tabs:

| Tab | Purpose |
|---|---|
| **Latest Session** | View and manage the most recently created session |
| **Create Session** | Open a new session |
| **Past Sessions** | Browse all closed sessions |

---

### 4.3 Creating a Session

Click the **Create Session** tab and fill in the form:

| Field | Description |
|---|---|
| **Topic / Subject** | The lesson or sermon topic (e.g. "The Faith of Abraham") |
| **Instructor** | The name of the person teaching |
| **Saturday date** | The first class date for this weekend |
| **Sunday date** | The second class date for this weekend |
| **Close time** | The time today at which the session will automatically stop accepting questions |

Click **Open session**. The system checks that no other session is already open for this campus and level. If one is, it will reject the request with an error. Once created, the dashboard switches automatically to the **Latest Session** tab.

> The close time is always set relative to today's date. If a session is created on Saturday at 10:00 AM with a close time of 14:00, it will auto-close at 2:00 PM that same day.

---

### 4.4 Managing a Live Session

The **Latest Session** tab shows the full session management view, divided into three areas:

**Left — Session header (pinned)**  
Shows the topic, instructor, class dates, and the session's open/closed status. If the session is open, a **Close early** button is available.

**Middle — Questions feed (scrollable)**  
Shows all questions submitted by students, with live stats at the top (total questions, total votes, highest vote count on a single question). Questions can be sorted by newest first or by most votes. Each question card shows:
- The question text
- The author's name (or "Anonymous")
- The time it was submitted
- The current vote count
- A **Project** button to display it on the classroom screen
- A **Remove** button to delete it

Two action buttons sit above the question list:
- **Export Questions to PowerPoint** — generates a `.pptx` file with one question per slide, sorted by votes, ready for classroom review
- **Open Web Projector** — opens the projector view in a new browser window

**Right — Timer and QR panel (pinned)**  
- A countdown timer showing how long until the session auto-closes, colour-coded: green (normal), amber (under 2 minutes), red and pulsing (under 30 seconds)
- The student QR code with a copyable URL
- A **Project QR** button to display the QR code on the classroom screen
- A **Download** button to save a full-size QR code image with joining instructions

---

### 4.5 Projecting a Question

Click the **Project** button on any question card. This does two things simultaneously:
1. Marks the question as "projected" in the database — the student who asked it will see a "Projected" badge on their screen in real time
2. Opens (or updates) the projector window to display that question fullscreen

Only one question can be projected at a time. Clicking **Project** on a second question automatically un-projects the first.

Clicking **Project** on an already-projected question toggles it off.

---

### 4.6 Projecting the QR Code

Click **Project QR** in the right sidebar. The projector window opens (or switches) to display the session QR code fullscreen, so students who haven't joined yet can scan it.

---

### 4.7 Exporting to PowerPoint

Click **Export Questions to PowerPoint**. The system generates a `.pptx` file locally in the browser — no server request is made. Each slide contains one question, the author's name, and a slide counter. Questions are ordered by vote count, highest first. The file is named after the session topic.

This is intended for use after the session closes, as a record of what was asked and a resource for follow-up.

---

### 4.8 Closing a Session

**Automatic close:** The session closes automatically at the time set when it was created. A background job runs every minute and closes any session whose close time has passed.

**Manual close:** Click **Close early** in the session header. A confirmation dialog appears. Confirm to close immediately. Once closed, students can no longer submit questions or upvotes, and the session moves to the Past Sessions list.

---

### 4.9 Browsing Past Sessions

Click the **Past Sessions** tab. A table lists all closed sessions with their topic, instructor, class dates, question count, and total votes.

Click any row to open a detail panel on the right. The detail panel shows the full session view — the same layout as the Latest Session tab — with all questions, stats, QR panel, and export options. The session list on the left narrows to show only session names, allowing quick switching between sessions.

Click **Back to list** or click the same row again to close the detail panel.

Questions in past sessions can still be deleted and projected from this view.

---

### 4.10 Logging Out

Click **Sign out** in the top-right corner of the header. The auth token is removed from the browser and the admin is redirected to the login page.

---

## 5. Participating in a Session — Student

### 5.1 Joining

Students join by scanning the QR code displayed in the classroom or by visiting the URL directly. The URL format is:

```
https://{domain}/student/{campus-id}/{level}
```

For example: `https://rhemabtc.app/student/ikeja/level-1`

### 5.2 Setting a name

On first visit, the student is asked "What should we call you?" They can:
- Type a name and click **Continue**
- Click **Stay anonymous** to participate without a name

This choice is saved in the browser. On future visits to the same URL, the name prompt is skipped. The name is attached to any questions the student submits and is visible to other students and the admin.

### 5.3 When there is no active session

If no session has ever been created for this campus and level, or if the most recent session is closed, the student sees a "No session active" message. They cannot submit questions. They should wait for the admin to open a session.

### 5.4 Submitting a question

When a session is open, a text area appears at the top of the page. The student types their question and clicks **Submit**. The question appears immediately in the live feed for all participants.

Each student can submit only one question per session. After submitting, the text area is replaced by a read-only card showing their question and its current vote count.

### 5.5 Upvoting

Students can upvote any question that is not their own. Each student can upvote each question only once. Clicking the upvote button on a question they have already voted on has no effect. The vote count updates in real time for all participants.

### 5.6 The live feed

All questions are displayed below the submission form, sorted by vote count (highest first), with ties broken by submission time (newest first). The feed updates in real time as new questions are submitted and votes are cast — no page refresh is needed.

If a question is currently being projected on the classroom screen, it shows a "Projected" badge.

### 5.7 When a session closes

When the session closes (either automatically or by the admin), the submission form disappears and the session status badge changes to "Closed". Students can still see all the questions that were submitted, but cannot submit new ones or upvote.

---

## 6. The Projector View

The projector view is a fullscreen display intended to be shown on a classroom screen or projector. It is opened by the admin from the dashboard and runs in a separate browser window.

### Question mode

Displays the projected question in large text, centred on screen, with the author's name below it. The display updates automatically when the admin projects a different question — the admin does not need to interact with the projector window after opening it.

### QR code mode

Displays the session QR code and the join URL in large format, so students at the back of the room can scan it. This mode is activated by clicking **Project QR** in the admin dashboard.

### Switching modes

The projector window responds to changes made in the admin dashboard in real time. The admin controls everything from the dashboard; the projector window is purely a display.

---

## 7. Real-Time Behaviour

The application uses Convex as its backend, which provides real-time data synchronisation via WebSocket connections. This means:

- When a student submits a question, it appears on every other student's screen and on the admin dashboard within milliseconds — no refresh required
- When a student upvotes a question, the vote count updates for everyone simultaneously
- When the admin projects a question, the "Projected" badge appears on the student's screen and the projector window updates immediately
- When the admin closes a session, the submission form disappears from all student screens at the same time
- The admin's countdown timer is calculated client-side from the stored close timestamp, so it stays accurate without any server polling

---

## 8. Session Lifecycle

A session moves through the following states:

```
[Created & Open]
      │
      ├─── Students submit questions and upvote
      ├─── Admin manages questions in real time
      │
      ▼
[Closed]  ←── Auto-close (background job, runs every minute)
              ←── Manual close (admin clicks "Close early")
      │
      ▼
[Past Session]  ←── Visible in Past Sessions tab
                    Admin can still view, export, project, and delete questions
```

Once a session is closed it cannot be reopened. A new session must be created for the next class.

Only one session can be open at a time per campus per level. Attempting to create a session while one is already open will produce an error.

---

## 9. Data & Privacy

### Student identity

Students are not required to create accounts or provide any verified personal information. The UUID stored in their browser is randomly generated and not linked to any external identity. If a student clears their browser data, they receive a new UUID and are treated as a new participant.

### Names

Student names are optional and self-reported. The system stores whatever the student types. Names are visible to other students in the question feed and to the admin in the dashboard.

### Question content

All questions are stored in the Convex database and are associated with the session, campus, level, and the student's UUID. Questions persist indefinitely until a session is deleted by an admin.

### Deletion

When an admin deletes a session, all questions belonging to that session are permanently deleted from the database. Individual questions can also be deleted by the admin without deleting the session.

### Admin credentials

Admin passwords are hashed using bcrypt before being stored. Plain-text passwords are never stored in the database. The Super Admin password is stored as an environment variable on the server and is never written to the database.

---

## 10. Constraints & Business Rules

| Rule | Detail |
|---|---|
| One open session per campus/level | A new session cannot be created if one is already open for that campus and level |
| One question per student per session | Enforced by the student's UUID — the system checks before inserting |
| One upvote per student per question | The `votedBy` array is checked before incrementing the vote count |
| Students cannot upvote their own question | The system compares the voter's UUID to the question author's UUID |
| Sessions auto-close | A background job runs every 60 seconds and closes any session whose close time has passed |
| Close time is same-day | The close time field sets the hour and minute for today's date — it cannot be set for a future date |
| Passwords minimum 6 characters | Enforced in the Super Admin UI when setting campus admin passwords |
| Campus IDs are URL-safe slugs | Generated automatically from the campus name by replacing non-alphanumeric characters with hyphens |

---

## 11. Error States & Edge Cases

| Scenario | What happens |
|---|---|
| Student visits URL for a campus/level that doesn't exist | The session query returns null and the student sees "No session active" |
| Student submits a question after the session closes | The submit button is disabled and the form is hidden when `isOpen` is false |
| Admin tries to create a session while one is already open | Convex returns an error and a toast notification is shown: "A session is already open" |
| Admin token expires or is invalid | On next page load, the token fails to decode and the admin is redirected to the login page |
| Super Admin password is not set in environment | The login server function throws "Server not configured correctly" |
| Student clears browser storage mid-session | They receive a new UUID, lose their submitted question association, and can submit again |
| Admin closes the projector window | The next time they click Project or Project QR, a new projector window opens automatically |
| Session close time is set in the past | The background job will close it within the next 60 seconds |

---

## 12. Glossary

| Term | Definition |
|---|---|
| **Session** | A timed window during which students can submit and vote on questions, associated with a specific campus, level, topic, and instructor |
| **Campus** | A physical Rhema BTC location (e.g. Ikeja, Abuja), each with its own admin credentials and sessions |
| **Level** | A class grouping within a campus (e.g. Level 1, Level 2), each managed independently |
| **UUID** | A randomly generated unique identifier stored in the student's browser to track their identity without requiring an account |
| **Projected** | The state of a question that is currently being displayed fullscreen on the classroom projector |
| **Close time** | The time at which a session automatically stops accepting questions |
| **JWT** | JSON Web Token — a secure, signed credential stored in the browser after admin login, used to authenticate subsequent requests |
| **Convex** | The backend platform used for the database and real-time data synchronisation |
| **PPTX export** | A PowerPoint file generated in the browser containing all session questions, one per slide, sorted by votes |
| **Super Admin** | The single global administrator who manages campuses and sets admin passwords across the entire system |
| **Campus Admin** | An administrator scoped to a single campus and level, responsible for running sessions |
