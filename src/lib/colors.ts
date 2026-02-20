import type { PaletteMode } from "./types";

export interface ColorOption {
  name: string;
  pastel: string;
  bold: string;
  /** Dark text color for pastel bg, light text for bold bg */
  pastelText: string;
  boldText: string;
  /** Darker accent for left border */
  pastelBorder: string;
  boldBorder: string;
}

export const COLOR_PALETTE: ColorOption[] = [
  {
    name: "Blue",
    pastel: "#DBEAFE",
    bold: "#3B82F6",
    pastelText: "#1E40AF",
    boldText: "#FFFFFF",
    pastelBorder: "#93C5FD",
    boldBorder: "#1D4ED8",
  },
  {
    name: "Purple",
    pastel: "#EDE9FE",
    bold: "#8B5CF6",
    pastelText: "#5B21B6",
    boldText: "#FFFFFF",
    pastelBorder: "#C4B5FD",
    boldBorder: "#6D28D9",
  },
  {
    name: "Rose",
    pastel: "#FFE4E6",
    bold: "#F43F5E",
    pastelText: "#9F1239",
    boldText: "#FFFFFF",
    pastelBorder: "#FDA4AF",
    boldBorder: "#BE123C",
  },
  {
    name: "Orange",
    pastel: "#FFEDD5",
    bold: "#F97316",
    pastelText: "#9A3412",
    boldText: "#FFFFFF",
    pastelBorder: "#FDBA74",
    boldBorder: "#C2410C",
  },
  {
    name: "Amber",
    pastel: "#FEF3C7",
    bold: "#F59E0B",
    pastelText: "#92400E",
    boldText: "#FFFFFF",
    pastelBorder: "#FCD34D",
    boldBorder: "#B45309",
  },
  {
    name: "Green",
    pastel: "#DCFCE7",
    bold: "#22C55E",
    pastelText: "#166534",
    boldText: "#FFFFFF",
    pastelBorder: "#86EFAC",
    boldBorder: "#15803D",
  },
  {
    name: "Teal",
    pastel: "#CCFBF1",
    bold: "#14B8A6",
    pastelText: "#115E59",
    boldText: "#FFFFFF",
    pastelBorder: "#5EEAD4",
    boldBorder: "#0D9488",
  },
  {
    name: "Cyan",
    pastel: "#CFFAFE",
    bold: "#06B6D4",
    pastelText: "#155E75",
    boldText: "#FFFFFF",
    pastelBorder: "#67E8F9",
    boldBorder: "#0891B2",
  },
  {
    name: "Indigo",
    pastel: "#E0E7FF",
    bold: "#6366F1",
    pastelText: "#3730A3",
    boldText: "#FFFFFF",
    pastelBorder: "#A5B4FC",
    boldBorder: "#4338CA",
  },
  {
    name: "Pink",
    pastel: "#FCE7F3",
    bold: "#EC4899",
    pastelText: "#9D174D",
    boldText: "#FFFFFF",
    pastelBorder: "#F9A8D4",
    boldBorder: "#BE185D",
  },
];

/**
 * Get the color values for a given hex code (the bg color stored on tasks)
 * Given the task stores the bg color, we need to find the matching palette entry.
 */
export function getColorOption(hex: string): ColorOption | undefined {
  return COLOR_PALETTE.find((c) => c.pastel === hex || c.bold === hex);
}

/**
 * Get display colors for a task block based on its stored color and the current palette mode.
 */
export function getTaskColors(
  taskColor: string,
  mode: PaletteMode
): { bg: string; text: string; border: string } {
  const option = getColorOption(taskColor);
  if (!option) {
    // Unknown color — use it as bg with auto contrast
    return { bg: taskColor, text: "#1F2937", border: taskColor };
  }

  if (mode === "pastel") {
    return { bg: option.pastel, text: option.pastelText, border: option.pastelBorder };
  }
  return { bg: option.bold, text: option.boldText, border: option.boldBorder };
}

/**
 * Default color for new tasks (Blue pastel)
 */
export const DEFAULT_TASK_COLOR = COLOR_PALETTE[0].pastel;
