# 01 — Evidence

Facts only. No scores. Every entry cites `file:line` or a measured value.

---

## A. Structural evidence

| Field | Value | Citation |
|---|---|---|
| Interactive elements (`<button>`) | 24 | across `src/` |
| Interactive elements (`<input>`/`<textarea>`/`<select>`) | 8 | across `src/` |
| Max component nesting depth (builder tree) | 6 — `App → ScheduleBuilder → WeeklyGrid → DndContext → DayColumn → TaskBlock` | `App.tsx:38`, `ScheduleBuilder.tsx:130`, `WeeklyGrid.tsx:134,196`, `WeeklyGrid.tsx:301` |
| `useDroppable` hooks instantiated at default settings | 70 (5 days × 14 hourly rows) | `WeeklyGrid.tsx:283-291`, `types.ts:56-63` |
| `useDroppable` hooks at max settings (7 days, 24h, 15-min) | 672 | same |
| `: any` / `as any` occurrences | 7 | `ScheduleTabs.tsx:33`, `ExportShareModal.tsx:40,75`, others |

### Repeated patterns (same affordance, same purpose, >1 implementation)

1. **Three separate button implementations** for the same visual language:
   - `ui/Button.tsx:29-44` (the primitive, with `disabled:` and `focus-visible:` handling)
   - `RightToolbar.tsx:74-101` `ToolbarButton` — reimplements primary/ghost variants inline, does not use `ui/Button`
   - `MobileBottomBar.tsx:73-97` `BottomBarItem` — reimplements again
2. **The same five actions rendered twice**, once per breakpoint, with no shared source of truth: `RightToolbar.tsx:27-60` (`hidden md:flex`) and `MobileBottomBar.tsx:59-68` (`md:hidden`). Adding a sixth action requires editing both.
3. **Palette hex literals duplicated outside the token layer**: `main.tsx:23-27` hardcodes `#5560C9`, `#252D6B`, `#141830`, `#FFFFFF`, `#ECE9F0`, `#131C30`, `#1B2040`, `#EFEAE3` — all of which already exist as CSS custom properties in `index.css:48-84`.

### Dead / removable structure

| Item | Citation |
|---|---|
| 18 "compat alias" tokens, self-labelled `Remove once the component sweep lands` | `index.css:108-127` |
| Spacer `<div>`s used instead of `gap`/`space-y` | `ScheduleBuilder.tsx:109`, `SharedScheduleView.tsx:87`, `RightToolbar.tsx:34,53`, `ExportShareModal.tsx:196`, `SettingsModal.tsx:52,97` |
| `Shortcuts` (keyboard-shortcut sheet) reachable from the **touch-only** bottom bar | `MobileBottomBar.tsx:46-53` |
| Unused starter asset | `src/assets/react.svg` |
| Landing page feature cards (pure decoration, three of them) | `App.tsx:123-155` |

---

## B. Visual evidence (INFERRED from source)

### Spacing scale observed (px)

`2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 64` — derived from Tailwind classes `p-0.5 … mb-16` across audited files. Plus viewport-relative horizontal padding `3vw / 4vw / 5vw` (`ScheduleBuilder.tsx:128`), which does not belong to any scale. Row height is a hardcoded `60` (`WeeklyGrid.tsx:31`).

### Type scale observed (px)

`10, 12, 14, 16, 18, 24, 36, 56, 64`

- `text-[10px]` appears **20 times** (labels, day headers, badges, task metadata) — e.g. `AddTaskModal.tsx:122`, `WeeklyGrid.tsx:167`, `TaskBlock.tsx:70`
- `text-[3.5rem]` / `text-[4rem]` — landing hero only (`App.tsx:111`)
- `text-4xl` (36px) — used once, for the emoji `📅` (`WeeklyGrid.tsx:147`)

### Distinct color count

- **Heritage tokens:** 11 semantic colors × 2 themes = 22 values (`index.css:48-84`)
- **Task palette:** 10 hues × 12 variants = **120 hardcoded hex values** (`colors.ts:22-173`), drawn from the stock Tailwind default palette (`#3B82F6` blue-500, `#F59E0B` amber-500, `#22C55E` green-500, …). **Zero overlap with the Heritage tokens.**
- **Orphan colors outside both systems:** `text-green-500` at `ExportShareModal.tsx:207`, `ExportShareModal.tsx:234`, `main.tsx:43`
- **Total distinct color values referenced: 145**

### Lowest contrast ratio across primary text

The `"Vibrant Bold"` palette mode (`SettingsModal.tsx:123`) renders task names as **white on a saturated 500-weight fill** (`colors.ts:206`, `TaskBlock.tsx:56-57`, `:64`). Task names are `text-xs` (12px) or `text-[10px]` — WCAG normal text, requiring 4.5:1.

