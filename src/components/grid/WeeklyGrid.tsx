import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useScheduleStore, useAppSettingsStore } from "../../store/scheduleStore";
import type { Day, Task, ScheduleSettings } from "../../lib/types";
import { getVisibleDays, generateTimeSlots, formatTime12h, timeToMinutes, minutesToTime, findOverlaps } from "../../lib/time";
import { DAY_SHORT_LABELS } from "../../lib/types";
import TaskBlock from "./TaskBlock";
import { getTaskColors } from "../../lib/colors";

interface WeeklyGridProps {
  onCellClick?: (day: Day, time: string) => void;
  onTaskClick?: (task: Task) => void;
  readOnly?: boolean;
  /** Ref for export capture */
  gridRef?: React.RefObject<HTMLDivElement | null>;
  /** Override tasks (for shared view) */
  tasks?: Task[];
  /** Override settings (for shared view) */
  settings?: ScheduleSettings;
}

const ROW_HEIGHT = 60; // px per time-increment row

export default function WeeklyGrid({
  onCellClick,
  onTaskClick,
  readOnly = false,
  gridRef,
  tasks: overrideTasks,
  settings: overrideSettings,
}: WeeklyGridProps) {
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const updateTask = useScheduleStore((s) => s.updateTask);
  const paletteMode = useAppSettingsStore((s) => s.paletteMode);

  const settings = overrideSettings ?? schedule?.settings;
  const tasks = overrideTasks ?? schedule?.tasks ?? [];

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const visibleDays = useMemo(
    () => (settings ? getVisibleDays(settings) : []),
    [settings]
  );

  const timeSlots = useMemo(
    () => (settings ? generateTimeSlots(settings) : []),
    [settings]
  );

  // Pre-compute overlaps per day
  const overlaps = useMemo(() => {
    const map = new Map<Day, Set<string>>();
    for (const day of visibleDays) {
      map.set(day, findOverlaps(tasks, day));
    }
    return map;
  }, [tasks, visibleDays]);

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No schedule selected
      </div>
    );
  }

  const totalMinutes = (settings.endHour - settings.startHour) * 60;
  const totalHeight = (totalMinutes / settings.timeIncrement) * ROW_HEIGHT;

  // ── Drag handlers ──

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    if (readOnly || !event.over) return;

    const taskId = event.active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // The droppable id format is "cell-{day}-{time}"
    const overId = event.over.id as string;
    if (!overId.startsWith("cell-")) return;

    const parts = overId.split("-");
    const targetDay = parts[1] as Day;
    const targetTime = parts.slice(2).join("-"); // handle "08:00" format

    // Calculate duration in minutes
    const durationMin = timeToMinutes(task.endTime) - timeToMinutes(task.startTime);
    const newStart = targetTime;
    const newEndMin = timeToMinutes(targetTime) + durationMin;
    const newEnd = minutesToTime(Math.min(newEndMin, settings.endHour * 60));

    // Update the task: replace the dragged day with the target day, update time
    const updatedTask: Task = {
      ...task,
      // If task was multi-day, only move the instance on the original day
      // For simplicity: if dragged, replace ALL days with just the target day
      // (User can re-add multi-day via edit modal)
      days: task.days.length === 1 ? [targetDay] : task.days.map((d) =>
        // Only replace if it makes sense — keep other days, replace the "source"
        d === (activeTask?.days[0] ?? d) ? targetDay : d
      ),
      startTime: newStart,
      endTime: newEnd,
    };

    updateTask(updatedTask);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={gridRef}
        className="flex-1 overflow-auto bg-card rounded-2xl border border-border shadow-sm"
      >
        <div className="min-w-[600px]">
          {/* ── Day Headers ── */}
          <div
            className="grid sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border"
            style={{
              gridTemplateColumns: `72px repeat(${visibleDays.length}, 1fr)`,
            }}
          >
            {/* Empty top-left corner */}
            <div className="p-3 text-xs font-medium text-muted-foreground border-r border-border" />

            {visibleDays.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold text-sm text-foreground border-r border-border last:border-r-0"
              >
                {DAY_SHORT_LABELS[day]}
              </div>
            ))}
          </div>

          {/* ── Grid Body ── */}
          <div
            className="grid relative"
            style={{
              gridTemplateColumns: `72px repeat(${visibleDays.length}, 1fr)`,
            }}
          >
            {/* Time labels column */}
            <div className="border-r border-border" style={{ height: totalHeight }}>
              {timeSlots.map((time, i) => (
                <div
                  key={time}
                  className="flex items-start justify-end pr-2 text-xs text-muted-foreground"
                  style={{ height: ROW_HEIGHT, paddingTop: 2 }}
                >
                  {formatTime12h(time)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {visibleDays.map((day) => (
              <DayColumn
                key={day}
                day={day}
                tasks={tasks}
                settings={settings}
                timeSlots={timeSlots}
                totalHeight={totalHeight}
                overlaps={overlaps.get(day) ?? new Set()}
                paletteMode={paletteMode}
                onCellClick={onCellClick}
                onTaskClick={onTaskClick}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask && (
          <div
            className="rounded-lg shadow-xl opacity-90 px-2 py-1 text-xs font-medium"
            style={{
              backgroundColor: getTaskColors(activeTask.color, paletteMode).bg,
              color: getTaskColors(activeTask.color, paletteMode).text,
              width: 120,
            }}
          >
            {activeTask.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Day Column ─────────────────────────────────────────────────────

import { useDroppable } from "@dnd-kit/core";

interface DayColumnProps {
  day: Day;
  tasks: Task[];
  settings: ScheduleSettings;
  timeSlots: string[];
  totalHeight: number;
  overlaps: Set<string>;
  paletteMode: "pastel" | "bold";
  onCellClick?: (day: Day, time: string) => void;
  onTaskClick?: (task: Task) => void;
  readOnly: boolean;
}

function DayColumn({
  day,
  tasks,
  settings,
  timeSlots,
  totalHeight,
  overlaps,
  paletteMode,
  onCellClick,
  onTaskClick,
  readOnly,
}: DayColumnProps) {
  const dayTasks = useMemo(
    () => tasks.filter((t) => t.days.includes(day)),
    [tasks, day]
  );

  const gridStart = settings.startHour * 60;
  const totalMinutes = (settings.endHour - settings.startHour) * 60;

  return (
    <div
      className="relative border-r border-border last:border-r-0"
      style={{ height: totalHeight }}
    >
      {/* Grid lines (time slot cells) */}
      {timeSlots.map((time) => (
        <DroppableCell
          key={`${day}-${time}`}
          id={`cell-${day}-${time}`}
          day={day}
          time={time}
          height={ROW_HEIGHT}
          onClick={() => onCellClick?.(day, time)}
          readOnly={readOnly}
        />
      ))}

      {/* Task blocks */}
      {dayTasks.map((task) => {
        const taskStart = timeToMinutes(task.startTime);
        const taskEnd = timeToMinutes(task.endTime);
        const topPx = ((taskStart - gridStart) / totalMinutes) * totalHeight;
        const heightPx = ((taskEnd - taskStart) / totalMinutes) * totalHeight;

        return (
          <TaskBlock
            key={task.id}
            task={task}
            topPx={Math.max(0, topPx)}
            heightPx={Math.max(16, heightPx)}
            isOverlapping={overlaps.has(task.id)}
            paletteMode={paletteMode}
            onClick={() => onTaskClick?.(task)}
            readOnly={readOnly}
          />
        );
      })}
    </div>
  );
}

// ─── Droppable Cell ─────────────────────────────────────────────────

interface DroppableCellProps {
  id: string;
  day: Day;
  time: string;
  height: number;
  onClick: () => void;
  readOnly: boolean;
}

function DroppableCell({ id, day, time, height, onClick, readOnly }: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`border-b border-border/50 transition-colors
        ${!readOnly ? "cursor-pointer hover:bg-primary/[0.03]" : ""}
        ${isOver ? "bg-primary/10" : ""}`}
      style={{ height }}
      onClick={() => {
        if (!readOnly) onClick();
      }}
    />
  );
}
