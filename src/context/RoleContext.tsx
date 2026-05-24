import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Role = "provider" | "government" | "patient";

type Ctx = {
  currentRole: Role;
  setRole: (r: Role) => void;
};

const RoleContext = createContext<Ctx>({
  currentRole: "provider",
  setRole: () => {},
});

const STORAGE_KEY = "sihatsatu.role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setRoleState] = useState<Role>("provider");

  // hydrate from localStorage on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (stored === "provider" || stored === "government" || stored === "patient") {
      setRoleState(stored);
    }
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, r);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
