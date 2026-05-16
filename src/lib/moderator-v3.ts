import {
  adminEvents,
  aiAgents,
  appeals,
  auditLogs,
  claims,
  complaints,
  enforcementActions,
  evidenceItems,
  moderationCases,
  promotionCampaigns,
} from "./admin-data";
import { applyGateDecision } from "./admin-guards";
import type {
  AIAgent,
  AdminEvent,
  Appeal,
  ApprovalStatus,
  AuditLogEntry,
  Claim,
  Complaint,
  EnforcementAction,
  EvidenceItem,
  ModerationCase,
  PromotionCampaign,
  Severity,
} from "./admin-types";

export type ModeratorQueueKind =
  | "event"
  | "complaint"
  | "chat"
  | "claim"
  | "ai"
  | "promotion"
  | "enforcement"
  | "appeal";

export interface ModeratorQueueItem {
  id: string;
  kind: ModeratorQueueKind;
  title: string;
  severity: Severity;
  status: string;
  assignee: string;
  dueAt: string;
  evidenceCount: number;
  href: string;
  summary: string;
}

export interface ModeratorEventReview {
  id: string;
  event: AdminEvent;
  organizerHistory: string;
  riskSignals: string[];
  linkedEvidenceIds: string[];
  contentScanId: string;
}

export interface EventContentScan {
  id: string;
  eventId: string;
  summary: string;
  categories: {
    label: "illegal" | "extremist" | "political" | "unsafe" | "fraud" | "harmful";
    status: "clear" | "warning" | "blocked";
    confidence: number;
    evidenceId?: string;
  }[];
  matchedRules: string[];
}

export interface ModeratorComplaintCase extends Complaint {
  timelineId: string;
  linkedEvidenceIds: string[];
  reporterHistory: string;
  recommendedAction: string;
}

export interface IncidentTimelineItem {
  id: string;
  incidentId: string;
  time: string;
  actor: string;
  event: string;
  evidenceId?: string;
}

export interface FlaggedMessage {
  id: string;
  author: string;
  excerpt: string;
  flagReason: string;
  retainedHash: string;
}

export interface FlaggedChatCase {
  id: string;
  title: string;
  eventTitle: string;
  reporterName: string;
  severity: Severity;
  status: "new" | "reviewing" | "hidden" | "removed" | "locked" | "dismissed";
  reason: string;
  messages: FlaggedMessage[];
  evidenceId: string;
}

export interface EvidenceVaultItem extends EvidenceItem {
  preview: string;
  linkedDecision: string;
  accessLog: string[];
  immutable: boolean;
}

export interface ModeratorClaimReview extends Claim {
  domainMatch: boolean;
  addressMatch: boolean;
  duplicateOwnerRisk: boolean;
  selfApprovalBlocked: boolean;
}

export interface AISafetyCase {
  id: string;
  agent: AIAgent;
  severity: Severity;
  status: ApprovalStatus | "open" | "agent_limited";
  prompt: string;
  answer: string;
  sources: string[];
  confidence: number;
  forbiddenTopic: string;
  escalationTrigger: string;
}

export interface PromotionReviewCase extends PromotionCampaign {
  targeting: string;
  policyMatches: string[];
  scanChecks: { label: string; status: "clear" | "warning" | "blocked" }[];
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: "review" | "escalate" | "block" | "draft_only";
  severity: Severity;
  enabled: boolean;
}

export interface RiskSimulationResult {
  input: string;
  score: number;
  triggeredRules: string[];
  recommendedAction: string;
}

export interface ModeratorWorkloadItem {
  id: string;
  assignee: string;
  queue: string;
  severity: Severity;
  count: number;
  sla: string;
}

export interface LegalEscalation {
  id: string;
  title: string;
  severity: Severity;
  reason: string;
  handoffTarget: "senior" | "legal" | "policy";
}

export interface LimitedFinanceContext {
  id: string;
  caseId: string;
  reason: string;
  grossSales: number;
  refunds: number;
  chargebacks: number;
}

export interface RepeatOffenderNode {
  id: string;
  label: string;
  kind: "user" | "organizer" | "organization" | "event" | "venue";
  linkedCases: number;
  severity: Severity;
}

export type ModeratorAuditEntry = AuditLogEntry & {
  policySection?: string;
  evidenceId?: string;
};

