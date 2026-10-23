# Local Council — Schedule-Maker design audit (2026-07-09)

**Local council** — these perspectives all come from Claude playing different roles, not from different AI vendors. Treat agreement as a shared starting point to pressure-test, not as independent confirmation.

**Question:** Is the audit's REDESIGN verdict right, or is this a REFINE the rubric mislabeled? What should be sequenced first, and what should be skipped?

**Members convened:** Devil's Advocate, Simplicity Champion, Security Auditor, Scalability Architect.
**Members returned:** 3 of 4. The **Security Auditor failed** — terminated by an API session limit before finishing. Its lens is uncovered. See "Blind spots."

---

## 🗳️ Devil's Advocate

### Position
This is a REFINE wearing a REDESIGN label. The verdict is produced by a mechanical `total < 20` gate on a rubric that deliberately scores the *worst* instance and breaks *ties downward* — a flaw-finding instrument being asked to make a remediation-cost decision it was never calibrated for. Almost every real defect here is a bounded, targeted fix on an architecture the audit itself insists you preserve.

### Key points
- **The headline contrast catastrophe is opt-in, not shipped.** `scheduleStore.ts:260` defaults `paletteMode` to `"pastel"`, which passes. The 2.15:1 failure only appears after a user deliberately switches to "bold." Fix or gate `boldText` — you do not need to burn down `colors.ts` or run a data migration.
- **The verdict contradicts itself.** "Why this is not a rewrite either" hands over a Preserve list covering the token architecture, the theme crossfade, the text-safe/fill-only primary split it calls "correct and rare," focus rings, reduced-motion, grid geometry, and the entire Zustand/Convex layer. When the thing you keep is the architecture and the thing you change is a punch-list of leaf-level bugs, that is the definition of a refine.
- **The highest-value fixes are one- and two-liners a redesign would delay for weeks.** Dynamic-importing the PDF stack (`export.ts:1-2`) removes 1.1MB from the entry chunk — the single biggest win in the audit, and it has nothing to do with design. The dead backdrop (`Modal.tsx:50-55`) is one line. "Flawless Export" is one word.
- **"There is no state layer" is rhetorical inflation.** Adding a toast and calling it in ~5 `catch` blocks is a bounded feature. The handoff itself points at `DataModal.tsx:121-123` as an existing visible error state to seed from. You are extending a pattern, not inventing one.
- **"Half the app has no keyboard path" is overstated.** `ScheduleTabs.tsx:121-124` already wires a `KeyboardSensor`. The grid genuinely lacks it, but the fix is to copy the in-repo pattern that already works.

### Risks & blind spots
- **The redesign path shares the refine path's only real migration risk and adds new ones.** Tasks store stock hex in `task.color` (localStorage + Convex). "Fold the palette into Heritage" forces a hex→token migration. The targeted path keeps the passing pastel hexes and fixes/gates bold — *zero* migration. On data risk, REFINE is strictly safer; the audit has it backwards.
- **A redesign is where subtle, good systems quietly die.** The audit praises the `@property` crossfade and the `--heritage-primary` / `--heritage-primary-solid` split as "rare." A solo dev doing a months-long IA rework is how those load-bearing subtleties get regressed.
- **Several "violations" are product decisions dressed as defects.** Removing the landing page is taste, not correctness. Deleting "Vibrant Bold" wholesale to fix a contrast ratio is amputation where a suture works.
- **Opportunity cost is what other lenses will miss.** Framed as REDESIGN, the free wins get scheduled *after* an IA rework instead of shipping this afternoon. The delete-data-loss risk is the one genuinely user-harming defect and deserves to jump the queue; a redesign narrative buries it in a backlog.

### Confidence
`high` — the Preserve list, the "not a rewrite" admission, and the `pastel` default (verified at `scheduleStore.ts:260`) directly undercut the audit's central aesthetic argument.

---

## 🗳️ Simplicity Champion

### Position
This is a REFINE the rubric mislabeled. Every one of the six findings maps to a bounded, local edit behind an interface that already exists; the "state layer that does not exist" already ships in two places. The real over-engineering risk is not the current code — it is the redesign process the verdict prescribes.

### Key points
- **Every "cross-cutting" failure is actually a localized diff.** Dead backdrop: 3 lines in `Modal.tsx:50-55`. The 1.1MB bundle: turn `export.ts:1-2` into `await import()` inside `exportSchedule()` — ~5 lines, and `ExportShareModal → export.ts` is the only static consumer. When the preserve list dwarfs the discard list, that is the signature of a refine.
- **The "no state layer" claim is contradicted by the code.** `ExportShareModal` already ships a success pattern: `copied` state, 2s auto-reset, `Check` icon (`:37, :92-93, :233-237`). The handoff names `DataModal:121-123` as an existing error state. The primitives are in the repo; you extend them to two more call sites and guard `navigator.clipboard` (`:91`).
- **The verdict is a threshold artifact, not a cost assessment.** `total < 20 → REDESIGN` plus worst-instance scoring and downward tie-breaking manufactures an 11/30 that *reads* like "burn it down." That number measures the current surface's quality, not the shape or cost of the remediation. Only the second question should decide redesign-vs-refine.
- **The keyboard fix is over-specified into expensiveness.** You don't need keyboard *drag* to make the grid operable: add `tabIndex`/`role="button"`/`onKeyDown` to `DroppableCell` and `TaskBlock` so Enter opens the modal, and let users reposition via the time/day fields already in it. Small, and it fully closes the focus-order void.
- **The heavyweight deliverables are the actual complexity to reject.** "New IA, side-by-side low-fi flow comparison with step counts, per-surface states checklist, contrast table, keyboard interaction spec, migration mapping, cutover criteria" would cost more than the fixes it governs. The migration table solves a non-problem: `getColorOption` already returns `undefined → auto-contrast fallback` (`colors.ts:192-194`).

