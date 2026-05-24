import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { useClaims } from "@/context/ClaimsContext";
import { eventBus } from "@/lib/eventBus";

export function TopBar() {
  const { demoMode, setDemoMode } = useClaims();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const off = eventBus.subscribe("tpa.sync", () => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1800);
    });
    return () => {
      off?.();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/70 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500/15 ring-1 ring-sky-500/40">
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 group-hover:text-white">
              SihatSatu
              {demoMode && (
                <span className="rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                  Demo
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">Claims &amp; GL Agent</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LiveBadge label="AIA" tone="emerald" state="Live" />
          <LiveBadge
            label="HealthMetrics"
            tone={syncing ? "amber" : "emerald"}
            state={syncing ? "Syncing" : "Live"}
          />
          <LiveBadge label="KAIZEN Engine" tone="sky" state="Active" />

          <label className="ml-2 flex cursor-pointer items-center gap-2 rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800">
            <span>Demo</span>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="h-3 w-3 accent-sky-500"
            />
          </label>
        </div>
      </div>
    </header>
  );
}

const TONE: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  sky: {
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    text: "text-sky-300",
    dot: "bg-sky-400",
  },
};

function LiveBadge({ label, tone, state }: { label: string; tone: "emerald" | "amber" | "sky"; state: string }) {
  const t = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${t.border} ${t.bg} px-2.5 py-1 text-[11px] font-medium ${t.text}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${t.dot} opacity-75`} />
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${t.dot}`} />
      </span>
      {label} <span className="opacity-70">·</span> {state}
    </span>
  );
}
