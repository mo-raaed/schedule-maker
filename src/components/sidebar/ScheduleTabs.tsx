import { useState, useRef, useEffect } from "react";
import { useScheduleStore } from "../../store/scheduleStore";
import { Plus, Pencil, Copy, Trash2, MoreVertical } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import type { Schedule } from "../../lib/types";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTabProps {
  schedule: Schedule;
  isActive: boolean;
  renamingId: string | null;
  renameValue: string;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  setRenameValue: (v: string) => void;
  handleRename: (id: string) => void;
  setRenamingId: (id: string | null) => void;
  setActiveSchedule: (id: string) => void;
  openMenu: (id: string, x: number, y: number) => void;
}

function SortableTab({
  schedule,
  isActive,
  renamingId,
  renameValue,
  renameInputRef,
  setRenameValue,
  handleRename,
  setRenamingId,
  setActiveSchedule,
  openMenu,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: schedule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (renamingId === schedule.id) {
    return (
      <div ref={setNodeRef} style={style} className="flex items-center shrink-0">
        <input
          ref={renameInputRef}
          value={renameValue}
          aria-label={`Rename ${schedule.name}`}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={() => handleRename(schedule.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename(schedule.id);
            if (e.key === "Escape") setRenamingId(null);
          }}
          className="h-8 px-3 text-sm rounded-full bg-surface-2 border border-border text-foreground
            outline-none focus:ring-2 focus:ring-ring/70 min-w-[80px] max-w-[160px]"
        />
      </div>
    );
  }

  /** Anchor the menu under the kebab so touch users get the same actions. */
  const openMenuFromKebab = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    openMenu(schedule.id, r.left, r.bottom + 4);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onContextMenu={(e) => {
        e.preventDefault();
        openMenu(schedule.id, e.clientX, e.clientY);
      }}
      className={`group relative shrink-0 flex items-center gap-0.5 h-8 pl-4 pr-1 rounded-full text-sm font-medium
        transition-colors duration-200 select-none max-w-[200px]
        ${isActive
          ? "bg-primary-solid text-white shadow-soft"
          : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground"
        }`}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={() => setActiveSchedule(schedule.id)}
        onDoubleClick={() => {
          setRenamingId(schedule.id);
          setRenameValue(schedule.name);
        }}
        className="flex items-center gap-1.5 min-w-0 cursor-pointer active:cursor-grabbing active:scale-[0.98]"
        title={`${schedule.name} — double-click to rename`}
      >
        <span className="truncate">{schedule.name}</span>
        {schedule.tasks.length > 0 && (
          <span className={`text-[10px] font-normal shrink-0 ${isActive ? "opacity-70" : "opacity-50"}`}>
            {schedule.tasks.length}
          </span>
        )}
      </button>

      <button
        onClick={openMenuFromKebab}
        aria-label={`Actions for ${schedule.name}`}
        className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center cursor-pointer
          transition-colors duration-200
          ${isActive ? "hover:bg-white/20" : "hover:bg-background/60"}`}
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ScheduleTabs() {
  const schedules = useScheduleStore((s) => s.schedules);
  const activeScheduleId = useScheduleStore((s) => s.activeScheduleId);
  const setActiveSchedule = useScheduleStore((s) => s.setActiveSchedule);
  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const deleteSchedule = useScheduleStore((s) => s.deleteSchedule);
  const renameSchedule = useScheduleStore((s) => s.renameSchedule);
  const duplicateSchedule = useScheduleStore((s) => s.duplicateSchedule);
  const reorderSchedules = useScheduleStore((s) => s.reorderSchedules);

  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Schedule | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSchedules(active.id as string, over.id as string);
    }
  };

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  const handleCreate = () => {
    const name = `Schedule ${schedules.length + 1}`;
    createSchedule(name);
  };

  const handleRename = (id: string) => {
    if (renameValue.trim()) {
      renameSchedule(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const MENU_W = 176; // w-44
  const MENU_H = 132; // 3 rows + padding

  /** Clamp to the viewport so the menu never opens off-screen. */
  const openMenu = (id: string, x: number, y: number) => {
    setContextMenu({
      id,
      x: Math.min(x, window.innerWidth - MENU_W - 8),
      y: Math.min(y, window.innerHeight - MENU_H - 8),
    });
  };

  return (
    <div className="flex items-center gap-1.5 min-w-0 flex-1 mx-4">
      {/* Scrollable tabs */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none min-w-0 flex-1"
        >
          <SortableContext
            items={schedules.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            {schedules.map((schedule) => (
              <SortableTab
                key={schedule.id}
                schedule={schedule}
                isActive={schedule.id === activeScheduleId}
                renamingId={renamingId}
                renameValue={renameValue}
                renameInputRef={renameInputRef}
                setRenameValue={setRenameValue}
                handleRename={handleRename}
                setRenamingId={setRenamingId}
                setActiveSchedule={setActiveSchedule}
                openMenu={openMenu}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Add tab button */}
      <button
        onClick={handleCreate}
        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center
          text-muted-foreground hover:bg-surface-2 hover:text-foreground
          transition-all duration-200 cursor-pointer active:scale-[0.98]"
        title="New Schedule"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-[200] w-44 bg-surface border border-border rounded-md shadow-card-lg p-1 animate-scale-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              const s = schedules.find((s) => s.id === contextMenu.id);
              if (s) {
                setRenamingId(s.id);
                setRenameValue(s.name);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground rounded-sm
              hover:bg-surface-2 transition-colors duration-150 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            Rename
          </button>
          <button
            onClick={() => {
              duplicateSchedule(contextMenu.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground rounded-sm
              hover:bg-surface-2 transition-colors duration-150 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            Duplicate
          </button>
          {schedules.length > 1 && (
            <button
              onClick={() => {
                const s = schedules.find((s) => s.id === contextMenu.id);
                if (s) setPendingDelete(s);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive rounded-sm
                hover:bg-destructive/10 transition-colors duration-150 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation — deleting a schedule destroys every task in it. */}
      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete schedule?"
        maxWidth="max-w-sm"
      >
        {pendingDelete && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">{pendingDelete.name}</span>
              {pendingDelete.tasks.length > 0 ? (
                <>
                  {" "}and its {pendingDelete.tasks.length}{" "}
                  {pendingDelete.tasks.length === 1 ? "task" : "tasks"} will be deleted.
                </>
              ) : (
                <> will be deleted.</>
              )}{" "}
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteSchedule(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
