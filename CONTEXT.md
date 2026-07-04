# Rhema BTC Q&A Portal

A live, web-based Q&A platform used during classroom sessions at Rhema Bible Training Center. Students submit and upvote questions in real time; admins run sessions and drive a classroom display.

## Language

### Roles & people

**Student**:
An anonymous participant who submits and upvotes questions. Identified only by a random UUID in their browser, never by an account.
_Avoid_: User, participant account

**Campus Admin**:
An administrator scoped to a single campus and level who runs sessions. Authenticates with a password.
_Avoid_: Moderator, host

**Super Admin**:
The single global administrator who creates campuses and sets campus-admin passwords.

**Instructor**:
The person teaching a session. Currently represented only as a name recorded on the Session — not an authenticated role.
_Avoid_: Teacher, lecturer

### Surfaces

**Projector View**:
The classroom screen (public, large-format) that displays one projected question or the join QR code, driven by the Campus Admin.
_Avoid_: Screen, display, presentation

**Instructor View**:
A read-only, live feed of all questions on the Instructor's own personal device, sorted by votes, optimised for glancing while teaching. A no-login shareable surface — distinct from the classroom Projector View.
_Avoid_: Presenter view, teacher view

### Session concepts

**Session**:
A timed window, scoped to one campus and level, during which students submit and upvote questions. Has exactly one open session per campus/level at a time.
_Avoid_: Class, event, room

**Campus**:
A physical Rhema BTC location (e.g. Ikeja), each with its own admin credentials and sessions.

**Level**:
A class grouping within a campus (e.g. level-1, level-2), managed independently.

**Projected**:
The state of the single question currently shown fullscreen on the Projector View.

**Close time**:
The same-day time at which a session automatically stops accepting questions and upvotes.
