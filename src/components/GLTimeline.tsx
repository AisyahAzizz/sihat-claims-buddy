import { Check, Loader2, Circle } from "lucide-react";

export type TimelineEvent = {
  status: "done" | "loading" | "pending";
  label: string;
  time?: string;
  note?: string;
};

export function GLTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-4 border-l border-slate-700 pl-6">
      {events.map((e, i) => (
        <li key={i} className="fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
          <span className="absolute -left-[9px] mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900">
            {e.status === "done" && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400">
                <Check className="h-2.5 w-2.5 text-emerald-300" />
              </span>
            )}
            {e.status === "loading" && (
              <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
            )}
            {e.status === "pending" && (
              <Circle className="h-3.5 w-3.5 text-slate-600" />
            )}
          </span>
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm text-slate-100">{e.label}</div>
            {e.time && <div className="font-mono text-xs text-slate-500">{e.time}</div>}
          </div>
          {e.note && <div className="mt-0.5 text-xs text-slate-400">{e.note}</div>}
        </li>
      ))}
    </ol>
  );
}
