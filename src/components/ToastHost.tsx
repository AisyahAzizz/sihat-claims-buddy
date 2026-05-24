import { useClaims, ToastLevel, ToastSource } from "@/context/ClaimsContext";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const LEVEL_STYLE: Record<ToastLevel, { border: string; icon: JSX.Element }> = {
  success: {
    border: "border-emerald-500/40",
    icon: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />,
  },
  warning: {
    border: "border-amber-500/40",
    icon: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />,
  },
  info: {
    border: "border-sky-500/40",
    icon: <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />,
  },
};

const SOURCE_COLOR: Record<ToastSource, string> = {
  Clinic: "text-sky-300",
  Hospital: "text-violet-300",
  System: "text-slate-300",
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
            className={`fade-in-up flex items-start gap-2 rounded-lg border ${style.border} bg-slate-800/95 px-4 py-3 text-sm text-slate-100 shadow-xl shadow-black/40 backdrop-blur`}
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
