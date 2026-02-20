import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Schedule } from "./types";
import { getVisibleDays, generateTimeSlots, formatTime12h, timeToMinutes } from "./time";
import { getTaskColors } from "./colors";
import { DAY_SHORT_LABELS } from "./types";
import type { PaletteMode } from "./types";

export type ExportFormat = "pdf" | "png";
export type ExportOrientation = "portrait" | "landscape";

interface ExportOptions {
  format: ExportFormat;
  orientation: ExportOrientation;
  title?: string;
  subtitle?: string;
  schedule: Schedule;
  paletteMode: PaletteMode;
}

/**
 * Build a clean, off-screen HTML element that represents the schedule
 * without any UI chrome — designed specifically for export.
 */
function buildExportDOM(options: ExportOptions): HTMLDivElement {
  const { schedule, paletteMode, title, subtitle, orientation } = options;
  const { settings, tasks } = schedule;
  const visibleDays = getVisibleDays(settings);
  const timeSlots = generateTimeSlots(settings);

  // A4 dimensions at 96 DPI (we'll scale up 2x later via html2canvas)
  const isLandscape = orientation === "landscape";
  const width = isLandscape ? 1123 : 794;
  const height = isLandscape ? 794 : 1123;

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed; left: -9999px; top: -9999px;
    width: ${width}px; height: ${height}px;
    background: #ffffff; font-family: Inter, system-ui, sans-serif;
    padding: 32px; box-sizing: border-box; overflow: hidden;
  `;

  // ── Title area ──
  const header = document.createElement("div");
  header.style.cssText = "margin-bottom: 16px;";

  const h1 = document.createElement("div");
  h1.textContent = title || schedule.name;
  h1.style.cssText = "font-size: 20px; font-weight: 700; color: #1F2937; margin-bottom: 4px;";
  header.appendChild(h1);

  if (subtitle) {
    const sub = document.createElement("div");
    sub.textContent = subtitle;
    sub.style.cssText = "font-size: 12px; color: #6B7280;";
    header.appendChild(sub);
  }
  container.appendChild(header);

  // ── Grid area ──
  const gridWidth = width - 64; // minus padding
  const headerHeight = (title || subtitle) ? 50 : 10;
  const gridTop = headerHeight;
  const dayHeaderH = 32;
  const timeLabelW = 60;
  const availableH = height - 64 - gridTop - dayHeaderH;
  const cellW = (gridWidth - timeLabelW) / visibleDays.length;
  const rowH = availableH / timeSlots.length;

  const grid = document.createElement("div");
  grid.style.cssText = `position: relative; width: ${gridWidth}px; height: ${availableH + dayHeaderH}px;`;

  // ── Day headers ──
  visibleDays.forEach((day, i) => {
    const cell = document.createElement("div");
    cell.textContent = DAY_SHORT_LABELS[day];
    cell.style.cssText = `
      position: absolute; left: ${timeLabelW + i * cellW}px; top: 0;
      width: ${cellW}px; height: ${dayHeaderH}px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 600; color: #374151;
      border-bottom: 1px solid #E5E7EB; border-right: 1px solid #F3F4F6;
      box-sizing: border-box;
    `;
    grid.appendChild(cell);
  });

  // ── Time labels + grid lines ──
  timeSlots.forEach((time, i) => {
    // Label
    const label = document.createElement("div");
    label.textContent = formatTime12h(time);
    label.style.cssText = `
      position: absolute; left: 0; top: ${dayHeaderH + i * rowH}px;
      width: ${timeLabelW}px; height: ${rowH}px;
      display: flex; align-items: flex-start; justify-content: flex-end;
      padding-right: 6px; padding-top: 2px;
      font-size: 9px; color: #9CA3AF; box-sizing: border-box;
    `;
    grid.appendChild(label);

    // Horizontal line
    visibleDays.forEach((_, di) => {
      const cell = document.createElement("div");
      cell.style.cssText = `
        position: absolute;
        left: ${timeLabelW + di * cellW}px;
        top: ${dayHeaderH + i * rowH}px;
        width: ${cellW}px; height: ${rowH}px;
        border-bottom: 1px solid #F3F4F6;
        border-right: 1px solid #F3F4F6;
        box-sizing: border-box;
      `;
      grid.appendChild(cell);
    });
  });

  // ── Task blocks ──
  const gridStartMin = settings.startHour * 60;
  const totalMin = (settings.endHour - settings.startHour) * 60;

  tasks.forEach((task) => {
    const taskStartMin = timeToMinutes(task.startTime);
    const taskEndMin = timeToMinutes(task.endTime);
    const colors = getTaskColors(task.color, paletteMode);

    task.days.forEach((day) => {
      const dayIdx = visibleDays.indexOf(day as any);
      if (dayIdx === -1) return;

      const topPx = dayHeaderH + ((taskStartMin - gridStartMin) / totalMin) * availableH;
      const heightPx = ((taskEndMin - taskStartMin) / totalMin) * availableH;

      const block = document.createElement("div");
      block.style.cssText = `
        position: absolute;
        left: ${timeLabelW + dayIdx * cellW + 2}px;
        top: ${topPx}px;
        width: ${cellW - 4}px;
        height: ${Math.max(14, heightPx)}px;
        background: ${colors.bg};
        color: ${colors.text};
        border-left: 3px solid ${colors.border};
        border-radius: 6px;
        padding: 3px 6px;
        font-size: 10px;
        font-weight: 600;
        overflow: hidden;
        box-sizing: border-box;
      `;
      block.textContent = task.name;

      // Add time range if there's room
      if (heightPx > 28) {
        const timeEl = document.createElement("div");
        timeEl.textContent = `${formatTime12h(task.startTime)} – ${formatTime12h(task.endTime)}`;
        timeEl.style.cssText = "font-size: 8px; font-weight: 400; opacity: 0.7; margin-top: 1px;";
        block.appendChild(timeEl);
      }

      grid.appendChild(block);
    });
  });

  container.appendChild(grid);
  return container;
}

/**
 * Export the schedule as PNG or PDF.
 */
export async function exportSchedule(options: ExportOptions): Promise<void> {
  const el = buildExportDOM(options);
  document.body.appendChild(el);

  try {
    const canvas = await html2canvas(el, {
      scale: 2, // Retina quality
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
    });

    if (options.format === "png") {
      const link = document.createElement("a");
      link.download = `${options.schedule.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } else {
      const isLandscape = options.orientation === "landscape";
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${options.schedule.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    }
  } finally {
    document.body.removeChild(el);
  }
}
