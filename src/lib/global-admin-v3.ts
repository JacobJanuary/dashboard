import routeManifest from "./v3-route-manifest.json";
import {
  adminEvents,
  adminVenues,
  auditLogs,
  claims,
  complaints,
  evidenceItems,
  participants,
  promotionCampaigns,
  roleLabels,
} from "./admin-data";
import { canPerformAction, type AdminAction } from "./admin-guards";
import type { AdminRole, AuditLogEntry } from "./admin-types";

export type RouteManifestGroup = keyof typeof routeManifest;

export type GlobalScreen = {
  id: string;
  title: string;
  route: string;
  purpose: string;
};

export type SystemStateDefinition = {
  id: string;
  slug: string;
  title: string;
  purpose: string;
  affectedRoutes: string[];
  expectedAction: string;
  auditNote: string;
  tone: "neutral" | "good" | "warn" | "danger" | "info";
};

export const routeGroupLabels: Record<RouteManifestGroup, string> = {
  global: "Shared / Global",
  organizer: "Organizer Admin",
  owner: "Venue Owner Admin",
  moderator: "Moderator Admin",
  public: "Public / Mobile Preview",
  system: "System / Edge States",
};

export const globalScreens: GlobalScreen[] = [
  { id: "GL-01", title: "Role & Organization Switcher", route: "/admin/select-role", purpose: "Выбор рабочей консоли без смешивания прав." },
  { id: "GL-02", title: "Admin Shell + Permission Guard", route: "/admin/shell", purpose: "Общий shell с явным role context и guard states." },
  { id: "GL-03", title: "Global Notifications Center", route: "/admin/notifications", purpose: "Все задачи, SLA, moderation, payout, approval и chat alerts." },
  { id: "GL-04", title: "Universal Search", route: "/admin/search", purpose: "Поиск по events, venues, participants, cases и payouts." },
  { id: "GL-05", title: "Public Preview QA Console", route: "/admin/preview-qa", purpose: "Проверка web/mobile preview и битых ссылок перед публикацией." },
  { id: "GL-06", title: "RBAC Matrix", route: "/admin/rbac-matrix", purpose: "Матрица ролей, действий и boundary conditions." },
  { id: "GL-07", title: "Global Audit Log", route: "/admin/audit", purpose: "Единый журнал критичных операций." },
  { id: "GL-08", title: "Approval Gate Model", route: "/admin/approval-model", purpose: "Объяснение venue gate + platform gate." },
  { id: "GL-09", title: "Data Freshness & Source Health", route: "/admin/data-health", purpose: "Показ устаревших данных, webhook delays и source of truth." },
  { id: "GL-10", title: "Design System Components", route: "/admin/design-system", purpose: "Паттерны бейджей, таблиц, drawers и decision panels." },
  { id: "GL-11", title: "Engineering Handoff Checklist", route: "/admin/handoff", purpose: "Контроль готовности экранов для реализации." },
  { id: "GL-12", title: "Global Edge State Library", route: "/admin/states", purpose: "Единые Loading/Empty/Error/Offline/Permission states." },
];

