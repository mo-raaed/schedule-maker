import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import WeeklyGrid from "./components/grid/WeeklyGrid";
import Button from "./components/ui/Button";
import ExportModal from "./components/modals/ExportModal";
import { Calendar, Download, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Schedule, ScheduleSettings, Task, Day } from "./lib/types";
import { DEFAULT_SETTINGS } from "./lib/types";
import { useAppSettingsStore } from "./store/scheduleStore";
import { exportSchedule } from "./lib/export";

interface SharedScheduleViewProps {
  shareId: string;
}

export default function SharedScheduleView({ shareId }: SharedScheduleViewProps) {
  const result = useQuery(api.schedules.getPublicSchedule, { shareId });
  const paletteMode = useAppSettingsStore((s) => s.paletteMode);
  const [exporting, setExporting] = useState(false);

  if (result === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (result === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center px-4">
        <div>
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Schedule Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This shared link may have expired or been removed.
          </p>
          <a href="/" className="text-primary hover:underline text-sm">
            ← Go to Schedule Maker
          </a>
        </div>
      </div>
    );
  }

  const settings: ScheduleSettings = result.settings as ScheduleSettings ?? DEFAULT_SETTINGS;
  const tasks: Task[] = (result.tasks as Task[]) ?? [];

  // Create a fake schedule object for the export function
  const schedule: Schedule = {
    id: "shared",
    name: result.name,
    tasks,
    settings,
    isPublic: true,
    shareId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const handleExportPng = async () => {
    setExporting(true);
    try {
      await exportSchedule({
        format: "png",
        orientation: "landscape",
        schedule,
        paletteMode,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <Calendar className="h-5 w-5 text-primary" />
          </a>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-semibold text-sm">{result.name}</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Shared</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportPng}
          disabled={exporting}
        >
          <Download className="h-4 w-4 mr-1.5" />
          {exporting ? "Exporting..." : "Download"}
        </Button>
      </header>

      {/* Grid */}
      <main className="flex-1 min-h-0 p-3 sm:p-4">
        <WeeklyGrid
          readOnly
          tasks={tasks}
          settings={settings}
        />
      </main>
    </div>
  );
}
