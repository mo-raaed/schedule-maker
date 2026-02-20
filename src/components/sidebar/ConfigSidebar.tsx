import { X, Settings } from "lucide-react";
import Toggle from "../ui/Toggle";
import Select from "../ui/Select";
import { useScheduleStore } from "../../store/scheduleStore";
import { useAppSettingsStore } from "../../store/scheduleStore";
import type { StartOfWeek, TimeIncrement } from "../../lib/types";

interface ConfigSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function ConfigSidebar({ open, onClose }: ConfigSidebarProps) {
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const updateSettings = useScheduleStore((s) => s.updateSettings);
  const paletteMode = useAppSettingsStore((s) => s.paletteMode);
  const setPaletteMode = useAppSettingsStore((s) => s.setPaletteMode);

  const settings = schedule?.settings;

  if (!settings) return null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-2xl
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings body */}
        <div className="px-5 py-5 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
          {/* Weekend Toggle */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Days
            </h3>
            <Toggle
              checked={settings.showWeekends}
              onChange={(v) => updateSettings({ showWeekends: v })}
              label="Show Weekends"
            />
          </div>

          {/* Start of Week */}
          <Select
            label="Start of Week"
            value={settings.startOfWeek}
            onChange={(e) =>
              updateSettings({ startOfWeek: e.target.value as StartOfWeek })
            }
            options={[
              { value: "sunday", label: "Sunday" },
              { value: "monday", label: "Monday" },
              { value: "saturday", label: "Saturday" },
            ]}
          />

          {/* Time Increment */}
          <Select
            label="Time Increment"
            value={String(settings.timeIncrement)}
            onChange={(e) =>
              updateSettings({
                timeIncrement: parseInt(e.target.value) as TimeIncrement,
              })
            }
            options={[
              { value: "15", label: "15 minutes" },
              { value: "30", label: "30 minutes" },
              { value: "60", label: "60 minutes" },
            ]}
          />

          {/* Start Hour */}
          <Select
            label="Day Starts At"
            value={String(settings.startHour)}
            onChange={(e) =>
              updateSettings({ startHour: parseInt(e.target.value) })
            }
            options={Array.from({ length: 24 }, (_, i) => ({
              value: String(i),
              label: formatHour(i),
            }))}
          />

          {/* End Hour */}
          <Select
            label="Day Ends At"
            value={String(settings.endHour)}
            onChange={(e) =>
              updateSettings({ endHour: parseInt(e.target.value) })
            }
            options={Array.from({ length: 24 }, (_, i) => ({
              value: String(i + 1),
              label: formatHour(i + 1),
            })).filter((opt) => parseInt(opt.value) > settings.startHour)}
          />

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Color Palette Mode */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Appearance
            </h3>
            <Select
              label="Color Palette"
              value={paletteMode}
              onChange={(e) =>
                setPaletteMode(e.target.value as "pastel" | "bold")
              }
              options={[
                { value: "pastel", label: "Soft Pastels" },
                { value: "bold", label: "Vibrant Bold" },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function formatHour(h: number): string {
  if (h === 0 || h === 24) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}
