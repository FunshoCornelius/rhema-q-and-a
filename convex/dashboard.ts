import { query } from './_generated/server'

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const campuses = await ctx.db.query('campuses').collect()

    // Get all sessions
    const allSessions = await ctx.db.query('sessions').collect()
    const activeSessions = allSessions.filter((s) => s.isOpen)

    // Get all questions
    const allQuestions = await ctx.db.query('questions').collect()

    // Calculate questions today
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const todayTimestamp = startOfToday.getTime()

    const questionsToday = allQuestions.filter(
      (q) => q.createdAt >= todayTimestamp,
    )
    const totalQuestionsToday = questionsToday.length
    const totalUpvotesToday = questionsToday.reduce(
      (sum, q) => sum + (q.votes || 0),
      0,
    )

    // Group info by campus
    const campusesWithStats = campuses.map((campus) => {
      const campusSessions = allSessions.filter((s) => s.campusId === campus.id)

      const levels = campus.levels.map((level) => {
        // Is there an active session for this level?
        const activeLevelSessions = campusSessions.filter(
          (s) => s.level === level && s.isOpen,
        )
        const status = activeLevelSessions.length > 0 ? 'open' : 'closed'

        // Questions for this campus+level
        const activeSessionIds = new Set(activeLevelSessions.map((s) => s._id))
        const levelQuestions = allQuestions.filter(
          (q) =>
            q.campusId === campus.id &&
            q.level === level &&
            activeSessionIds.has(q.sessionId),
        )

        const topVotes =
          levelQuestions.length > 0
            ? Math.max(...levelQuestions.map((q) => q.votes || 0))
            : 0

        return {
          level,
          status,
          questions: levelQuestions.length,
          topVotes,
        }
      })

      return {
        id: campus.id,
        name: campus.name,
        levels,
      }
    })

    return {
      stats: {
        totalCampuses: campuses.length,
        activeSessions: activeSessions.length,
        questionsToday: totalQuestionsToday,
        upvotesToday: totalUpvotesToday,
      },
      campuses: campusesWithStats,
    }
  },
})
