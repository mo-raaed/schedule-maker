import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Select from "../ui/Select";
import { useScheduleStore, useAppSettingsStore } from "../../store/scheduleStore";
import { exportSchedule, type ExportFormat, type ExportOrientation } from "../../lib/export";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Download,
  FileImage,
  FileText,
  Loader2,
  Link2,
  Copy,
  Check,
  Globe,
  GlobeLock,
} from "lucide-react";

interface ExportShareModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportShareModal({ open, onClose }: ExportShareModalProps) {
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const setShareId = useScheduleStore((s) => s.setShareId);
  const setPublic = useScheduleStore((s) => s.setPublic);
  const paletteMode = useAppSettingsStore((s) => s.paletteMode);

  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [orientation, setOrientation] = useState<ExportOrientation>("landscape");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Convex mutation (only works when authenticated)
  let togglePublicMutation: any = null;
  try {
    togglePublicMutation = useMutation(api.schedules.togglePublic);
  } catch {
    // Guest mode — no Convex mutations
  }

  if (!schedule) return null;

  const shareUrl = schedule.shareId
    ? `${window.location.origin}/?share=${schedule.shareId}`
    : null;

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    setExportDone(false);
    try {
      await exportSchedule({
        format,
        orientation,
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        schedule,
        paletteMode,
      });
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Export failed. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  const handleToggleShare = async () => {
    if (!schedule.convexId || !togglePublicMutation) return;
    setShareError(null);
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
      setShareError(
        err instanceof Error ? err.message : "Could not update sharing. Please try again."
      );
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    setShareError(null);
    try {
      // Rejects on insecure origins and when the permission is denied.
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError("Could not copy. Select the link and copy it manually.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export & Share" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* ── Export Section ── */}
        <div className="space-y-4">
          <h3 className="uppercase text-[10px] tracking-[0.1em] font-semibold text-muted-foreground">
            Export
          </h3>

          {/* Format selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat("pdf")}
              className={`flex flex-col items-center gap-2 p-4 rounded-md transition-all duration-200 cursor-pointer active:scale-[0.98]
                ${format === "pdf"
                  ? "bg-primary/10 shadow-soft"
                  : "bg-surface hover:bg-surface-3"
                }`}
            >
              <FileText className={`h-6 w-6 ${format === "pdf" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat("png")}
              className={`flex flex-col items-center gap-2 p-4 rounded-md transition-all duration-200 cursor-pointer active:scale-[0.98]
                ${format === "png"
                  ? "bg-primary/10 shadow-soft"
                  : "bg-surface hover:bg-surface-3"
                }`}
            >
              <FileImage className={`h-6 w-6 ${format === "png" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">PNG</span>
            </button>
          </div>

          {/* Options */}
          <Select
            label="Orientation"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as ExportOrientation)}
            options={[
              { value: "landscape", label: "Landscape" },
              { value: "portrait", label: "Portrait" },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block uppercase text-[10px] tracking-[0.05em] font-semibold text-muted-foreground">
                Title <span className="text-xs normal-case text-muted-foreground">(opt.)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={schedule.name}
                className="w-full rounded-md bg-surface-2 border border-border px-3 py-2.5 text-sm text-foreground
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/70
                  placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block uppercase text-[10px] tracking-[0.05em] font-semibold text-muted-foreground">
                Subtitle <span className="text-xs normal-case text-muted-foreground">(opt.)</span>
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., Spring 2026"
                className="w-full rounded-md bg-surface-2 border border-border px-3 py-2.5 text-sm text-foreground
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/70
                  placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleExport}
            disabled={exporting}
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

          {exportError && (
            <p role="alert" className="text-sm text-destructive px-1">
              {exportError}
            </p>
          )}
          {exportDone && !exportError && (
            <p role="status" className="flex items-center gap-1.5 text-sm text-primary px-1">
              <Check className="h-4 w-4 shrink-0" />
              {format.toUpperCase()} downloaded.
            </p>
          )}
        </div>

        {/* Spacing instead of divider */}
        <div className="my-6" />

        {/* ── Share Section ── */}
        <div className="space-y-4">
          <h3 className="uppercase text-[10px] tracking-[0.1em] font-semibold text-muted-foreground">
            Share
          </h3>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 rounded-md bg-surface">
            {schedule.isPublic ? (
              <Globe className="h-5 w-5 text-primary shrink-0" />
            ) : (
              <GlobeLock className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {schedule.isPublic ? "Public Link Active" : "Private"}
              </p>
              <p className="text-xs text-muted-foreground">
                {schedule.isPublic
                  ? "Anyone with the link can view"
                  : "Only you can see this schedule"}
              </p>
            </div>
          </div>

          {/* Share URL (click to copy) */}
          {shareUrl && (
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2 p-3 rounded-md bg-surface-2 border border-border
                hover:bg-surface-3 transition-all duration-200 cursor-pointer group active:scale-[0.98]"
            >
              <span className="flex-1 text-sm text-muted-foreground truncate text-left">
                {shareUrl}
              </span>
              {copied ? (
                <Check className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
              )}
            </button>
          )}

          {shareError && (
            <p role="alert" className="text-sm text-destructive px-1">
              {shareError}
            </p>
          )}

          {/* Toggle */}
          {!schedule.convexId ? (
            <p className="text-sm text-muted-foreground text-center py-1">
              Sign in to share your schedule with a public link.
            </p>
          ) : (
            <Button
              className="w-full"
              variant={schedule.isPublic ? "secondary" : "primary"}
              onClick={handleToggleShare}
            >
              <Link2 className="h-4 w-4 mr-2" />
              {schedule.isPublic ? "Disable Sharing" : "Create Public Link"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
