import { useState, useRef, useEffect } from "react";
import { useScheduleStore } from "../../store/scheduleStore";
import { Plus, Pencil, Copy, Trash2, X, Check } from "lucide-react";

export default function ScheduleTabs() {
  const schedules = useScheduleStore((s) => s.schedules);
  const activeScheduleId = useScheduleStore((s) => s.activeScheduleId);
  const setActiveSchedule = useScheduleStore((s) => s.setActiveSchedule);
  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const deleteSchedule = useScheduleStore((s) => s.deleteSchedule);
  const renameSchedule = useScheduleStore((s) => s.renameSchedule);
  const duplicateSchedule = useScheduleStore((s) => s.duplicateSchedule);

  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex items-center gap-1 min-w-0 flex-1 mx-4">
      {/* Scrollable tabs */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto scrollbar-none min-w-0 flex-1"
      >
        {schedules.map((schedule) => {
          const isActive = schedule.id === activeScheduleId;

          if (renamingId === schedule.id) {
            return (
              <div key={schedule.id} className="flex items-center shrink-0">
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRename(schedule.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(schedule.id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="h-8 px-3 text-sm rounded-xl border border-primary bg-card text-foreground
                    outline-none min-w-[80px] max-w-[160px]"
                />
              </div>
            );
          }

          return (
            <button
              key={schedule.id}
              onClick={() => setActiveSchedule(schedule.id)}
              onContextMenu={(e) => handleContextMenu(e, schedule.id)}
              className={`relative shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm font-medium
                transition-all duration-200 cursor-pointer select-none max-w-[180px]
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              title={schedule.name}
            >
              <span className="truncate">{schedule.name}</span>
              {schedule.tasks.length > 0 && (
                <span className={`text-[10px] font-normal shrink-0 ${isActive ? "opacity-70" : "opacity-50"}`}>
                  {schedule.tasks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add tab button */}
      <button
        onClick={handleCreate}
        className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center
          text-muted-foreground hover:bg-accent hover:text-foreground
          transition-colors cursor-pointer"
        title="New Schedule"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-[200] w-44 bg-card rounded-xl border border-border shadow-card overflow-hidden animate-scale-in"
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
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground
              hover:bg-accent transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            Rename
          </button>
          <button
            onClick={() => {
              duplicateSchedule(contextMenu.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground
              hover:bg-accent transition-colors cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            Duplicate
          </button>
          {schedules.length > 1 && (
            <button
              onClick={() => {
                deleteSchedule(contextMenu.id);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive
                hover:bg-destructive/5 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
