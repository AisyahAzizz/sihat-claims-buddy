import { Check, AlertTriangle, X } from "lucide-react";

export type CheckItem = {
  status: "ok" | "warn" | "error";
  label: string;
  note?: string;
};

export function CheckList({ items }: { items: CheckItem[] }) {
  return (
    <ul className="divide-y divide-slate-700 rounded-lg border border-slate-700 bg-slate-800/40">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-3 fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
          <Icon status={it.status} />
          <div className="flex-1">
            <div className="text-sm text-slate-100">{it.label}</div>
            {it.note && (
              <div
                className={[
                  "text-xs mt-0.5",
                  it.status === "ok" && "text-slate-400",
                  it.status === "warn" && "text-amber-300",
                  it.status === "error" && "text-red-300",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {it.note}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Icon({ status }: { status: CheckItem["status"] }) {
  if (status === "ok")
    return (
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
        <Check className="h-3 w-3 text-emerald-300" />
      </div>
    );
  if (status === "warn")
    return (
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/15 ring-1 ring-amber-400/40">
        <AlertTriangle className="h-3 w-3 text-amber-300" />
      </div>
    );
  return (
    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/40">
      <X className="h-3 w-3 text-red-300" />
    </div>
  );
}
