import { useDraggable } from "@dnd-kit/core";
import { AlertTriangle } from "lucide-react";
import type { Task, PaletteMode } from "../../lib/types";
import { getTaskColors } from "../../lib/colors";
import { formatTime12h, getDuration } from "../../lib/time";

interface TaskBlockProps {
  task: Task;
  topPx: number;
  heightPx: number;
  isOverlapping: boolean;
  paletteMode: PaletteMode;
  onClick: () => void;
  readOnly: boolean;
}

export default function TaskBlock({
  task,
  topPx,
  heightPx,
  isOverlapping,
  paletteMode,
  onClick,
  readOnly,
}: TaskBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: readOnly,
  });

  const colors = getTaskColors(task.color, paletteMode);
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
      className={`absolute left-1 right-1 rounded-lg overflow-hidden cursor-pointer
        transition-shadow duration-150 select-none
        ${isDragging ? "opacity-40 shadow-none" : "shadow-sm hover:shadow-md"}
        ${isOverlapping ? "ring-2 ring-red-400/60" : ""}`}
      style={{
        top: topPx,
        height: heightPx,
        backgroundColor: colors.bg,
        color: colors.text,
        borderLeft: `3px solid ${colors.border}`,
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
            {formatTime12h(task.startTime)} – {formatTime12h(task.endTime)}
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
