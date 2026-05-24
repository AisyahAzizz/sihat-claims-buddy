import { useState } from "react";
import { useActivity, ActivityItem } from "@/context/ActivityContext";
import { Activity, ChevronDown, ChevronUp, CheckCircle2, Info, AlertTriangle } from "lucide-react";

function fmtTime(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

const SOURCE_COLOR: Record<ActivityItem["source"], string> = {
  Clinic: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Hospital: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  System: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  KAIZEN: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

function LevelIcon({ level }: { level: ActivityItem["level"] }) {
  if (level === "success") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
  if (level === "warning") return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
  return <Info className="h-3.5 w-3.5 text-sky-400" />;
}

export function ActivityFeed() {
  const { activity } = useActivity();
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[min(360px,calc(100vw-2rem))]">
      <div className="rounded-lg border border-slate-700 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 border-b border-slate-700 px-3 py-2 text-left"
        >
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
            </span>
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            System Activity
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              {activity.length}
            </span>
          </span>
          {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
        </button>
        {open && (
          <div className="max-h-72 overflow-y-auto px-2 py-2">
            {activity.length === 0 ? (
              <div className="px-2 py-4 text-center text-xs text-slate-500">No activity yet</div>
            ) : (
              <ul className="space-y-1">
                {activity.map((a) => (
                  <li
                    key={a.id}
                    className="fade-in-up flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-800/60"
                  >
                    <LevelIcon level={a.level} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${SOURCE_COLOR[a.source]}`}
                        >
                          {a.source}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{fmtTime(a.ts)}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-200">{a.message}</div>
                      {a.refCode && (
                        <div className="font-mono text-[10px] text-sky-300">{a.refCode}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
