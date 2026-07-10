# 04 — Handoff Prompt

Copy the fenced block below into a fresh session. It is self-contained; the next session does not need this audit on disk.

````
/make-plan Redesign Schedule Maker (weekly schedule builder — grid, task blocks, schedule tabs, export/share). Current design failed a Dieter Rams audit at 11/30 with critical gaps in principles #8 thorough (0), #3 aesthetic (1), #4 understandable (1), #6 honest (1), #7 long-lasting (1), #9 environmentally friendly (1), #10 as little design as possible (1).

Verdict paragraph (quoted from the audit):
> Schedule Maker scores 11/30 and fails principle #8 (thorough) outright: the design is a well-made surface stretched over a state layer that does not exist, and its most consequential actions — export, share, delete — cannot report failure, confirm success, or be undone.

Why redesign and not refine: Principle #8 (thorough) scored 0 — four of six required states are missing or rough, and the two absent ones (error, success) are exactly the ones carrying irreversible user consequences. Total of 11 is far below the refine threshold of 20. Three failures cross-cut every surface: the design system stops at the edge of the grid (task colors share zero tokens with Heritage), there is no state layer at all, and roughly half the app has no keyboard path.

Preserve from current design (these are sound — do not touch except where a move below requires it):
- The Heritage token architecture: `@property`-typed color customs enabling animated theme crossfade, one `:root` + one `.dark` override, `@theme inline` mapping. `src/index.css:20-107`.
- The dark-theme split between text-safe and fill-only primaries: `--heritage-primary: #8F97EC` vs `--heritage-primary-solid: #5560C9`. `src/index.css:75-76`. This distinction is correct and rare; keep it.
- Global `:focus-visible` ring with offset. `src/index.css:194-196`.
- Reduced-motion discipline, belt and braces: the global CSS guard at `src/index.css:265-274` plus `<MotionConfig reducedMotion="user">` at `src/App.tsx:32`.
- Self-hosted, subset fonts (no CDN) and the pre-paint FOUC script. `src/index.css:1-4`, `index.html:16-31`.
- The grid's time geometry: `ROW_HEIGHT = 60`, minute-proportional `topPx`/`heightPx` positioning, and the overlap detection that rings colliding tasks. `src/components/grid/WeeklyGrid.tsx:31,294-314`, `TaskBlock.tsx:52`.
- `Toggle.tsx:12-14` — the only component with correct `role="switch"` + `aria-checked`. Use it as the a11y reference for every new control.
- `DataModal.tsx:121-123` — the only visible error state in the app. Use it as the seed pattern for move #2.
- The honest guest-mode framing: "No account needed to try · Sign in to sync across devices". `src/App.tsx:191`. Keep this promise exactly as written.
- The Zustand + Convex sync layer (`src/store/scheduleStore.ts`, `src/hooks/useConvexSync.ts`). Not a design surface; out of scope; do not refactor.

Discard (these structural patterns caused the failures):
- The parallel task-color system: 10 hues × 12 variants = 120 hardcoded stock-Tailwind hex values with zero token overlap with Heritage. Evidence: `src/lib/colors.ts:22-173`. Caused failure on principle #3.
- The `Vibrant Bold` palette mode. Evidence: `src/lib/colors.ts:206` renders `boldText: "#FFFFFF"` on 500-weight fills; white on `#F59E0B` = 2.15:1, on `#22C55E` = 2.28:1, on `#06B6D4` = 2.43:1 — all ten hues fail WCAG AA for the 12px/10px task text at `TaskBlock.tsx:64,70`. Caused failure on principles #3 and #8.
- Silent failure as the error-handling strategy. Evidence: `src/components/modals/ExportShareModal.tsx:64-68` and `:84-86` both `console.error` and return; `:91` calls `navigator.clipboard.writeText` unguarded. Caused failure on principle #8.
- Destructive actions with no confirmation and no undo. Evidence: `src/components/sidebar/ScheduleTabs.tsx:249-259` (deletes a schedule and every task in it, one click); `src/components/modals/AddTaskModal.tsx:102-107`. Caused failure on principle #8.
- Right-click as the sole affordance. Evidence: `src/components/sidebar/ScheduleTabs.tsx:79,216-262` — Rename/Duplicate/Delete exist only behind `onContextMenu`, hinted by a `title` tooltip (`:86`) that never renders on touch, in a menu positioned at raw `clientX/clientY` with no viewport clamping (`:220`). Caused failure on principle #4.
- The dead modal backdrop. Evidence: `src/components/ui/Modal.tsx:50-52` fires `onClose` only when `e.target === overlayRef.current`, but the backdrop `<div className="absolute inset-0">` at `:55` covers the overlay and is always the click target. Clicking outside a modal does nothing. Caused failure on principle #4.
- Non-interactive elements carrying interaction. Evidence: `src/components/grid/WeeklyGrid.tsx:328-343` (`DroppableCell` is a bare `<div>` with `onClick`, no `tabIndex`, no `role`, no key handler); `src/components/grid/TaskBlock.tsx:41-48`; `src/components/modals/DataModal.tsx:101-119` (file input is `display:none`, so it leaves the tab order). Caused failure on principles #2 and #4.
- Three button implementations for one visual language. Evidence: the `ui/Button.tsx:29-44` primitive, bypassed by `RightToolbar.tsx:74-101` and again by `MobileBottomBar.tsx:73-97`. Caused failure on principle #10.
- Static import of the PDF stack. Evidence: `src/lib/export.ts:1-2` imports `html2canvas` and `jspdf`; the chain `App → ScheduleBuilder → ExportShareModal → export.ts` puts both in the entry chunk — 1,100,473 raw bytes (326 KB gzip) shipped to a landing page that has no export button. Caused failure on principle #9.
- The landing-page interstitial and its three decorative feature cards. Evidence: `src/App.tsx:72-198`, cards at `:123-155`. Caused failure on principle #10.
- The 18 Material-era compat aliases, self-marked `Remove once the component sweep lands`. Evidence: `src/index.css:108-127`. Caused failure on principle #10.

