import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/StatusBadge";
import { dashboardClaims } from "@/data/mockData";

export const Route = createFileRoute("/status")({
  component: Status,
  head: () => ({ meta: [{ title: "Claims Dashboard — SihatSatu" }] }),
});

function Status() {
  const totals = dashboardClaims.reduce(
    (acc, c) => {
      acc.total += c.amount;
      if (c.status === "approved") acc.approved += c.amount;
      if ((c.status as string) === "pending") acc.pending += c.amount;
      if (c.status === "rejected") acc.rejected += c.amount;
      return acc;
    },
    { total: 0, approved: 0, pending: 0, rejected: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Claims Dashboard</h1>
        <p className="text-sm text-slate-400">All claims processed by the SihatSatu Claims Agent.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total claimed" value={totals.total} tone="slate" />
        <Stat label="Approved" value={totals.approved} tone="emerald" />
        <Stat label="Pending" value={totals.pending} tone="slate" />
        <Stat label="Rejected" value={totals.rejected} tone="red" />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/40">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-left text-[11px] uppercase tracking-wide text-slate-400">
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
          <tbody className="divide-y divide-slate-700">
            {dashboardClaims.map((c) => (
              <tr key={c.ref} className="hover:bg-slate-800/40">
                <Td>
                  <span className="font-mono text-sky-300">{c.ref}</span>
                </Td>
                <Td>{c.patient}</Td>
                <Td className="text-slate-400">{c.type}</Td>
                <Td className="text-slate-400">{c.provider}</Td>
                <Td className="text-right font-mono">RM {c.amount.toLocaleString()}</Td>
                <Td className="text-slate-400">{c.insurer}</Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td className="font-mono text-xs text-slate-400">{c.submitted}</Td>
                <Td>
                  {c.status === "rejected" ? (
                    <Link
                      to="/appeal"
                      className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs font-medium text-red-300 hover:bg-red-500/10"
                    >
                      Draft Appeal
                    </Link>
                  ) : (
                    <button className="text-xs text-sky-300 hover:underline">View</button>
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
  return <td className={`px-4 py-3 text-slate-200 ${className ?? ""}`}>{children}</td>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "slate" | "emerald" | "red" }) {
  const toneMap = {
    slate: "text-slate-100",
    emerald: "text-emerald-300",
    red: "text-red-300",
  };
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 font-mono text-2xl font-semibold ${toneMap[tone]}`}>
        RM {value.toLocaleString()}
      </div>
    </div>
  );
}
