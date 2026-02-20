import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useScheduleStore } from "../../store/scheduleStore";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link2, Copy, Check, Upload, Download, Globe, GlobeLock } from "lucide-react";
import type { Schedule, Task } from "../../lib/types";
import { DEFAULT_SETTINGS } from "../../lib/types";

// ─── Share Modal ────────────────────────────────────────────────────

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ open, onClose }: ShareModalProps) {
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const setShareId = useScheduleStore((s) => s.setShareId);
  const setPublic = useScheduleStore((s) => s.setPublic);
  const [copied, setCopied] = useState(false);

  // Convex mutation (only works when authenticated)
  let togglePublicMutation: any = null;
  try {
    togglePublicMutation = useMutation(api.schedules.togglePublic);
  } catch {
    // Guest mode — no Convex mutations available
  }

  if (!schedule) return null;

  const shareUrl = schedule.shareId
    ? `${window.location.origin}/?share=${schedule.shareId}`
    : null;

  const handleToggle = async () => {
    if (!schedule.convexId || !togglePublicMutation) {
      // Guest mode — generate a local share ID (won't actually be accessible without Convex)
      // Show a message that they need to sign in
      return;
    }

    try {
      const result = await togglePublicMutation({
        scheduleId: schedule.convexId as any,
      });
      if (result) {
        setShareId(schedule.id, result);
        setPublic(schedule.id, true);
      } else {
        setShareId(schedule.id, undefined);
        setPublic(schedule.id, false);
      }
    } catch (err) {
      console.error("Failed to toggle sharing:", err);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title="Share Schedule" maxWidth="max-w-sm">
      <div className="space-y-5">
        {/* Status */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          {schedule.isPublic ? (
            <Globe className="h-5 w-5 text-green-500" />
          ) : (
            <GlobeLock className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {schedule.isPublic ? "Public Link Active" : "Private"}
            </p>
            <p className="text-xs text-muted-foreground">
              {schedule.isPublic
                ? "Anyone with the link can view this schedule"
                : "Only you can see this schedule"}
            </p>
          </div>
        </div>

        {/* Share URL */}
        {shareUrl && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm
                text-muted-foreground truncate"
            />
            <Button variant="secondary" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Toggle */}
        {!schedule.convexId ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Sign in to share your schedule with a public link.
          </p>
        ) : (
          <Button
            className="w-full"
            variant={schedule.isPublic ? "secondary" : "primary"}
            onClick={handleToggle}
          >
            <Link2 className="h-4 w-4 mr-2" />
            {schedule.isPublic ? "Disable Sharing" : "Create Public Link"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

// ─── JSON Import/Export ─────────────────────────────────────────────

interface ImportExportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportExportModal({ open, onClose }: ImportExportModalProps) {
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

        // Validate structure
        if (!data.name || !Array.isArray(data.tasks)) {
          throw new Error("Invalid schedule file format");
        }

        // Create a new schedule
        const newId = createSchedule(data.name);

        // Import settings if present
        if (data.settings) {
          setActiveSchedule(newId);
          // Use setTimeout to ensure store has updated
          setTimeout(() => {
            updateSettings(data.settings);
            // Import tasks
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

    // Reset input
    e.target.value = "";
  };

  return (
    <Modal open={open} onClose={onClose} title="Import / Export" maxWidth="max-w-sm">
      <div className="space-y-4">
        {/* Export */}
        <Button className="w-full" variant="secondary" onClick={handleExportJson}>
          <Download className="h-4 w-4 mr-2" />
          Export as JSON
        </Button>

        {/* Import */}
        <label className="block">
          <input
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
          <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border
            text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary
            transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            Import from JSON
          </div>
        </label>

        {importError && (
          <p className="text-sm text-destructive">{importError}</p>
        )}
      </div>
    </Modal>
  );
}