Computed (WCAG 2.1 relative luminance):

| Hue | Fill | Text | Ratio | AA (4.5:1) |
|---|---|---|---|---|
| Amber | `#F59E0B` | `#FFFFFF` | **2.15:1** | FAIL |
| Green | `#22C55E` | `#FFFFFF` | 2.28:1 | FAIL |
| Cyan | `#06B6D4` | `#FFFFFF` | 2.43:1 | FAIL |
| Teal | `#14B8A6` | `#FFFFFF` | 2.61:1 | FAIL |
| Orange | `#F97316` | `#FFFFFF` | 3.02:1 | FAIL |
| Amber (dark mode) | `#D97706` | `#FEF3C7` | 2.87:1 | FAIL |

**Lowest observed: 2.15:1.** The `"Soft Pastels"` mode passes (e.g. `#92400E` on `#FEF3C7` ≈ 7.4:1) and is the default (`colors.ts:212`). Bold mode is a shipped, one-select-away state.

Heritage chrome contrast is sound and self-documented: navy `#252D6B` is 11.7:1 on the light background (`index.css:56`); the dark theme correctly splits `--heritage-primary` (text-safe) from `--heritage-primary-solid` (fills only) at `index.css:75-76`.

### States checklist

| State | Status | Citation |
|---|---|---|
| **empty** | PARTIAL — present on the editable grid; **absent on the shared read-only view** because the guard is `tasks.length === 0 && !readOnly` | `WeeklyGrid.tsx:144` |
| **loading** | PARTIAL — spinner on the shared view (`SharedScheduleView.tsx:21-27`) and on export (`ExportShareModal.tsx:181-186`); **no state while an authenticated user's schedules load** — `AuthenticatedApp` renders the builder immediately, `ScheduleBuilder.tsx:46-48` auto-creates `"My Schedule"`, then `useConvexSync` swaps in remote data | `App.tsx:54-68`, `ScheduleBuilder.tsx:46-48` |
| **error** | **MISSING** on the two most consequential actions. Export failure: `catch (err) { console.error("Export failed:", err); }` — nothing surfaces to the user. Share-toggle failure: same. `navigator.clipboard.writeText` is unguarded and rejects on insecure origins. The only visible error in the whole app is the JSON import error. | `ExportShareModal.tsx:64-68`, `:84-86`, `:91`; contrast with `DataModal.tsx:121-123` |
| **success** | **MISSING** — saving a task closes the modal silently; a completed export produces no confirmation. The one exception is the 2-second clipboard checkmark. | `AddTaskModal.tsx:99`, `ExportShareModal.tsx:233` |
| **focus** | PRESENT — global `:focus-visible` ring with offset | `index.css:194-196` |
| **disabled** | PRESENT — `disabled:opacity-50 disabled:pointer-events-none` on the primitive | `Button.tsx:36` |

### Additional visual facts

- `rounded-full` used 20×, `rounded-md` 20×, `rounded-lg` 4×, `rounded-sm` 5× — every button, tab, chip and day-picker is a pill.
- `active:scale-[0.98]` appears on 20+ elements.
- Glassmorphism: `backdrop-filter: blur(16px)` on the header (`index.css:199-208`), on floating panels (`:211-219`), and `backdrop-blur-[2px]` on modal backdrops (`Modal.tsx:55`).
- Emoji used as UI: `📅` in the grid empty state (`WeeklyGrid.tsx:147`) and as the favicon data-URI (`index.html:5`), against `lucide-react` icons everywhere else.

---

## C. Copy & honesty evidence

### User-facing strings (landing page, `App.tsx`)

| Line | String |
|---|---|
| `App.tsx:98` | `Weekly Planner` |
| `App.tsx:112-114` | `Build Your Perfect / Weekly Schedule` |
| `App.tsx:117-119` | `A beautifully minimal schedule planner. Add tasks, drag to rearrange, and export a clean PDF — all in your browser.` |
| `App.tsx:128` | `Visual Grid` / `See your entire week at a glance on a clean, configurable calendar` |
| `App.tsx:133` | `Drag & Drop` / `Click to add tasks, drag to rearrange them — effortless planning` |
| `App.tsx:137-138` | `Flawless Export` / `Download your schedule as a high-resolution PDF or PNG` |
| `App.tsx:169` | `Sign In to Save` |
| `App.tsx:179` | `Start Building` |
| `App.tsx:186` | `Create a new account` |
| `App.tsx:191` | `No account needed to try · Sign in to sync across devices` |
| `index.html:7` | `Build beautiful weekly schedules with drag-and-drop, export to PDF/PNG, and sync across devices.` |

### Flagged inflations (superlatives without backing)

