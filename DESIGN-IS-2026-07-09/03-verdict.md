# 03 — Verdict

## REDESIGN

**Schedule Maker scores 11/30 and fails principle #8 (thorough) outright: the design is a well-made surface stretched over a state layer that does not exist, and its most consequential actions — export, share, delete — cannot report failure, confirm success, or be undone.**

## Why this verdict, mechanically

The rule is `total < 20 → REDESIGN`. The total is 11. Independently, #8 scored 0.

## Why this is not a REFINE

The failures are not localized to a screen. They are three cross-cutting absences, each of which reaches every surface:

1. **The design system stops at the edge of the grid.** Heritage governs the chrome beautifully; the task blocks — the reason the product exists — are painted from 120 stock Tailwind hex values that share not one token with it (`colors.ts:22-173`). One of the two shipped palette modes renders 12px white text at 2.15:1. This is not a restyle; the content layer has no design system to refine.
2. **There is no state layer.** Error and success states are absent, not rough. `console.error("Export failed:", err)` (`ExportShareModal.tsx:64-68`) is the entire failure path for the app's headline feature. Adding error states is not a change to existing components — it is the introduction of a category of component that has never existed here.
3. **Roughly half the app has no keyboard path.** The grid — every cell, every task block — is a focus-order void (`WeeklyGrid.tsx:328-343`, `TaskBlock.tsx:41`), and schedule management hides behind `onContextMenu` with no visible trigger (`ScheduleTabs.tsx:79`). Restoring this means re-deciding what the interactive primitives *are*, not adjusting how they look.

## Why this is not a rewrite either

Read the Preserve list in the handoff before scoping. The token architecture, the focus-ring treatment, the reduced-motion discipline, the grid's time-geometry, and the Zustand/Convex sync are all sound and stay. What gets discarded is the content color system, the affordance model, and the assumption that a happy path is enough. The Rams anti-pattern being avoided here is the opposite of sunk cost: this codebase is *good enough that it is tempting to call the gaps polish*. They are not polish. They are the parts that were never designed.

## Top 5 highest-leverage moves

1. **#3 aesthetic / #8 thorough — Fold the task palette into Heritage and delete `Vibrant Bold`.** Replace the 120 hardcoded Tailwind hex values with a token-derived set of task hues, each pinned to a contrast floor of 4.5:1 against its own text color. Evidence: `colors.ts:22-173`; white-on-`#F59E0B` measures 2.15:1 at 12px (`01-evidence.md` §B).

2. **#8 thorough — Build the state layer that does not exist: error, success, and confirmation.** Every action that touches the network, the filesystem, or destroys data needs a visible outcome. Evidence: export failure swallowed at `ExportShareModal.tsx:64-68`; share-toggle failure at `:84-86`; unguarded clipboard at `:91`; unconfirmed, un-undoable schedule deletion at `ScheduleTabs.tsx:249-259`.

3. **#4 understandable — Give `Rename`, `Duplicate` and `Delete` a visible affordance, and make the modal backdrop dismiss.** Right-click is not an affordance; it is a secret. Evidence: `ScheduleTabs.tsx:79,216-262` (context-menu-only, unreachable on touch, unclamped to viewport); `Modal.tsx:50-55` (backdrop click is dead because the backdrop `<div>` is always the event target, never `overlayRef.current`).

4. **#2 useful — Make the grid keyboard-operable and open the app on it.** Cells and task blocks must be real controls with a `KeyboardSensor` behind the drag. Delete the landing interstitial. Evidence: `WeeklyGrid.tsx:328-343` (bare `<div>` + `onClick`), `TaskBlock.tsx:41-48`, `WeeklyGrid.tsx:52-58` (no `KeyboardSensor`, unlike `ScheduleTabs.tsx:121`), `DataModal.tsx:101-119` (hidden file input); `App.tsx:72-198` (landing gate).

5. **#9 environmentally friendly / #6 honest — Dynamically import the PDF stack, and cut the copy back to what the product does.** `html2canvas` + `jspdf` are 1.1 MB in the entry chunk, shipped to a landing page with no export button. Then remove `Flawless Export` — a claim the code cannot honor. Evidence: `export.ts:1-2` static imports; `dist/assets/index-*.js` = 1,100,473 bytes; `App.tsx:137`.