export function getInitialModeratorQueue(): ModeratorQueueItem[] {
  return [
    ...moderationCases.map((item) => ({
      id: item.id,
      kind: (item.type === "ai_agent" ? "ai" : item.type === "promotion" ? "promotion" : item.type) as ModeratorQueueKind,
      title: item.title,
      severity: item.severity,
      status: item.status,
      assignee: item.assignee,
      dueAt: item.dueAt,
      evidenceCount: item.type === "chat" ? 2 : 1,
      href: queueHref(item),
      summary: item.summary,
    })),
    {
      id: "legal_1",
      kind: "enforcement" as ModeratorQueueKind,
      title: "Legal escalation: unsafe venue claim",
      severity: "critical",
      status: "open",
      assignee: "Senior mod",
      dueAt: "45m",
      evidenceCount: 4,
      href: "/moderator/legal",
      summary: "Possible impersonation and unauthorized venue usage.",
    },
  ];
}

function queueHref(item: ModerationCase) {
  if (item.type === "event") return `/moderator/events/${item.id}`;
  if (item.type === "chat") return `/moderator/chats/${item.id}`;
  if (item.type === "ai_agent") return `/moderator/ai-safety/conversations/${item.id}`;
  if (item.type === "promotion") return `/moderator/promotion/${item.id}`;
  if (item.type === "claim") return `/moderator/claims/venues/${item.id}`;
  return `/moderator/complaints/${item.id}`;
}

export function getInitialModeratorEvents(): ModeratorEventReview[] {
  return adminEvents.map((event, index) => ({
    id: `review_${event.id}`,
    event,
    organizerHistory:
      index === 0
        ? "18 past events, 0 complaints, venue owner coordination active."
        : "New or risky organizer signals require manual content review.",
    riskSignals: event.riskScore > 80
      ? ["missing_safety_plan", "late_night_alcohol", "venue_proof_gap"]
      : ["refund_policy_present", "venue_gate_visible", "no_extremism_match"],
    linkedEvidenceIds: evidenceItems.slice(0, 2).map((item) => item.id),
    contentScanId: `scan_${event.id}`,
  }));
}

export function getInitialContentScans(): EventContentScan[] {
  return adminEvents.map((event) => ({
    id: `scan_${event.id}`,
    eventId: event.id,
    summary: event.riskScore > 80
      ? "Unsafe/fraud signals require moderator decision before platform gate can pass."
      : "No illegal or extremist match. Refund and organizer context still visible.",
    categories: [
      { label: "illegal", status: "clear", confidence: 0.94 },
      { label: "extremist", status: "clear", confidence: 0.97 },
      { label: "political", status: "clear", confidence: 0.89 },
      { label: "unsafe", status: event.riskScore > 80 ? "blocked" : "warning", confidence: event.riskScore / 100, evidenceId: "ev_001" },
      { label: "fraud", status: event.riskScore > 80 ? "warning" : "clear", confidence: 0.64, evidenceId: "ev_002" },
      { label: "harmful", status: "clear", confidence: 0.88 },
    ],
    matchedRules: event.riskScore > 80
      ? ["high_capacity_new_org", "missing_safety_plan"]
      : ["paid_event_refund_policy_visible"],
  }));
}

export function getInitialComplaintCases(): ModeratorComplaintCase[] {
  return complaints.map((complaint, index) => ({
    ...complaint,
    timelineId: `inc_${index + 1}`,
    linkedEvidenceIds: evidenceItems.slice(0, 2).map((item) => item.id),
    reporterHistory: index === 0 ? "Reporter has 2 prior valid reports." : "First report from this user.",
    recommendedAction: complaint.severity === "critical" ? "Escalate to legal and preserve evidence." : "Review evidence and request context.",
  }));
}

export const incidentTimeline: IncidentTimelineItem[] = [
  { id: "tl_1", incidentId: "inc_1", time: "09:02", actor: "Reporter", event: "Complaint submitted", evidenceId: "ev_001" },
  { id: "tl_2", incidentId: "inc_1", time: "09:04", actor: "System", event: "Flagged chat excerpt retained", evidenceId: "ev_002" },
  { id: "tl_3", incidentId: "inc_1", time: "09:16", actor: "Moderator", event: "Case linked to event approval queue" },
  { id: "tl_4", incidentId: "inc_1", time: "09:22", actor: "AI scan", event: "Unsafe venue proof signal detected", evidenceId: "ev_003" },
];

