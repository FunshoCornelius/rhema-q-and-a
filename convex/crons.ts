import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'
import { internalMutation } from './_generated/server'

export const autoCloseSessions = internalMutation({
  handler: async (ctx) => {
    const now = Date.now()
    const activeSessions = await ctx.db
      .query('sessions')
      .filter((q) => q.eq(q.field('isOpen'), true))
      .collect()

    for (const session of activeSessions) {
      if (session.closeAt <= now) {
        await ctx.db.patch(session._id, {
          isOpen: false,
          closeAt: now,
        })
      }
    }
  },
})

const crons = cronJobs()

crons.interval(
  'auto-close-sessions',
  { minutes: 1 },
  internal.crons.autoCloseSessions,
)

export default crons
