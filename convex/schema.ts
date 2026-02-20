import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Reusable validator for a task object
export const taskValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  color: v.string(),
  days: v.array(v.string()), // e.g. ["mon", "wed", "fri"]
  startTime: v.string(),     // "HH:mm" 24h format
  endTime: v.string(),       // "HH:mm" 24h format
});

// Reusable validator for schedule settings
export const settingsValidator = v.object({
  showWeekends: v.boolean(),
  startOfWeek: v.string(),       // "sunday" | "monday" | "saturday"
  timeIncrement: v.number(),     // 15 | 30 | 60
  startHour: v.number(),         // 0–23
  endHour: v.number(),           // 0–23
});

export default defineSchema({
  // Users table — synced with Clerk (same accounts as Gradify)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  // Schedules table — general-purpose task-based schedules
  schedules: defineTable({
    userId: v.id("users"),
    name: v.string(),
    tasks: v.array(taskValidator),
    settings: settingsValidator,
    isPublic: v.boolean(),
    shareId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_shareId", ["shareId"]),
});
