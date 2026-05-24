import { supabase } from "@/integrations/supabase/client";

export type ClaimStatus = "pending" | "auto_approved" | "approved" | "rejected" | "flagged";

export type ClaimRow = {
  id: string;
  ref_code: string;
  patient_name: string;
  patient_ic: string | null;
  provider_name: string;
  claim_type: string;
  amount: number;
  diagnosis: string | null;
  status: ClaimStatus;
  decided_by: string | null;
  decided_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ClaimEventRow = {
  id: string;
  claim_id: string | null;
  event_name: string;
  source: string;
  message: string | null;
  level: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export async function submitClaim(input: {
  ref_code: string;
  patient_name: string;
  patient_ic?: string;
  provider_name: string;
  claim_type: "clinic" | "hospital";
  amount: number;
  diagnosis?: string;
  status?: ClaimStatus;
}) {
  const { data, error } = await supabase
    .from("claims")
    .insert({
      ref_code: input.ref_code,
      patient_name: input.patient_name,
      patient_ic: input.patient_ic ?? null,
      provider_name: input.provider_name,
      claim_type: input.claim_type,
      amount: input.amount,
      diagnosis: input.diagnosis ?? null,
      status: input.status ?? "pending",
    })
    .select()
    .single();
  if (error) throw error;

  await logEvent({
    claim_id: data.id,
    event_name: "claim.submitted",
    source: "Provider",
    level: "info",
    message: `${input.claim_type === "clinic" ? "Clinic claim" : "Guarantee Letter"} submitted · ${input.ref_code}`,
  });

  return data as ClaimRow;
}

export async function decideClaim(
  ref_code: string,
  decision: "approved" | "rejected" | "flagged",
  reviewer = "MOH Reviewer",
) {
  const { data, error } = await supabase
    .from("claims")
    .update({
      status: decision,
      decided_by: reviewer,
      decided_at: new Date().toISOString(),
    })
    .eq("ref_code", ref_code)
    .select()
    .single();
  if (error) throw error;

  await logEvent({
    claim_id: data.id,
    event_name:
      decision === "approved" ? "claim.approved" : decision === "rejected" ? "claim.rejected" : "claim.flagged",
    source: "Government",
    level: decision === "approved" ? "success" : decision === "rejected" ? "warning" : "info",
    message: `${decision[0].toUpperCase() + decision.slice(1)} by ${reviewer} · ${ref_code}`,
  });

  return data as ClaimRow;
}

export async function autoApprove(ref_code: string) {
  const { data, error } = await supabase
    .from("claims")
    .update({
      status: "auto_approved",
      decided_by: "AI Adjudicator",
      decided_at: new Date().toISOString(),
    })
    .eq("ref_code", ref_code)
    .select()
    .single();
  if (error) throw error;

  await logEvent({
    claim_id: data.id,
    event_name: "claim.auto.approved",
    source: "System",
    level: "success",
    message: `Auto-approved · RM ${Number(data.amount).toLocaleString()} · ${ref_code}`,
  });
  return data as ClaimRow;
}

export async function listClaims(): Promise<ClaimRow[]> {
  const { data, error } = await supabase
    .from("claims")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as ClaimRow[];
}

export async function listClaimsForPatient(patient_name: string): Promise<ClaimRow[]> {
  const { data, error } = await supabase
    .from("claims")
    .select("*")
    .eq("patient_name", patient_name)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as ClaimRow[];
}

export async function listEventsForPatient(patient_name: string): Promise<ClaimEventRow[]> {
  // Get patient's claim ids, then their events
  const { data: claims } = await supabase
    .from("claims")
    .select("id")
    .eq("patient_name", patient_name);
  const ids = (claims ?? []).map((c) => c.id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("claim_events")
    .select("*")
    .in("claim_id", ids)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as ClaimEventRow[];
}

async function logEvent(e: {
  claim_id: string | null;
  event_name: string;
  source: string;
  level: string;
  message: string;
  payload?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("claim_events").insert({
    claim_id: e.claim_id,
    event_name: e.event_name,
    source: e.source,
    level: e.level,
    message: e.message,
    payload: e.payload ?? null,
  });
  if (error) console.error("logEvent failed", error);
}

/** Subscribe to all claim row changes. Returns cleanup fn. */
export function subscribeClaims(onChange: (row: ClaimRow, evt: "INSERT" | "UPDATE" | "DELETE") => void) {
  const channel = supabase
    .channel("claims-stream")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "claims" },
      (payload) => {
        const evt = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
        const row = (payload.new ?? payload.old) as ClaimRow;
        if (row) onChange(row, evt);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/** Subscribe to claim_events inserts. */
export function subscribeClaimEvents(onInsert: (row: ClaimEventRow) => void) {
  const channel = supabase
    .channel("claim-events-stream")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "claim_events" },
      (payload) => onInsert(payload.new as ClaimEventRow),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
