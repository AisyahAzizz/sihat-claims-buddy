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
                done && "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40",
                active && "bg-sky-500/15 text-sky-300 ring-sky-500/50",
                !done && !active && "bg-slate-800 text-slate-500 ring-slate-700",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : idx}
            </div>
            <span
              className={[
                "text-xs font-medium whitespace-nowrap",
                done && "text-emerald-300",
                active && "text-sky-300",
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
                  done ? "bg-emerald-500/40" : "bg-slate-700",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
