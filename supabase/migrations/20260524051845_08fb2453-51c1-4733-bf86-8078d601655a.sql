
-- Status enum for claims
CREATE TYPE public.claim_status AS ENUM (
  'pending',
  'auto_approved',
  'approved',
  'rejected',
  'flagged'
);

-- Claims table — shared across Provider, Government, Patient
CREATE TABLE public.claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code text NOT NULL UNIQUE,
  patient_name text NOT NULL,
  patient_ic text,
  provider_name text NOT NULL,
  claim_type text NOT NULL,           -- 'clinic' | 'hospital'
  amount numeric(12,2) NOT NULL DEFAULT 0,
  diagnosis text,
  status public.claim_status NOT NULL DEFAULT 'pending',
  decided_by text,
  decided_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_created_at ON public.claims(created_at DESC);
CREATE INDEX idx_claims_patient_name ON public.claims(patient_name);

-- Event log per claim (for ActivityFeed + Patient timeline)
CREATE TABLE public.claim_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid REFERENCES public.claims(id) ON DELETE CASCADE,
  event_name text NOT NULL,           -- 'claim.submitted', 'claim.approved', etc.
  source text NOT NULL,               -- 'Provider' | 'Government' | 'Patient' | 'System'
  message text,
  level text NOT NULL DEFAULT 'info', -- 'info' | 'success' | 'warning'
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_claim_events_claim_id ON public.claim_events(claim_id);
CREATE INDEX idx_claim_events_created_at ON public.claim_events(created_at DESC);

-- updated_at trigger for claims
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER claims_touch_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS — open for hackathon demo (no auth yet). Tighten when auth lands.
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_claims_select" ON public.claims FOR SELECT USING (true);
CREATE POLICY "demo_claims_insert" ON public.claims FOR INSERT WITH CHECK (true);
CREATE POLICY "demo_claims_update" ON public.claims FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "demo_events_select" ON public.claim_events FOR SELECT USING (true);
CREATE POLICY "demo_events_insert" ON public.claim_events FOR INSERT WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
ALTER PUBLICATION supabase_realtime ADD TABLE public.claim_events;