### Risks & blind spots
- My lens undervalues the palette work: folding 10 hues × 12 variants into contrast-safe tokens is real design labor. The accessibility lens will rightly weight the 2.15:1 failure as ship-blocking regardless of how the work is labeled.
- Calling it a REFINE risks the opposite failure: fixing the visual layer and stopping before error/success states land. **The label matters less than a hard gate — nothing ships until export and share can report failure and confirm success.**
- A punch-list of eight "small" edits can, in aggregate, be as much work as a scoped redesign — and without the redesign's forcing function, an item (the read-only shared empty state, the auth first-paint flash) can quietly get skipped. Keep the audit's *states checklist* as a plain to-do; throw away the ceremony around it.

### Confidence
`high` — each defect is a specific line range behind a stable interface, the success/error primitives already exist in-repo, and the Preserve list is larger than the Discard list.

---

## 🗳️ Scalability Architect

### Position
From the scaling lens this is a **REFINE, not a REDESIGN**. The Convex/Zustand/grid architecture is correctly sized for this product's realistic ceiling. But the audit's design scope explicitly walled off the sync layer ("do not refactor"), and in doing so it misses the only issues that actually scale badly: a few O(N) write/read amplifications and a genuine multi-writer lost-update bug.

### Key points
- **The nested-tasks-on-document model (`convex/schema.ts:38`) is the right call, not a liability.** You always load a whole schedule to render a week. Convex's 1MiB / 8192-element limits are orders of magnitude away. Do **not** let a redesign "normalize" tasks into their own table.
- **The audit's one true perf finding (#5) is real and cheap.** Dynamic-import `html2canvas`+`jspdf`. ~20 minutes, helps every landing-page visitor. Sequence it first because it's free and lens-agnostic.
- **The audit MISSES the write amplification.** `getMySchedules` is commented "metadata only" (`schedules.ts:39`) but returns every task of every schedule (`:54-65`), and it's a *reactive* query — editing one task re-ships the full task arrays of **all** schedules. Compounding it, the write-through (`useConvexSync.ts:173-181`) uses the coarse full-document `updateSchedule` even though granular `addTask`/`updateTask`/`removeTask` mutations already exist at `schedules.ts:154-210` and sit unused.
- **There is a silent multi-writer data-loss bug the design audit structurally cannot see.** The write-through diffs on `updatedAt` and pushes the *whole* tasks array. Two tabs/devices editing the same schedule = last-writer-wins on the full document; a task added in tab B is clobbered when tab A flushes its stale array. Switching to the existing granular mutations makes append/remove transactional server-side and eliminates most of the lost-update window. That is a worse failure than anything on the scorecard, and it is invisible to a Rams audit.
- **`reorderSchedules` (`scheduleStore.ts:121-135`) bumps `updatedAt` on *every* schedule**, so one reorder fans out into N full-document network writes.

### Risks & blind spots
- **The REDESIGN framing risks destabilizing a layer that is currently fine.** Touching the grid puts hands on `WeeklyGrid.tsx`, where the 672-`useDroppable` render cost lives (`:283-291`, with `DayColumn`/`DroppableCell` unmemoized). A targeted refine can memoize deliberately. The grid work should be scoped as *rendering cost*, which the audit never names.
- **The audit and my lens agree on urgency for the wrong-looking reason.** The un-undoable schedule delete is filed as a "thorough/#8" UX gap, but it's a data-loss bug at N=1. "What breaks first" is data loss, and two of the top-three data-loss risks are invisible to a cosmetic scorecard.
- **Concurrent shared-link viewers only bite under edit-while-shared.** Same full-document-write root cause, so fixing the write path pays off here too. Don't over-engineer a read cache.
- **Skip:** horizontal scaling, sharding, a tasks table, a CDN for shared views.

### Confidence
`high` — grounded in the read code; the only soft spot is exact traffic thresholds.

---

## 🗳️ Security Auditor — FAILED

Terminated by an API session limit mid-run, after reading the Convex functions but before returning a perspective. **Its lens is uncovered.** The share-link authorization surface (`togglePublic`, `getPublicSchedule`), the JSON import path (`DataModal.handleImportJson` parses untrusted JSON and feeds `task.color` straight into an inline `style` attribute), and the ownership checks on the Convex mutations were **not** reviewed by any member.

