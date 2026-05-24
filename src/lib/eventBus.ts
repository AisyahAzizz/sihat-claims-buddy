// Tiny pub/sub event bus — no deps
export type SystemEventName =
  | "claim.submitted"
  | "claim.auto.approved"
  | "claim.rejected"
  | "gl.requested"
  | "gl.ai.reviewing"
  | "gl.approved"
  | "discharge.queued"
  | "inventory.push"
  | "ops.notify"
  | "billing.update"
  | "tpa.sync";

export type SystemEventPayload = {
  source?: "Clinic" | "Hospital" | "System" | "KAIZEN";
  message?: string;
  refCode?: string;
  amount?: number;
  level?: "info" | "success" | "warning";
  [k: string]: unknown;
};

type Handler = (payload: SystemEventPayload) => void;

const listeners = new Map<string, Set<Handler>>();

export const eventBus = {
  emit(name: SystemEventName, payload: SystemEventPayload = {}) {
    // eslint-disable-next-line no-console
    console.log(`[event] ${name}`, payload);
    listeners.get(name)?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error(e);
      }
    });
    listeners.get("*")?.forEach((fn) => fn({ ...payload, _name: name }));
  },
  subscribe(name: SystemEventName | "*", fn: Handler) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name)!.add(fn);
    return () => listeners.get(name)?.delete(fn);
  },
};
