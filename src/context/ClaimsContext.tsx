import { createContext, useContext, useState, ReactNode } from "react";

type ClaimsState = {
  clinicStep: number;
  setClinicStep: (n: number) => void;
  hospitalStep: number;
  setHospitalStep: (n: number) => void;
  toasts: { id: number; message: string }[];
  showToast: (message: string) => void;
};

const ClaimsContext = createContext<ClaimsState | null>(null);

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [clinicStep, setClinicStep] = useState(1);
  const [hospitalStep, setHospitalStep] = useState(1);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  const showToast = (message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  };

  return (
    <ClaimsContext.Provider
      value={{ clinicStep, setClinicStep, hospitalStep, setHospitalStep, toasts, showToast }}
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
