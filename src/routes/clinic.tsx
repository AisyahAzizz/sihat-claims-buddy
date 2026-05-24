import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StepBar } from "@/components/StepBar";
import { PatientCard } from "@/components/PatientCard";
import { ScanProgress } from "@/components/ScanProgress";
import { CheckList } from "@/components/CheckList";
import { ClaimBreakdown } from "@/components/ClaimBreakdown";
import { GLTimeline, TimelineEvent } from "@/components/GLTimeline";
import { CodeBlock } from "@/components/CodeBlock";
import { DocumentDropzone, type DocFile } from "@/components/DocumentDropzone";
import { useClaims } from "@/context/ClaimsContext";
import { rahman, clinicClaim } from "@/data/mockData";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";


export const Route = createFileRoute("/clinic")({
  component: ClinicWizard,
  head: () => ({
    meta: [{ title: "Clinic Claim — SihatSatu" }],
  }),
});

const STEPS = ["Patient", "Documents", "Submit", "Status"];

function ClinicWizard() {
  const { clinicStep, setClinicStep } = useClaims();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <StepBar steps={STEPS} current={clinicStep} />
      {clinicStep === 1 && <Step1 onNext={() => setClinicStep(2)} />}
      {clinicStep === 2 && <Step2 onNext={() => setClinicStep(3)} onBack={() => setClinicStep(1)} />}
      {clinicStep === 3 && <Step3 onNext={() => setClinicStep(4)} onBack={() => setClinicStep(2)} />}
      {clinicStep === 4 && <Step4 onReset={() => setClinicStep(1)} />}
    </div>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <PatientCard
        title="Patient"
        badge="⬡ Received from KAIZEN"
        rows={[
          { label: "Full name", value: rahman.name },
          { label: "MyKad", value: rahman.myKad, mono: true },
          { label: "Visit date", value: clinicClaim.visitDate },
          { label: "Clinic", value: clinicClaim.clinic },
          { label: "ICD-10", value: `${clinicClaim.icd10} — ${clinicClaim.icd10Desc}`, mono: true },
          { label: "Medication", value: clinicClaim.medication },
          { label: "Dispensed at", value: clinicClaim.dispensedAt },
          { label: "Insurer", value: rahman.policyName },
          { label: "Policy no", value: rahman.policyNo, mono: true },
        ]}
      />
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { showToast } = useClaims();
  const [docs, setDocs] = useState<DocFile[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);

  const currentDocs = docs ?? (clinicClaim.documents as DocFile[]);
  const canScan = currentDocs.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-100">Uploaded documents</h3>
        <DocumentDropzone
          seed={clinicClaim.documents as DocFile[]}
          files={docs}
          onChange={setDocs}
          onToast={showToast}
        />
      </div>

      {!scanning && !done && (
        <button
          onClick={() => setScanning(true)}
          disabled={!canScan}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Scan Documents
        </button>
      )}


      {scanning && !done && (
        <ScanProgress
          labels={clinicClaim.scanLabels}
          intervalMs={280}
          onComplete={() => setDone(true)}
        />
      )}

      {done && (
        <>
          <CheckList items={clinicClaim.checks} />
          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm">
            <span className="text-slate-300">
              <span className="font-medium text-emerald-300">6 passed</span> ·{" "}
              <span className="font-medium text-amber-300">1 warning</span> ·{" "}
              <span className="font-medium text-slate-100">Submittable</span>
            </span>
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>
        {done && (
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
          >
            Continue to Submit <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="space-y-6">
      <ClaimBreakdown items={clinicClaim.breakdown} total={clinicClaim.total} />
      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">AIA eClaim payload</div>
        <CodeBlock code={JSON.stringify(clinicClaim.json, null, 2)} />
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>
        <button
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(onNext, 1500);
          }}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting to AIA…
            </>
          ) : (
            <>Auto-submit to AIA</>
          )}
        </button>
      </div>
    </div>
  );
}

function Step4({ onReset }: { onReset: () => void }) {
  const { showToast } = useClaims();
  const [stage, setStage] = useState(0); // 0,1,2,3,4
  const [verifyingDone, setVerifyingDone] = useState(false);
  const [adjudicatingDone, setAdjudicatingDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 1600);
    const t3 = setTimeout(() => setStage(3), 3100);
    const t4 = setTimeout(() => setVerifyingDone(true), 3100 + 2000);
    const t5 = setTimeout(() => setStage(4), 5200);
    const t6 = setTimeout(() => setAdjudicatingDone(true), 5200 + 3000);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  const events: TimelineEvent[] = [];
  if (stage >= 1) events.push({ status: "done", label: "Submitted to AIA", time: "14:32:00", note: "Auto by Claims Agent" });
  if (stage >= 2) events.push({ status: "done", label: "AIA gateway acknowledged", time: "14:32:08" });
  if (stage >= 3)
    events.push(
      verifyingDone
        ? { status: "done", label: "Documents verified", time: "14:32:11" }
        : { status: "loading", label: "Verifying documents…" },
    );
  if (stage >= 4)
    events.push(
      adjudicatingDone
        ? { status: "done", label: "Claim approved", time: "14:32:44" }
        : { status: "loading", label: "Adjudicating claim…" },
    );

  const complete = adjudicatingDone;

  return (
    <div className="space-y-6">
      <GLTimeline events={events} />
      {complete && (
        <div className="fade-in-up rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            <div>
              <div className="text-xl font-semibold text-emerald-200">
                Claim Approved — <span className="font-mono">RM 99.00</span>
              </div>
              <div className="mt-1 text-sm text-emerald-200/70">
                Payment to Klinik Sihat Subang Jaya within 3–5 business days
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/status"
              onClick={() => onReset()}
              className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
            >
              View All Claims
            </Link>
            <button
              onClick={() => showToast("Logged to KAIZEN shared memory")}
              className="rounded-md border border-sky-500/50 px-4 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/10"
            >
              Export to Patient Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
