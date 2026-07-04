# Defer adding an index on `questions.sessionId`

**Status:** accepted (revisit when the `questions` table grows large)

Queries that fetch a session's questions and the one-question-per-student check in `submitQuestion` currently use `.filter()` on `sessionId` (`convex/questions.ts`), which scans the entire `questions` table on every call. We are knowingly keeping this for now because at classroom scale (tens of questions per session, a few thousand rows total) the scan is negligible, and the code stays simple.

## The trade-off

A full-table `.filter()` reads work proportional to *total questions ever created*, not *questions in this session*, so both cost (documents read) and latency grow slowly over time as more sessions accumulate. An index keeps that work proportional to just the current session.

## Future fix (when needed)

Add an index and switch the three call sites from `.filter()` to `.withIndex()`:

```ts
// convex/schema.ts
questions: defineTable({ /* ... */ }).index('bySession', ['sessionId'])

// convex/questions.ts — getSessionQuestions, submitQuestion dedupe, toggleProjectQuestion
ctx.db.query('questions').withIndex('bySession', (q) => q.eq('sessionId', sessionId))
```

Trigger to revisit: noticeably higher Convex read counts/costs, or the `questions` table reaching the low tens of thousands of rows.
