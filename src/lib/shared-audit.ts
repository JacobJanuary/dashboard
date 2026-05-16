import type { AdminRole, AuditLogEntry } from "./admin-types";

const SHARED_AUDIT_KEY = "sparkirl_shared_audit_v3";

export type SharedAuditInput = {
  actor: string;
  actorRole: AdminRole;
  action: string;
  entity: string;
  reasonCode?: string;
};

export function makeSharedAuditEntry(input: SharedAuditInput): AuditLogEntry {
  return {
    id: `shared_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    actor: input.actor,
    actorRole: input.actorRole,
    action: input.action,
    entity: input.entity,
    reasonCode: input.reasonCode,
    createdAt: "Только что",
  };
}

export function readSharedAuditEntries(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHARED_AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendSharedAuditEntry(input: SharedAuditInput) {
  if (typeof window === "undefined") return;
  const next = makeSharedAuditEntry(input);
  const entries = [next, ...readSharedAuditEntries()].slice(0, 100);
  window.localStorage.setItem(SHARED_AUDIT_KEY, JSON.stringify(entries));
}
