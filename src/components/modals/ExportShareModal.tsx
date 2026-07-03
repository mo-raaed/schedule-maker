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

  const handleToggleShare = async () => {
    if (!schedule.convexId || !togglePublicMutation) return;
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
    <Modal open={open} onClose={onClose} title="Export & Share" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* ── Export Section ── */}
        <div className="space-y-4">
          <h3 className="uppercase text-[10px] tracking-[0.1em] font-semibold text-[var(--color-on-surface-variant)]">
            Export
          </h3>

          {/* Format selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat("pdf")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-[0.98]
                ${format === "pdf"
                  ? "bg-primary/10 shadow-soft"
                  : "bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)]"
                }`}
            >
              <FileText className={`h-6 w-6 ${format === "pdf" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat("png")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-[0.98]
                ${format === "png"
                  ? "bg-primary/10 shadow-soft"
                  : "bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)]"
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
              <label className="block uppercase text-[10px] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)]">
                Title <span className="text-xs normal-case text-muted-foreground">(opt.)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={schedule.name}
                className="w-full rounded-2xl bg-[var(--color-surface-container-highest)] px-3 py-2.5 text-sm text-foreground
                  transition-all duration-200 focus:outline-none focus:shadow-[inset_0_0_0_1.5px_var(--color-primary)]
                  placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block uppercase text-[10px] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)]">
                Subtitle <span className="text-xs normal-case text-muted-foreground">(opt.)</span>
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., Spring 2026"
                className="w-full rounded-2xl bg-[var(--color-surface-container-highest)] px-3 py-2.5 text-sm text-foreground
                  transition-all duration-200 focus:outline-none focus:shadow-[inset_0_0_0_1.5px_var(--color-primary)]
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
        </div>

        {/* Spacing instead of divider */}
        <div className="my-6" />

        {/* ── Share Section ── */}
        <div className="space-y-4">
          <h3 className="uppercase text-[10px] tracking-[0.1em] font-semibold text-[var(--color-on-surface-variant)]">
            Share
          </h3>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-surface-container)]">
            {schedule.isPublic ? (
              <Globe className="h-5 w-5 text-green-500 shrink-0" />
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
              className="w-full flex items-center gap-2 p-3 rounded-2xl bg-[var(--color-surface-container-highest)]
                hover:bg-[var(--color-surface-container-high)] transition-all duration-200 cursor-pointer group active:scale-[0.98]"
            >
              <span className="flex-1 text-sm text-muted-foreground truncate text-left">
                {shareUrl}
              </span>
              {copied ? (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
              )}
            </button>
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
