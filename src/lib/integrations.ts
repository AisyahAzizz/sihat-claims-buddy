import { eventBus } from "./eventBus";

export function pushToInventory(payload: Record<string, unknown>) {
  console.log("[integration] inventory ←", payload);
  eventBus.emit("inventory.push", {
    source: "System",
    level: "info",
    message: "Inventory updated · consumables deducted",
    ...payload,
  });
}

export function notifyOps(payload: Record<string, unknown>) {
  console.log("[integration] ops ←", payload);
  eventBus.emit("ops.notify", {
    source: "System",
    level: "info",
    message: "Ward ops notified · discharge queued",
    ...payload,
  });
}

export function updateBilling(payload: Record<string, unknown>) {
  console.log("[integration] billing ←", payload);
  eventBus.emit("billing.update", {
    source: "System",
    level: "success",
    message: "Billing ledger updated",
    ...payload,
  });
}
