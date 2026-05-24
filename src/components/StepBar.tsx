import { Check } from "lucide-react";

export function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1",
                done && "bg-emerald-100 text-emerald-700 ring-emerald-300",
                active && "bg-sky-100 text-sky-700 ring-sky-300",
                !done && !active && "bg-slate-100 text-slate-500 ring-slate-200",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : idx}
            </div>
            <span
              className={[
                "text-xs font-medium whitespace-nowrap",
                done && "text-emerald-700",
                active && "text-sky-700",
                !done && !active && "text-slate-500",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={[
                  "h-px flex-1 mx-1",
                  done ? "bg-emerald-500/40" : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
