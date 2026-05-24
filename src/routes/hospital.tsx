import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StepBar } from "@/components/StepBar";
import { PatientCard } from "@/components/PatientCard";
import { ScanProgress } from "@/components/ScanProgress";
import { CheckList } from "@/components/CheckList";
import { ClaimBreakdown } from "@/components/ClaimBreakdown";
import { GLTimeline, TimelineEvent } from "@/components/GLTimeline";
import { DocumentDropzone, type DocFile } from "@/components/DocumentDropzone";
import { useClaims } from "@/context/ClaimsContext";
import { rahman, hospitalCase } from "@/data/mockData";
import { AlertTriangle, ArrowRight, CheckCircle2, ArrowRightCircle } from "lucide-react";


export const Route = createFileRoute("/hospital")({
  component: HospitalWizard,
  head: () => ({ meta: [{ title: "Hospital GL — SihatSatu" }] }),
});

const STEPS = ["Admission", "GL Request", "AI Review", "GL Status", "Ward & Claim"];

function HospitalWizard() {
  const { hospitalStep, setHospitalStep } = useClaims();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <StepBar steps={STEPS} current={hospitalStep} />
      <div className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
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
          <div className="mt-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
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
          ? "border-sky-500/60 bg-sky-500/10 ring-1 ring-sky-500/40"
          : "border-slate-700 bg-slate-800/40 hover:bg-slate-800/70",
      ].join(" ")}
    >
      <span className="text-xl">{icon}</span>
      <span className="mt-2 text-sm font-medium text-slate-100">{label}</span>
      <span className="mt-0.5 text-xs text-slate-400">{desc}</span>
    </button>
  );
}

