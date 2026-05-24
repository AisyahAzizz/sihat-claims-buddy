import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { eventBus, SystemEventPayload } from "@/lib/eventBus";

export type ActivityItem = {
  id: number;
  ts: number;
  source: "Clinic" | "Hospital" | "System" | "KAIZEN";
  level: "info" | "success" | "warning";
  message: string;
  refCode?: string;
  eventName: string;
};

type Ctx = {
  activity: ActivityItem[];
  clear: () => void;
};

const ActivityContext = createContext<Ctx | null>(null);

const FRIENDLY: Record<string, { source: ActivityItem["source"]; level: ActivityItem["level"]; msg: string }> = {
  "claim.submitted": { source: "Clinic", level: "info", msg: "Clinic claim submitted to insurer" },
  "claim.auto.approved": { source: "Clinic", level: "success", msg: "Clinic claim auto-approved" },
  "claim.rejected": { source: "System", level: "warning", msg: "Claim rejected" },
  "gl.requested": { source: "Hospital", level: "info", msg: "GL request submitted" },
  "gl.ai.reviewing": { source: "KAIZEN", level: "info", msg: "AI reviewing GL request" },
  "gl.approved": { source: "Hospital", level: "success", msg: "GL approved by TPA" },
  "discharge.queued": { source: "Hospital", level: "info", msg: "Discharge queued" },
  "inventory.push": { source: "System", level: "info", msg: "Inventory updated" },
  "ops.notify": { source: "System", level: "info", msg: "Ward ops notified" },
  "billing.update": { source: "System", level: "success", msg: "Billing ledger updated" },
  "tpa.sync": { source: "KAIZEN", level: "info", msg: "Syncing with HealthMetrics TPA" },
};

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<ActivityItem[]>([
    {
      id: Date.now(),
      ts: Date.now(),
      source: "System",
      level: "info",
      message: "SihatSatu operating system online",
      eventName: "system.boot",
    },
  ]);

  useEffect(() => {
    const off = eventBus.subscribe("*", (payload: SystemEventPayload & { _name?: string }) => {
      const name = payload._name || "system.event";
      const meta = FRIENDLY[name] || { source: "System" as const, level: "info" as const, msg: name };
      setActivity((prev) =>
        [
          {
            id: Date.now() + Math.random(),
            ts: Date.now(),
            source: (payload.source as ActivityItem["source"]) || meta.source,
            level: (payload.level as ActivityItem["level"]) || meta.level,
            message: (payload.message as string) || meta.msg,
            refCode: payload.refCode as string | undefined,
            eventName: name,
          },
          ...prev,
        ].slice(0, 50),
      );
    });
    return () => {
      off?.();
    };
  }, []);

  return (
    <ActivityContext.Provider value={{ activity, clear: () => setActivity([]) }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be inside ActivityProvider");
  return ctx;
}
