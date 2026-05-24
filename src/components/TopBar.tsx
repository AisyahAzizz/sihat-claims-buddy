import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500/15 ring-1 ring-sky-500/40">
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-100 group-hover:text-white">
              SihatSatu
            </div>
            <div className="text-[11px] text-slate-400">Claims &amp; GL Agent</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LiveBadge label="AIA" />
          <LiveBadge label="HealthMetrics" />
        </div>
      </div>
    </header>
  );
}

function LiveBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      {label} <span className="text-emerald-400/70">●</span> Live
    </span>
  );
}
