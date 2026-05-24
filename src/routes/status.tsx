import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { dashboardClaims } from "@/data/mockData";
import { eventBus, SystemEventPayload } from "@/lib/eventBus";

export const Route = createFileRoute("/status")({
  component: Status,
  head: () => ({ meta: [{ title: "Claims Dashboard — SihatSatu" }] }),
});

type Row = (typeof dashboardClaims)[number] & { _flashKey?: number };

function Status() {
  const [rows, setRows] = useState<Row[]>(() => [...dashboardClaims]);
  const [lastEventAt, setLastEventAt] = useState<number>(0);

  useEffect(() => {
    const upsert = (ref: string, patch: Partial<Row>, fallback?: Row) => {
      setLastEventAt(Date.now());
      setRows((prev) => {
        const i = prev.findIndex((r) => r.ref === ref);
        if (i === -1 && fallback) {
          return [{ ...fallback, ...patch, _flashKey: Date.now() }, ...prev];
        }
        if (i === -1) return prev;
        const next = [...prev];
        next[i] = { ...next[i], ...patch, _flashKey: Date.now() };
        return next;
      });
    };

    const offs = [
      eventBus.subscribe("claim.submitted", (p: SystemEventPayload) => {
        const ref = (p.refCode as string) || `SSATU-${Date.now()}`;
        upsert(
          ref,
          { status: "pending" as never },
          {
            ref,
            patient: (p.patient as string) || "Encik Rahman",
            type: "Outpatient",
            provider: (p.provider as string) || "Klinik Sihat",
            amount: (p.amount as number) || 99,
            insurer: "AIA",
            status: "pending" as never,
            submitted: new Date().toLocaleString("en-MY", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        );
      }),
      eventBus.subscribe("claim.auto.approved", (p: SystemEventPayload) => {
        const ref = (p.refCode as string) || "SSATU-20260524-001";
        upsert(ref, { status: "approved" as never });
      }),
      eventBus.subscribe("gl.approved", (p: SystemEventPayload) => {
        const ref = (p.refCode as string) || "GL-SSATU-20260524-HOS";
        upsert(ref, { status: "approved" as never });
      }),
      eventBus.subscribe("claim.rejected", (p: SystemEventPayload) => {
        const ref = p.refCode as string;
        if (ref) upsert(ref, { status: "rejected" as never });
      }),
    ];
    return () => offs.forEach((o) => o?.());
  }, []);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, c) => {
          acc.total += c.amount;
          if (c.status === "approved") acc.approved += c.amount;
          if ((c.status as string) === "pending") acc.pending += c.amount;
          if (c.status === "rejected") acc.rejected += c.amount;
          return acc;
        },
        { total: 0, approved: 0, pending: 0, rejected: 0 },
      ),
    [rows],
  );

  const isLive = Date.now() - lastEventAt < 3000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Claims Dashboard</h1>
          <p className="text-sm text-slate-600">All claims processed by the SihatSatu Claims Agent.</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium ${
            isLive
              ? "border-sky-300 bg-sky-50 text-sky-700"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isLive ? "bg-sky-400" : "bg-slate-500"} opacity-75`} />
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isLive ? "bg-sky-400" : "bg-slate-500"}`} />
          </span>
          {isLive ? "Live update" : "Listening"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total claimed" value={totals.total} tone="slate" />
        <Stat label="Approved" value={totals.approved} tone="emerald" />
        <Stat label="Pending" value={totals.pending} tone="slate" />
        <Stat label="Rejected" value={totals.rejected} tone="red" />
      </div>

      <div className="card-glow overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
            <tr>
              <Th>Ref</Th>
              <Th>Patient</Th>
              <Th>Type</Th>
              <Th>Provider</Th>
              <Th className="text-right">Amount</Th>
              <Th>Insurer</Th>
              <Th>Status</Th>
              <Th>Submitted</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((c) => (
              <tr
                key={c.ref}
                className={`hover:bg-white ${c._flashKey ? "row-flash" : ""}`}
              >
                <Td>
                  <span className="font-mono text-sky-700">{c.ref}</span>
                </Td>
                <Td>{c.patient}</Td>
                <Td className="text-slate-600">{c.type}</Td>
                <Td className="text-slate-600">{c.provider}</Td>
                <Td className="text-right font-mono">RM {c.amount.toLocaleString()}</Td>
                <Td className="text-slate-600">{c.insurer}</Td>
                <Td>
                  <StatusBadge status={c.status} />
                </Td>
                <Td className="font-mono text-xs text-slate-600">{c.submitted}</Td>
                <Td>
                  {c.status === "rejected" ? (
                    <Link
                      to="/appeal"
                      className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Draft Appeal
                    </Link>
                  ) : (
                    <button className="text-xs text-sky-700 hover:underline">View</button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className ?? ""}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-slate-800 ${className ?? ""}`}>{children}</td>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "slate" | "emerald" | "red" }) {
  const toneMap = {
    slate: "text-slate-900",
    emerald: "text-emerald-700",
    red: "text-red-700",
  };
  return (
    <div className="card-glow rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 font-mono text-2xl font-semibold ${toneMap[tone]}`}>
        RM {value.toLocaleString()}
      </div>
    </div>
  );
}
