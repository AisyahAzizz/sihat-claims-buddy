import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { StepBar } from "@/components/StepBar";
import { PatientCard } from "@/components/PatientCard";
import { ScanProgress } from "@/components/ScanProgress";
import { CheckList } from "@/components/CheckList";
import { ClaimBreakdown } from "@/components/ClaimBreakdown";
import { GLTimeline, TimelineEvent } from "@/components/GLTimeline";
import { DocumentDropzone, type DocFile } from "@/components/DocumentDropzone";
import { useClaims } from "@/context/ClaimsContext";
import { rahman, hospitalCase } from "@/data/mockData";
import { eventBus } from "@/lib/eventBus";
import { notifyOps, pushToInventory, updateBilling } from "@/lib/integrations";
import { submitClaim, decideClaim } from "@/lib/claimsApi";
import { AlertTriangle, ArrowRight, CheckCircle2, ArrowRightCircle, Loader2 } from "lucide-react";

// Per-session unique ref so re-submits don't collide on the unique index
function makeHospitalRef() {
  return `GL-SSATU-${Date.now().toString().slice(-8)}-HOS`;
}


export const Route = createFileRoute("/hospital")({
  component: HospitalWizard,
  head: () => ({ meta: [{ title: "Hospital GL — SihatSatu" }] }),
});

const STEPS = ["Admission", "GL Request", "AI Review", "GL Status", "Ward & Claim"];

// Holds the ref_code for the current hospital session so Step4 can approve the row Step2 created
let currentHospitalRef: string | null = null;

