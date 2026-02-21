import { useDraggable } from "@dnd-kit/core";
import { AlertTriangle } from "lucide-react";
import type { Task, PaletteMode } from "../../lib/types";
import { getTaskColors } from "../../lib/colors";
import { formatTimeDisplay } from "../../lib/time";
import type { ClockFormat } from "../../lib/types";

interface TaskBlockProps {
  task: Task;
  topPx: number;
  heightPx: number;
  isOverlapping: boolean;
  paletteMode: PaletteMode;
  onClick: () => void;
  readOnly: boolean;
  clockFormat?: ClockFormat;
  isDarkMode?: boolean;
}

export default function TaskBlock({
  task,
  topPx,
  heightPx,
  isOverlapping,
  paletteMode,
  onClick,
  readOnly,
  clockFormat = "12h",
  isDarkMode = false,
}: TaskBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: readOnly,
  });

  const colors = getTaskColors(task.color, paletteMode, isDarkMode);
  const isCompact = heightPx < 40;
  const isTiny = heightPx < 24;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute left-1 right-1 rounded-xl overflow-hidden cursor-pointer
        transition-[transform,box-shadow,opacity] duration-150 select-none
        ${isDragging ? "opacity-40 shadow-none" : "shadow-sm hover:shadow-md hover:scale-[1.01]"}
        ${isOverlapping ? "ring-2 ring-red-400/60" : ""}`}
      style={{
        top: topPx,
        height: heightPx,
        backgroundColor: colors.bg,
        color: colors.text,
        borderLeft: `4px solid ${colors.border}`,
        zIndex: isDragging ? 50 : 10,
      }}
    >
      <div className={`h-full px-2 ${isTiny ? "py-0" : "py-1"} flex flex-col justify-center overflow-hidden`}>
        {/* Task name */}
        <div className={`font-semibold truncate leading-tight ${isCompact ? "text-[10px]" : "text-xs"}`}>
          {task.name}
        </div>

        {/* Time range (only if there's room) */}
        {!isCompact && (
          <div className="text-[10px] opacity-75 truncate mt-0.5">
            {formatTimeDisplay(task.startTime, clockFormat)} – {formatTimeDisplay(task.endTime, clockFormat)}
          </div>
        )}

        {/* Description (only on large blocks) */}
        {heightPx >= 60 && task.description && (
          <div className="text-[10px] opacity-60 truncate mt-0.5">
            {task.description}
          </div>
        )}
      </div>

      {/* Overlap warning icon */}
      {isOverlapping && (
        <div className="absolute top-0.5 right-0.5">
          <AlertTriangle className="h-3 w-3 text-red-500" />
        </div>
      )}
    </div>
  );
}
