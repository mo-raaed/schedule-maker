import { Check } from "lucide-react";
import { COLOR_PALETTE } from "../../lib/colors";
import type { PaletteMode } from "../../lib/types";
import { useAppSettingsStore } from "../../store/scheduleStore";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  paletteMode: PaletteMode;
}

export default function ColorPicker({ value, onChange, paletteMode }: ColorPickerProps) {
  const isDarkMode = useAppSettingsStore((s) => s.darkMode);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="uppercase text-[10px] tracking-[0.05em] font-semibold text-muted-foreground">
          {paletteMode === "pastel" ? "Pastel" : "Bold"} Colors
        </span>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {COLOR_PALETTE.map((color) => {
          // Store the light-mode hex as the value (canonical ID)
          const hex = paletteMode === "pastel" ? color.pastel : color.bold;
          // Preview the fill that will actually render, not the stored ID.
          const displayHex =
            isDarkMode
              ? paletteMode === "pastel"
                ? color.darkPastel
                : color.darkBoldFill
              : paletteMode === "pastel"
                ? color.pastel
                : color.boldFill;
          const checkColor =
            isDarkMode
              ? paletteMode === "pastel"
                ? color.darkPastelText
                : color.darkBoldText
              : paletteMode === "pastel"
                ? color.pastelText
                : color.boldText;
          const isSelected = value === hex;
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onChange(hex)}
              className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
                ring-offset-2 ring-offset-surface transition-transform duration-200 ease-out
                hover:scale-110 active:scale-95
                ${isSelected ? "ring-2 ring-ring shadow-card" : ""}`}
              style={{ backgroundColor: displayHex }}
              title={color.name}
            >
              {isSelected && (
                <Check
                  className="h-4 w-4"
                  style={{ color: checkColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
