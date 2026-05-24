# SihatSatu — System Integration Upgrade Plan

Turn the existing clinic/hospital/status/appeal pages into one connected, backend-feeling demo without adding any real backend. All changes are additive — current routes, mock data, and step wizards stay intact.

## 1. New core: event bus + activity log

**`src/lib/eventBus.ts`** — tiny pub/sub (`emit`, `subscribe`, `unsubscribe`). Typed event names:
`claim.submitted`, `claim.auto.approved`, `claim.rejected`, `gl.requested`, `gl.ai.reviewing`, `gl.approved`, `discharge.queued`, `inventory.push`, `ops.notify`, `billing.update`, `tpa.sync`.

**`src/context/ActivityContext.tsx`** — subscribes to every event, keeps a rolling `activity[]` (max 50) with `{ id, ts, source: 'Clinic'|'Hospital'|'System'|'KAIZEN', level: 'info'|'success'|'warning', message, refCode? }`. Provider mounted in `__root.tsx` inside `ClaimsProvider`.

**`src/lib/integrations.ts`** — stubs `pushToInventory`, `notifyOps`, `updateBilling`. Each `console.log` + `eventBus.emit` so the activity feed lights up. Wired into hospital discharge step and clinic approval.

## 2. Live Activity Feed component

**`src/components/ActivityFeed.tsx`** — floating panel bottom-right (above existing ToastHost), collapsible header "System Activity" with live dot + count badge. Expanded: scrollable list, mono timestamps, colored source pill (Clinic=sky, Hospital=violet, System=slate, KAIZEN=emerald), level icon. On viewports <768px renders as a single collapsed pill that opens a bottom sheet. Mounted in `__root.tsx`.

## 3. Upgraded ToastHost

Rework `src/components/ToastHost.tsx` + `ClaimsContext.showToast` signature to
`showToast(message, opts?: { level?: 'success'|'warning'|'info', source?: 'Clinic'|'Hospital'|'System' })`. Existing call sites keep working (defaults to info/System). Visual: stacked, icon by level, source pill prefix (e.g. "Hospital → GL Approved"). Backward compatible — old `showToast("…")` still renders.

## 4. Dynamic Status page

Rewrite `src/routes/status.tsx` to keep `dashboardClaims` as the seed, but:
- Store rows in local state seeded from mock.
- Subscribe to `claim.submitted`, `claim.auto.approved`, `gl.approved`, `claim.rejected` — prepend or update matching `ref`.
- Add row enter animation (`fade-in-up`) and a subtle row-flash on status change.
- Add a "Live" pill in the header tied to feed activity.

## 5. Hospital flow realism

Update `src/routes/hospital.tsx` Step 3 + Step 4:
- After "Check Documents" → ScanProgress already exists; afterwards inject a 2–4 s randomized "Queued in HealthMetrics TPA" → "Assigned to medical officer #A17" → "Cross-checking policy coverage…" micro-status sequence before showing the AI review summary. Each step emits an event.
- GL issuance: keep current GL number/timeline, but submission delay randomized 2–4 s, and emits `gl.requested` → `gl.ai.reviewing` → `gl.approved`.
- Discharge step: button "Queue discharge" calls `notifyOps()` + `pushToInventory()` + `updateBilling()` + emits `discharge.queued`. Toast: "Hospital → Discharge queued".

## 6. Clinic flow events

In `src/routes/clinic.tsx`:
- Step 2 after scan completes: insert ~1.2 s "Insurer validation in progress…" line before showing the checklist (emit `tpa.sync`).
- Step 3 submit: emit `claim.submitted` with the clinic ref.
- Step 4 on approval: emit `claim.auto.approved` (so the Status page row lights up live) + `updateBilling()`.

## 7. System Control Header

Update `src/components/TopBar.tsx`:
- Replace 2 static badges with 3 live indicators: `AIA ● Live` (emerald), `HealthMetrics ● Syncing` (amber, pulsing), `KAIZEN Engine ● Active` (sky). Pulse driven by CSS animation.
- Wire a tiny ticker that flips HealthMetrics to "Syncing" briefly whenever a `tpa.sync` event fires.

## 8. Demo Mode toggle

Add `demoMode: boolean` + `setDemoMode` to `ClaimsContext`. TopBar gets a small switch ("Demo mode"). When ON:
- ScanProgress `intervalMs` halved.
- Random delays clamped to ~600 ms.
- Clinic/Hospital wizards auto-advance to next step on completion (500 ms timer).
- A subtle "DEMO" chip shows next to logo.
Off = current manual behaviour.

## 9. Visual polish pass

- Add `.card-glow` utility in `src/styles.css` (`hover:` ring + soft sky shadow) and apply to PatientCard, ClaimBreakdown, GLTimeline, dashboard rows.
- Audit clinic/hospital/status/appeal for: every `RM …` wrapped in `font-mono`; every GL/ref/policy ID wrapped in `font-mono text-sky-300`.
- Tighten spacing tokens (consistent `p-5`, `gap-4`, `rounded-lg`) on top-level cards.
- Add `border-slate-700/70` outline + faint inner gradient on outer wrappers for the "sci-fi dashboard" feel.

## 10. Files changed / created

Created:
- `src/lib/eventBus.ts`
- `src/lib/integrations.ts`
- `src/context/ActivityContext.tsx`
- `src/components/ActivityFeed.tsx`

Edited:
- `src/context/ClaimsContext.tsx` (toast levels/sources + demoMode)
- `src/components/ToastHost.tsx` (stacked, icons, source pill)
- `src/components/TopBar.tsx` (3 live indicators + demo switch)
- `src/routes/__root.tsx` (mount ActivityProvider + ActivityFeed)
- `src/routes/clinic.tsx` (emit events, validation delay)
- `src/routes/hospital.tsx` (realistic delays, micro-status, discharge integrations)
- `src/routes/status.tsx` (live subscription, row animations)
- `src/styles.css` (card-glow, pulse-soft utility)

## Out of scope

- No real backend, no auth, no persistence beyond in-memory state.
- No changes to appeal typewriter, KAIZEN intake stubs, mock data shape, or routing.
- No new dependencies.
