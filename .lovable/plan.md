## SihatSatu — Claims & GL Module

A standalone, offline-first demo of the Insurance Claims & Guarantee Letter agent for a Malaysian private-healthcare hackathon. Dark Linear/Vercel-style UI, hardcoded mock data for patient *Encik Rahman bin Ismail*, animated flows, zero backend.

### Stack note (important)
The project is on **TanStack Start**, not Create React App + React Router DOM. I'll honour the intent of the spec but use TanStack's file-based routing instead of `react-router-dom` (the spec's "Use React Router for navigation" line). Everything else — state via `useState` + `useContext`, no Framer Motion, no API calls — stays exactly as specified.

### Routes (files under `src/routes/`)
- `index.tsx` → `/` Mode selector
- `clinic.tsx` → `/clinic` 4-step wizard
- `hospital.tsx` → `/hospital` 5-step wizard
- `status.tsx` → `/status` Claims dashboard
- `appeal.tsx` → `/appeal` Defense + typewriter letter

A shared layout (`__root.tsx`) renders `<TopBar />` + `<Outlet />` and wraps everything in `<ClaimsProvider>`.

### Design tokens (src/styles.css)
Override existing `:root` / `.dark` to lock the app into the dark palette:
- bg `slate-900`, surfaces `slate-800`, borders `slate-700`
- primary `sky-500`, success `emerald-500`, warn `amber-400`, error `red-400`
- Inter for UI, `font-mono` for amounts/refs (refs additionally `text-sky-400`)
- Force dark mode by adding `.dark` to `<html>` in `__root.tsx`

### Reusable components (`src/components/`)
`TopBar`, `StepBar`, `PatientCard`, `ScanProgress`, `CheckList`, `ClaimBreakdown`, `GLTimeline`, `StatusBadge`, `KaizenBadge`, `CodeBlock`, `Toast` (+ tiny `ToastProvider`/`useToast` hook driven by context — sonner not used so we keep it dependency-free per spec).

### State
`src/context/ClaimsContext.tsx` holds `clinicStep`, `hospitalStep`, `claimStatus`, `glStatus`, `patientData`. Wizard steps live in context so navigating away/back keeps progress.

### Mock data
`src/data/mockData.ts` exports: `rahman` patient, `clinicClaim`, `hospitalCase`, `dashboardClaims[]` (3 rows including Puan Haslinda's rejected RM 340), `rejectedClaim`, `appealLetter` (the full letter text verbatim).

### Integration stub
`src/lib/kaizen.ts` with `receiveFromKAIZEN` and `pushToKAIZEN` exactly as specified (console.log bodies).

### Animations (setTimeout chains only)
- `ScanProgress`: cycles labels at 280ms (clinic) / 320ms (hospital), then resolves with `onComplete`.
- Clinic Step 4 timeline: items animate in with 1.5s gap; items 3 & 4 show spinner then resolve (2s, 3s).
- Hospital Step 3: auto-runs on mount; Q&A box fades in 500ms after checklist.
- Hospital Step 4: "Simulate GL approval" resolves item 4 immediately, item 5 after 1.5s.
- Appeal page: 800ms spinner, then 12ms-per-char typewriter using `setInterval` over the letter string.

### Page-by-page content
All copy, amounts, ICD codes, JSON payload, GL fields, checklist items, Q&A, timeline timestamps, dashboard rows and the full appeal letter come from the spec verbatim — no lorem ipsum, no substitutions.

### Toasts
Action buttons that don't navigate (`Export to Patient Record`, `Auto-file Discharge Claim`, `Resubmit Appeal`, `Learn Panel Patterns`) trigger a bottom-right `<Toast>` with the exact spec message.

### Build order
1. Tokens + `__root.tsx` shell with `TopBar` + `ClaimsProvider` + `ToastProvider`.
2. Mock data, kaizen stub, shared components.
3. `/` mode selector.
4. `/clinic` 4 steps.
5. `/hospital` 5 steps.
6. `/status` dashboard.
7. `/appeal` with typewriter.
8. Polish pass at 1280px.

### Out of scope (per spec)
No auth, no API calls, no DB, no Framer Motion/GSAP, no light mode, no Lovable Cloud, no mobile-first work (laptop demo only — basic responsive only).

### Confirm before I build
- OK to use TanStack file-based routing instead of `react-router-dom`? (Same UX, type-safe, matches the template.)
- OK with a tiny in-house `<Toast>` + context (no `sonner`) to stay true to "no extra libraries"?
