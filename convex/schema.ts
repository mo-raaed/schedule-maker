import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table — synced with Clerk (same accounts as Gradify)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  // Schedules table — each user can have multiple schedules
  schedules: defineTable({
    userId: v.id("users"),
    name: v.string(), // e.g. "Fall 2026 Schedule"
    semester: v.string(), // e.g. "Fall 2026"
    sections: v.array(
      v.object({
        id: v.string(),
        courseCode: v.string(),
        courseName: v.string(),
        section: v.string(),
        instructor: v.optional(v.string()),
        days: v.array(v.string()), // e.g. ["Mon", "Wed"]
        startTime: v.string(), // e.g. "09:00"
        endTime: v.string(), // e.g. "10:15"
        location: v.optional(v.string()),
        credits: v.number(),
        color: v.optional(v.string()), // UI color for the block
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
