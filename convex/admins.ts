import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getAdmin = query({
  args: { campusId: v.string(), level: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('admins')
      .filter((q) =>
        q.and(
          q.eq(q.field('campusId'), args.campusId),
          q.eq(q.field('level'), args.level),
        ),
      )
      .first()
  },
})

export const upsertAdmin = mutation({
  args: { campusId: v.string(), level: v.string(), passwordHash: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('admins')
      .filter((q) =>
        q.and(
          q.eq(q.field('campusId'), args.campusId),
          q.eq(q.field('level'), args.level),
        ),
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, { passwordHash: args.passwordHash })
    } else {
      await ctx.db.insert('admins', {
        campusId: args.campusId,
        level: args.level,
        passwordHash: args.passwordHash,
        createdAt: Date.now(),
      })
    }
  },
})
