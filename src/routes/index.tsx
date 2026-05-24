import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope, Building2, ArrowRight, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: ModeSelector,
  head: () => ({
    meta: [
      { title: "SihatSatu — Choose claim type" },
      {
        name: "description",
        content: "Outpatient clinic claims or hospital guarantee letters, automated for Malaysian healthcare.",
      },
    ],
  }),
});

function ModeSelector() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs text-slate-400">
          <Zap className="h-3 w-3 text-sky-400" />
          Claims &amp; Guarantee Letter Agent
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-100">
          What kind of claim is this?
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Pick the right flow. KAIZEN already pulled the patient record.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ModeCard
          to="/clinic"
          icon={<Stethoscope className="h-6 w-6 text-sky-400" />}
          title="Clinic / Outpatient"
          desc="Simple medication claims. Scan documents, auto-submit to insurer, track approval."
          badge="Avg approval: 44 seconds"
          cta="Start Clinic Claim"
        />
        <ModeCard
          to="/hospital"
          icon={<Building2 className="h-6 w-6 text-sky-300" />}
          title="Hospital / Warded"
          desc="Guarantee Letter flow. AI pre-fills all insurer requirements before submission."
          badge="Avg GL wait: 6 min (was 3.2 hrs)"
          cta="Start GL Request"
          highlight
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="text-slate-400">Connected:</span>
        {["AIA", "HealthMetrics TPA", "Great Eastern", "MediExpress", "PMCare"].map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function ModeCard({
  to,
  icon,
  title,
  desc,
  badge,
  cta,
  highlight,
}: {
  to: "/clinic" | "/hospital";
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge: string;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "group relative flex flex-col rounded-xl border bg-slate-800/40 p-6 transition hover:bg-slate-800/70",
        highlight ? "border-sky-500/60 ring-1 ring-sky-500/30" : "border-slate-700",
      ].join(" ")}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900/60 ring-1 ring-slate-700">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
      <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
        {badge}
      </div>
      <Link
        to={to}
        className={[
          "mt-6 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition",
          highlight
            ? "bg-sky-500 text-white hover:bg-sky-400"
            : "bg-slate-700 text-slate-100 hover:bg-slate-600",
        ].join(" ")}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
