import { describe, expect, it } from "vitest";
import { diffSchedule, isEmptyDiff } from "./syncDiff";
import { DEFAULT_SETTINGS } from "./types";
import type { Schedule, Task } from "./types";

const task = (id: string, over: Partial<Task> = {}): Task => ({
  id,
  name: `Task ${id}`,
  color: "#DBEAFE",
  days: ["mon"],
  startTime: "09:00",
  endTime: "10:00",
  ...over,
});

const schedule = (tasks: Task[], over: Partial<Schedule> = {}): Schedule => ({
  id: "s1",
  name: "My Schedule",
  tasks,
  settings: { ...DEFAULT_SETTINGS },
  isPublic: false,
  createdAt: 0,
  updatedAt: 0,
  ...over,
});

describe("diffSchedule", () => {
  it("reports nothing for an unchanged schedule", () => {
    const s = schedule([task("a"), task("b")]);
    const d = diffSchedule(s, schedule([task("a"), task("b")]));
    expect(isEmptyDiff(d)).toBe(true);
  });

  it("detects an added task without resending the others", () => {
    const prev = schedule([task("a")]);
    const curr = schedule([task("a"), task("b")]);
    const d = diffSchedule(prev, curr);
    expect(d.added.map((t) => t.id)).toEqual(["b"]);
    expect(d.updated).toEqual([]);
    expect(d.removedIds).toEqual([]);
  });

  it("detects a removed task by id", () => {
    const d = diffSchedule(schedule([task("a"), task("b")]), schedule([task("a")]));
    expect(d.removedIds).toEqual(["b"]);
    expect(d.added).toEqual([]);
  });

  it("detects a field edit as an update, not an add", () => {
    const prev = schedule([task("a")]);
    const curr = schedule([task("a", { startTime: "11:00" })]);
    const d = diffSchedule(prev, curr);
    expect(d.updated.map((t) => t.id)).toEqual(["a"]);
    expect(d.added).toEqual([]);
    expect(d.removedIds).toEqual([]);
  });

  it("treats a days-array edit as an update", () => {
    const d = diffSchedule(
      schedule([task("a", { days: ["mon"] })]),
      schedule([task("a", { days: ["mon", "tue"] })])
    );
    expect(d.updated.map((t) => t.id)).toEqual(["a"]);
  });

  it("does not mistake identical tasks for updates when the array is reordered", () => {
    const d = diffSchedule(
      schedule([task("a"), task("b")]),
      schedule([task("b"), task("a")])
    );
    expect(isEmptyDiff(d)).toBe(true);
  });

  it("flags a rename as metadata-only", () => {
    const d = diffSchedule(schedule([task("a")]), schedule([task("a")], { name: "Renamed" }));
    expect(d.metadataChanged).toBe(true);
    expect(d.added).toEqual([]);
    expect(d.updated).toEqual([]);
    expect(d.removedIds).toEqual([]);
  });

  it("flags an order change as metadata-only", () => {
    const d = diffSchedule(schedule([]), schedule([], { order: 3 }));
    expect(d.metadataChanged).toBe(true);
  });

  it("flags a settings change as metadata-only", () => {
    const d = diffSchedule(
      schedule([]),
      schedule([], { settings: { ...DEFAULT_SETTINGS, showWeekends: true } })
    );
    expect(d.metadataChanged).toBe(true);
  });

  it("does not flag metadata when only tasks changed", () => {
    const d = diffSchedule(schedule([task("a")]), schedule([task("a"), task("b")]));
    expect(d.metadataChanged).toBe(false);
  });

  it("handles a simultaneous add, update and remove", () => {
    const prev = schedule([task("a"), task("b")]);
    const curr = schedule([task("a", { name: "edited" }), task("c")]);
    const d = diffSchedule(prev, curr);
    expect(d.updated.map((t) => t.id)).toEqual(["a"]);
    expect(d.added.map((t) => t.id)).toEqual(["c"]);
    expect(d.removedIds).toEqual(["b"]);
  });
});
