import type {
  AdminEvent,
  AdminRole,
  AdminScreenDefinition,
  ApprovalGateType,
  ApprovalStatus,
  EventPublicationStatus,
} from "./admin-types";

export type AdminAction =
  | "audit:write"
  | "event:create"
  | "event:operate_business_fields"
  | "approval:venue_gate"
  | "approval:platform_gate"
  | "venue:policy_edit"
  | "venue:approve_organizer"
  | "chat:participant_reply"
  | "chat:moderate_flagged"
  | "ai:configure"
  | "ai:moderate"
  | "promotion:manage_own"
  | "promotion:moderate"
  | "finance:read_own"
  | "finance:read_limited"
  | "finance:refund"
  | "moderation:decide"
  | "enforcement:write";

export type AdminResourceContext = {
  ownsEvent?: boolean;
  ownsVenue?: boolean;
  flagged?: boolean;
  fraudContext?: boolean;
  claimStatus?: ApprovalStatus;
};

const terminalPublicationStatuses = new Set<EventPublicationStatus>([
  "published",
  "paused",
  "cancelled",
  "completed",
  "archived",
]);

const sensitiveActions = new Set<AdminAction>([
  "approval:venue_gate",
  "approval:platform_gate",
  "chat:moderate_flagged",
  "ai:moderate",
  "promotion:moderate",
  "finance:refund",
  "moderation:decide",
  "enforcement:write",
]);

const destructiveDecisions = new Set([
  "Отклонить",
  "Заблокировать",
  "Скрыть",
  "Отменить",
  "Disable",
  "Remove",
  "Reject",
  "Block",
  "Cancel",
]);

export function canAccessRoute(role: AdminRole, screen: AdminScreenDefinition) {
  return screen.requiredRole === role;
}

export function canPerformAction(
  role: AdminRole,
  action: AdminAction,
  resource: AdminResourceContext = {},
) {
  switch (action) {
    case "audit:write":
      return true;
    case "event:create":
      return role === "organizer" || role === "venue_owner";
    case "event:operate_business_fields":
      return role === "organizer" || (role === "venue_owner" && resource.ownsEvent === true);
    case "approval:venue_gate":
      return role === "venue_owner" && resource.ownsVenue !== false;
    case "approval:platform_gate":
      return role === "moderator";
    case "venue:policy_edit":
      return role === "venue_owner" && resource.ownsVenue !== false && resource.claimStatus !== "pending";
    case "venue:approve_organizer":
      return role === "venue_owner" && resource.ownsVenue !== false;
    case "chat:participant_reply":
      return role === "organizer" && resource.ownsEvent !== false;
    case "chat:moderate_flagged":
      return role === "moderator" && resource.flagged !== false;
    case "ai:configure":
      return role === "organizer" || role === "venue_owner";
    case "ai:moderate":
      return role === "moderator";
    case "promotion:manage_own":
      return role === "organizer" || role === "venue_owner";
    case "promotion:moderate":
      return role === "moderator";
    case "finance:read_own":
      return role === "organizer" || role === "venue_owner";
    case "finance:read_limited":
      return role === "moderator" && resource.fraudContext === true;
    case "finance:refund":
      return role === "organizer" && resource.ownsEvent !== false;
    case "moderation:decide":
    case "enforcement:write":
      return role === "moderator";
    default:
      return false;
  }
}

export function actionRequiresReason(action: AdminAction, decision?: string) {
  return sensitiveActions.has(action) || (decision ? destructiveDecisions.has(decision) : false);
}

export function canPublishEvent(event: AdminEvent) {
  return event.approvalGates.every(
    (gate) => gate.status === "approved" || gate.status === "not_required",
  );
}

export function derivePublicationStatus(event: AdminEvent): EventPublicationStatus {
  if (terminalPublicationStatuses.has(event.publicationStatus)) {
    return event.publicationStatus;
  }

  return canPublishEvent(event) ? "ready_to_publish" : "blocked_until_gates_pass";
}

export function gateTypeForRole(role: AdminRole): ApprovalGateType | undefined {
  if (role === "venue_owner") return "venue";
  if (role === "moderator") return "platform";
  return undefined;
}

export function decisionToApprovalStatus(decision: string): ApprovalStatus | undefined {
  if (decision === "Одобрить") return "approved";
  if (decision === "Запросить правки") return "changes_requested";
  if (decision === "Эскалировать") return "escalated";
  if (decision === "Отклонить") return "rejected";
  return undefined;
}

export function applyGateDecision({
  event,
  role,
  decision,
  reasonCode,
  decidedBy,
}: {
  event: AdminEvent;
  role: AdminRole;
  decision: string;
  reasonCode?: string;
  decidedBy: string;
}): AdminEvent {
  const gateType = gateTypeForRole(role);
  const status = decisionToApprovalStatus(decision);
  const action = gateType === "venue" ? "approval:venue_gate" : "approval:platform_gate";

  if (!gateType || !status || !canPerformAction(role, action)) {
    return event;
  }

  const nextEvent = {
    ...event,
    approvalGates: event.approvalGates.map((gate) =>
      gate.type === gateType
        ? {
            ...gate,
            status,
            reason: reasonCode,
            decidedBy,
            decidedAt: "Только что",
          }
        : gate,
    ),
  };

  return {
    ...nextEvent,
    publicationStatus: derivePublicationStatus(nextEvent),
  };
}