export function getInitialFlaggedChats(): FlaggedChatCase[] {
  return [
    {
      id: "chat_1",
      title: "Sunset group flagged excerpt",
      eventTitle: "Sunset Singles Mixer",
      reporterName: "Maya R.",
      severity: "high",
      status: "new",
      reason: "Harassment and unsafe meetup pressure",
      evidenceId: "ev_002",
      messages: [
        {
          id: "msg_1",
          author: "Flagged participant",
          excerpt: "Meet me outside the venue alone after the event.",
          flagReason: "unsafe_meetup_pressure",
          retainedHash: "sha256:chat-a91",
        },
        {
          id: "msg_2",
          author: "AI draft",
          excerpt: "This looks unsafe. Please keep communication in the group chat.",
          flagReason: "ai_safety_escalation",
          retainedHash: "sha256:chat-b22",
        },
      ],
    },
    {
      id: "chat_2",
      title: "AI answer complaint",
      eventTitle: "AI Networking Breakfast",
      reporterName: "Venue owner",
      severity: "medium",
      status: "reviewing",
      reason: "AI promised venue policy exception",
      evidenceId: "ev_003",
      messages: [
        {
          id: "msg_3",
          author: "Event AI",
          excerpt: "The venue can waive approval if you mention my name.",
          flagReason: "unsafe_ai_answer",
          retainedHash: "sha256:chat-c33",
        },
      ],
    },
  ];
}

export function getInitialEvidenceVault(): EvidenceVaultItem[] {
  return evidenceItems.map((item, index) => ({
    ...item,
    preview: index === 0 ? "Screenshot of public event claim and missing venue proof." : "Flagged transcript excerpt retained before removal.",
    linkedDecision: index === 0 ? "Pending event approval" : "Chat moderation review",
    accessLog: ["System retained original", "Moderator opened detail"],
    immutable: true,
  }));
}

export function getInitialClaimReviews(): ModeratorClaimReview[] {
  return claims.map((claim, index) => ({
    ...claim,
    domainMatch: index !== 0,
    addressMatch: true,
    duplicateOwnerRisk: index === 0,
    selfApprovalBlocked: false,
  }));
}

export function getInitialAISafetyCases(): AISafetyCase[] {
  return aiAgents.map((agent, index) => ({
    id: `ai_case_${agent.id}`,
    agent,
    severity: index === 0 ? "high" : "medium",
    status: index === 0 ? "open" : "changes_requested",
    prompt: "Can I bypass venue approval if the organizer says yes?",
    answer: "You may be able to proceed without waiting for venue owner approval.",
    sources: ["Venue policy KB", "Agent trace", "User report"],
    confidence: index === 0 ? 0.54 : 0.72,
    forbiddenTopic: index === 0 ? "policy bypass" : "refund exception",
    escalationTrigger: "confidence_below_threshold + policy_exception",
  }));
}

export function getInitialPromotionReviews(): PromotionReviewCase[] {
  return promotionCampaigns.map((campaign) => ({
    ...campaign,
    targeting: "LA singles, 25-38, nightlife/social interest",
    policyMatches: campaign.riskScore > 50
      ? ["unsafe_urgency_claim", "missing_venue_evidence"]
      : ["paid_promotion_disclosure"],
    scanChecks: [
      { label: "misleading claims", status: campaign.riskScore > 50 ? "warning" : "clear" },
      { label: "illegal/extremist", status: "clear" },
      { label: "political targeting", status: "clear" },
      { label: "unsafe urgency", status: campaign.riskScore > 50 ? "blocked" : "clear" },
    ],
  }));
}

export function getInitialPolicyRules(): PolicyRule[] {
  return [
    {
      id: "high_capacity_new_org",
      condition: "new_org && capacity > 150 && venue_gate !== approved",
      action: "escalate",
      severity: "high",
      enabled: true,
    },
    {
      id: "unsafe_ai_answer",
      condition: "ai_answer contains policy_exception OR confidence < 0.6",
      action: "draft_only",
      severity: "medium",
      enabled: true,
    },
    {
      id: "promo_urgency_claim",
      condition: "promotion contains guaranteed outcome OR unsafe urgency",
      action: "review",
      severity: "medium",
      enabled: true,
    },
  ];
}

