# Rhema BTC — Student Q&A Portal

A real-time classroom Q&A platform for Rhema Bible Training Center. Students scan a QR code or visit a URL to submit questions during a session. Instructors manage sessions, project questions, and export them to PowerPoint — all from a live admin dashboard.

---

## Tech Stack

| Layer               | Technology                                                        |
| ------------------- | ----------------------------------------------------------------- |
| Framework           | [TanStack Start](https://tanstack.com/start) (React, SSR)         |
| Routing             | [TanStack Router](https://tanstack.com/router) (file-based)       |
| Database / Realtime | [Convex](https://convex.dev)                                      |
| Styling             | [Tailwind CSS v4](https://tailwindcss.com)                        |
| Auth                | JWT via `jose` (server functions) + `bcryptjs` (password hashing) |
| Runtime             | [Bun](https://bun.sh)                                             |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- A [Convex](https://dashboard.convex.dev) account and project

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Convex
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud

# Auth — generate both with: openssl rand -base64 32
AUTH_SECRET=your_access_token_secret_here
REFRESH_SECRET=your_refresh_token_secret_here

# Super admin password (plain text, set once)
SUPER_ADMIN_PASSWORD=your_super_admin_password
```

### Run Development

```bash
# Start Convex backend (in one terminal)
bunx convex dev

# Start the app (in another terminal)
bun --bun run dev
```

---

## Project Structure

```
src/
├── routes/                        # File-based routes (TanStack Router)
│   ├── __root.tsx                 # Root layout, providers, global head
│   ├── index.tsx                  # Homepage — campus & level selection
│   ├── student/
│   │   └── $campusId/$level.tsx   # Student Q&A view (live session)
│   ├── admin/
│   │   ├── login.tsx              # Campus admin login
│   │   └── index.tsx              # Admin dashboard (3 tabs)
│   ├── super-admin/
│   │   ├── login.tsx              # Super admin login
│   │   ├── index.tsx              # Overview — live stats across all campuses
│   │   └── campuses.tsx           # Manage campuses & set admin passwords
│   └── projector/
│       └── $campusId/$level.tsx   # Fullscreen projector view
│
├── components/
│   ├── ui/                        # Primitives (Dialog)
│   ├── StatusDot.tsx
│   └── features/
│       ├── admin-layout/          # AdminHeader
│       ├── sessions/              # ActiveSessionView, CreateSessionForm,
│       │                          # PastSessionsList, QrExportPanel
│       ├── questions/             # QuestionsList (with PPTX export)
│       └── super-admin/           # SuperAdminLayout, StatCard,
│                                  # CampusOverviewCard, CampusCard,
│                                  # CreateCampusForm, SetPasswordModal
│
├── hooks/
│   └── use-countdown.ts           # Countdown timer hook
│
├── utils/
│   └── date-helpers.ts            # getPreviousWeekend()
│
├── server/
│   └── auth.ts                    # signToken / verifyToken (jose)
│
├── config/
│   └── campuses.ts                # LEVELS config
│
└── styles.css                     # Tailwind + global tokens

convex/
├── schema.ts                      # Database schema
├── campuses.ts                    # Campus queries & mutations
├── sessions.ts                    # Session queries & mutations
├── questions.ts                   # Question queries & mutations
├── admins.ts                      # Admin queries & mutations
├── adminActions.ts                # Server actions (bcrypt password hashing)
├── dashboard.ts                   # Aggregated stats query
└── crons.ts                       # Scheduled jobs (auto-close sessions)
```

---

## User Roles

### Student (`/student/:campusId/:level`)

- No login required
- Identified by a UUID stored in `localStorage`
- Can submit one question per session
- Can upvote other students' questions
- Sees live question feed sorted by votes

### Campus Admin (`/admin`)

- Logs in with campus + level + password
- Authenticated via JWT stored in `localStorage`
- **Latest Session tab** — view and manage the most recent session: project questions to screen, export to PowerPoint, download QR code, close session early
- **Create Session tab** — open a new session with topic, instructor, class dates, and auto-close time
- **Past Sessions tab** — browse previous sessions; click any row to open a full detail view with all questions

### Super Admin (`/super-admin`)

- Single global password (set via `SUPER_ADMIN_PASSWORD` env var)
- **Overview** — live stats: total campuses, active sessions, questions today, upvotes today; per-campus level status
- **Campuses & Admins** — create new campuses, set/reset admin passwords per campus per level

---

## Routes & Metadata

| Route                         | Title                            | Access      |
| ----------------------------- | -------------------------------- | ----------- |
| `/`                           | Rhema BTC — Student Q&A          | Public      |
| `/student/:campusId/:level`   | Q&A Session — Rhema BTC          | Public      |
| `/admin/login`                | Admin Sign In — Rhema BTC        | Public      |
| `/admin`                      | Admin Dashboard — Rhema BTC      | JWT (admin) |
| `/super-admin/login`          | Super Admin — Rhema BTC          | Public      |
| `/super-admin`                | Super Admin Overview — Rhema BTC | JWT (super) |
| `/super-admin/campuses`       | Campuses & Admins — Rhema BTC    | JWT (super) |
| `/projector/:campusId/:level` | Projector — Rhema BTC            | Internal    |

All admin and super-admin routes are tagged `noindex, nofollow`.

---

## Database Schema (Convex)

### `campuses`

| Field    | Type                                       |
| -------- | ------------------------------------------ |
| `id`     | `string` — URL-safe slug                   |
| `name`   | `string` — display name                    |
| `levels` | `string[]` — e.g. `["level-1", "level-2"]` |

### `sessions`

| Field        | Type                          |
| ------------ | ----------------------------- |
| `campusId`   | `string`                      |
| `level`      | `string`                      |
| `topic`      | `string`                      |
| `instructor` | `string`                      |
| `classDates` | `string[]` — ISO date strings |
| `isOpen`     | `boolean`                     |
| `closeAt`    | `number` — Unix timestamp     |
| `createdAt`  | `number`                      |

### `questions`

| Field         | Type                       |
| ------------- | -------------------------- |
| `sessionId`   | `Id<"sessions">`           |
| `campusId`    | `string`                   |
| `level`       | `string`                   |
| `text`        | `string`                   |
| `authorName`  | `string \| null`           |
| `submittedBy` | `string` — student UUID    |
| `votes`       | `number`                   |
| `votedBy`     | `string[]` — student UUIDs |
| `isProjected` | `boolean`                  |
| `createdAt`   | `number`                   |

### `admins`

| Field          | Type              |
| -------------- | ----------------- |
| `campusId`     | `string`          |
| `level`        | `string`          |
| `passwordHash` | `string` — bcrypt |
| `createdAt`    | `number`          |

---

## Building for Production

```bash
bun --bun run build
```

---

## Testing

```bash
bun --bun run test
```

---

## Linting & Formatting

```bash
bun --bun run lint
bun --bun run format
bun --bun run check
```
