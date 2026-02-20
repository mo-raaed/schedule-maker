import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Select from "../ui/Select";
import { useScheduleStore, useAppSettingsStore } from "../../store/scheduleStore";
import { exportSchedule, type ExportFormat, type ExportOrientation } from "../../lib/export";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportModal({ open, onClose }: ExportModalProps) {
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const paletteMode = useAppSettingsStore((s) => s.paletteMode);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [orientation, setOrientation] = useState<ExportOrientation>("landscape");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!schedule) return;
    setExporting(true);
    try {
      await exportSchedule({
        format,
        orientation,
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        schedule,
        paletteMode,
      });
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Schedule" maxWidth="max-w-sm">
      <div className="space-y-5">
        {/* Format */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormat("pdf")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer
              ${format === "pdf"
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border hover:border-primary/30"
              }`}
          >
            <FileText className="h-6 w-6 text-red-500" />
            <span className="text-sm font-medium">PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setFormat("png")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer
              ${format === "png"
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border hover:border-primary/30"
              }`}
          >
            <FileImage className="h-6 w-6 text-blue-500" />
            <span className="text-sm font-medium">PNG</span>
          </button>
        </div>

        {/* Orientation */}
        <Select
          label="Orientation"
          value={orientation}
          onChange={(e) => setOrientation(e.target.value as ExportOrientation)}
          options={[
            { value: "landscape", label: "Landscape" },
            { value: "portrait", label: "Portrait" },
          ]}
        />

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Title <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={schedule?.name ?? "My Schedule"}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground
              transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
              placeholder:text-muted-foreground"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Subtitle <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g., Spring 2026"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground
              transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
              placeholder:text-muted-foreground"
          />
        </div>

        {/* Export button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleExport}
          disabled={exporting || !schedule}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download {format.toUpperCase()}
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
