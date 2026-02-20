import { Check } from "lucide-react";
import { COLOR_PALETTE, type ColorOption } from "../../lib/colors";
import type { PaletteMode } from "../../lib/types";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  paletteMode: PaletteMode;
}

export default function ColorPicker({ value, onChange, paletteMode }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {paletteMode === "pastel" ? "Pastel" : "Bold"} Colors
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {COLOR_PALETTE.map((color) => {
          const hex = paletteMode === "pastel" ? color.pastel : color.bold;
          const isSelected = value === hex;
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onChange(hex)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer
                ring-offset-2 ring-offset-card
                ${isSelected ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`}
              style={{ backgroundColor: hex }}
              title={color.name}
            >
              {isSelected && (
                <Check
                  className="h-4 w-4"
                  style={{
                    color:
                      paletteMode === "pastel"
                        ? color.pastelText
                        : color.boldText,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
