import type { ReactNode } from "react";
import { useClaims, ToastLevel, ToastSource } from "@/context/ClaimsContext";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const LEVEL_STYLE: Record<ToastLevel, { border: string; icon: ReactNode }> = {
  success: {
    border: "border-emerald-300",
    icon: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />,
  },
  warning: {
    border: "border-amber-300",
    icon: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />,
  },
  info: {
    border: "border-sky-300",
    icon: <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />,
  },
};

const SOURCE_COLOR: Record<ToastSource, string> = {
  Clinic: "text-sky-700",
  Hospital: "text-violet-700",
  System: "text-slate-700",
  Government: "text-red-700",
  Patient: "text-emerald-700",
  Provider: "text-sky-700",
};

export function ToastHost() {
  const { toasts } = useClaims();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const style = LEVEL_STYLE[t.level];
        return (
          <div
            key={t.id}
            className={`fade-in-up flex items-start gap-2 rounded-lg border ${style.border} bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-xl shadow-slate-900/10 backdrop-blur`}
          >
            {style.icon}
            <div className="min-w-0 flex-1">
              <div className={`text-[10px] font-semibold uppercase tracking-wide ${SOURCE_COLOR[t.source]}`}>
                {t.source} →
              </div>
              <div className="leading-snug">{t.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
