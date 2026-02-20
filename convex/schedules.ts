import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Helper to get the authenticated user or throw
async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

/**
 * Get all schedules for the current user
 */
export const getMySchedules = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      return [];
    }
    return await ctx.db
      .query("schedules")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/**
 * Get a single schedule by ID
 */
export const getSchedule = query({
  args: { scheduleId: v.id("schedules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      return null;
    }
    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || schedule.userId !== user._id) {
      return null;
    }
    return schedule;
  },
});

/**
 * Create a new schedule
 */
export const createSchedule = mutation({
  args: {
    name: v.string(),
    semester: v.string(),
  },
  returns: v.id("schedules"),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("schedules", {
      userId: user._id,
      name: args.name,
      semester: args.semester,
      sections: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Add a section to a schedule
 */
export const addSection = mutation({
  args: {
    scheduleId: v.id("schedules"),
    section: v.object({
      id: v.string(),
      courseCode: v.string(),
      courseName: v.string(),
      section: v.string(),
      instructor: v.optional(v.string()),
      days: v.array(v.string()),
      startTime: v.string(),
      endTime: v.string(),
      location: v.optional(v.string()),
      credits: v.number(),
      color: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    await ctx.db.patch("schedules", args.scheduleId, {
      sections: [...schedule.sections, args.section],
      updatedAt: Date.now(),
    });
  },
});

/**
 * Remove a section from a schedule
 */
export const removeSection = mutation({
  args: {
    scheduleId: v.id("schedules"),
    sectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    await ctx.db.patch("schedules", args.scheduleId, {
      sections: schedule.sections.filter((s) => s.id !== args.sectionId),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a schedule
 */
export const deleteSchedule = mutation({
  args: { scheduleId: v.id("schedules") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    await ctx.db.delete(args.scheduleId);
  },
});

/**
 * Rename a schedule
 */
export const renameSchedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    await ctx.db.patch("schedules", args.scheduleId, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});
