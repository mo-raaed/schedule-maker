# 02 — Scorecard

Anchors applied verbatim from the rubric. Ties broken downward. Where a principle has several instances on the audited surface, the **worst** instance is scored, not the average.

---

**1. Good design is innovative — Score: 1/3**
Evidence: Week grid, click-cell-to-create, drag-to-move, and a modal editor are the shared vocabulary of Google Calendar, Notion Calendar, Cron and every timetable builder (§A, `WeeklyGrid.tsx:134-232`). The one departure is the draggable schedule tab strip with task-count badges (`ScheduleTabs.tsx:68-95`) — a browser-tab metaphor applied to schedules.
Justification: Not 2, because the tab strip re-skins an existing pattern without making the primary task better; not 0, because no competitor's flow is copied wholesale.

**2. Good design makes a product useful — Score: 2/3**
Evidence: The primary task completes — click a cell, name the task, pick days, save (`WeeklyGrid.tsx:288` → `AddTaskModal.tsx:82-100`), then export (`ExportShareModal.tsx:175-192`). But a marketing interstitial stands between arrival and the grid: guest mode requires clicking `Start Building` on a landing page (`App.tsx:172-181`).
Justification: Not 3, because the landing page and the export/share split across two modals add steps to a task that could open directly on the grid; not 1, because the core loop itself contains no detours.

**3. Good design is aesthetic — Score: 1/3**
Evidence: Heritage governs the chrome and governs it well (`index.css:48-84`). It does not govern the content. Task blocks — the entire point of the grid — are painted from 120 stock Tailwind hex values with zero token overlap (`colors.ts:22-173`). On top of that: `text-green-500` orphans ×3 (`ExportShareModal.tsx:207,234`, `main.tsx:43`); 8 palette hex literals re-typed by hand in `main.tsx:23-27`; 18 Material-era compat aliases the file itself marks for deletion (`index.css:108-127`); and `📅` at `text-4xl` amid an otherwise all-lucide icon set (`WeeklyGrid.tsx:147`).
Justification: Not 2, because that is five inconsistencies, not two, and the `Vibrant Bold` palette is independently a jarring violation at 2.15:1 (§B); not 0, because a real and coherent system demonstrably exists — it simply stops at the edge of the grid.

**4. Good design makes a product understandable — Score: 1/3**
Evidence: `Data` names a file format, not a user intention (`RightToolbar.tsx:50`). `Rename`, `Duplicate` and `Delete` have no visible affordance at all — they live behind a right-click, hinted only by a hover tooltip that never appears on touch (`ScheduleTabs.tsx:79,86,216-262`). Clicking a modal's backdrop, the most universally learned dismissal gesture on the web, silently does nothing (`Modal.tsx:50-55`). Tabs display `cursor-grab` while a click selects (`ScheduleTabs.tsx:81`).
Justification: Not 2, because three controls are unclear and one label is jargon — well past the one-tooltip allowance; not 0, because `Add Task` is unmistakable and the grid explains itself.

**5. Good design is unobtrusive — Score: 2/3**
Evidence: The grid holds the viewport; the toolbar is a quiet 208px `<aside>` of unadorned text-and-icon rows (`RightToolbar.tsx:25`), and the header is a 56px glass strip (`ScheduleBuilder.tsx:87`). No badges, no toasts, no interstitials (§D). Against that: the toolbar spends its full width permanently on five buttons, four of them secondary, and the landing page carries three purely decorative feature cards (`App.tsx:123-155`).
Justification: Not 3, because chrome is continuously visible on three edges rather than receding; not 1, because nothing decorative competes with the content on the builder screen itself.

**6. Good design is honest — Score: 1/3**
Evidence: Six unbacked superlatives (§C) — `Flawless Export`, `Build Your Perfect Weekly Schedule`, `beautifully minimal`, `effortless planning`, `high-resolution`, `Build beautiful weekly schedules`. Two of them are not merely puffery but contradicted by the code: `Flawless Export` ships alongside `console.error("Export failed:", err)` with no user-facing error path (`App.tsx:137` vs `ExportShareModal.tsx:64-68`), so the product is structurally incapable of admitting a failed export. And `Import JSON — Load a schedule from a file` will create an empty schedule and discard every task in a file that lacks a `settings` key, then close reporting success (`DataModal.tsx:53,115-116`).
Justification: Not 2, because that is six inflations and two label→behaviour mismatches, not one minor inflation; not 0, because no deceptive flow exists — guest mode is offered on equal footing and `No account needed to try` (`App.tsx:191`) is true.

