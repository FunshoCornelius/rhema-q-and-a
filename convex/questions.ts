import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getSessionQuestions = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('questions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .collect()
  },
})

export const deleteQuestion = mutation({
  args: { questionId: v.id('questions') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.questionId)
  },
})

export const toggleProjectQuestion = mutation({
  args: { questionId: v.id('questions'), sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    // Unproject all others in session
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .collect()

    for (const q of questions) {
      if (q.isProjected && q._id !== args.questionId) {
        await ctx.db.patch(q._id, { isProjected: false })
      }
    }
    // Toggle the selected one
    const target = await ctx.db.get(args.questionId)
    if (target) {
      await ctx.db.patch(args.questionId, { isProjected: !target.isProjected })
    }
  },
})

export const adminUpvote = mutation({
  args: { questionId: v.id('questions') },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.questionId)
    if (target) {
      await ctx.db.patch(args.questionId, { votes: (target.votes || 0) + 1 })
    }
  },
})

export const submitQuestion = mutation({
  args: {
    sessionId: v.id('sessions'),
    campusId: v.string(),
    level: v.string(),
    text: v.string(),
    authorName: v.union(v.string(), v.null()),
    submittedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session || !session.isOpen || session.closeAt < Date.now()) {
      throw new Error('Session is not open for questions')
    }

    const existing = await ctx.db
      .query('questions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .filter((q) => q.eq(q.field('submittedBy'), args.submittedBy))
      .first()

    if (existing) {
      throw new Error('You have already submitted a question for this session.')
    }

    await ctx.db.insert('questions', {
      sessionId: args.sessionId,
      campusId: args.campusId,
      level: args.level,
      text: args.text,
      authorName: args.authorName,
      votes: 0,
      votedBy: [],
      submittedBy: args.submittedBy,
      createdAt: Date.now(),
      isProjected: false,
    })
  },
})

export const upvoteQuestion = mutation({
  args: {
    questionId: v.id('questions'),
    voterUuid: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId)
    if (!question) throw new Error('Question not found')

    if (question.submittedBy === args.voterUuid) {
      throw new Error('You cannot upvote your own question')
    }
    if (question.votedBy.includes(args.voterUuid)) {
      throw new Error('You have already upvoted this question')
    }

    await ctx.db.patch(args.questionId, {
      votes: (question.votes || 0) + 1,
      votedBy: [...question.votedBy, args.voterUuid],
    })
  },
})
