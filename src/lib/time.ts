import type { Day, ScheduleSettings, StartOfWeek, Task } from "./types";
import { ALL_DAYS } from "./types";

/**
 * Parse "HH:mm" to minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to "HH:mm" (24h).
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Format "HH:mm" to a 12-hour display string (e.g., "9:00 AM").
 */
export function formatTime12h(time: string): string {
  const mins = timeToMinutes(time);
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

/**
 * Generate time slot labels for the grid based on settings.
 */
export function generateTimeSlots(settings: ScheduleSettings): string[] {
  const slots: string[] = [];
  const startMin = settings.startHour * 60;
  const endMin = settings.endHour * 60;

  for (let m = startMin; m < endMin; m += settings.timeIncrement) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

/**
 * Get the weekend days (last 2 days of the week) based on start-of-week.
 * e.g. Sunday start → Fri, Sat; Monday start → Sat, Sun; Saturday start → Thu, Fri
 */
export function getWeekendDays(startOfWeek: StartOfWeek): [Day, Day] {
  const weekOrder = getWeekOrder(startOfWeek);
  return [weekOrder[5], weekOrder[6]];
}

/**
 * Get the visible days in order based on settings.
 */
export function getVisibleDays(settings: ScheduleSettings): Day[] {
  const weekOrder = getWeekOrder(settings.startOfWeek);
  if (settings.showWeekends) {
    return weekOrder;
  }
  const weekend = getWeekendDays(settings.startOfWeek);
  return weekOrder.filter((d) => !weekend.includes(d));
}

/**
 * Reorder days array based on start-of-week preference.
 */
export function getWeekOrder(startOfWeek: StartOfWeek): Day[] {
  const startIndex =
    startOfWeek === "sunday" ? 0 : startOfWeek === "monday" ? 1 : 6;
  const ordered: Day[] = [];
  for (let i = 0; i < 7; i++) {
    ordered.push(ALL_DAYS[(startIndex + i) % 7]);
  }
  return ordered;
}

/**
 * Calculate the top position (%) and height (%) of a task block on the grid.
 */
export function getTaskPosition(
  task: { startTime: string; endTime: string },
  settings: ScheduleSettings
): { topPercent: number; heightPercent: number } {
  const gridStart = settings.startHour * 60;
  const gridEnd = settings.endHour * 60;
  const totalMinutes = gridEnd - gridStart;

  const taskStart = timeToMinutes(task.startTime);
  const taskEnd = timeToMinutes(task.endTime);

  const topPercent = ((taskStart - gridStart) / totalMinutes) * 100;
  const heightPercent = ((taskEnd - taskStart) / totalMinutes) * 100;

  return {
    topPercent: Math.max(0, topPercent),
    heightPercent: Math.min(100 - Math.max(0, topPercent), Math.max(0, heightPercent)),
  };
}

/**
 * Check if two tasks overlap on a given day.
 */
export function tasksOverlap(a: Task, b: Task, day: Day): boolean {
  if (!a.days.includes(day) || !b.days.includes(day)) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Find all overlapping task pairs for a given day.
 */
export function findOverlaps(tasks: Task[], day: Day): Set<string> {
  const overlapping = new Set<string>();
  const dayTasks = tasks.filter((t) => t.days.includes(day));

  for (let i = 0; i < dayTasks.length; i++) {
    for (let j = i + 1; j < dayTasks.length; j++) {
      if (tasksOverlap(dayTasks[i], dayTasks[j], day)) {
        overlapping.add(dayTasks[i].id);
        overlapping.add(dayTasks[j].id);
      }
    }
  }
  return overlapping;
}

/**
 * Validate a time string in "HH:mm" format.
 */
export function isValidTime(time: string): boolean {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/**
 * Get duration in human-readable form, e.g., "1h 30m".
 */
export function getDuration(startTime: string, endTime: string): string {
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (diff <= 0) return "0m";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Generate an array of suggested times for a dropdown based on increment.
 */
export function generateTimeSuggestions(increment: number, startHour = 0, endHour = 24): string[] {
  const suggestions: string[] = [];
  for (let m = startHour * 60; m < endHour * 60; m += increment) {
    suggestions.push(minutesToTime(m));
  }
  return suggestions;
}
