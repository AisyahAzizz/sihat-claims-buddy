import { useClaims } from "@/context/ClaimsContext";
import { CheckCircle2 } from "lucide-react";

export function ToastHost() {
  const { toasts } = useClaims();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="fade-in-up flex items-start gap-2 rounded-lg border border-sky-500/40 bg-slate-800/95 px-4 py-3 text-sm text-slate-100 shadow-xl shadow-black/40 backdrop-blur"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
