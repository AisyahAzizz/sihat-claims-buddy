import { createContext, useContext, useState, ReactNode } from "react";

export type ToastLevel = "success" | "warning" | "info";
export type ToastSource = "Clinic" | "Hospital" | "System";

export type ToastItem = {
  id: number;
  message: string;
  level: ToastLevel;
  source: ToastSource;
};

type ClaimsState = {
  clinicStep: number;
  setClinicStep: (n: number) => void;
  hospitalStep: number;
  setHospitalStep: (n: number) => void;
  toasts: ToastItem[];
  showToast: (message: string, opts?: { level?: ToastLevel; source?: ToastSource }) => void;
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
};

const ClaimsContext = createContext<ClaimsState | null>(null);

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [clinicStep, setClinicStep] = useState(1);
  const [hospitalStep, setHospitalStep] = useState(1);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [demoMode, setDemoMode] = useState(false);

  const showToast: ClaimsState["showToast"] = (message, opts) => {
    const id = Date.now() + Math.random();
    const t: ToastItem = {
      id,
      message,
      level: opts?.level ?? "info",
      source: opts?.source ?? "System",
    };
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  };

  return (
    <ClaimsContext.Provider
      value={{
        clinicStep,
        setClinicStep,
        hospitalStep,
        setHospitalStep,
        toasts,
        showToast,
        demoMode,
        setDemoMode,
      }}
    >
      {children}
    </ClaimsContext.Provider>
  );
}

export function useClaims() {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be inside ClaimsProvider");
  return ctx;
}
