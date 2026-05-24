import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { rahman, hospitalCase } from "@/data/mockData";
import {
  listEventsForPatient,
  subscribeClaimEvents,
  type ClaimEventRow,
} from "@/lib/claimsApi";
import {
  User,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  HeartPulse,
  Shield,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/patient")({
  component: PatientDashboard,
  head: () => ({ meta: [{ title: "My Health — SihatSatu" }] }),
});

type Status = "submitted" | "approved" | "rejected" | "pending";

type TimelineItem = {
  id: string;
  ts: number;
  title: string;
  desc?: string;
  ref?: string;
  status: Status;
};

const ICON: Record<Status, { icon: typeof Clock; color: string; ring: string }> = {
  submitted: { icon: Clock, color: "text-sky-700", ring: "ring-sky-200 bg-sky-50" },
  approved: { icon: CheckCircle2, color: "text-emerald-700", ring: "ring-emerald-200 bg-emerald-50" },
  rejected: { icon: XCircle, color: "text-red-700", ring: "ring-red-200 bg-red-50" },
  pending: { icon: Clock, color: "text-amber-700", ring: "ring-amber-200 bg-amber-50" },
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("en-MY", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function eventToItem(row: ClaimEventRow): TimelineItem {
  const map: Record<string, { title: string; status: Status }> = {
    "claim.submitted": { title: "Claim submitted to insurer", status: "submitted" },
    "gl.requested": { title: "Guarantee Letter requested", status: "pending" },
    "claim.auto.approved": { title: "Claim auto-approved", status: "approved" },
    "claim.approved": { title: "Claim approved", status: "approved" },
    "gl.approved": { title: "GL approved", status: "approved" },
    "claim.rejected": { title: "Claim rejected", status: "rejected" },
    "claim.flagged": { title: "Claim flagged for review", status: "pending" },
  };
  const meta = map[row.event_name] ?? { title: row.event_name, status: "submitted" as Status };
  return {
    id: row.id,
    ts: new Date(row.created_at).getTime(),
    title: meta.title,
    desc: row.message ?? undefined,
    status: meta.status,
  };
}

function PatientDashboard() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const usedLimit = 15489;
  const remaining = rahman.annualLimit - usedLimit;
  const pct = (usedLimit / rahman.annualLimit) * 100;

  useEffect(() => {
    listEventsForPatient(rahman.name)
      .then((events) => setItems(events.map(eventToItem)))
      .catch((e) => console.error("listEventsForPatient failed", e));
  }, []);

  useEffect(() => {
    const off = subscribeClaimEvents((row) => {
      // We don't know the patient_name from the event alone — keep it simple:
      // append everything (demo scope: one patient). Tighten when auth lands.
      setItems((prev) => {
        if (prev.some((x) => x.id === row.id)) return prev;
        return [eventToItem(row), ...prev];
      });
    });
    return off;
  }, []);



  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200">
          <User className="h-6 w-6 text-emerald-700" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            Patient Portal · Signed in
          </div>
          <h1 className="text-lg font-semibold text-slate-900">{rahman.name}</h1>
          <div className="text-xs text-slate-600">
            MyKad <span className="font-mono">{rahman.myKad}</span> · {rahman.policyName}
          </div>
        </div>
        <Link
          to="/appeal"
          className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
        >
          <Sparkles className="h-4 w-4" />
          Generate Appeal Letter
        </Link>
      </div>

      {/* Current treatment + Insurance summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-glow rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <HeartPulse className="h-4 w-4 text-red-600" />
            Current Treatment
          </div>
          <dl className="space-y-3 text-sm">
            <KV label="Hospital status" value={<span className="text-emerald-700">Admitted · Sunway Medical</span>} />
            <KV label="Attending doctor" value={`${hospitalCase.doctor} · ${hospitalCase.specialty}`} />
            <KV label="GL status" value={<span className="font-mono text-sky-700">{hospitalCase.glDetails.glNumber}</span>} />
            <KV label="Coverage" value={<span className="text-emerald-700">✓ Active · RM {hospitalCase.glDetails.approvedAmount.toLocaleString()} approved</span>} />
            <KV label="Valid until" value={hospitalCase.glDetails.validUntil} />
          </dl>
        </div>

        <div className="card-glow rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Shield className="h-4 w-4 text-sky-600" />
            Insurance Summary
          </div>
          <dl className="space-y-3 text-sm">
            <KV label="Policy" value={rahman.policyName} />
            <KV label="Policy no" value={<span className="font-mono text-sky-700">{rahman.policyNo}</span>} />
            <KV label="Status" value={<span className="text-emerald-700">● Active</span>} />
          </dl>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-600">Annual limit used</span>
              <span className="font-mono text-slate-900">
                RM {usedLimit.toLocaleString()} / RM {rahman.annualLimit.toLocaleString()}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 text-xs text-emerald-700">
              <span className="font-mono">RM {remaining.toLocaleString()}</span> remaining this policy year
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <section className="card-glow rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-slate-600" />
            My Claims Timeline
          </h2>
          <span className="text-[11px] text-slate-500">{items.length} events</span>
        </div>
        <ol className="relative space-y-4 border-l border-slate-200 pl-6">
          {items.map((it) => {
            const meta = ICON[it.status];
            const Icon = meta.icon;
            return (
              <li key={it.id} className="fade-in-up relative">
                <span className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-2 ${meta.ring}`}>
                  <Icon className={`h-3 w-3 ${meta.color}`} />
                </span>
                <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900">{it.title}</div>
                    <div className="font-mono text-[10px] text-slate-500">{formatTime(it.ts)}</div>
                  </div>
                  {it.desc && <div className="mt-0.5 text-xs text-slate-600">{it.desc}</div>}
                  {it.ref && (
                    <div className="mt-1 font-mono text-[11px] text-sky-700">{it.ref}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <Link
        to="/appeal"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-400 sm:hidden"
      >
        <Sparkles className="h-4 w-4" />
        Generate Appeal Letter
      </Link>
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-right text-sm text-slate-900">{value}</dd>
    </div>
  );
}
