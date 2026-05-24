import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useClaims } from "@/context/ClaimsContext";
import { eventBus } from "@/lib/eventBus";
import { updateBilling } from "@/lib/integrations";
import {
  listClaims,
  decideClaim,
  subscribeClaims,
  type ClaimRow,
} from "@/lib/claimsApi";
import {
  Landmark,
  AlertTriangle,
  Activity,
  Shield,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";

export const Route = createFileRoute("/gov")({
  component: GovDashboard,
  head: () => ({
    meta: [{ title: "Government Control Center — SihatSatu" }],
  }),
});

type Row = ClaimRow & { _flashKey?: number; flagged?: boolean };

function statusLabel(s: ClaimRow["status"]) {
  if (s === "auto_approved" || s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  if (s === "flagged") return "flagged";
  return "pending";
}

function GovDashboard() {
  const { showToast } = useClaims();
  const [rows, setRows] = useState<Row[]>([]);
  const [lastEventAt, setLastEventAt] = useState(0);

  // initial load
  useEffect(() => {
    listClaims()
      .then((data) => setRows(data.map((r) => ({ ...r, flagged: r.status === "flagged" }))))
      .catch((e) => console.error("listClaims failed", e));
  }, []);

  // realtime sync from DB
  useEffect(() => {
    const off = subscribeClaims((row, evt) => {
      setLastEventAt(Date.now());
      setRows((prev) => {
        const i = prev.findIndex((r) => r.id === row.id);
        if (evt === "DELETE") return prev.filter((r) => r.id !== row.id);
        if (i === -1)
          return [{ ...row, flagged: row.status === "flagged", _flashKey: Date.now() }, ...prev];
        const next = [...prev];
        next[i] = { ...next[i], ...row, flagged: row.status === "flagged", _flashKey: Date.now() };
        return next;
      });
    });
    return off;
  }, []);



  const totals = useMemo(
    () =>
      rows.reduce(
        (a, c) => {
          const amt = Number(c.amount);
          a.total += amt;
          if (c.status === "approved" || c.status === "auto_approved") a.approved += amt;
          if (c.status === "pending") a.pending += amt;
          if (c.claim_type === "clinic") a.clinic += amt;
          else a.hospital += amt;
          return a;
        },
        { total: 0, approved: 0, pending: 0, clinic: 0, hospital: 0 },
      ),
    [rows],
  );

  const handleAction = async (ref: string, action: "approve" | "reject" | "flag") => {
    const decision = action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged";
    try {
      await decideClaim(ref, decision, "MOH Reviewer");
    } catch (e) {
      console.error("decideClaim failed", e);
    }
    const row = rows.find((r) => r.ref_code === ref);
    if (action === "approve") {
      eventBus.emit("gl.approved", {
        source: "Government",
        level: "success",
        message: `Approved by MOH reviewer · ${ref}`,
        refCode: ref,
        amount: row ? Number(row.amount) : undefined,
      });
      if (row) updateBilling({ ref, amount: Number(row.amount) });
      showToast(`Approved ${ref}`, { level: "success", source: "Government" });
    } else if (action === "reject") {
      eventBus.emit("claim.rejected", {
        source: "Government",
        level: "warning",
        message: `Rejected by MOH reviewer · ${ref}`,
        refCode: ref,
      });
      showToast(`Rejected ${ref}`, { level: "warning", source: "Government" });
    } else {
      showToast(`Flagged ${ref} for review`, { level: "info", source: "Government" });
    }
  };

  const isLive = Date.now() - lastEventAt < 3000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 ring-1 ring-red-200">
            <Landmark className="h-5 w-5 text-red-700" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-red-700">
              Ministry of Health Malaysia · National Oversight
            </div>
            <h1 className="text-xl font-semibold text-slate-900">National Insurance Control Center</h1>
            <p className="text-xs text-slate-600">Live claims feed across 180 providers · 24.8M citizen records</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium ${
            isLive ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isLive ? "bg-sky-400" : "bg-slate-400"} opacity-75`} />
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isLive ? "bg-sky-400" : "bg-slate-400"}`} />
          </span>
          {isLive ? "Live update" : "Listening"}
        </span>
      </div>

      {/* Cost overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total payout today" value={totals.approved} tone="emerald" icon={<TrendingUp className="h-4 w-4" />} />
        <Stat label="Clinic spend" value={totals.clinic} tone="sky" icon={<Activity className="h-4 w-4" />} />
        <Stat label="Hospital spend" value={totals.hospital} tone="violet" icon={<Shield className="h-4 w-4" />} />
        <Stat label="Pending exposure" value={totals.pending} tone="amber" icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      {/* Risk monitoring */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Risk Monitoring</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RiskCard
            tone="red"
            title="High cost admissions"
            value="7"
            note="≥ RM 15K open exposure"
          />
          <RiskCard
            tone="amber"
            title="Pre-existing flags"
            value="12"
            note="T2DM, HTN, CKD watchlist"
          />
          <RiskCard
            tone="sky"
            title="Frequent claim patients"
            value="3"
            note=">4 claims in 30 days"
          />
          <RiskCard
            tone="violet"
            title="Suspicious patterns"
            value="2"
            note="Duplicate IC, near-limit billing"
          />
        </div>
      </section>

      {/* Live queue + control */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Live Claims Queue</h2>
        <div className="card-glow overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <Th>Claim ID</Th>
                  <Th>Patient</Th>
                  <Th>Type</Th>
                  <Th>Provider</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th>Submitted</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((c) => (
                  <tr key={c.id} className={`hover:bg-slate-50 ${c._flashKey ? "row-flash" : ""}`}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-sky-700">{c.ref_code}</span>
                        {c.flagged && (
                          <span className="rounded border border-amber-300 bg-amber-50 px-1 py-0.5 text-[9px] font-semibold uppercase text-amber-700">
                            Flagged
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>{c.patient_name}</Td>
                    <Td className="text-slate-600">{c.claim_type === "clinic" ? "Outpatient" : "Inpatient GL"}</Td>
                    <Td className="text-slate-600">{c.provider_name}</Td>
                    <Td className="text-right font-mono">RM {Number(c.amount).toLocaleString()}</Td>
                    <Td><StatusBadge status={statusLabel(c.status)} /></Td>
                    <Td className="font-mono text-xs text-slate-600">
                      {new Date(c.created_at).toLocaleString("en-MY", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <ActionBtn
                          onClick={() => handleAction(c.ref_code, "approve")}
                          tone="emerald"
                          icon={<CheckCircle2 className="h-3 w-3" />}
                          label="Approve"
                          disabled={c.status === "approved" || c.status === "auto_approved"}
                        />
                        <ActionBtn
                          onClick={() => handleAction(c.ref_code, "reject")}
                          tone="red"
                          icon={<XCircle className="h-3 w-3" />}
                          label="Reject"
                          disabled={c.status === "rejected"}
                        />
                        <ActionBtn
                          onClick={() => handleAction(c.ref_code, "flag")}
                          tone="amber"
                          icon={<Flag className="h-3 w-3" />}
                          label="Flag"
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Live data from clinic & hospital provider flows. <Link to="/status" className="text-sky-700 hover:underline">View full audit log →</Link>
        </p>
      </section>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className ?? ""}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-slate-800 ${className ?? ""}`}>{children}</td>;
}

const STAT_TONE: Record<string, string> = {
  emerald: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  sky: "text-sky-700 bg-sky-50 ring-sky-200",
  violet: "text-violet-700 bg-violet-50 ring-violet-200",
  amber: "text-amber-700 bg-amber-50 ring-amber-200",
};

function Stat({ label, value, tone, icon }: { label: string; value: number; tone: keyof typeof STAT_TONE; icon: React.ReactNode }) {
  return (
    <div className="card-glow rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ring-1 ${STAT_TONE[tone]}`}>{icon}</span>
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold text-slate-900">
        RM {value.toLocaleString()}
      </div>
    </div>
  );
}

const RISK_TONE: Record<string, string> = {
  red: "border-red-200 bg-red-50 text-red-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

function RiskCard({ tone, title, value, note }: { tone: keyof typeof RISK_TONE; title: string; value: string; note: string }) {
  return (
    <div className={`card-glow rounded-lg border p-4 ${RISK_TONE[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{title}</div>
      <div className="mt-2 font-mono text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-[11px] opacity-80">{note}</div>
    </div>
  );
}

const ACTION_TONE: Record<string, string> = {
  emerald: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  red: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
  amber: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
};

function ActionBtn({
  onClick,
  tone,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  tone: keyof typeof ACTION_TONE;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${ACTION_TONE[tone]}`}
    >
      {icon}
      {label}
    </button>
  );
}
