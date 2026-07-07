import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { arrayMove } from "@dnd-kit/sortable";
import type { Schedule, Task, ScheduleSettings, PaletteMode } from "../lib/types";
import { DEFAULT_SETTINGS } from "../lib/types";

// ─── Schedule Store ─────────────────────────────────────────────────

interface ScheduleState {
  schedules: Schedule[];
  activeScheduleId: string | null;

  // Derived helpers
  getActiveSchedule: () => Schedule | undefined;

  // Schedule CRUD
  createSchedule: (name: string) => string;
  deleteSchedule: (id: string) => void;
  renameSchedule: (id: string, name: string) => void;
  setActiveSchedule: (id: string) => void;
  duplicateSchedule: (id: string) => string;
  reorderSchedules: (activeId: string, overId: string) => void;

  // Task CRUD
  addTask: (task: Omit<Task, "id">) => string;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;

  // Settings
  updateSettings: (settings: Partial<ScheduleSettings>) => void;

  // Sharing
  setShareId: (scheduleId: string, shareId: string | undefined) => void;
  setPublic: (scheduleId: string, isPublic: boolean) => void;

  // Sync helpers
  setSchedules: (schedules: Schedule[]) => void;
  syncFromConvex: (schedules: Schedule[]) => void;
  markSynced: (localId: string, convexId: string) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: [],
      activeScheduleId: null,

      getActiveSchedule: () => {
        const { schedules, activeScheduleId } = get();
        return schedules.find((s) => s.id === activeScheduleId);
      },

      createSchedule: (name: string) => {
        const id = uuid();
        const now = Date.now();
        const schedule: Schedule = {
          id,
          name,
          tasks: [],
          settings: { ...DEFAULT_SETTINGS },
          isPublic: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          schedules: [...state.schedules, schedule],
          activeScheduleId: id,
        }));
        return id;
      },

      deleteSchedule: (id: string) => {
        set((state) => {
          const remaining = state.schedules.filter((s) => s.id !== id);
          return {
            schedules: remaining,
            activeScheduleId:
              state.activeScheduleId === id
                ? remaining[0]?.id ?? null
                : state.activeScheduleId,
          };
        });
      },

      renameSchedule: (id: string, name: string) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, name, updatedAt: Date.now() } : s
          ),
        }));
      },

      setActiveSchedule: (id: string) => {
        set({ activeScheduleId: id });
      },

      duplicateSchedule: (id: string) => {
        const source = get().schedules.find((s) => s.id === id);
        if (!source) return id;
        const newId = uuid();
        const now = Date.now();
        const copy: Schedule = {
          ...source,
          id: newId,
          convexId: undefined,
          name: `${source.name} (copy)`,
          tasks: source.tasks.map((t) => ({ ...t, id: uuid() })),
          isPublic: false,
          shareId: undefined,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          schedules: [...state.schedules, copy],
          activeScheduleId: newId,
        }));
        return newId;
      },

      reorderSchedules: (activeId: string, overId: string) => {
        set((state) => {
          const oldIndex = state.schedules.findIndex((s) => s.id === activeId);
          const newIndex = state.schedules.findIndex((s) => s.id === overId);
          if (oldIndex === -1 || newIndex === -1) return state;

          const newSchedules = arrayMove(state.schedules, oldIndex, newIndex);
          const updated = newSchedules.map((s, idx) => ({
            ...s,
            order: idx,
            updatedAt: Date.now()
          }));
          return { schedules: updated };
        });
      },

      // ── Task CRUD (always on active schedule) ──

      addTask: (taskData) => {
        const taskId = uuid();
        const task: Task = { ...taskData, id: taskId };
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === state.activeScheduleId
              ? { ...s, tasks: [...s.tasks, task], updatedAt: Date.now() }
              : s
          ),
        }));
        return taskId;
      },

      updateTask: (task: Task) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === state.activeScheduleId
              ? {
                  ...s,
                  tasks: s.tasks.map((t) => (t.id === task.id ? task : t)),
                  updatedAt: Date.now(),
                }
              : s
          ),
        }));
      },

      removeTask: (taskId: string) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === state.activeScheduleId
              ? {
                  ...s,
                  tasks: s.tasks.filter((t) => t.id !== taskId),
                  updatedAt: Date.now(),
                }
              : s
          ),
        }));
      },

      // ── Settings ──

      updateSettings: (partial) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === state.activeScheduleId
              ? {
                  ...s,
                  settings: { ...s.settings, ...partial },
                  updatedAt: Date.now(),
                }
              : s
          ),
        }));
      },

      // ── Sharing ──

      setShareId: (scheduleId, shareId) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === scheduleId ? { ...s, shareId, updatedAt: Date.now() } : s
          ),
        }));
      },

      setPublic: (scheduleId, isPublic) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === scheduleId ? { ...s, isPublic, updatedAt: Date.now() } : s
          ),
        }));
      },

      // ── Sync ──

      setSchedules: (schedules) => {
        set({ schedules });
      },

      syncFromConvex: (schedules) => {
        set({ schedules });
      },

      markSynced: (localId, convexId) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === localId ? { ...s, convexId } : s
          ),
        }));
      },
    }),
    {
      name: "schedule-maker-schedules",
    }
  )
);

// ─── Settings Store (global UI prefs) ───────────────────────────────

interface AppSettingsState {
  darkMode: boolean;
  /** True once the user explicitly toggled the theme. Until then the app
   *  follows the system preference (and the FOUC script in index.html
   *  resolves the pre-paint class the same way). */
  themeExplicit: boolean;
  paletteMode: PaletteMode;
  toggleDarkMode: () => void;
  setPaletteMode: (mode: PaletteMode) => void;
}

const systemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      darkMode: systemPrefersDark(),
      themeExplicit: false,
      paletteMode: "pastel",
      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode, themeExplicit: true })),
      setPaletteMode: (mode) => set({ paletteMode: mode }),
    }),
    {
      name: "schedule-maker-settings",
      onRehydrateStorage: () => (state) => {
        // No explicit choice saved → follow the current system preference,
        // not whatever was persisted alongside other settings.
        if (state && !state.themeExplicit) {
          state.darkMode = systemPrefersDark();
        }
      },
    }
  )
);

// Follow live system-preference changes until the user picks a theme.
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const s = useAppSettingsStore.getState();
      if (!s.themeExplicit) {
        useAppSettingsStore.setState({ darkMode: e.matches });
      }
    });
}
