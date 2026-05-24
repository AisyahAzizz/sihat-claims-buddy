import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useClaims } from "@/context/ClaimsContext";
import { rejectedClaim, appealLetter } from "@/data/mockData";
import { Loader2, FileWarning, Sparkles } from "lucide-react";

export const Route = createFileRoute("/appeal")({
  component: Appeal,
  head: () => ({ meta: [{ title: "Claims Defense — SihatSatu" }] }),
});

function Appeal() {
  const { showToast } = useClaims();
  const [stage, setStage] = useState<"idle" | "loading" | "typing" | "done">("idle");
  const [typed, setTyped] = useState("");
  const idxRef = useRef(0);

  useEffect(() => {
    if (stage !== "typing") return;
    idxRef.current = 0;
    setTyped("");
    const id = setInterval(() => {
      idxRef.current += 1;
      if (idxRef.current >= appealLetter.length) {
        setTyped(appealLetter);
        clearInterval(id);
        setStage("done");
      } else {
        setTyped(appealLetter.slice(0, idxRef.current));
      }
    }, 12);
    return () => clearInterval(id);
  }, [stage]);

  const handleGenerate = () => {
    setStage("loading");
    setTimeout(() => setStage("typing"), 800);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/15 ring-1 ring-red-500/40">
            <FileWarning className="h-5 w-5 text-red-300" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-200">Rejected claim</div>
            <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 text-sm">
              <Row label="Claim ref" value={<span className="font-mono text-sky-300">{rejectedClaim.ref}</span>} />
              <Row label="Patient" value={rejectedClaim.patient} />
              <Row label="Amount" value={<span className="font-mono">RM {rejectedClaim.amount.toFixed(2)}</span>} />
              <Row label="Rejected by" value={rejectedClaim.rejectedBy} />
              <div className="sm:col-span-2">
                <dt className="text-[11px] uppercase tracking-wide text-slate-500">Rejection reason</dt>
                <dd className="mt-0.5 text-sm text-red-200">{rejectedClaim.reason}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {stage === "idle" && (
        <button
          onClick={handleGenerate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 py-3.5 text-base font-medium text-white hover:bg-sky-400"
        >
          <Sparkles className="h-5 w-5" />
          Generate Appeal Letter
        </button>
      )}

      {stage === "loading" && (
        <button
          disabled
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500/70 px-6 py-3.5 text-base font-medium text-white"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          Claims Defense Agent drafting…
        </button>
      )}

      {(stage === "typing" || stage === "done") && (
        <div className="rounded-lg border border-amber-400/30 bg-slate-900/60 p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Drafted by Claims Defense Agent
          </div>
          <pre
            className={[
              "whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-100",
              stage === "typing" && "tw-caret",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {typed}
          </pre>
        </div>
      )}

      {stage === "done" && (
        <div className="fade-in-up flex flex-wrap gap-3">
          <button
            onClick={() => showToast("Appeal submitted to AIA. Expected response: 3–5 business days.")}
            className="rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
          >
            Resubmit Appeal to AIA
          </button>
          <button
            onClick={() =>
              showToast(
                "Logging rejection pattern: AIA · GST omission · Klinik Prima. KAIZEN will flag this pre-submission in future.",
              )
            }
            className="rounded-md border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Learn Panel Patterns
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-100">{value}</dd>
    </div>
  );
}