**7. Good design is long-lasting — Score: 1/3**
Evidence: Three trend markers, each with a datable vintage. Glassmorphism — `backdrop-filter: blur(16px)` on the header, on floating panels, and on modal backdrops (`index.css:199-219`, `Modal.tsx:55`). The shadcn-era micro-press, `active:scale-[0.98]`, on 20+ elements. Pill geometry as a default — `rounded-full` ×20, applied to every button, tab, chip and day toggle. `📅` serves as the favicon (`index.html:5`).
Justification: Not 2, because three markers is past the single-marker allowance; not 0, because the foundation — Fraunces on navy and burgundy, a warm stone ground — is genuinely period-neutral and would read as current in 2029.

**8. Good design is thorough down to the last detail — Score: 0/3**
Evidence: Of the six required states, four are missing or rough. **Error: missing** — the two most consequential actions in the app, export and share, swallow their failures to `console.error` (`ExportShareModal.tsx:64-68`, `:84-86`), and `navigator.clipboard.writeText` is unguarded against insecure origins (`:91`). **Success: missing** — a saved task closes the modal in silence; a finished export announces nothing. **Empty: rough** — guarded by `!readOnly`, so a shared schedule with no tasks renders as a blank grid with no explanation (`WeeklyGrid.tsx:144`). **Loading: rough** — an authenticated user watches the app auto-create `"My Schedule"` before their real data arrives (`ScheduleBuilder.tsx:46-48`). Focus (`index.css:194-196`) and disabled (`Button.tsx:36`) are present and well made. Beyond the checklist: destroying a schedule and every task in it takes one unconfirmed click with no undo (`ScheduleTabs.tsx:249-259`); the modal has no `role="dialog"`, no focus trap, no focus restoration (`Modal.tsx`); the fixed 56px mobile bar overlays the bottom of the grid, which compensates with `pb-3` = 12px (`ScheduleBuilder.tsx:128`, `MobileBottomBar.tsx:29`).
Justification: Not 1, because the anchor's own wording — *"1 state missing **or rough**"* at level 2 — makes rough states countable, and four states are missing or rough; not higher on any reading, since the two absent states are the ones that carry irreversible user consequences.

**9. Good design is environmentally friendly — Score: 1/3**
Evidence: Initial JS is **1,100,473 bytes raw**, 326 KB gzipped, in a single entry chunk (§D). `lib/export.ts:1-2` statically imports `html2canvas` and `jspdf`, and the static import chain `App → ScheduleBuilder → ExportShareModal → export.ts` drags both PDF libraries into that chunk — so every visitor to a landing page that has no export button downloads and parses them. The sole dynamic `import()` in the tree is `motionFeatures` (`App.tsx:31`). Estimated TTI ~2.6 s on mid-tier mobile over 4G. Motion is properly gated (`index.css:265-274`, `App.tsx:32`), dark mode is honored (`index.css:67`), fonts are self-hosted and subset (`index.css:1-4`), and no animation runs on an idle screen.
Justification: Falls in the 500 KB–2 MB band on raw bytes, which is level 1; the level-2 traits (gated motion, honored dark mode) are genuinely present, so the tie-breaker resolves the 1-versus-2 uncertainty downward. Not 0 — there is no autoplay video, and dark mode is honored with care.

**10. Good design is as little design as possible — Score: 1/3**
Evidence: Six removable elements. The landing page (`App.tsx:72-198`) gates a tool whose guest mode is already free. Its three feature cards (`:123-155`) are decoration. `Shortcuts` — a keyboard-shortcut sheet — is offered from the touch-only mobile bar (`MobileBottomBar.tsx:46-53`). Three button implementations coexist for one visual language, and both toolbars bypass the `ui/Button` primitive that exists to serve them (`Button.tsx:29`, `RightToolbar.tsx:74`, `MobileBottomBar.tsx:73`). Eighteen compat aliases sit in the token file marked `Remove once the component sweep lands` (`index.css:108-127`). Spacer `<div>`s stand in for `gap` in seven places.
Justification: Not 2, because six removable elements is past the two-element allowance; not 0, because the builder screen is not dominated by decoration — the grid remains the figure, and each removal above is subtractive rather than structural.

---

## Total: **11 / 30**

| # | Principle | Score |
|---|---|---|
| 1 | innovative | 1 |
| 2 | useful | 2 |
| 3 | aesthetic | 1 |
| 4 | understandable | 1 |
| 5 | unobtrusive | 2 |
| 6 | honest | 1 |
| 7 | long-lasting | 1 |
| 8 | thorough | **0** |
| 9 | environmentally friendly | 1 |
| 10 | as little design as possible | 1 |
| | **Total** | **11 / 30** |
