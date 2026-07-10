import type { PaletteMode } from "./types";

export interface ColorOption {
  name: string;
  /** Canonical stored ID for a task's colour. Persisted in localStorage and
   *  Convex — never change these values, or existing tasks stop resolving. */
  pastel: string;
  bold: string;
  /** Dark text color for pastel bg, light text for bold bg */
  pastelText: string;
  boldText: string;
  /** Rendered fill for bold mode. Darker than the `bold` ID so that white
   *  label text clears WCAG AA (4.5:1) at the 10–12px used on task blocks;
   *  the 500-weight `bold` hex only reached 2.15:1–4.47:1. */
  boldFill: string;
  /** Darker accent for left border */
  pastelBorder: string;
  boldBorder: string;
  /** Dark-mode variants — deeper bg, lighter text for readability */
  darkPastel: string;
  darkPastelText: string;
  darkPastelBorder: string;
  darkBoldFill: string;
  darkBoldText: string;
  darkBoldBorder: string;
}

export const COLOR_PALETTE: ColorOption[] = [
  {
    name: "Blue",
    pastel: "#DBEAFE",
    bold: "#3B82F6",
    pastelText: "#1E40AF",
    boldText: "#FFFFFF",
    boldFill: "#1D4ED8",
    pastelBorder: "#93C5FD",
    boldBorder: "#1E40AF",
    darkPastel: "#1E3A5F",
    darkPastelText: "#93C5FD",
    darkPastelBorder: "#2563EB",
    darkBoldFill: "#1D4ED8",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#1E40AF",
  },
  {
    name: "Purple",
    pastel: "#EDE9FE",
    bold: "#8B5CF6",
    pastelText: "#5B21B6",
    boldText: "#FFFFFF",
    boldFill: "#6D28D9",
    pastelBorder: "#C4B5FD",
    boldBorder: "#5B21B6",
    darkPastel: "#2E1065",
    darkPastelText: "#C4B5FD",
    darkPastelBorder: "#7C3AED",
    darkBoldFill: "#6D28D9",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#5B21B6",
  },
  {
    name: "Rose",
    pastel: "#FFE4E6",
    bold: "#F43F5E",
    pastelText: "#9F1239",
    boldText: "#FFFFFF",
    boldFill: "#BE123C",
    pastelBorder: "#FDA4AF",
    boldBorder: "#9F1239",
    darkPastel: "#4C0519",
    darkPastelText: "#FDA4AF",
    darkPastelBorder: "#E11D48",
    darkBoldFill: "#BE123C",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#9F1239",
  },
  {
    name: "Orange",
    pastel: "#FFEDD5",
    bold: "#F97316",
    pastelText: "#9A3412",
    boldText: "#FFFFFF",
    boldFill: "#C2410C",
    pastelBorder: "#FDBA74",
    boldBorder: "#9A3412",
    darkPastel: "#431407",
    darkPastelText: "#FDBA74",
    darkPastelBorder: "#EA580C",
    darkBoldFill: "#C2410C",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#9A3412",
  },
  {
    name: "Amber",
    pastel: "#FEF3C7",
    bold: "#F59E0B",
    pastelText: "#92400E",
    boldText: "#FFFFFF",
    boldFill: "#B45309",
    pastelBorder: "#FCD34D",
    boldBorder: "#92400E",
    darkPastel: "#451A03",
    darkPastelText: "#FCD34D",
    darkPastelBorder: "#D97706",
    darkBoldFill: "#B45309",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#92400E",
  },
  {
    name: "Green",
    pastel: "#DCFCE7",
    bold: "#22C55E",
    pastelText: "#166534",
    boldText: "#FFFFFF",
    boldFill: "#15803D",
    pastelBorder: "#86EFAC",
    boldBorder: "#166534",
    darkPastel: "#052E16",
    darkPastelText: "#86EFAC",
    darkPastelBorder: "#16A34A",
    darkBoldFill: "#15803D",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#166534",
  },
  {
    name: "Teal",
    pastel: "#CCFBF1",
    bold: "#14B8A6",
    pastelText: "#115E59",
    boldText: "#FFFFFF",
    boldFill: "#0F766E",
    pastelBorder: "#5EEAD4",
    boldBorder: "#115E59",
    darkPastel: "#042F2E",
    darkPastelText: "#5EEAD4",
    darkPastelBorder: "#0D9488",
    darkBoldFill: "#0F766E",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#115E59",
  },
  {
    name: "Cyan",
    pastel: "#CFFAFE",
    bold: "#06B6D4",
    pastelText: "#155E75",
    boldText: "#FFFFFF",
    boldFill: "#0E7490",
    pastelBorder: "#67E8F9",
    boldBorder: "#155E75",
    darkPastel: "#083344",
    darkPastelText: "#67E8F9",
    darkPastelBorder: "#0891B2",
    darkBoldFill: "#0E7490",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#155E75",
  },
  {
    name: "Indigo",
    pastel: "#E0E7FF",
    bold: "#6366F1",
    pastelText: "#3730A3",
    boldText: "#FFFFFF",
    boldFill: "#4338CA",
    pastelBorder: "#A5B4FC",
    boldBorder: "#3730A3",
    darkPastel: "#1E1B4B",
    darkPastelText: "#A5B4FC",
    darkPastelBorder: "#4F46E5",
    darkBoldFill: "#4338CA",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#3730A3",
  },
  {
    name: "Pink",
    pastel: "#FCE7F3",
    bold: "#EC4899",
    pastelText: "#9D174D",
    boldText: "#FFFFFF",
    boldFill: "#BE185D",
    pastelBorder: "#F9A8D4",
    boldBorder: "#9D174D",
    darkPastel: "#500724",
    darkPastelText: "#F9A8D4",
    darkPastelBorder: "#DB2777",
    darkBoldFill: "#BE185D",
    darkBoldText: "#FFFFFF",
    darkBoldBorder: "#9D174D",
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
 * Get display colors for a task block based on its stored color, palette mode, and dark mode.
 */
export function getTaskColors(
  taskColor: string,
  mode: PaletteMode,
  isDarkMode = false
): { bg: string; text: string; border: string } {
  const option = getColorOption(taskColor);
  if (!option) {
    // Unknown color — use it as bg with auto contrast
    return { bg: taskColor, text: isDarkMode ? "#E5E7EB" : "#1F2937", border: taskColor };
  }

  if (mode === "pastel") {
    if (isDarkMode) {
      return { bg: option.darkPastel, text: option.darkPastelText, border: option.darkPastelBorder };
    }
    return { bg: option.pastel, text: option.pastelText, border: option.pastelBorder };
  }
  if (isDarkMode) {
    return { bg: option.darkBoldFill, text: option.darkBoldText, border: option.darkBoldBorder };
  }
  return { bg: option.boldFill, text: option.boldText, border: option.boldBorder };
}

/**
 * Default color for new tasks (Blue pastel)
 */
export const DEFAULT_TASK_COLOR = COLOR_PALETTE[0].pastel;
