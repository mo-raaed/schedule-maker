import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { taskValidator, settingsValidator } from "./schema";

// ─── Helpers ────────────────────────────────────────────────────────

async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  return user;
}

function generateShareId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Default settings for new schedules
const DEFAULT_SETTINGS = {
  showWeekends: false,
  startOfWeek: "sunday",
  timeIncrement: 60,
  startHour: 8,
  endHour: 22,
};

// ─── Queries ────────────────────────────────────────────────────────

/** Get all schedules (metadata only) for the current user */
export const getMySchedules = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    // Return metadata only (no tasks) for the list view
    return schedules.map((s) => ({
      _id: s._id,
      name: s.name,
      taskCount: s.tasks.length,
      isPublic: s.isPublic,
      shareId: s.shareId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  },
});

/** Get a full schedule by ID (with ownership check) */
export const getSchedule = query({
  args: { scheduleId: v.id("schedules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || schedule.userId !== user._id) return null;
    return schedule;
  },
});

/** Get a public schedule by shareId — no auth required */
export const getPublicSchedule = query({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    const schedule = await ctx.db
      .query("schedules")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();
    if (!schedule || !schedule.isPublic) return null;
    // Return without userId for privacy
    return {
      _id: schedule._id,
      name: schedule.name,
      tasks: schedule.tasks,
      settings: schedule.settings,
      shareId: schedule.shareId,
    };
  },
});

// ─── Mutations ──────────────────────────────────────────────────────

/** Create a new schedule with default settings and empty tasks */
export const createSchedule = mutation({
  args: { name: v.string() },
  returns: v.id("schedules"),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("schedules", {
      userId: user._id,
      name: args.name,
      tasks: [],
      settings: DEFAULT_SETTINGS,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Full update — replace tasks and/or settings (used for syncing from local) */
export const updateSchedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
    name: v.optional(v.string()),
    tasks: v.optional(v.array(taskValidator)),
    settings: v.optional(settingsValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.tasks !== undefined) updates.tasks = args.tasks;
    if (args.settings !== undefined) updates.settings = args.settings;
    await ctx.db.patch(args.scheduleId, updates);
  },
});

/** Add a single task to a schedule */
export const addTask = mutation({
  args: {
    scheduleId: v.id("schedules"),
    task: taskValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    await ctx.db.patch(args.scheduleId, {
      tasks: [...schedule.tasks, args.task],
      updatedAt: Date.now(),
    });
  },
});

/** Update a single task within a schedule */
export const updateTask = mutation({
  args: {
    scheduleId: v.id("schedules"),
    task: taskValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    await ctx.db.patch(args.scheduleId, {
      tasks: schedule.tasks.map((t) =>
        t.id === args.task.id ? args.task : t
      ),
      updatedAt: Date.now(),
    });
  },
});

/** Remove a task by its id */
export const removeTask = mutation({
  args: {
    scheduleId: v.id("schedules"),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    await ctx.db.patch(args.scheduleId, {
      tasks: schedule.tasks.filter((t) => t.id !== args.taskId),
      updatedAt: Date.now(),
    });
  },
});

/** Delete an entire schedule */
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

/** Rename a schedule */
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
    await ctx.db.patch(args.scheduleId, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});

/** Toggle public sharing — generates or clears shareId */
export const togglePublic = mutation({
  args: { scheduleId: v.id("schedules") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule || schedule.userId !== user._id) {
      throw new Error("Schedule not found");
    }
    if (schedule.isPublic) {
      // Disable sharing
      await ctx.db.patch(args.scheduleId, {
        isPublic: false,
        shareId: undefined,
        updatedAt: Date.now(),
      });
      return null;
    } else {
      // Enable sharing with a unique ID
      const shareId = generateShareId();
      await ctx.db.patch(args.scheduleId, {
        isPublic: true,
        shareId,
        updatedAt: Date.now(),
      });
      return shareId;
    }
  },
});
