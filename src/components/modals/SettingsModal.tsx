import Modal from "../ui/Modal";
import Toggle from "../ui/Toggle";
import Select from "../ui/Select";
import { useScheduleStore, useAppSettingsStore } from "../../store/scheduleStore";
import type { StartOfWeek, TimeIncrement, ClockFormat } from "../../lib/types";
import { formatHourDisplay } from "../../lib/time";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const updateSettings = useScheduleStore((s) => s.updateSettings);
  const paletteMode = useAppSettingsStore((s) => s.paletteMode);
  const setPaletteMode = useAppSettingsStore((s) => s.setPaletteMode);

  const settings = schedule?.settings;
  if (!settings) return null;

  const clockFormat = settings.clockFormat ?? "12h";

  return (
    <Modal open={open} onClose={onClose} title="Settings" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* ── Days Section ── */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Days
          </h3>
          <Toggle
            checked={settings.showWeekends}
            onChange={(v) => updateSettings({ showWeekends: v })}
            label="Show Weekends"
          />
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
        </div>

        <div className="border-t border-border" />

        {/* ── Time Section ── */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Time
          </h3>
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
          <Select
            label="Day Starts At"
            value={String(settings.startHour)}
            onChange={(e) =>
              updateSettings({ startHour: parseInt(e.target.value) })
            }
            options={Array.from({ length: 24 }, (_, i) => ({
              value: String(i),
              label: formatHourDisplay(i, clockFormat),
            }))}
          />
          <Select
            label="Day Ends At"
            value={String(settings.endHour)}
            onChange={(e) =>
              updateSettings({ endHour: parseInt(e.target.value) })
            }
            options={Array.from({ length: 24 }, (_, i) => ({
              value: String(i + 1),
              label: formatHourDisplay(i + 1, clockFormat),
            })).filter((opt) => parseInt(opt.value) > settings.startHour)}
          />
        </div>

        <div className="border-t border-border" />

        {/* ── Display Section ── */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Display
          </h3>
          <Select
            label="Clock Format"
            value={clockFormat}
            onChange={(e) =>
              updateSettings({ clockFormat: e.target.value as ClockFormat })
            }
            options={[
              { value: "12h", label: "12-hour (AM/PM)" },
              { value: "24h", label: "24-hour" },
            ]}
          />
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
    </Modal>
  );
}
