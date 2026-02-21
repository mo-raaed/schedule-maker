import { useState } from "react";
import Modal from "../ui/Modal";
import { useScheduleStore } from "../../store/scheduleStore";
import { Download, Upload } from "lucide-react";

interface DataModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DataModal({ open, onClose }: DataModalProps) {
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const addTask = useScheduleStore((s) => s.addTask);
  const updateSettings = useScheduleStore((s) => s.updateSettings);
  const setActiveSchedule = useScheduleStore((s) => s.setActiveSchedule);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExportJson = () => {
    if (!schedule) return;
    const data = {
      name: schedule.name,
      tasks: schedule.tasks,
      settings: schedule.settings,
      exportedAt: new Date().toISOString(),
      version: 1,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${schedule.name.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (!data.name || !Array.isArray(data.tasks)) {
          throw new Error("Invalid schedule file format");
        }

        const newId = createSchedule(data.name);

        if (data.settings) {
          setActiveSchedule(newId);
          setTimeout(() => {
            updateSettings(data.settings);
            for (const task of data.tasks) {
              addTask({
                name: task.name,
                description: task.description,
                color: task.color,
                days: task.days,
                startTime: task.startTime,
                endTime: task.endTime,
              });
            }
          }, 0);
        }

        onClose();
      } catch (err: any) {
        setImportError(err.message || "Failed to import file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <Modal open={open} onClose={onClose} title="Data" maxWidth="max-w-sm">
      <div className="space-y-4">
        {/* Export JSON */}
        <button
          onClick={handleExportJson}
          disabled={!schedule}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-border
            hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Export JSON</p>
            <p className="text-xs text-muted-foreground">Download your schedule as a file</p>
          </div>
        </button>

        {/* Import JSON */}
        <label className="block">
          <input
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
          <div className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-border
            hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 cursor-pointer text-left">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Import JSON</p>
              <p className="text-xs text-muted-foreground">Load a schedule from a file</p>
            </div>
          </div>
        </label>

        {importError && (
          <p className="text-sm text-destructive px-1">{importError}</p>
        )}
      </div>
    </Modal>
  );
}
