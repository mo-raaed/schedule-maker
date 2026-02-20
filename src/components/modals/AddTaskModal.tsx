import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import ColorPicker from "../ui/ColorPicker";
import TimePicker from "../ui/TimePicker";
import type { Day, Task, ScheduleSettings } from "../../lib/types";
import { DAY_SHORT_LABELS, ALL_DAYS } from "../../lib/types";
import { DEFAULT_TASK_COLOR } from "../../lib/colors";
import { useScheduleStore, useAppSettingsStore } from "../../store/scheduleStore";
import { getVisibleDays } from "../../lib/time";
import { Trash2 } from "lucide-react";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  /** If provided, we're editing this task instead of creating */
  editTask?: Task | null;
  /** Pre-fill day when clicking a grid cell */
  prefillDay?: Day;
  /** Pre-fill time when clicking a grid cell */
  prefillTime?: string;
}

export default function AddTaskModal({
  open,
  onClose,
  editTask,
  prefillDay,
  prefillTime,
}: AddTaskModalProps) {
  const addTask = useScheduleStore((s) => s.addTask);
  const updateTask = useScheduleStore((s) => s.updateTask);
  const removeTask = useScheduleStore((s) => s.removeTask);
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const paletteMode = useAppSettingsStore((s) => s.paletteMode);

  const settings = schedule?.settings;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_TASK_COLOR);
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Reset form when modal opens/changes
  useEffect(() => {
    if (open) {
      if (editTask) {
        setName(editTask.name);
        setDescription(editTask.description ?? "");
        setColor(editTask.color);
        setSelectedDays([...editTask.days]);
        setStartTime(editTask.startTime);
        setEndTime(editTask.endTime);
      } else {
        setName("");
        setDescription("");
        setColor(DEFAULT_TASK_COLOR);
        setSelectedDays(prefillDay ? [prefillDay] : []);
        setStartTime(prefillTime ?? "09:00");
        setEndTime(
          prefillTime
            ? (() => {
                const [h, m] = prefillTime.split(":").map(Number);
                const newH = Math.min(h + 1, settings?.endHour ?? 23);
                return `${newH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
              })()
            : "10:00"
        );
      }
    }
  }, [open, editTask, prefillDay, prefillTime, settings]);

  const toggleDay = (day: Day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (!name.trim() || selectedDays.length === 0) return;

    const taskData = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      days: selectedDays,
      startTime,
      endTime,
    };

    if (editTask) {
      updateTask({ ...taskData, id: editTask.id });
    } else {
      addTask(taskData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editTask) {
      removeTask(editTask.id);
      onClose();
    }
  };

  const visibleDays = settings ? getVisibleDays(settings) : ALL_DAYS.filter((d) => d !== "sat" && d !== "sun");
  const isValid = name.trim().length > 0 && selectedDays.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editTask ? "Edit Task" : "Add Task"}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Math Lecture, Gym, Meeting"
            autoFocus
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground
              transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
              hover:border-primary/30 placeholder:text-muted-foreground"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes..."
            rows={2}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground
              transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
              hover:border-primary/30 placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* Color Picker */}
        <ColorPicker value={color} onChange={setColor} paletteMode={paletteMode} />

        {/* Days Multi-select */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Days <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {visibleDays.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                >
                  {DAY_SHORT_LABELS[day]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Pickers */}
        <div className="grid grid-cols-2 gap-4">
          <TimePicker
            label="Start Time"
            value={startTime}
            onChange={setStartTime}
            increment={settings?.timeIncrement ?? 30}
            startHour={settings?.startHour ?? 0}
            endHour={settings?.endHour ?? 24}
          />
          <TimePicker
            label="End Time"
            value={endTime}
            onChange={setEndTime}
            increment={settings?.timeIncrement ?? 30}
            startHour={settings?.startHour ?? 0}
            endHour={settings?.endHour ?? 24}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {editTask && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              {editTask ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