1. `Flawless Export` — `App.tsx:137`
2. `Build Your Perfect Weekly Schedule` — `App.tsx:112`
3. `A beautifully minimal schedule planner` — `App.tsx:117`
4. `effortless planning` — `App.tsx:133`
5. `high-resolution PDF or PNG` — `App.tsx:138` (no resolution is specified anywhere; `export.ts` drives `html2canvas` at its default scale)
6. `Build beautiful weekly schedules` — `index.html:7`

### Flagged dark patterns

**None found.** No forced continuity, no hidden cost, no fake scarcity, no confirmshaming. Guest mode is offered on equal footing with sign-in (`App.tsx:172-181`) and the caption `No account needed to try` (`App.tsx:191`) is accurate.

### Label → behaviour mismatches

1. **`Flawless Export`** (`App.tsx:137`) vs. **export failures are swallowed to the console** (`ExportShareModal.tsx:64-68`). The product cannot report a non-flawless export, so the claim is unfalsifiable by construction.
2. **`Import JSON — Load a schedule from a file`** (`DataModal.tsx:115-116`) vs. `DataModal.tsx:53` — `if (data.settings)`. A valid file with tasks but no `settings` key creates an **empty schedule, silently drops every task**, and closes the modal reporting success.
3. **Modal backdrop implies dismiss-on-click** — `Modal.tsx:50-52` fires `onClose` only when `e.target === overlayRef.current`, but the backdrop `<div className="absolute inset-0 …">` at `Modal.tsx:55` covers the entire overlay and is therefore always the click target. **Clicking outside a modal does nothing.**
4. **Tabs render `cursor-grab` at rest** (`ScheduleTabs.tsx:81`) while a single click selects rather than drags.
5. **Shared links render in the *viewer's* palette and theme**, not the author's — `SharedScheduleView.tsx:18` reads `paletteMode` from the local store, so a schedule authored in pastel is shown in bold to a viewer who prefers bold.

### Flagged jargon / unclear labels

| Label | Location | Plain replacement |
|---|---|---|
| `Data` | `RightToolbar.tsx:50`, `MobileBottomBar.tsx:44`, `DataModal.tsx:80` | `Import / Export file` |
| `Vibrant Bold` / `Soft Pastels` | `SettingsModal.tsx:122-123` | `Bold` / `Pastel` (the adjectives are marketing, not description) |

### Hidden affordances (no visible control)

`Rename`, `Duplicate` and `Delete` for a schedule exist **only** inside a right-click context menu (`ScheduleTabs.tsx:216-262`), reached via `onContextMenu` (`ScheduleTabs.tsx:79`). There is no visible trigger — the sole hint is a `title` tooltip, `"… — double-click to rename"` (`ScheduleTabs.tsx:86`), which never renders on touch. The context menu is positioned at raw `clientX/clientY` with no viewport clamping (`ScheduleTabs.tsx:220`), so it overflows offscreen near the right or bottom edge.

### Destructive actions without confirmation or undo

- `deleteSchedule` — one click, destroys every task in the schedule, no confirm, no undo (`ScheduleTabs.tsx:249-259`)
- `removeTask` — one click, no confirm, no undo (`AddTaskModal.tsx:102-107`, `:209-212`)

---

## D. Weight & friction evidence (MEASURED — `npx vite build`)

| Field | Value | Method |
|---|---|---|
| Initial JS bytes | **1,100,473 raw** / 326,157 gzip | `dist/assets/index-*.js`, the only `<script>` in `dist/index.html` |
| Initial CSS bytes | 41,542 raw / 9,521 gzip | `dist/assets/index-*.css` |
| Deferred chunks | `motionFeatures` 37,180 · `index.es` 158,580 · `purify.es` 22,449 | dynamic import at `App.tsx:31`, plus jsPDF's own splits |
| Total `dist/` | 1,601,732 bytes | `du -sb dist` |
| Network requests, primary view | 5 — document, JS, CSS, 2 woff2 subsets (latin) | `dist/index.html` + `@fontsource` `unicode-range` splitting |
| Time-to-interactive | **~2.6 s estimated** (4G, mid-tier mobile) | 326 KB gzip transfer @ ~1.6 Mbps ≈ 1.6 s + ~1.1 MB parse/compile @ ~1 MB/s ≈ 1.0 s. Not measured on hardware. |
| Animations on idle screen | **0** | landing hero animations are one-shot `initial`/`animate` (`App.tsx:92-161`); no `repeat`, no autoplay video; `Loader2` spins only while `exporting` is true |
| Notifications / badges / modals on initial load | **0** | no interstitial, no cookie banner, no toast |

