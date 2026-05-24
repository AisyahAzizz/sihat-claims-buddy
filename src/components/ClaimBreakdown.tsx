export function ClaimBreakdown({
  items,
  total,
  totalLabel = "Claimable total",
}: {
  items: { label: string; amount: number }[];
  total: number;
  totalLabel?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/40">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-slate-700">
          {items.map((it) => (
            <tr key={it.label}>
              <td className="px-4 py-2.5 text-slate-200">{it.label}</td>
              <td
                className={[
                  "px-4 py-2.5 text-right font-mono",
                  it.amount < 0 ? "text-amber-300" : "text-slate-100",
                ].join(" ")}
              >
                {fmt(it.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-700 bg-emerald-500/5">
            <td className="px-4 py-3 text-sm font-semibold text-emerald-300">{totalLabel}</td>
            <td className="px-4 py-3 text-right font-mono text-lg font-semibold text-emerald-300">
              {fmt(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function fmt(n: number) {
  const abs = Math.abs(n).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${n < 0 ? "−" : ""}RM ${abs}`;
}
