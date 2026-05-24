export function StatusBadge({
  status,
}: {
  status: "approved" | "rejected" | "pending" | "warning";
}) {
  const map = {
    approved: "bg-emerald-100 text-emerald-700 ring-emerald-300",
    rejected: "bg-red-100 text-red-700 ring-red-300",
    pending: "bg-slate-500/15 text-slate-700 ring-slate-500/40",
    warning: "bg-amber-100 text-amber-700 ring-amber-300",
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
