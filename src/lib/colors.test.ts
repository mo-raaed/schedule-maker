import { describe, expect, it } from "vitest";
import { COLOR_PALETTE, DEFAULT_TASK_COLOR, getColorOption, getTaskColors } from "./colors";
import { AA_NORMAL_TEXT, contrastRatio } from "./contrast";
import type { PaletteMode } from "./types";

const MODES: PaletteMode[] = ["pastel", "bold"];
const THEMES = [
  { name: "light", isDark: false },
  { name: "dark", isDark: true },
];

describe("task colour contrast", () => {
  // Task labels render at text-xs (12px) and text-[10px] — WCAG normal text.
  // Regression guard: "Vibrant Bold" once shipped white on 500-weight fills,
  // bottoming out at 2.15:1 on amber.
  for (const mode of MODES) {
    for (const theme of THEMES) {
      for (const option of COLOR_PALETTE) {
        it(`${option.name} / ${mode} / ${theme.name} clears AA`, () => {
          const stored = mode === "pastel" ? option.pastel : option.bold;
          const { bg, text } = getTaskColors(stored, mode, theme.isDark);
          expect(contrastRatio(bg, text)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
        });
      }
    }
  }
});

describe("stored colour identity", () => {
  // task.color is persisted in localStorage and Convex. If these hexes move,
  // every existing task silently falls back to the auto-contrast branch.
  it("resolves every canonical hex back to its palette entry", () => {
    for (const option of COLOR_PALETTE) {
      expect(getColorOption(option.pastel)?.name).toBe(option.name);
      expect(getColorOption(option.bold)?.name).toBe(option.name);
    }
  });

  it("keeps the documented canonical hexes", () => {
    const blue = COLOR_PALETTE.find((c) => c.name === "Blue")!;
    expect(blue.pastel).toBe("#DBEAFE");
    expect(blue.bold).toBe("#3B82F6");
    expect(DEFAULT_TASK_COLOR).toBe("#DBEAFE");
  });

  it("falls back to auto-contrast for an unknown hex", () => {
    expect(getColorOption("#123456")).toBeUndefined();
    expect(getTaskColors("#123456", "bold", false)).toEqual({
      bg: "#123456",
      text: "#1F2937",
      border: "#123456",
    });
  });
});
