// ─── Day & Time Types ───────────────────────────────────────────────

export type Day = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const ALL_DAYS: Day[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const DAY_LABELS: Record<Day, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

export const DAY_SHORT_LABELS: Record<Day, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

export type StartOfWeek = "sunday" | "monday" | "saturday";

export type TimeIncrement = 15 | 30 | 60;

// ─── Task ───────────────────────────────────────────────────────────

export interface Task {
  id: string;
  name: string;
  description?: string;
  color: string;
  days: Day[];
  startTime: string; // "HH:mm" 24h format
  endTime: string;   // "HH:mm" 24h format
}

// ─── Schedule Settings ──────────────────────────────────────────────

export interface ScheduleSettings {
  showWeekends: boolean;
  startOfWeek: StartOfWeek;
  timeIncrement: TimeIncrement;
  startHour: number; // 0–23
  endHour: number;   // 0–23
}

export const DEFAULT_SETTINGS: ScheduleSettings = {
  showWeekends: false,
  startOfWeek: "sunday",
  timeIncrement: 60,
  startHour: 8,
  endHour: 22,
};

// ─── Schedule ───────────────────────────────────────────────────────

export interface Schedule {
  id: string;          // local uuid (or Convex _id as string once synced)
  convexId?: string;   // set once synced to Convex
  name: string;
  tasks: Task[];
  settings: ScheduleSettings;
  isPublic: boolean;
  shareId?: string;
  createdAt: number;
  updatedAt: number;
}

// ─── App-level State ────────────────────────────────────────────────

export type PaletteMode = "pastel" | "bold";

export type AppView = "landing" | "builder" | "shared";
