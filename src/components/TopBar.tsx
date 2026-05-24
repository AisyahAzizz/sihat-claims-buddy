import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ChevronDown, Stethoscope, Landmark, User } from "lucide-react";
import { useClaims } from "@/context/ClaimsContext";
import { useRole, Role } from "@/context/RoleContext";
import { eventBus } from "@/lib/eventBus";

const ROLE_META: Record<Role, { label: string; icon: typeof Activity; tone: string }> = {
  provider: { label: "Provider", icon: Stethoscope, tone: "text-sky-700" },
  government: { label: "Government", icon: Landmark, tone: "text-red-700" },
  patient: { label: "Patient", icon: User, tone: "text-emerald-700" },
};

const ROLE_HOME: Record<Role, string> = {
  provider: "/",
  government: "/gov",
  patient: "/patient",
};

export function TopBar() {
  const { demoMode, setDemoMode } = useClaims();
  const { currentRole, setRole } = useRole();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const off = eventBus.subscribe("tpa.sync", () => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1800);
    });
    return () => {
      off?.();
    };
  }, []);

  const RoleIcon = ROLE_META[currentRole].icon;

  const pickRole = (r: Role) => {
    setRole(r);
    setOpen(false);
    navigate({ to: ROLE_HOME[r] });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 ring-1 ring-sky-300">
            <Activity className="h-4 w-4 text-sky-600" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              SihatSatu
              {demoMode && (
                <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                  Demo
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-600">National Health OS</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LiveBadge label="AIA" tone="emerald" state="Live" />
          <LiveBadge
            label="HealthMetrics"
            tone={syncing ? "amber" : "emerald"}
            state={syncing ? "Syncing" : "Live"}
          />
          <LiveBadge label="KAIZEN" tone="sky" state="Active" />

          {/* Role switcher */}
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
            >
              <RoleIcon className={`h-3.5 w-3.5 ${ROLE_META[currentRole].tone}`} />
              {ROLE_META[currentRole].label}
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 z-50 mt-1.5 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                  <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Switch portal
                  </div>
                  {(Object.keys(ROLE_META) as Role[]).map((r) => {
                    const Icon = ROLE_META[r].icon;
                    const active = r === currentRole;
                    return (
                      <button
                        key={r}
                        onClick={() => pickRole(r)}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-slate-50 ${
                          active ? "bg-slate-50" : ""
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${ROLE_META[r].tone}`} />
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{ROLE_META[r].label}</div>
                          <div className="text-[10px] text-slate-500">
                            {r === "provider" && "Clinic & hospital flows"}
                            {r === "government" && "MOH / TPA control center"}
                            {r === "patient" && "Personal claims view"}
                          </div>
                        </div>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100">
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
  emerald: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  amber: { border: "border-amber-300", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  sky: { border: "border-sky-200", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-400" },
};

function LiveBadge({ label, tone, state }: { label: string; tone: "emerald" | "amber" | "sky"; state: string }) {
  const t = TONE[tone];
  return (
    <span
      className={`hidden md:inline-flex items-center gap-1.5 rounded-md border ${t.border} ${t.bg} px-2.5 py-1 text-[11px] font-medium ${t.text}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${t.dot} opacity-75`} />
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${t.dot}`} />
      </span>
      {label} <span className="opacity-70">·</span> {state}
    </span>
  );
}
