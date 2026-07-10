import { beforeEach, describe, expect, it } from "vitest";
import { useScheduleStore } from "./scheduleStore";

/** zustand's persist middleware reaches for localStorage at hydrate time. */
function stubLocalStorage() {
  const map = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

stubLocalStorage();

const reset = () =>
  useScheduleStore.setState({ schedules: [], activeScheduleId: null });

describe("reorderSchedules", () => {
  beforeEach(reset);

  it("only stamps updatedAt on schedules whose order actually moved", async () => {
    const s = useScheduleStore.getState();
    const a = s.createSchedule("A");
    const b = s.createSchedule("B");
    const c = s.createSchedule("C");

    // Give every schedule a settled order and a stale timestamp.
    useScheduleStore.setState((st) => ({
      schedules: st.schedules.map((sc, i) => ({ ...sc, order: i, updatedAt: 1000 })),
    }));

    // Move A (index 0) to C's slot (index 2). B and C shift; all three move.
    useScheduleStore.getState().reorderSchedules(a, c);

    const after = useScheduleStore.getState().schedules;
    expect(after.map((sc) => sc.name)).toEqual(["B", "C", "A"]);
    // Every one of these three changed index, so every one syncs.
    for (const sc of after) expect(sc.updatedAt).toBeGreaterThan(1000);

    // Now a no-op reorder: dropping B onto itself must not touch anything.
    const before = useScheduleStore.getState().schedules.map((sc) => sc.updatedAt);
    useScheduleStore.getState().reorderSchedules(b, b);
    expect(useScheduleStore.getState().schedules.map((sc) => sc.updatedAt)).toEqual(before);
  });

  it("leaves untouched schedules alone when only a suffix moves", () => {
    const s = useScheduleStore.getState();
    s.createSchedule("A");
    const b = s.createSchedule("B");
    const c = s.createSchedule("C");

    useScheduleStore.setState((st) => ({
      schedules: st.schedules.map((sc, i) => ({ ...sc, order: i, updatedAt: 1000 })),
    }));

    // Swap B and C. A holds index 0 and must not be re-sent to Convex.
    useScheduleStore.getState().reorderSchedules(b, c);

    const after = useScheduleStore.getState().schedules;
    expect(after.map((sc) => sc.name)).toEqual(["A", "C", "B"]);
    expect(after.find((sc) => sc.name === "A")!.updatedAt).toBe(1000);
    expect(after.find((sc) => sc.name === "B")!.updatedAt).toBeGreaterThan(1000);
    expect(after.find((sc) => sc.name === "C")!.updatedAt).toBeGreaterThan(1000);
  });
});

describe("deleteSchedule", () => {
  beforeEach(reset);

  it("reassigns the active schedule when the active one is deleted", () => {
    const s = useScheduleStore.getState();
    const a = s.createSchedule("A");
    s.createSchedule("B");
    useScheduleStore.getState().setActiveSchedule(a);

    useScheduleStore.getState().deleteSchedule(a);

    const st = useScheduleStore.getState();
    expect(st.schedules.map((sc) => sc.name)).toEqual(["B"]);
    expect(st.activeScheduleId).toBe(st.schedules[0].id);
  });
});