export const systemStates: SystemStateDefinition[] = [
  { id: "SYS-01", slug: "loading", title: "Loading State", purpose: "Skeletons before real data arrives.", affectedRoutes: ["/organizer/events", "/owner/venues", "/moderator/events"], expectedAction: "Show stable skeleton rows after 200ms.", auditNote: "No audit; read not completed yet.", tone: "neutral" },
  { id: "SYS-02", slug: "empty-venue", title: "Empty State — First Venue", purpose: "Owner has no venues yet.", affectedRoutes: ["/owner/venues", "/owner/venues/new"], expectedAction: "Show add/claim venue CTA.", auditNote: "Claim submission creates audit.", tone: "info" },
  { id: "SYS-03", slug: "error", title: "Error + Retry", purpose: "Recoverable API or source failure.", affectedRoutes: ["/admin/data-health", "/organizer/payouts"], expectedAction: "Explain cause and offer retry.", auditNote: "Critical failed writes should audit attempted action.", tone: "danger" },
  { id: "SYS-04", slug: "offline", title: "Offline State", purpose: "Cached mode with irreversible actions locked.", affectedRoutes: ["/organizer/events/evt_123/check-in", "/owner/calendar/week"], expectedAction: "Allow safe reads and manual check-in; lock refunds/enforcement.", auditNote: "Denied irreversible action can audit locally.", tone: "warn" },
  { id: "SYS-05", slug: "permission-denied", title: "Permission Denied", purpose: "Wrong role or out-of-scope resource.", affectedRoutes: ["/moderator/finance-context/fraud_case_1", "/owner/venues/ven_789/edit"], expectedAction: "Show required role/scope and switcher path.", auditNote: "Sensitive denied reads should audit.", tone: "danger" },
  { id: "SYS-06", slug: "partial-data", title: "Partial Data State", purpose: "Some sources are delayed or stale.", affectedRoutes: ["/admin/data-health", "/owner/analytics"], expectedAction: "Label stale metrics and keep actions scoped.", auditNote: "No audit unless user acts on stale data.", tone: "info" },
  { id: "SYS-07", slug: "stale-analytics", title: "Stale Analytics Warning", purpose: "Analytics lag behind current operations.", affectedRoutes: ["/owner/analytics", "/organizer/promotion/camp_1/analytics"], expectedAction: "Show freshness timestamp and source.", auditNote: "Campaign decisions should mention stale source.", tone: "warn" },
  { id: "SYS-08", slug: "payment-delay", title: "Webhook Delayed Payment", purpose: "Payment provider webhook has not reconciled.", affectedRoutes: ["/event/1/confirmation", "/organizer/payouts/ledger"], expectedAction: "Show pending confirmation and no duplicate charge action.", auditNote: "Ledger writes stay pending.", tone: "warn" },
  { id: "SYS-09", slug: "form-validation", title: "Validation Error Form", purpose: "Required fields block submit.", affectedRoutes: ["/organizer/events/new/basics", "/owner/venues/new/basics"], expectedAction: "Inline validation and disabled submit.", auditNote: "No audit until submit attempt.", tone: "danger" },
  { id: "SYS-10", slug: "destructive-reason", title: "Destructive Action Reason Code", purpose: "Sensitive destructive actions require reason.", affectedRoutes: ["/moderator/enforcement/block", "/organizer/events/evt_123/cancel"], expectedAction: "Disable action until reason code is present.", auditNote: "Audit must include reason code.", tone: "danger" },
  { id: "SYS-11", slug: "undo-toast", title: "Undo Toast", purpose: "Reversible non-legal UI changes.", affectedRoutes: ["/organizer/participants", "/owner/team"], expectedAction: "Toast with undo for safe operations.", auditNote: "Audit only final persistent state.", tone: "good" },
  { id: "SYS-12", slug: "changes-requested", title: "Changes Requested State", purpose: "Approval gate needs edits.", affectedRoutes: ["/organizer/events/evt_123/approval"], expectedAction: "Show requested changes and resubmit path.", auditNote: "Gate decision audit includes requester.", tone: "warn" },
  { id: "SYS-13", slug: "rejected-by-venue", title: "Rejected by Venue", purpose: "Venue gate rejected.", affectedRoutes: ["/organizer/events/evt_123/approval"], expectedAction: "Block publish and offer location change.", auditNote: "Venue owner audit includes reason.", tone: "danger" },
  { id: "SYS-14", slug: "rejected-by-moderator", title: "Rejected by Moderator", purpose: "Platform gate rejected.", affectedRoutes: ["/moderator/events/evt_123", "/organizer/events/evt_123/approval"], expectedAction: "Block publish and show appeal/change path.", auditNote: "Moderator audit includes policy section.", tone: "danger" },
  { id: "SYS-15", slug: "gate-conflict", title: "Gate Conflict State", purpose: "Venue/platform gates disagree or one escalates.", affectedRoutes: ["/admin/approval-model", "/organizer/events/evt_123/approval"], expectedAction: "Derive publication as blocked until all required gates pass.", auditNote: "Every gate mutation is logged.", tone: "warn" },
  { id: "SYS-16", slug: "kyc-required", title: "KYC Required", purpose: "Payouts blocked until verification.", affectedRoutes: ["/organizer/payouts", "/organizer/payouts/ledger"], expectedAction: "Show verification CTA and hold amount.", auditNote: "KYC open event audited locally.", tone: "warn" },
  { id: "SYS-17", slug: "privacy-boundary", title: "Privacy Boundary Explanation", purpose: "Hide data outside role scope.", affectedRoutes: ["/owner/inbox", "/moderator/chats/chat_1"], expectedAction: "Explain why participant chat or finance is limited.", auditNote: "Sensitive reads should append audit.", tone: "info" },
  { id: "SYS-18", slug: "audit-created", title: "Audit Log Generated", purpose: "Critical action produces visible audit row.", affectedRoutes: ["/admin/audit", "/moderator/audit"], expectedAction: "Show actor, role, action, entity, reason and timestamp.", auditNote: "This state demonstrates the audit row itself.", tone: "good" },
  { id: "SYS-19", slug: "ai-low-confidence", title: "AI Confidence Low", purpose: "AI output requires human review.", affectedRoutes: ["/organizer/ai/test", "/moderator/ai-safety"], expectedAction: "Force draft-only or escalation.", auditNote: "Unsafe AI moderation is audited.", tone: "warn" },
  { id: "SYS-20", slug: "no-external-events", title: "No External Events Disabled Venue", purpose: "Venue policy prohibits external organizers.", affectedRoutes: ["/organizer/venues/ven_closed/unavailable"], expectedAction: "Disable venue selection and explain owner policy.", auditNote: "Policy change to closed requires reason audit.", tone: "danger" },
];