**Root cause of the initial payload:** `lib/export.ts:1-2` statically imports `html2canvas` and `jspdf`. That module is imported by `ExportShareModal`, which is imported by `ScheduleBuilder`, which is imported by `App`. Both PDF libraries therefore ship in the entry chunk and are downloaded and parsed by **every visitor to the landing page** — a screen that has no export button. `grep -c html2canvas dist/assets/index-*.js` → 2. The only dynamic `import()` in the entire source tree is `motionFeatures` (`App.tsx:31`).

**Resource conservation done right (for the record):** dark mode is honored (`index.css:67-84`); `prefers-reduced-motion` is respected twice over, via the global CSS guard (`index.css:265-274`) and `<MotionConfig reducedMotion="user">` (`App.tsx:32`); fonts are self-hosted and subset rather than pulled from a CDN (`index.css:1-4`); a FOUC-prevention script resolves the theme before first paint (`index.html:16-31`).

---

## E. Accessibility evidence

Deployed: the target has a meaningful interactive surface (drag-and-drop grid, four modals, tab strip).

### ARIA landmarks

**3** — `<header>` + `<main>` + `<aside>` (`ScheduleBuilder.tsx:87,128`, `RightToolbar.tsx:25`). The schedule tab strip is not a `<nav>`. No `<footer>`.

### Skip link

**No.**

### Keyboard reachability of primary actions

| Action | Reachable? | Citation |
|---|---|---|
| Add task (toolbar button) | Yes | `RightToolbar.tsx:77` |
| Add task **by clicking a grid cell** | **No** — `DroppableCell` is a bare `<div>` with `onClick`, no `tabIndex`, no `role`, no key handler | `WeeklyGrid.tsx:328-343` |
| Edit a task | **No** — `TaskBlock` is a `<div>`; dnd-kit's `attributes` supply `role="button"` and `tabIndex=0`, but `Enter`/`Space` do not fire `click` on a `<div>`, and no `onKeyDown` is bound | `TaskBlock.tsx:41-48` |
| Move a task by keyboard | **No** — `WeeklyGrid` registers only `PointerSensor` and `TouchSensor`; no `KeyboardSensor` | `WeeklyGrid.tsx:52-58` (contrast: `ScheduleTabs.tsx:121-123` *does* register one) |
| Rename / duplicate / delete a schedule | **No** — context-menu-only, opened by `onContextMenu` | `ScheduleTabs.tsx:79,216` |
| Import JSON | **No** — the `<input type="file">` is `className="hidden"` (`display:none`), which removes it from the tab order; the visible target is a `<div>`, not a `<button>` | `DataModal.tsx:101-119` |
| Export / Share / Settings / Shortcuts | Yes | `RightToolbar.tsx:91` |
| Toggle dark mode | Yes | `App.tsx:80`, `ScheduleBuilder.tsx:101` |

### Accessible names

- Icon-only **modal close button has no `aria-label` and no `title`** — announced as "button" (`Modal.tsx:66-71`).
- Icon-only dark-mode toggles rely on `title` only (`App.tsx:83`, `ScheduleBuilder.tsx:105`).
- `Toggle.tsx:12-14` is the **only** component in the codebase with `role` + `aria-checked`.

### Dialog semantics

`Modal.tsx` has **no `role="dialog"`, no `aria-modal`, no focus trap, and no focus restoration on close**. It does handle `Escape` (`Modal.tsx:23-30`) and body-scroll locking (`:33-42`).

### WCAG contrast per text token

| Token / pairing | Ratio | Result |
|---|---|---|
| `--heritage-fg` `#131C30` on `--heritage-bg` `#F8F6F3` | ~15.6:1 | PASS |
| `--heritage-primary` `#252D6B` on bg | 11.7:1 (self-documented, `index.css:56`) | PASS |
| `--heritage-accent` `#7D1F34` on bg | 9:1 (self-documented, `index.css:58`) | PASS |
| `--heritage-muted-fg` `#545C6E` on bg | ~6.4:1 | PASS |
| dark `--heritage-accent` `#D68A9C` on dark bg | 7.1:1 (self-documented, `index.css:77`) | PASS |
| **Task text, `Vibrant Bold` mode** | **2.15:1 – 3.02:1** | **FAIL (all 10 hues)** |
| Task text, `Soft Pastels` mode | ≥7:1 | PASS |

### Focus order

Follows DOM order and is coherent on the builder shell: logo → tab strip → `+` new schedule → dark-mode toggle → auth button → *(grid: skipped entirely)* → toolbar buttons. **The grid — the entire content region — is a focus-order void.**

---

## F. Known gaps

- No runtime screenshots; visual claims derive from tokens and class names.
- Time-to-interactive is estimated, not measured on hardware; the method is stated above.
- Contrast ratios were computed from source hex values, not sampled from rendered pixels.
- Clerk's hosted auth modal was not audited beyond the theme overrides at `main.tsx:20-49`.
- Screen-reader behaviour was reasoned from markup, not verified with an actual screen reader.