Orchestrator spot-check performed in its absence: `.env.local` is gitignored (`.gitignore:13`, `*.local`) and untracked. That is the only security claim in this document that was verified.

---

## Synthesis — angles, not consensus

### Shared starting points (a common prior to stress-test, not corroboration)

All three surviving members independently called REFINE, and all three attacked the same target: the `total < 20` threshold as a category error — a rubric that measures *surface quality* being read as a verdict on *remediation shape*.

**This agreement is weak signal.** Three Claude instances, same training, same priors, handed the same framing — including a question that itself offered "or is this a REFINE the rubric mislabeled?" as an option. That phrasing invited the contrarian read, and three contrarians obliged. What they might *all* be missing for the same reason: the pull toward the clever-sounding "the rubric is the real bug" take, which is more satisfying to write than "the audit is right and the work is boring." Each member's specific code citations were independently verified by the orchestrator and hold up; the *label* argument they share was not verified by anything, because it is a judgment call, not a fact.

### Genuine tensions

- **Devil vs. Simplicity on the palette.** Devil says fix or gate `boldText` and keep the 120 hexes — zero migration, strictly safer. Simplicity concedes its lens *undervalues* the palette work and that a 2.15:1 contrast failure is ship-blocking "regardless of how the work is labeled." The user's situation resolves this: the default is `pastel`, so live exposure is opt-in. That makes it urgent-to-fix but not urgent-to-*redesign*. Devil wins on scope; Simplicity wins on the gate.
- **Simplicity vs. itself on process.** It rejects the audit's deliverables as "premature formalization," then immediately warns that without a forcing function an item "can quietly get skipped." Its own resolution is the right one: keep the states checklist as a plain to-do, discard the IA/cutover ceremony.
- **Scalability vs. the audit's scope.** The audit's handoff says the sync layer is "not a design surface; out of scope; do not refactor." Scalability's strongest findings live precisely there. The audit's scope boundary is what hid them.

### Blind spots

- **What the audit missed and the council caught:** the write amplification and the multi-writer lost-update window in `useConvexSync.ts:169-184`, and the O(N) fanout in `reorderSchedules`. Both verified against the code. Granular Convex mutations exist at `schedules.ts:154-210` and are called from nowhere in `src/` — dead server code that is also the fix.
- **What the audit overstated and the council caught:** "all 10 hues fail WCAG" is true only in the non-default `bold` mode. `scheduleStore.ts:260` defaults to `pastel`. Verified.
- **What *no member* covered:** the security lens. Nobody reviewed the share-link authorization, the ownership checks on `togglePublic`/`getPublicSchedule`, or the untrusted-JSON import path that writes `task.color` into an inline style. If any of the redesign moves touch sharing or import, that gap should be closed first.
- **What no member questioned:** whether the app has users at all. Every priority argument here — data loss, lost updates, WCAG exposure — presumes someone other than the author uses it. Nobody asked.

### Suggested direction

**Implement the fixes. Do not run the redesign process.** Supported by all three surviving members, and by the audit's own Preserve list, which is longer than its Discard list.

Sequence by user harm, not by scorecard position:

1. Confirmation/undo on schedule delete (`ScheduleTabs.tsx:249-259`) — data loss at N=1. *(Devil, Scalability)*
2. Switch the write-through to the granular Convex mutations that already exist (`schedules.ts:154-210`, called from nowhere); stop `reorderSchedules` bumping `updatedAt` on every schedule. Closes the lost-update window and the write amplification. *(Scalability — audit missed entirely)*
3. `await import()` the PDF stack (`export.ts:1-2`). −1.1MB entry chunk, ~20 min. *(all three)*
4. Surface export/share/clipboard failures; guard `navigator.clipboard`. Extend the `DataModal:121-123` error pattern and the `copied` success pattern. **This is the hard gate — nothing ships until it lands.** *(Simplicity)*
5. Modal: live backdrop click, `role="dialog"`, `aria-modal`, focus trap, focus restore.
6. Fix or gate `boldText` contrast. **Do not** delete the mode or migrate 120 hexes. *(Devil)*
7. `tabIndex` + `role="button"` + `onKeyDown` on `DroppableCell` and `TaskBlock`; Enter opens the modal. Keyboard *drag* via `KeyboardSensor` is optional and later. *(Simplicity)*
8. Visible kebab affordance reusing the existing context menu.
9. Delete the "Flawless Export" claim.

**Skip:** removing the landing page and reworking the IA (a product bet, not a defect); wholesale deletion of `Vibrant Bold`; the hex→token palette migration and its cutover criteria; the compat aliases, spacer divs, and three-button dedupe (opportunistic tidy-up, gates nothing).

**Where the real uncertainty remains:** the lost-update window's severity. Convex's reactive query refreshes tab A's local array when tab B writes, which narrows the window to "tab A writes before B's tick lands." Real, but I have not reproduced it. Confirm with two tabs before treating step 2 as urgent rather than merely correct.
