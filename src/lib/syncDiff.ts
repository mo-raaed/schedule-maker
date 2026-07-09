import type { Schedule, Task } from "./types";

/**
 * What changed between two snapshots of one schedule.
 *
 * The write-through used to push the whole tasks array on any change, which
 * meant a stale client could overwrite a task another tab had just added.
 * Emitting per-task operations lets the server re-read its own array inside a
 * transaction, so concurrent edits merge instead of clobbering.
 */
export interface ScheduleDiff {
  added: Task[];
  updated: Task[];
  removedIds: string[];
  /** True when name, settings or order moved — pushed without touching tasks. */
  metadataChanged: boolean;
}

function tasksEqual(a: Task, b: Task): boolean {
  return (
    a.name === b.name &&
    a.description === b.description &&
    a.color === b.color &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime &&
    a.days.length === b.days.length &&
    a.days.every((d, i) => d === b.days[i])
  );
}

export function diffSchedule(prev: Schedule, curr: Schedule): ScheduleDiff {
  const prevById = new Map(prev.tasks.map((t) => [t.id, t]));
  const currById = new Map(curr.tasks.map((t) => [t.id, t]));

  const added: Task[] = [];
  const updated: Task[] = [];
  for (const task of curr.tasks) {
    const before = prevById.get(task.id);
    if (!before) added.push(task);
    else if (!tasksEqual(before, task)) updated.push(task);
  }

  const removedIds = prev.tasks
    .filter((t) => !currById.has(t.id))
    .map((t) => t.id);

  const metadataChanged =
    prev.name !== curr.name ||
    prev.order !== curr.order ||
    JSON.stringify(prev.settings) !== JSON.stringify(curr.settings);

  return { added, updated, removedIds, metadataChanged };
}

/** True when the diff carries nothing worth a network round-trip. */
export function isEmptyDiff(d: ScheduleDiff): boolean {
  return (
    d.added.length === 0 &&
    d.updated.length === 0 &&
    d.removedIds.length === 0 &&
    !d.metadataChanged
  );
}
