# Index `questions` by `sessionId`

**Status:** accepted — implemented 2026-07-04

Queries that fetch a session's questions and the one-question-per-student check in `submitQuestion` originally used `.filter()` on `sessionId` (`convex/questions.ts`), which scans the entire `questions` table on every call. That is fine at classroom scale but does work proportional to *total questions ever created* rather than *questions in this session*, so read cost and latency creep up as sessions accumulate.

## Decision

Added an index `by_sessionId` on `['sessionId']` to the `questions` table and switched all per-session lookups from `.filter()` to `.withIndex()`:

- `getSessionQuestions`
- `submitQuestion` (dedupe check — now `withIndex('by_sessionId')` then `.filter()` on `submittedBy`, so the filter runs only over the session's rows, not the whole table)
- `toggleProjectQuestion`
- `deleteSession` (`convex/sessions.ts`) — question cleanup

Each of these now reads only the current session's questions instead of the whole table.

## Not covered

`getPastSessions` (`convex/sessions.ts`) still calls `ctx.db.query('questions').collect()` to aggregate counts across every past session in one pass. That is a different, cross-session aggregate rather than a single-session lookup; revisit it (e.g. denormalised per-session counters) only if it shows up as a cost/latency hotspot.

## Deploy note

The index only exists in the backend once the schema is pushed (`convex dev` / deploy). `withIndex('by_sessionId', ...)` will fail against a backend that hasn't picked up the new schema yet.
