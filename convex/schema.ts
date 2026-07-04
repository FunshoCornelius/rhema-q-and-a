import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  campuses: defineTable({
    id: v.string(), // e.g., 'ikeja'
    name: v.string(), // e.g., 'Ikeja'
    levels: v.array(v.string()), // e.g., ['level-1', 'level-2']
  }).index('byId', ['id']),
  admins: defineTable({
    campusId: v.string(),
    level: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }),
  sessions: defineTable({
    campusId: v.string(),
    level: v.string(),
    topic: v.string(),
    instructor: v.string(),
    isOpen: v.boolean(),
    createdAt: v.number(),
    classDates: v.array(v.string()),
    closeAt: v.number(),
  }),
  questions: defineTable({
    sessionId: v.id('sessions'),
    campusId: v.string(),
    level: v.string(),
    text: v.string(),
    authorName: v.union(v.string(), v.null()),
    votes: v.number(),
    votedBy: v.array(v.string()),
    submittedBy: v.string(),
    createdAt: v.number(),
    isProjected: v.boolean(),
  }).index('by_sessionId', ['sessionId']),
})
