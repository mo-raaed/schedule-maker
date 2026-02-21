import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { useScheduleStore } from "../store/scheduleStore";
import type { Schedule, Task, ScheduleSettings } from "../lib/types";
import { DEFAULT_SETTINGS } from "../lib/types";

/**
 * Syncs local Zustand state with Convex when the user is authenticated.
 *
 * On first auth:
 *  - Pulls full schedules from Convex (source of truth)
 *  - Pushes any local-only (guest) schedules to Convex
 *
 * On subsequent mutations:
 *  - Write-through: creates, updates, and deletes are mirrored to Convex
 */
export function useConvexSync() {
  const { isSignedIn } = useAuth();
  const hasSynced = useRef(false);

  const setSchedules = useScheduleStore((s) => s.setSchedules);
  const setActiveSchedule = useScheduleStore((s) => s.setActiveSchedule);
  const markSynced = useScheduleStore((s) => s.markSynced);

  // Convex queries/mutations
  const mySchedules = useQuery(
    api.schedules.getMySchedules,
    isSignedIn ? {} : "skip"
  );
  const createMutation = useMutation(api.schedules.createSchedule);
  const updateMutation = useMutation(api.schedules.updateSchedule);
  const deleteMutation = useMutation(api.schedules.deleteSchedule);

  // ── Initial sync on sign-in ──────────────────────────────────────
  useEffect(() => {
    if (!isSignedIn || hasSynced.current || mySchedules === undefined) return;
    hasSynced.current = true;

    const localSchedules = useScheduleStore.getState().schedules;
    const activeId = useScheduleStore.getState().activeScheduleId;

    // 1. Convert remote schedules → local format (with full tasks & settings)
    const remoteSchedules: Schedule[] = mySchedules.map((remote) => ({
      id: remote._id as string,
      convexId: remote._id as string,
      name: remote.name,
      tasks: (remote.tasks ?? []) as Task[],
      settings: { ...DEFAULT_SETTINGS, ...(remote.settings as Partial<ScheduleSettings>) },
      isPublic: remote.isPublic,
      shareId: remote.shareId,
      createdAt: remote.createdAt,
      updatedAt: remote.updatedAt,
    }));

    // 2. Find local-only (guest) schedules that haven't been pushed yet
    const guestSchedules = localSchedules.filter((s) => !s.convexId);

    // 3. Merge: remote (source of truth) + guest (to be pushed)
    const merged = [...remoteSchedules, ...guestSchedules];
    setSchedules(merged);

    // Preserve active schedule if it still exists, otherwise pick first
    if (merged.length > 0) {
      const activeExists = merged.some((s) => s.id === activeId);
      if (!activeExists) {
        setActiveSchedule(merged[0].id);
      }
    }

    // 4. Push guest schedules to Convex
    for (const guest of guestSchedules) {
      void pushGuestSchedule(guest);
    }
  }, [isSignedIn, mySchedules]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Write-through: mirror local changes → Convex ─────────────────
  useEffect(() => {
    if (!isSignedIn) return;

    const unsub = useScheduleStore.subscribe((state, prevState) => {
      // Don't sync until initial pull is done
      if (!hasSynced.current) return;

      const prevMap = new Map(prevState.schedules.map((s) => [s.id, s]));
      const currMap = new Map(state.schedules.map((s) => [s.id, s]));

      // — Deleted schedules ─────────────────────────────────────────
      for (const prev of prevState.schedules) {
        if (!currMap.has(prev.id) && prev.convexId) {
          void deleteMutation({ scheduleId: prev.convexId as any }).catch((err) =>
            console.error("Convex delete failed:", err)
          );
        }
      }

      // — New schedules (no convexId yet) ───────────────────────────
      for (const curr of state.schedules) {
        if (!prevMap.has(curr.id) && !curr.convexId) {
          void pushGuestSchedule(curr);
        }
      }

      // — Modified schedules (updatedAt changed) ────────────────────
      for (const curr of state.schedules) {
        if (curr.convexId) {
          const prev = prevMap.get(curr.id);
          if (prev && curr.updatedAt !== prev.updatedAt) {
            void updateMutation({
              scheduleId: curr.convexId as any,
              name: curr.name,
              tasks: curr.tasks,
              settings: curr.settings,
            }).catch((err) =>
              console.error("Convex update failed:", err)
            );
          }
        }
      }
    });

    return unsub;
  }, [isSignedIn, updateMutation, createMutation, deleteMutation]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helper: push a guest schedule to Convex ──────────────────────
  async function pushGuestSchedule(schedule: Schedule) {
    try {
      const convexId = await createMutation({ name: schedule.name });
      markSynced(schedule.id, convexId as string);

      // Push tasks + settings
      await updateMutation({
        scheduleId: convexId,
        tasks: schedule.tasks,
        settings: schedule.settings,
      });
    } catch (err) {
      console.error("Failed to push schedule to Convex:", err);
    }
  }
}
