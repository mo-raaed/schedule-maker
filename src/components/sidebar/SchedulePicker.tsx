import { useState, useRef, useEffect } from "react";
import { useScheduleStore } from "../../store/scheduleStore";
import { ChevronDown, Plus, Trash2, Copy, Check, Pencil } from "lucide-react";

export default function SchedulePicker() {
  const schedules = useScheduleStore((s) => s.schedules);
  const activeScheduleId = useScheduleStore((s) => s.activeScheduleId);
  const setActiveSchedule = useScheduleStore((s) => s.setActiveSchedule);
  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const deleteSchedule = useScheduleStore((s) => s.deleteSchedule);
  const renameSchedule = useScheduleStore((s) => s.renameSchedule);
  const duplicateSchedule = useScheduleStore((s) => s.duplicateSchedule);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setRenamingId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  const handleCreate = () => {
    const name = `Schedule ${schedules.length + 1}`;
    createSchedule(name);
    setDropdownOpen(false);
  };

  const handleRename = (id: string) => {
    if (renameValue.trim()) {
      renameSchedule(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors 
          text-sm font-semibold text-foreground cursor-pointer max-w-[200px]"
      >
        <span className="truncate">{activeSchedule?.name ?? "No Schedule"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`group flex items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer
                  ${schedule.id === activeScheduleId ? "bg-primary/5 text-primary" : "text-foreground hover:bg-accent"}`}
              >
                {renamingId === schedule.id ? (
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(schedule.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(schedule.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="flex-1 bg-transparent border-b border-primary outline-none text-sm py-0.5"
                  />
                ) : (
                  <>
                    <span
                      className="flex-1 truncate"
                      onClick={() => {
                        setActiveSchedule(schedule.id);
                        setDropdownOpen(false);
                      }}
                    >
                      {schedule.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {schedule.tasks.length}
                    </span>

                    {/* Actions (visible on hover) */}
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(schedule.id);
                          setRenameValue(schedule.name);
                        }}
                        className="p-1 rounded hover:bg-accent cursor-pointer"
                        title="Rename"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSchedule(schedule.id);
                          setDropdownOpen(false);
                        }}
                        className="p-1 rounded hover:bg-accent cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {schedules.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSchedule(schedule.id);
                          }}
                          className="p-1 rounded hover:bg-red-50 text-destructive cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Create new */}
          <div className="border-t border-border p-1">
            <button
              onClick={handleCreate}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary font-medium
                rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