export const moderatorWorkload: ModeratorWorkloadItem[] = [
  { id: "wl_1", assignee: "Nina", queue: "Event Approval", severity: "high", count: 8, sla: "2h avg" },
  { id: "wl_2", assignee: "Omar", queue: "AI Safety", severity: "medium", count: 5, sla: "4h avg" },
  { id: "wl_3", assignee: "Legal", queue: "Escalations", severity: "critical", count: 2, sla: "45m avg" },
];

export const legalEscalations: LegalEscalation[] = [
  {
    id: "esc_1",
    title: "Unauthorized venue usage with safety risk",
    severity: "critical",
    reason: "Possible impersonation and unsafe late-night event.",
    handoffTarget: "legal",
  },
];

export const limitedFinanceContexts: LimitedFinanceContext[] = [
  {
    id: "fraud_case_1",
    caseId: "cmp_1",
    reason: "Fraud/dispute moderation context only",
    grossSales: 1050,
    refunds: 175,
    chargebacks: 1,
  },
];

export const repeatOffenderNodes: RepeatOffenderNode[] = [
  { id: "node_user_1", label: "Unsafe Events LLC", kind: "organization", linkedCases: 4, severity: "critical" },
  { id: "node_event_1", label: "Late Night Warehouse Party", kind: "event", linkedCases: 3, severity: "high" },
  { id: "node_ai_1", label: "Venue AI exception answers", kind: "venue", linkedCases: 2, severity: "medium" },
];

export function applyPlatformGateDecision(
  review: ModeratorEventReview,
  decision: string,
  reasonCode?: string,
): ModeratorEventReview {
  return {
    ...review,
    event: applyGateDecision({
      event: review.event,
      role: "moderator",
      decision,
      reasonCode,
      decidedBy: "Moderator",
    }),
  };
}

export function applyComplaintDecision(
  complaint: ModeratorComplaintCase,
  status: ModeratorComplaintCase["status"],
): ModeratorComplaintCase {
  return { ...complaint, status };
}

export function applyChatModerationDecision(
  chat: FlaggedChatCase,
  status: FlaggedChatCase["status"],
): FlaggedChatCase {
  return { ...chat, status };
}

export function applyClaimDecision(
  claim: ModeratorClaimReview,
  status: ApprovalStatus,
): ModeratorClaimReview {
  return { ...claim, status };
}

export function applyPromotionDecision(
  promotion: PromotionReviewCase,
  status: ApprovalStatus | "running" | "paused",
): PromotionReviewCase {
  return { ...promotion, status };
}

export function applyEnforcementAction(
  action: EnforcementAction,
  status: EnforcementAction["status"],
): EnforcementAction {
  return { ...action, status };
}

export function applyAppealDecision(
  appeal: Appeal,
  status: Appeal["status"],
): Appeal {
  return { ...appeal, status };
}

export function simulateRiskRule(input: string, rules: PolicyRule[]): RiskSimulationResult {
  const triggeredRules = rules
    .filter((rule) => rule.enabled && input.toLowerCase().includes(rule.id.split("_")[0]))
    .map((rule) => rule.id);
  return {
    input,
    score: triggeredRules.length ? 84 : 28,
    triggeredRules,
    recommendedAction: triggeredRules.length ? "Escalate for manual review" : "No blocking policy match",
  };
}

export function makeModeratorAudit({
  action,
  entity,
  reasonCode,
  policySection,
  evidenceId,
}: {
  action: string;
  entity: string;
  reasonCode?: string;
  policySection?: string;
  evidenceId?: string;
}): ModeratorAuditEntry {
  return {
    id: `mod_local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    actor: "Moderator",
    actorRole: "moderator",
    action,
    entity,
    reasonCode,
    policySection,
    evidenceId,
    createdAt: "Только что",
  };
}

export function moderatorAuditSeed() {
  return auditLogs.filter((log) => log.actorRole === "moderator");
}

export function initialEnforcementActions() {
  return enforcementActions;
}

export function initialAppeals() {
  return appeals;
}
