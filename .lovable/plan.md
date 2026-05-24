## Switch app to light mode

Convert the SihatSatu app from its current dark-only theme to a light theme. Keep the same sky/emerald/violet accent system so brand identity stays intact.

### Changes

**1. `src/styles.css`**
- Remove `dark` class from `<html>` usage — switch `:root` tokens to light values:
  - `--background`: near-white (`oklch(0.99 0.005 256)`)
  - `--foreground`: slate-900
  - `--card`, `--popover`: white
  - `--muted`, `--secondary`, `--accent`: slate-100
  - `--border`, `--input`: slate-200
  - `--primary`: keep sky-500 family
- Update `html, body` rule: `background-color: #f8fafc` (slate-50), `color: #0f172a` (slate-900).
- Update `@layer base * { border-color }` to slate-200.
- Update `.card-glow` hover shadow opacity for light bg.
- Update `.row-flash` background tint (slightly stronger sky alpha for visibility on white).

**2. `src/routes/__root.tsx`**
- Remove `className="dark"` from `<html>`.
- Change main wrapper `bg-slate-900 text-slate-100` → `bg-slate-50 text-slate-900`.

**3. Component color sweep** (replace slate-dark utility classes with light equivalents). Files: `TopBar.tsx`, `ToastHost.tsx`, `ActivityFeed.tsx`, `StepBar.tsx`, `StatusBadge.tsx`, `CheckList.tsx`, `ClaimBreakdown.tsx`, `CodeBlock.tsx`, `GLTimeline.tsx`, `KaizenBadge.tsx`, `PatientCard.tsx`, `ScanProgress.tsx`, `DocumentDropzone.tsx`, and routes `index.tsx`, `clinic.tsx`, `hospital.tsx`, `status.tsx`, `appeal.tsx`.

Mapping rules applied consistently:
- `bg-slate-900` / `bg-slate-800/*` (page & card surfaces) → `bg-white` or `bg-slate-50`
- `border-slate-700` → `border-slate-200`
- `text-slate-100` → `text-slate-900`
- `text-slate-300/400` → `text-slate-600`
- `text-slate-500` (meta) → `text-slate-500` (kept)
- `bg-slate-950` (CodeBlock) → `bg-slate-900` (keep code dark for contrast/legibility) — code blocks stay dark intentionally.
- Accent tints (`bg-sky-500/15`, `text-sky-300`, etc.) → lighter/darker variants: `bg-sky-100`, `text-sky-700`, `ring-sky-300` etc. Same for emerald/amber/violet/red used in badges, timelines, toasts.
- Shadows: `shadow-black/40` → `shadow-slate-900/10`.

**4. TopBar live badges**
- Re-tune `LiveBadge` tone palette for white background: stronger text color (`text-emerald-700` instead of `text-emerald-300`), light bg (`bg-emerald-50`), border (`border-emerald-200`). Same pattern for sky/amber.

**5. Camera modal (`DocumentDropzone.tsx`)**
- Modal overlay stays dark (it's a camera viewfinder — dark is correct UX). Only adjust the trigger buttons and dropzone surface to light theme.

### Out of scope
- No layout changes, no copy changes, no logic changes.
- No theme toggle — purely a one-way switch to light mode (can add toggle later if requested).
- Brand accent hues unchanged; only their light/dark shade variants are swapped.