function HospitalWizard() {
  const { hospitalStep, setHospitalStep } = useClaims();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <StepBar steps={STEPS} current={hospitalStep} />
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Traditional GL approval: 30 min – 6 hours. <strong>KAIZEN target: under 8 minutes.</strong>
        </span>
      </div>

      {hospitalStep === 1 && <Step1 onNext={() => setHospitalStep(2)} />}
      {hospitalStep === 2 && <Step2 onNext={() => setHospitalStep(3)} onBack={() => setHospitalStep(1)} />}
      {hospitalStep === 3 && <Step3 onNext={() => setHospitalStep(4)} onBack={() => setHospitalStep(2)} />}
      {hospitalStep === 4 && <Step4 onNext={() => setHospitalStep(5)} />}
      {hospitalStep === 5 && <Step5 onReset={() => setHospitalStep(1)} />}
    </div>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  const [urgency, setUrgency] = useState<"emergency" | "semi" | "planned">("semi");
  return (
    <div className="space-y-6">
      <PatientCard
        title="Admission"
        badge="⬡ Record pulled from 4 providers"
        rows={[
          { label: "Patient", value: rahman.name },
          { label: "IC", value: rahman.myKad, mono: true },
          { label: "Hospital", value: hospitalCase.hospital },
          { label: "Admitting doctor", value: `${hospitalCase.doctor} — ${hospitalCase.specialty} — ${hospitalCase.mmc}` },
          { label: "Primary diagnosis", value: `${hospitalCase.icd10} — ${hospitalCase.icd10Desc}`, mono: true },
          { label: "Proposed procedures", value: hospitalCase.procedures.join(", ") },
          { label: "Estimated stay", value: hospitalCase.estStay },
        ]}
      />

      <div>
        <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">Urgency</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <UrgencyCard
            id="emergency"
            label="Emergency"
            desc="Stabilise first, GL later"
            icon="🔴"
            selected={urgency === "emergency"}
            onClick={() => setUrgency("emergency")}
          />
          <UrgencyCard
            id="semi"
            label="Semi-urgent"
            desc="GL needed before ward"
            icon="🟡"
            selected={urgency === "semi"}
            onClick={() => setUrgency("semi")}
          />
          <UrgencyCard
            id="planned"
            label="Planned"
            desc="Elective admission"
            icon="🔵"
            selected={urgency === "planned"}
            onClick={() => setUrgency("planned")}
          />
        </div>
        {urgency === "semi" && (
          <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Semi-urgent: hospital will not admit without GL. KAIZEN will draft and submit within 2 minutes.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
        >
          Draft GL Request <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function UrgencyCard({
  label,
  desc,
  icon,
  selected,
  onClick,
}: {
  id: string;
  label: string;
  desc: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex flex-col items-start rounded-lg border p-4 text-left transition",
        selected
          ? "border-sky-400 bg-sky-50 ring-1 ring-sky-300"
          : "border-slate-200 bg-white hover:bg-slate-100",
      ].join(" ")}
    >
      <span className="text-xl">{icon}</span>
      <span className="mt-2 text-sm font-medium text-slate-900">{label}</span>
      <span className="mt-0.5 text-xs text-slate-600">{desc}</span>
    </button>
  );
}

function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [just, setJust] = useState(hospitalCase.justification);
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Guarantee Letter — Pre-filled by KAIZEN</h3>
          <span className="font-mono text-xs text-sky-700">{hospitalCase.glRef}</span>
        </div>
        <p className="text-xs text-sky-700">
          8 insurer questions answered automatically. No manual paperwork.
        </p>

        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <Field label="Insurer / TPA" value={<span>AIA Bhd <span className="text-slate-500">→</span> HealthMetrics TPA</span>} />
          <Field label="Estimated cost" value={<span className="font-mono">{hospitalCase.estCost}</span>} />
          <Field label="Room type" value={hospitalCase.roomType} />
          <Field label="Attending specialist" value={`${hospitalCase.doctor} · ${hospitalCase.mmc}`} mono />
          <Field
            label="Policy status"
            value={<span className="text-emerald-700">✓ Active · No waiting period · Cardiac covered</span>}
          />
          <Field
            label="Pre-existing flag"
            value={<span className="text-amber-700">⚠ T2DM listed as pre-existing · cardiac benefit not excluded</span>}
          />
        </dl>

        <div className="mt-5">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Clinical justification</div>
          <textarea
            value={just}
            onChange={(e) => setJust(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        KAIZEN pre-answered all 8 standard insurer checks before submission. In the traditional process,
        each unanswered question adds 20–40 minutes of back-and-forth.
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Back
        </button>
        <button
          onClick={() => {
            eventBus.emit("gl.requested", {
              source: "Hospital",
              level: "info",
              message: "GL request submitted to AIA / HealthMetrics",
              refCode: hospitalCase.glRef,
            });
            onNext();
          }}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
        >
          Submit GL to AIA / HealthMetrics <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={["mt-0.5 text-sm text-slate-900", mono && "font-mono"].filter(Boolean).join(" ")}>
        {value}
      </dd>
    </div>
  );
}

const MICRO_STATUS = [
  { label: "Queued in HealthMetrics TPA…", event: "tpa.sync" as const, source: "KAIZEN" as const },
  { label: "Assigned to medical officer #A17", event: "gl.ai.reviewing" as const, source: "Hospital" as const },
  { label: "Cross-checking policy coverage and medical necessity…", event: "gl.ai.reviewing" as const, source: "KAIZEN" as const },
];

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { showToast, demoMode } = useClaims();
  const [docs, setDocs] = useState<DocFile[] | null>(null);
  const [started, setStarted] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [microIdx, setMicroIdx] = useState(-1);
  const [showQA, setShowQA] = useState(false);

  const currentDocs = docs ?? (hospitalCase.documents as DocFile[]);
  const canStart = currentDocs.length > 0;

  // Run micro-status sequence after scan completes
  useEffect(() => {
    if (!scanned) return;
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < MICRO_STATUS.length; i++) {
        if (cancelled) return;
        setMicroIdx(i);
        const s = MICRO_STATUS[i];
        eventBus.emit(s.event, { source: s.source, level: "info", message: s.label });
        const delay = demoMode ? 500 : 1500 + Math.random() * 1500;
        await new Promise((r) => setTimeout(r, delay));
      }
      if (!cancelled) setShowQA(true);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [scanned, demoMode]);

  return (
    <div className="space-y-6">
      <div className="card-glow rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Supporting documents</h3>
        <DocumentDropzone
          seed={hospitalCase.documents as DocFile[]}
          files={docs}
          onChange={setDocs}
          onToast={showToast}
        />
      </div>

      {!started && (
        <button
          onClick={() => setStarted(true)}
          disabled={!canStart}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check Documents
        </button>
      )}

      {started && !scanned && (
        <ScanProgress
          labels={hospitalCase.scanLabels}
          intervalMs={demoMode ? 160 : 320}
          onComplete={() => setScanned(true)}
        />
      )}

      {scanned && (
        <>
          <CheckList items={hospitalCase.checks} />
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <span className="font-medium text-emerald-700">7 passed</span> ·{" "}
            <span className="font-medium text-amber-700">1 advisory</span> ·{" "}
            <span className="font-medium text-slate-900">GL likely to be approved</span>
          </div>

          {microIdx >= 0 && !showQA && (
            <div className="space-y-2">
              {MICRO_STATUS.slice(0, microIdx + 1).map((s, i) => (
                <div
                  key={i}
                  className="fade-in-up flex items-center gap-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800"
                >
                  {i === microIdx ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {showQA && (
            <div className="fade-in-up rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h4 className="mb-3 text-sm font-semibold text-amber-800">
                Insurer questions — auto-answered by KAIZEN
              </h4>
              <div className="space-y-4">
                {hospitalCase.qa.map((qa, i) => (
                  <div key={i} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-medium text-amber-700">Q: {qa.q}</div>
                    <div className="mt-1 text-sm text-slate-900">A: {qa.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}


      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Back
        </button>
        {scanned && (
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
          >
            Continue to GL Status <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Step4({ onNext }: { onNext: () => void }) {
  const { demoMode } = useClaims();
  const [reviewDone, setReviewDone] = useState(false);
  const [issued, setIssued] = useState(false);
  const autoRan = useRef(false);

  // Auto-trigger realistic delay on mount
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    const reviewDelay = demoMode ? 800 : 2000 + Math.random() * 2000;
    const t1 = setTimeout(() => {
      setReviewDone(true);
      eventBus.emit("gl.ai.reviewing", {
        source: "Hospital",
        level: "info",
        message: "Medical officer #A17 approved GL",
        refCode: hospitalCase.glRef,
      });
    }, reviewDelay);
    const t2 = setTimeout(() => {
      setIssued(true);
      eventBus.emit("gl.approved", {
        source: "Hospital",
        level: "success",
        message: `GL approved · RM ${hospitalCase.glDetails.approvedAmount.toLocaleString()}`,
        refCode: hospitalCase.glRef,
        amount: hospitalCase.glDetails.approvedAmount,
      });
    }, reviewDelay + (demoMode ? 600 : 1500));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [demoMode]);

  const events: TimelineEvent[] = [
    { status: "done", label: "GL drafted by KAIZEN", time: "14:31:02", note: "8 checks pre-answered" },
    { status: "done", label: "Submitted to AIA / HealthMetrics", time: "14:31:05" },
    { status: "done", label: "TPA received and auto-triaged", time: "14:31:09", note: "High-priority queue" },
    reviewDone
      ? { status: "done", label: "Medical officer approved", time: "14:37:14" }
      : { status: "loading", label: "Medical officer reviewing…" },
    issued
      ? { status: "done", label: "GL issued", time: "14:37:16" }
      : { status: "pending", label: "GL decision" },
  ];

  return (
    <div className="space-y-6">
      <GLTimeline events={events} />

      {!issued ? (
        <div className="card-glow rounded-lg border border-sky-300 bg-sky-50 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-sky-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            Awaiting HealthMetrics response…
          </div>
          <div className="mt-1 text-xs text-sky-700">
            Traditional wait: 2–6 hours · KAIZEN target: under 8 minutes
          </div>
        </div>
      ) : (
        <div className="fade-in-up rounded-xl border border-emerald-300 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-700" />
            <div className="flex-1">
              <div className="text-xl font-semibold text-emerald-800">GL Approved</div>
              <div className="mt-1 text-sm text-emerald-700">
                HealthMetrics TPA · AIA Smart MedCare Plus
              </div>
              <div className="mt-3 inline-block rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
                Total wait: <span className="font-mono">6 min 14 sec</span> vs traditional average{" "}
                <span className="font-mono">3.2 hrs</span>
              </div>
              <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <Field label="GL Number" value={<span className="font-mono text-sky-700">{hospitalCase.glDetails.glNumber}</span>} />
                <Field label="Approved amount" value={<span className="font-mono">RM {hospitalCase.glDetails.approvedAmount.toLocaleString()}</span>} />
                <Field label="Room" value={hospitalCase.glDetails.room} />
                <Field label="Valid until" value={hospitalCase.glDetails.validUntil} />
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-emerald-700">
                <strong>Conditions:</strong> {hospitalCase.glDetails.conditions}
              </p>
            </div>
          </div>
        </div>
      )}

      {issued && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
          >
            Proceed to Ward &amp; Claim <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Step5({ onReset }: { onReset: () => void }) {
  const { showToast } = useClaims();
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        GL secured. {rahman.name} admitted to Ward 4B, Sunway Medical Centre.
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
          Projected claim breakdown (post-discharge)
        </div>
        <ClaimBreakdown items={hospitalCase.claimBreakdown} total={hospitalCase.claimTotal} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-semibold text-slate-900">What KAIZEN solved</h4>
        <ul className="space-y-2 text-sm text-slate-800">
          {[
            "GL pre-filled from patient record — no manual paperwork",
            "8 insurer questions answered before submission",
            "Medical necessity justified with lab values and ECG findings",
            "After-hours coverage — AI handles initial review 24/7",
            "Claim will auto-file on discharge — zero staff intervention",
          ].map((it) => (
            <li key={it} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => {
            notifyOps({ ward: "4B", patient: rahman.name });
            pushToInventory({ ref: hospitalCase.glRef });
            updateBilling({ ref: hospitalCase.glRef, amount: hospitalCase.claimTotal });
            eventBus.emit("discharge.queued", {
              source: "Hospital",
              level: "success",
              message: "Discharge claim queued · auto-submitting to AIA",
              refCode: hospitalCase.glRef,
              amount: hospitalCase.claimTotal,
            });
            showToast("Discharge claim queued · auto-submitting to AIA", {
              level: "success",
              source: "Hospital",
            });
          }}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          Auto-file Discharge Claim
        </button>
        <Link
          to="/appeal"
          onClick={() => onReset()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-800 hover:bg-slate-100"
        >
          Claims Defense Readiness <ArrowRightCircle className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