export const globalNotifications = [
  { title: "Venue gate pending", route: "/owner/approvals/events/owner_req_evt_123", role: "venue_owner" as AdminRole, severity: "high", allowed: true },
  { title: "Platform scan escalated", route: "/moderator/events/evt_123/content-scan", role: "moderator" as AdminRole, severity: "critical", allowed: true },
  { title: "Refund requested", route: "/organizer/events/evt_123/refunds", role: "organizer" as AdminRole, severity: "medium", allowed: true },
  { title: "Participant chat hidden from owner", route: "/owner/inbox", role: "venue_owner" as AdminRole, severity: "low", allowed: false },
];

export const previewQaResults = [
  { route: "/event/1", entity: "Sunset Sessions", surface: "Web Event Page", status: "pass", note: "Title, venue, refund policy and AI disclosure paths are present." },
  { route: "/event/1?preview=mobile", entity: "Sunset Sessions", surface: "Mobile Event Page", status: "pass", note: "Phone preview remains contained." },
  { route: "/venue/ven_456", entity: "The Penmar", surface: "Web Venue Page", status: "pass", note: "Venue route resolves and policy is visible." },
  { route: "/preview/missing-fields", entity: "AI Draft Event", surface: "Missing Fields", status: "fail", note: "Refund policy and venue address block publish." },
  { route: "/notifications/event-changed", entity: "Event Changed", surface: "Notification", status: "warn", note: "Schedule changed notification requires user confirmation." },
];

