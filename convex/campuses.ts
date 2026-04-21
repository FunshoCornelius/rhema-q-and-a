import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getCampuses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('campuses').collect()
  },
})

export const createCampus = mutation({
  args: {
    id: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { id, name }) => {
    // Check if campus already exists
    const existing = await ctx.db
      .query('campuses')
      .withIndex('byId', (q) => q.eq('id', id))
      .first()
    if (existing) {
      throw new Error(`Campus with id ${id} already exists`)
    }

    // By default, give it two levels
    await ctx.db.insert('campuses', {
      id,
      name,
      levels: ['level-1', 'level-2'],
    })
  },
})
