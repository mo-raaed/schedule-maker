# 00 — Scope Lock

**Date:** 2026-07-09
**Target:** `/home/mo/code/schedule-maker` (repo, `main` @ `7a304ef`)
**Mode:** Static source audit. No running dev server; no live URL reachable. All visual facts are **INFERRED from source** (CSS tokens, component classes, computed contrast math) unless marked MEASURED (build output).

## What was audited

| Surface | Path |
|---|---|
| Landing page | `src/App.tsx:72-198` |
| Builder shell | `src/ScheduleBuilder.tsx` |
| Weekly grid + task blocks | `src/components/grid/WeeklyGrid.tsx`, `TaskBlock.tsx` |
| Toolbars | `src/components/sidebar/RightToolbar.tsx`, `MobileBottomBar.tsx`, `ScheduleTabs.tsx` |
| Modals | `src/components/modals/{AddTask,ExportShare,Data,Settings}Modal.tsx` |
| UI primitives | `src/components/ui/{Button,Modal,Select,Toggle,TimePicker,ColorPicker}.tsx` |
| Design tokens | `src/index.css` |
| Task color system | `src/lib/colors.ts` |
| Shared (read-only) view | `src/SharedScheduleView.tsx` |
| App shell / auth theming | `src/main.tsx`, `index.html` |

Total audited surface: **4,150 LOC** across 25 source files.

## Primary user and task

- **Primary user:** a student or individual planning a repeating weekly timetable (evidenced by the placeholder copy `"e.g., Math Lecture, Gym, Meeting"` — `AddTaskModal.tsx:129` — and the subtitle placeholder `"e.g., Spring 2026"` — `ExportShareModal.tsx:168`).
- **Primary task:** lay out recurring tasks on a week grid and export the result as a PDF or PNG.
- **Secondary tasks:** keep several schedules side by side; share a read-only public link; import/export JSON.

## Constraints

- **Stack:** React 19, Vite 7, Tailwind v4, Zustand, Convex, Clerk, dnd-kit, motion.js
- **Brand:** "Heritage" design system — deep navy `#252D6B` + burgundy `#7D1F34`, warm-stone background, Fraunces display serif + Plus Jakarta Sans. Declared shared across `mo-alyousif.com`, Gradify, Schedule Maker, Gamut (`index.css:41-47`).
- **Accessibility floor:** none declared in repo.
- **Deadline:** none declared.

## Reference designs

None declared in the repo. Implicit peer set for principle #1: Google Calendar, Notion Calendar, Cron, TimeTree, university timetable builders.

## Known gaps

- No screenshots or computed styles: no dev server was started, so every visual claim is derived from source tokens and class names.
- Time-to-interactive not measured on real hardware; estimated from bundle bytes with method noted in `01-evidence.md`.
- Clerk's auth modal is a third-party surface and was not audited beyond the theme overrides in `main.tsx:20-49`.
