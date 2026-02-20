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
 *  - Pulls existing schedules from Convex
 *  - Pushes any local-only schedules (created as guest) to Convex
 *
 * On subsequent mutations:
 *  - Write-through to Convex for schedules that have a convexId
 */
export function useConvexSync() {
  const { isSignedIn } = useAuth();
  const hasSynced = useRef(false);

  const schedules = useScheduleStore((s) => s.schedules);
  const setSchedules = useScheduleStore((s) => s.setSchedules);
  const markSynced = useScheduleStore((s) => s.markSynced);
  const setActiveSchedule = useScheduleStore((s) => s.setActiveSchedule);

  // Convex queries/mutations
  const mySchedules = useQuery(
    api.schedules.getMySchedules,
    isSignedIn ? {} : "skip"
  );
  const createMutation = useMutation(api.schedules.createSchedule);
  const updateMutation = useMutation(api.schedules.updateSchedule);

  // Sync on first sign-in
  useEffect(() => {
    if (!isSignedIn || hasSynced.current || mySchedules === undefined) return;
    hasSynced.current = true;

    const localSchedules = useScheduleStore.getState().schedules;

    // If user has remote schedules, load them
    if (mySchedules && mySchedules.length > 0) {
      // For now, we keep both local and remote.
      // Remote schedules that aren't in local state get added.
      const localConvexIds = new Set(localSchedules.map((s) => s.convexId).filter(Boolean));
      const toAdd: Schedule[] = [];

      for (const remote of mySchedules) {
        if (!localConvexIds.has(remote._id as string)) {
          // This is a remote schedule not in local state — we'd need to fetch full data
          // For the list view, we just create a shell. Full data loads when selected.
          toAdd.push({
            id: remote._id as string,
            convexId: remote._id as string,
            name: remote.name,
            tasks: [], // Will be loaded on demand
            settings: DEFAULT_SETTINGS,
            isPublic: remote.isPublic,
            shareId: remote.shareId,
            createdAt: remote.createdAt,
            updatedAt: remote.updatedAt,
          });
        }
      }

      if (toAdd.length > 0) {
        setSchedules([...localSchedules, ...toAdd]);
      }
    }

    // Push local-only schedules (no convexId) to Convex
    const unsyncedLocal = localSchedules.filter((s) => !s.convexId);
    for (const local of unsyncedLocal) {
      void (async () => {
        try {
          const convexId = await createMutation({ name: local.name });
          markSynced(local.id, convexId as string);

          // Also push tasks and settings
          if (local.tasks.length > 0 || local.settings !== DEFAULT_SETTINGS) {
            await updateMutation({
              scheduleId: convexId,
              tasks: local.tasks,
              settings: local.settings,
            });
          }
        } catch (err) {
          console.error("Failed to sync schedule to Convex:", err);
        }
      })();
    }
  }, [isSignedIn, mySchedules]);

  // Write-through: when local state changes for synced schedules, push to Convex
  useEffect(() => {
    if (!isSignedIn) return;

    // Subscribe to schedule changes
    const unsub = useScheduleStore.subscribe((state, prevState) => {
      const active = state.schedules.find((s) => s.id === state.activeScheduleId);
      const prevActive = prevState.schedules.find((s) => s.id === prevState.activeScheduleId);

      if (
        active?.convexId &&
        prevActive?.convexId === active.convexId &&
        active.updatedAt !== prevActive?.updatedAt
      ) {
        void updateMutation({
          scheduleId: active.convexId as any,
          name: active.name,
          tasks: active.tasks,
          settings: active.settings,
        }).catch((err) => {
          console.error("Failed to sync to Convex:", err);
        });
      }
    });

    return unsub;
  }, [isSignedIn, updateMutation]);
}
