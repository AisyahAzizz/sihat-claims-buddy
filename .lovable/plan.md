## Goal

Replace the in-memory mock (`ClaimsContext`, `eventBus`, `SystemContext`, localStorage role) with a real Postgres backend via **Lovable Cloud**, so Provider / Government / Patient portals see the same live data — no hand-written `src/lib/supabase.ts` needed.

## Why not the snippet you pasted

`import.meta.env.https://...!` is invalid syntax — `import.meta.env` only accepts variable names. Enabling Lovable Cloud auto-generates a correct client at `@/integrations/supabase/client` with URL + publishable key wired in. That replaces your file entirely.

## Steps

### 1. Enable Lovable Cloud
- Provisions Postgres, auth, storage, generates `@/integrations/supabase/client.ts` and `client.server.ts`.

### 2. Database schema (migration)

```text
profiles (id uuid PK → auth.users, full_name, created_at)
user_roles (user_id, role enum: provider|government|patient)  -- separate table, has_role() SECURITY DEFINER fn
claims (
  id uuid PK, ref_code text unique, patient_name text, provider_id uuid,
  type text, amount numeric, status enum: pending|auto_approved|approved|rejected|flagged,
  diagnosis text, created_at, updated_at, decided_by uuid, decided_at
)
claim_events (id, claim_id FK, event_name text, source text, message text, payload jsonb, created_at)
```

RLS:
- `claims`: providers see/insert their own; government sees all + can update status; patients see claims where `patient_name`/linked id matches.
- `claim_events`: readable by anyone who can read the parent claim; insert via server fn only.
- `user_roles`: user reads own row; admins managed via `has_role()`.

### 3. Realtime
Enable Postgres realtime on `claims` and `claim_events`. Replace `eventBus.subscribe(...)` in `gov.tsx`, `patient.tsx`, `ActivityFeed.tsx` with Supabase channel subscriptions. Keep `eventBus` as a thin local fan-out for toast UX.

### 4. Server functions (`src/lib/claims.functions.ts`)
- `submitClaim` (provider) — insert + emit `claim.submitted` event row
- `decideClaim` (government, requires role check) — update status, insert event
- `listClaims` / `getMyClaims` — role-scoped reads via RLS

### 5. Refactor existing code
- `ClaimsContext` → keep `clinicStep`/`hospitalStep`/`toasts` (UI only); remove mock claim arrays.
- `RoleContext` → load role from `user_roles` after sign-in; keep localStorage as dev-mode override behind a flag.
- `clinic.tsx` submit → calls `submitClaim`.
- `gov.tsx` approve/reject/flag → calls `decideClaim`.
- `patient.tsx` timeline → `useQuery` + realtime channel on `claims`.
- `ActivityFeed` → reads `claim_events` table (last 50) + realtime.

### 6. Auth
Add minimal `/login` (email+password + Google) and `_authenticated` layout. Demo mode: seed 3 test accounts (one per role) so the role switcher still works for the hackathon demo.

### 7. Delete the broken snippet
Do not create `src/lib/supabase.ts`. All imports use `@/integrations/supabase/client`.

## Out of scope
- File storage, payments, email sending, AI gateway — can be added later.

## Open question
Hackathon demo: do you want **real auth (login screen)** or keep the **role switcher as-is** and just have all 3 roles share one demo account that bypasses RLS via a server fn? The former is more "real", the latter is faster to demo.