export const dataSourceHealth = [
  { source: "events", owner: "event-svc mock", freshness: "fresh", route: "/organizer/events", note: `${adminEvents.length} admin events loaded.` },
  { source: "payments", owner: "ledger mock", freshness: "delayed", route: "/admin/data-health", note: "Webhook delayed payment state available." },
  { source: "messages", owner: "chat mock", freshness: "partial", route: "/moderator/chats", note: "Moderator sees flagged excerpts only." },
  { source: "promotion", owner: "campaign mock", freshness: "fresh", route: "/moderator/promotion", note: `${promotionCampaigns.length} campaigns indexed.` },
  { source: "evidence", owner: "evidence vault mock", freshness: "retained", route: "/moderator/evidence", note: `${evidenceItems.length} retained items.` },
];

export const handoffChecklist = [
  { label: "204 v3 routes covered", done: true },
  { label: "Role shells use primary nav only", done: true },
  { label: "Approval model derives publication status", done: true },
  { label: "Public preview QA has broken/missing-field states", done: true },
  { label: "Backend persistence handoff documented", done: false },
];

const actionRows: { action: AdminAction; label: string; resource?: Parameters<typeof canPerformAction>[2] }[] = [
  { action: "event:create", label: "Create event" },
  { action: "event:operate_business_fields", label: "Edit event price/tickets/capacity", resource: { ownsEvent: true } },
  { action: "approval:venue_gate", label: "Approve venue gate", resource: { ownsVenue: true } },
  { action: "approval:platform_gate", label: "Approve platform gate" },
  { action: "chat:participant_reply", label: "Read/reply participant chat", resource: { ownsEvent: true } },
  { action: "chat:moderate_flagged", label: "Moderate flagged chat excerpt", resource: { flagged: true } },
  { action: "finance:read_limited", label: "Read limited fraud/dispute finance", resource: { fraudContext: true } },
  { action: "enforcement:write", label: "Block/suspend with evidence" },
];

export const rbacRows = actionRows.map((row) => ({
  ...row,
  organizer: canPerformAction("organizer", row.action, row.resource),
  venue_owner: canPerformAction("venue_owner", row.action, row.resource),
  moderator: canPerformAction("moderator", row.action, row.resource),
}));

export const searchIndex = [
  ...adminEvents.map((event) => ({
    label: event.title,
    type: "event",
    route: `/organizer/events/${event.id}`,
    allowedRoles: ["organizer", "venue_owner", "moderator"] as AdminRole[],
    note: event.publicationStatus,
  })),
  ...adminVenues.map((venue) => ({
    label: venue.name,
    type: "venue",
    route: `/owner/venues/${venue.id}`,
    allowedRoles: ["venue_owner"] as AdminRole[],
    note: venue.claimStatus,
  })),
  ...participants.map((participant) => ({
    label: participant.name,
    type: "participant",
    route: `/organizer/participants/${participant.id}`,
    allowedRoles: ["organizer"] as AdminRole[],
    note: participant.status,
  })),
  ...complaints.map((complaint) => ({
    label: complaint.targetName,
    type: "complaint",
    route: `/moderator/complaints/${complaint.id}`,
    allowedRoles: ["moderator"] as AdminRole[],
    note: complaint.severity,
  })),
  ...claims.map((claim) => ({
    label: claim.targetName,
    type: "claim",
    route: claim.type === "organization" ? `/moderator/claims/organizations/${claim.id}` : `/moderator/claims/venues/${claim.id}`,
    allowedRoles: ["moderator"] as AdminRole[],
    note: claim.status,
  })),
];

export function getAllV3Routes() {
  return Object.values(routeManifest).flat();
}

export function getManifestCounts() {
  return Object.entries(routeManifest).map(([group, routes]) => ({
    group: group as RouteManifestGroup,
    label: routeGroupLabels[group as RouteManifestGroup],
    count: routes.length,
  }));
}

export function findSystemState(slug: string) {
  return systemStates.find((state) => state.slug === slug) ?? systemStates[0];
}

export function mergeAuditLogs(sharedLogs: AuditLogEntry[]) {
  return [...sharedLogs, ...auditLogs];
}

export function roleName(role: AdminRole) {
  return roleLabels[role];
}