function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [just, setJust] = useState(hospitalCase.justification);
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-5">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">Guarantee Letter — Pre-filled by KAIZEN</h3>
          <span className="font-mono text-xs text-sky-300">{hospitalCase.glRef}</span>
        </div>
        <p className="text-xs text-sky-300">
          8 insurer questions answered automatically. No manual paperwork.
        </p>

        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <Field label="Insurer / TPA" value={<span>AIA Bhd <span className="text-slate-500">→</span> HealthMetrics TPA</span>} />
          <Field label="Estimated cost" value={<span className="font-mono">{hospitalCase.estCost}</span>} />
          <Field label="Room type" value={hospitalCase.roomType} />
          <Field label="Attending specialist" value={`${hospitalCase.doctor} · ${hospitalCase.mmc}`} mono />
          <Field
            label="Policy status"
            value={<span className="text-emerald-300">✓ Active · No waiting period · Cardiac covered</span>}
          />
          <Field
            label="Pre-existing flag"
            value={<span className="text-amber-300">⚠ T2DM listed as pre-existing · cardiac benefit not excluded</span>}
          />
        </dl>

        <div className="mt-5">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Clinical justification</div>
          <textarea
            value={just}
            onChange={(e) => setJust(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 p-3 text-sm leading-relaxed text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        KAIZEN pre-answered all 8 standard insurer checks before submission. In the traditional process,
        each unanswered question adds 20–40 minutes of back-and-forth.
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>
        <button
          onClick={onNext}
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
      <dd className={["mt-0.5 text-sm text-slate-100", mono && "font-mono"].filter(Boolean).join(" ")}>
        {value}
      </dd>
    </div>
  );
}

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { showToast } = useClaims();
  const [docs, setDocs] = useState<DocFile[] | null>(null);
  const [started, setStarted] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showQA, setShowQA] = useState(false);

  const currentDocs = docs ?? (hospitalCase.documents as DocFile[]);
  const canStart = currentDocs.length > 0;

  useEffect(() => {
    if (scanned) {
      const t = setTimeout(() => setShowQA(true), 500);
      return () => clearTimeout(t);
    }
  }, [scanned]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-100">Supporting documents</h3>
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
          Start AI Review
        </button>
      )}

      {started && !scanned && (
        <ScanProgress
          labels={hospitalCase.scanLabels}
          intervalMs={320}
          onComplete={() => setScanned(true)}
        />
      )}

      {scanned && (
        <>
          <CheckList items={hospitalCase.checks} />
          <div className="rounded-lg border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm text-slate-300">
            <span className="font-medium text-emerald-300">7 passed</span> ·{" "}
            <span className="font-medium text-amber-300">1 advisory</span> ·{" "}
            <span className="font-medium text-slate-100">GL likely to be approved</span>
          </div>

          {showQA && (
            <div className="fade-in-up rounded-lg border border-amber-400/30 bg-amber-400/5 p-5">
              <h4 className="mb-3 text-sm font-semibold text-amber-200">
                Insurer questions — auto-answered by KAIZEN
              </h4>
              <div className="space-y-4">
                {hospitalCase.qa.map((qa, i) => (
                  <div key={i} className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
                    <div className="text-xs font-medium text-amber-300">Q: {qa.q}</div>
                    <div className="mt-1 text-sm text-slate-100">A: {qa.a}</div>
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
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
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
  const [reviewDone, setReviewDone] = useState(false);
  const [issued, setIssued] = useState(false);

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

  const handleSimulate = () => {
    setReviewDone(true);
    setTimeout(() => setIssued(true), 1500);
  };

  return (
    <div className="space-y-6">
      <GLTimeline events={events} />

      {!issued ? (
        <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-5">
          <div className="text-sm font-medium text-sky-200">Awaiting HealthMetrics response…</div>
          <div className="mt-1 text-xs text-sky-300/80">
            Traditional wait: 2–6 hours · KAIZEN target: under 8 minutes
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleSimulate}
              className="rounded-md bg-sky-500 px-5 py-2 text-sm font-medium text-white hover:bg-sky-400"
            >
              Simulate GL approval (demo)
            </button>
          </div>
        </div>
      ) : (
        <div className="fade-in-up rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-300" />
            <div className="flex-1">
              <div className="text-xl font-semibold text-emerald-200">GL Approved</div>
              <div className="mt-1 text-sm text-emerald-200/70">
                HealthMetrics TPA · AIA Smart MedCare Plus
              </div>
              <div className="mt-3 inline-block rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                Total wait: <span className="font-mono">6 min 14 sec</span> vs traditional average{" "}
                <span className="font-mono">3.2 hrs</span>
              </div>
              <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <Field label="GL Number" value={<span className="font-mono text-sky-300">{hospitalCase.glDetails.glNumber}</span>} />
                <Field label="Approved amount" value={<span className="font-mono">RM {hospitalCase.glDetails.approvedAmount.toLocaleString()}</span>} />
                <Field label="Room" value={hospitalCase.glDetails.room} />
                <Field label="Valid until" value={hospitalCase.glDetails.validUntil} />
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-emerald-200/80">
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
      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        GL secured. {rahman.name} admitted to Ward 4B, Sunway Medical Centre.
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
          Projected claim breakdown (post-discharge)
        </div>
        <ClaimBreakdown items={hospitalCase.claimBreakdown} total={hospitalCase.claimTotal} />
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-5">
        <h4 className="mb-3 text-sm font-semibold text-slate-100">What KAIZEN solved</h4>
        <ul className="space-y-2 text-sm text-slate-200">
          {[
            "GL pre-filled from patient record — no manual paperwork",
            "8 insurer questions answered before submission",
            "Medical necessity justified with lab values and ECG findings",
            "After-hours coverage — AI handles initial review 24/7",
            "Claim will auto-file on discharge — zero staff intervention",
          ].map((it) => (
            <li key={it} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => showToast("Claim queued for discharge. Will auto-submit to AIA.")}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          Auto-file Discharge Claim
        </button>
        <Link
          to="/appeal"
          onClick={() => onReset()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Claims Defense Readiness <ArrowRightCircle className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
