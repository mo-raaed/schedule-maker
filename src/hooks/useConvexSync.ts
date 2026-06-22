import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { useScheduleStore } from "../store/scheduleStore";
import type { Schedule, Task, ScheduleSettings } from "../lib/types";
import { DEFAULT_SETTINGS } from "../lib/types";

/**
 * Reactive Convex-first sync hook.
 *
 * - Initial load: merges remote schedules with guest (unsynced) schedules
 * - Ongoing: Convex query updates flow reactively into Zustand
 * - Write-through: local mutations are mirrored to Convex
 * - Persists activeScheduleId to Convex user record
 */
export function useConvexSync(userReady: boolean) {
  const { isSignedIn } = useAuth();
  const hasSynced = useRef(false);
  const isSyncing = useRef(false);
  const prevRemoteKey = useRef<string | null>(null);

  const syncFromConvex = useScheduleStore((s) => s.syncFromConvex);
  const setActiveSchedule = useScheduleStore((s) => s.setActiveSchedule);
  const markSynced = useScheduleStore((s) => s.markSynced);

  // Convex queries
  const mySchedules = useQuery(
    api.schedules.getMySchedules,
    isSignedIn ? {} : "skip"
  );
  const lastActiveId = useQuery(
    api.users.getLastActiveSchedule,
    isSignedIn ? {} : "skip"
  );

  // Convex mutations
  const createMutation = useMutation(api.schedules.createSchedule);
  const updateMutation = useMutation(api.schedules.updateSchedule);
  const deleteMutation = useMutation(api.schedules.deleteSchedule);
  const setLastActiveMutation = useMutation(api.users.setLastActiveSchedule);

  // Convert remote schedules to local format
  const toLocalSchedules = useCallback(
    (remotes: NonNullable<typeof mySchedules>): Schedule[] =>
      remotes.map((remote) => ({
        id: remote._id as string,
        convexId: remote._id as string,
        name: remote.name,
        tasks: (remote.tasks ?? []) as Task[],
        settings: {
          ...DEFAULT_SETTINGS,
          ...(remote.settings as Partial<ScheduleSettings>),
        },
        isPublic: remote.isPublic,
        shareId: remote.shareId,
        createdAt: remote.createdAt,
        updatedAt: remote.updatedAt,
      })),
    []
  );

  // Push a guest schedule to Convex
  const pushGuestSchedule = useCallback(
    async (schedule: Schedule) => {
      try {
        const convexId = await createMutation({ name: schedule.name });
        markSynced(schedule.id, convexId as string);
        await updateMutation({
          scheduleId: convexId,
          tasks: schedule.tasks,
          settings: schedule.settings,
        });
      } catch (err) {
        console.error("Failed to push schedule to Convex:", err);
      }
    },
    [createMutation, updateMutation, markSynced]
  );

  // ── Reactive sync: Convex → Local ────────────────────────────────
  useEffect(() => {
    if (!isSignedIn || !userReady || mySchedules === undefined) return;

    const remoteSchedules = toLocalSchedules(mySchedules);
    const remoteKey = JSON.stringify(
      mySchedules.map((s) => ({ id: s._id, u: s.updatedAt }))
    );

    if (!hasSynced.current) {
      // ── First sync: merge guest schedules ──
      hasSynced.current = true;
      const localSchedules = useScheduleStore.getState().schedules;
      const guestSchedules = localSchedules.filter((s) => !s.convexId);
      const merged = [...remoteSchedules, ...guestSchedules];

      isSyncing.current = true;
      syncFromConvex(merged);
      isSyncing.current = false;

      // Restore active schedule from Convex, or keep current if valid
      const currentActiveId = useScheduleStore.getState().activeScheduleId;
      if (lastActiveId && merged.some((s) => s.id === lastActiveId)) {
        setActiveSchedule(lastActiveId);
      } else if (merged.length > 0) {
        const activeExists = merged.some((s) => s.id === currentActiveId);
        if (!activeExists) setActiveSchedule(merged[0].id);
      }

      // Push guest schedules to Convex
      for (const guest of guestSchedules) {
        void pushGuestSchedule(guest);
      }

      prevRemoteKey.current = remoteKey;
    } else if (remoteKey !== prevRemoteKey.current) {
      // ── Subsequent reactive update from Convex ──
      prevRemoteKey.current = remoteKey;

      const localSchedules = useScheduleStore.getState().schedules;
      const guestSchedules = localSchedules.filter((s) => !s.convexId);
      const merged = [...remoteSchedules, ...guestSchedules];

      isSyncing.current = true;
      syncFromConvex(merged);
      isSyncing.current = false;

      // Ensure active schedule still exists
      const activeId = useScheduleStore.getState().activeScheduleId;
      if (activeId && !merged.some((s) => s.id === activeId)) {
        if (merged.length > 0) setActiveSchedule(merged[0].id);
      }
    }
  }, [isSignedIn, userReady, mySchedules, lastActiveId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Write-through: Local → Convex ────────────────────────────────
  useEffect(() => {
    if (!isSignedIn) return;

    const unsub = useScheduleStore.subscribe((state, prevState) => {
      if (!hasSynced.current || isSyncing.current) return;

      const prevMap = new Map(prevState.schedules.map((s) => [s.id, s]));
      const currMap = new Map(state.schedules.map((s) => [s.id, s]));

      // Deleted schedules
      for (const prev of prevState.schedules) {
        if (!currMap.has(prev.id) && prev.convexId) {
          void deleteMutation({ scheduleId: prev.convexId as any }).catch(
            (err) => console.error("Convex delete failed:", err)
          );
        }
      }

      // New schedules (no convexId yet)
      for (const curr of state.schedules) {
        if (!prevMap.has(curr.id) && !curr.convexId) {
          void pushGuestSchedule(curr);
        }
      }

      // Modified schedules (updatedAt changed)
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

      // Persist active schedule change to Convex
      if (
        state.activeScheduleId !== prevState.activeScheduleId &&
        state.activeScheduleId
      ) {
        void setLastActiveMutation({
          scheduleId: state.activeScheduleId,
        }).catch(() => {});
      }
    });

    return unsub;
  }, [isSignedIn, updateMutation, deleteMutation, setLastActiveMutation, pushGuestSchedule]);
}
