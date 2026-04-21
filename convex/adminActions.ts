'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'
import bcrypt from 'bcryptjs'
import { api } from './_generated/api'

export const setAdminPassword = action({
  args: {
    campusId: v.string(),
    level: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(args.password, saltRounds)

    await ctx.runMutation(api.admins.upsertAdmin, {
      campusId: args.campusId,
      level: args.level,
      passwordHash,
    })

    return { success: true }
  },
})
