/**
 * WCAG 2.1 relative luminance and contrast ratio.
 * Used by the palette tests to hold every task colour above AA.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

function channel(srgb: number): number {
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6) throw new Error(`Expected a 6-digit hex, got "${hex}"`);
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hex colours, 1:1 (identical) to 21:1 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG AA floor for normal-size text. Task labels render at 10-12px. */
export const AA_NORMAL_TEXT = 4.5;
