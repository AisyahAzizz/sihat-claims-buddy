export function StatusBadge({
  status,
}: {
  status: "approved" | "rejected" | "pending" | "warning";
}) {
  const map = {
    approved: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40",
    rejected: "bg-red-500/15 text-red-300 ring-red-500/40",
    pending: "bg-slate-500/15 text-slate-300 ring-slate-500/40",
    warning: "bg-amber-400/15 text-amber-300 ring-amber-400/40",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 capitalize ${map[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
