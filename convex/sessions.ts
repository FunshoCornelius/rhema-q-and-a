import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getCurrentSession = query({
  args: { campusId: v.string(), level: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sessions')
      .filter((q) =>
        q.and(
          q.eq(q.field('campusId'), args.campusId),
          q.eq(q.field('level'), args.level),
          q.eq(q.field('isOpen'), true),
        ),
      )
      .order('desc')
      .first()
  },
})

export const getLatestSession = query({
  args: { campusId: v.string(), level: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sessions')
      .filter((q) =>
        q.and(
          q.eq(q.field('campusId'), args.campusId),
          q.eq(q.field('level'), args.level),
        ),
      )
      .order('desc')
      .first()
  },
})

export const getPastSessions = query({
  args: { campusId: v.string(), level: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('sessions')
      .filter((q) =>
        q.and(
          q.eq(q.field('campusId'), args.campusId),
          q.eq(q.field('level'), args.level),
          q.eq(q.field('isOpen'), false),
        ),
      )
      .order('desc')
      .collect()

    const questions = await ctx.db.query('questions').collect()

    return sessions.map((session) => {
      const sessionQuestions = questions.filter(
        (q) => q.sessionId === session._id,
      )
      const totalVotes = sessionQuestions.reduce(
        (sum, q) => sum + (q.votes || 0),
        0,
      )
      return {
        ...session,
        questionCount: sessionQuestions.length,
        totalVotes,
      }
    })
  },
})

export const createSession = mutation({
  args: {
    campusId: v.string(),
    level: v.string(),
    topic: v.string(),
    instructor: v.string(),
    classDates: v.array(v.string()),
    closeAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existingOpen = await ctx.db
      .query('sessions')
      .filter((q) =>
        q.and(
          q.eq(q.field('campusId'), args.campusId),
          q.eq(q.field('level'), args.level),
          q.eq(q.field('isOpen'), true),
        ),
      )
      .first()

    if (existingOpen) {
      throw new Error(
        'A session is already open. Please close the active session first.',
      )
    }

    return await ctx.db.insert('sessions', {
      campusId: args.campusId,
      level: args.level,
      topic: args.topic,
      instructor: args.instructor,
      isOpen: true,
      classDates: args.classDates,
      createdAt: Date.now(),
      closeAt: args.closeAt,
    })
  },
})

export const closeSession = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      isOpen: false,
      closeAt: Date.now(),
    })
  },
})

export const deleteSession = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId)
    const questions = await ctx.db
      .query('questions')
      .filter((q) => q.eq(q.field('sessionId'), args.sessionId))
      .collect()
    for (const q of questions) {
      await ctx.db.delete(q._id)
    }
  },
})
