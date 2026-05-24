import { ReactNode } from "react";
import { KaizenBadge } from "./KaizenBadge";

export function PatientCard({
  title = "Patient",
  badge,
  rows,
  children,
}: {
  title?: string;
  badge?: string;
  rows: { label: string; value: ReactNode; mono?: boolean }[];
  children?: ReactNode;
}) {
  return (
    <div className="relative rounded-lg border border-slate-700 bg-slate-800/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {badge && <KaizenBadge message={badge} />}
      </div>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">{r.label}</dt>
            <dd
              className={[
                "mt-0.5 text-sm text-slate-100",
                r.mono && "font-mono text-sky-300",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      {children}
    </div>
  );
}