Top 5 moves from the audit (verbatim):
1. #3 aesthetic / #8 thorough — Fold the task palette into Heritage and delete `Vibrant Bold`. Replace the 120 hardcoded Tailwind hex values with a token-derived set of task hues, each pinned to a contrast floor of 4.5:1 against its own text color. Evidence: `src/lib/colors.ts:22-173`; white-on-`#F59E0B` measures 2.15:1 at 12px.
2. #8 thorough — Build the state layer that does not exist: error, success, and confirmation. Every action that touches the network, the filesystem, or destroys data needs a visible outcome. Evidence: export failure swallowed at `src/components/modals/ExportShareModal.tsx:64-68`; share-toggle failure at `:84-86`; unguarded clipboard at `:91`; unconfirmed, un-undoable schedule deletion at `src/components/sidebar/ScheduleTabs.tsx:249-259`.
3. #4 understandable — Give `Rename`, `Duplicate` and `Delete` a visible affordance, and make the modal backdrop dismiss. Right-click is not an affordance; it is a secret. Evidence: `src/components/sidebar/ScheduleTabs.tsx:79,216-262`; `src/components/ui/Modal.tsx:50-55`.
4. #2 useful — Make the grid keyboard-operable and open the app on it. Cells and task blocks must be real controls with a `KeyboardSensor` behind the drag. Delete the landing interstitial. Evidence: `src/components/grid/WeeklyGrid.tsx:328-343`, `TaskBlock.tsx:41-48`, `WeeklyGrid.tsx:52-58` (no `KeyboardSensor`, unlike `ScheduleTabs.tsx:121`), `DataModal.tsx:101-119`; `App.tsx:72-198`.
5. #9 environmentally friendly / #6 honest — Dynamically import the PDF stack, and cut the copy back to what the product does. `html2canvas` + `jspdf` are 1.1 MB in the entry chunk, shipped to a landing page with no export button. Then remove `Flawless Export` — a claim the code cannot honor. Evidence: `src/lib/export.ts:1-2`; `dist/assets/index-*.js` = 1,100,473 bytes; `src/App.tsx:137`.

Redesign principles in priority order:
1. #8 Thorough — Success looks like: every one of empty, loading, error, success, focus, disabled is present and deliberate on every surface, including the read-only shared view (currently the empty state is suppressed by `!readOnly` at `WeeklyGrid.tsx:144`) and the authenticated first paint (currently `ScheduleBuilder.tsx:46-48` auto-creates "My Schedule" before remote data lands). Destroying a schedule or a task is confirmed or undoable. The modal is a real dialog: `role="dialog"`, `aria-modal`, focus trap, focus restoration.
2. #4 Understandable — Success looks like: a first-time user, on a touch device, can name and reach every primary control without a tooltip. No action hides behind right-click. `Data` is renamed to say what it does. Clicking a backdrop closes the modal.
3. #3 Aesthetic — Success looks like: one color system, spanning chrome *and* content. Every task color derives from Heritage tokens and passes 4.5:1 against its own label. No `text-green-500` orphans (`ExportShareModal.tsx:207,234`, `main.tsx:43`), no hand-copied hex in `main.tsx:23-27`, no compat aliases.

Deliverables for the plan:
- New information architecture, derived from the primary task ("lay out a repeating week, then export it") and not from the current screen map. Decide explicitly whether a landing page exists at all.
- New primary flow, low-fi and labeled, shown side-by-side against the current `landing → Start Building → grid → click cell → modal → save` path. Count the steps in both.
- A states checklist covering empty, loading, error, success, focus, disabled — enumerated per surface: grid, task block, schedule tabs, each of the four modals, and the shared read-only view.
- A contrast table for the new task palette: every hue against its own label text, with the measured ratio, floor 4.5:1.
- Keyboard interaction spec: tab order across the grid, `Enter`/`Space` on cells and task blocks, `KeyboardSensor` coordinates for drag, and where focus lands after a modal closes.
- Migration path for users currently on the old design: tasks in localStorage and Convex carry stock Tailwind hex values in `task.color` (`colors.ts:180` matches on `c.pastel === hex || c.bold === hex`). Specify the mapping from old hex to new token, and the fallback for unmatched values (currently `colors.ts:194`).
- Cutover criteria: what must be true before the old grid, the old palette, and the landing page are deleted rather than flagged.

Anti-patterns to guard against (specific to REDESIGN):
- Porting old structure under new styling — in particular, do not re-skin `colors.ts` while keeping 10 hues × 12 hand-maintained variants.
- Keeping both designs behind a flag indefinitely.
- Redesigning to follow a trend rather than the principles above. The audit already flagged three trend markers (glassmorphism at `index.css:199-219`, `active:scale-[0.98]` on 20+ elements, `rounded-full` ×20). Do not replace them with this year's set.
- Treating the Preserve list as optional — the Heritage token architecture, the reduced-motion discipline, and the grid's time geometry survive this redesign intact.
- Fixing the visual layer and declaring victory. Principle #8 scored 0. If the plan does not produce error and success states, it has not addressed the reason this is a redesign.
````
