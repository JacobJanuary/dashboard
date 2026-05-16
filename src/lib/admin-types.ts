export type AdminRole = "organizer" | "venue_owner" | "moderator";

export type ApprovalGateType = "venue" | "platform";
export type ApprovalActor = "venue_owner" | "moderator";
export type ApprovalStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "escalated";

export type EventPublicationStatus =
  | "draft"
  | "blocked_until_gates_pass"
  | "ready_to_publish"
  | "published"
  | "paused"
  | "cancelled"
  | "completed"
  | "archived";

export type VenuePolicyMode =
  | "approve_organizers"
  | "moderate_every_event"
  | "no_external_events";

export type ParticipantStatus =
  | "applied"
  | "approved"
  | "paid"
  | "waitlist"
  | "checked_in"
  | "no_show"
  | "refund_requested"
  | "refunded";

export type Severity = "low" | "medium" | "high" | "critical";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: AdminRole[];
}

export interface ApprovalGate {
  id: string;
  type: ApprovalGateType;
  actor: ApprovalActor;
  status: ApprovalStatus;
  venueId?: string;
  decidedBy?: string;
  decidedAt?: string;
  reason?: string;
  requiredBecause: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  organizerName: string;
  venueName: string;
  locationType: "own_venue" | "external_venue" | "public_place" | "online";
  category: string;
  date: string;
  capacity: number;
  ticketsSold: number;
  revenue: number;
  refundPolicy: string;
  riskScore: number;
  publicationStatus: EventPublicationStatus;
  approvalGates: ApprovalGate[];
  aiSummary: string;
  publicPreviewUrl: string;
}

export interface VenuePolicy {
  mode: VenuePolicyMode;
  allowRecurring: boolean;
  maxCapacityOverride?: number;
  setupBufferMinutes: number;
  restrictedCategories: string[];
}

export interface VenueOrganizerAccess {
  id: string;
  venueId: string;
  organizerName: string;
  status: ApprovalStatus | "blocked";
  requestedAt: string;
  rating: number;
  pastEvents: number;
  complaintCount: number;
  note: string;
}

export interface AdminVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  ownerName: string;
  claimStatus: ApprovalStatus;
  policy: VenuePolicy;
  amenities: string[];
  accessibility: string[];
  rules: string[];
  rating: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  status: ParticipantStatus;
  ticketTier: string;
  paid: number;
  checkedInAt?: string;
  lastMessageAt?: string;
  notes: string;
}

export interface PromotionCampaign {
  id: string;
  name: string;
  ownerName: string;
  targetEntity: string;
  spend: number;
  status: ApprovalStatus | "running" | "paused";
  riskScore: number;
  creativeSummary: string;
}

export interface Complaint {
  id: string;
  targetType: "event" | "chat" | "organizer" | "venue" | "participant" | "ai_agent";
  targetName: string;
  reporterName: string;
  severity: Severity;
  status: "new" | "investigating" | "resolved" | "appealed";
  summary: string;
  evidenceCount: number;
}

export interface Claim {
  id: string;
  type: "organization" | "venue";
  claimantName: string;
  targetName: string;
  status: ApprovalStatus;
  evidence: string[];
  submittedAt: string;
}

export interface ModerationCase {
  id: string;
  type: "event" | "chat" | "ai_agent" | "promotion" | "claim" | "complaint";
  title: string;
  severity: Severity;
  status: ApprovalStatus | "open" | "closed";
  assignee: string;
  dueAt: string;
  summary: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  title: string;
  source: "upload" | "chat_snapshot" | "ai_trace" | "system_log" | "public_page";
  retainedUntil: string;
  hash: string;
}

export interface EnforcementAction {
  id: string;
  target: string;
  action: "warning" | "suspension" | "block" | "content_hidden" | "agent_limited";
  status: "active" | "expired" | "appealed";
  reasonCode: string;
  createdAt: string;
}

export interface Appeal {
  id: string;
  target: string;
  originalDecision: string;
  status: "new" | "under_review" | "upheld" | "overturned";
  submittedAt: string;
  newEvidence: string[];
}

export interface AIAgent {
  id: string;
  name: string;
  ownerName: string;
  scope: "event" | "organizer" | "venue";
  mode:
    | "off"
    | "draft_replies"
    | "auto_reply_safe"
    | "auto_reply_escalate";
  confidenceThreshold: number;
  forbiddenTopics: string[];
  escalationTriggers: string[];
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: AdminRole;
  action: string;
  entity: string;
  reasonCode?: string;
  createdAt: string;
}

export type AdminSurfaceType =
  | "page"
  | "tab"
  | "drawer"
  | "detail_panel"
  | "wizard_step"
  | "action";

export interface AdminScreenSurface {
  slug: string;
  title: string;
  description: string;
  surfaceType: AdminSurfaceType;
  variant?: AdminScreenDefinition["variant"];
  detail?: boolean;
  destructiveActions?: boolean;
  partialData?: boolean;
  prototypeRefs?: string[];
}

export interface AdminScreenDefinition {
  slug: string;
  title: string;
  description: string;
  navGroup: string;
  variant:
    | "dashboard"
    | "events"
    | "event_detail"
    | "create"
    | "ai_builder"
    | "venues"
    | "venue_detail"
    | "policy"
    | "approvals"
    | "participants"
    | "chats"
    | "ai_agents"
    | "promotion"
    | "finance"
    | "calendar"
    | "team"
    | "audit"
    | "moderation_queue"
    | "complaints"
    | "claims"
    | "evidence"
    | "enforcement"
    | "appeals"
    | "rules"
    | "generic";
  requiredRole: AdminRole;
  detail?: boolean;
  destructiveActions?: boolean;
  partialData?: boolean;
  isPrimaryNav?: boolean;
  parentSlug?: string;
  surfaceType?: AdminSurfaceType;
  tabs?: AdminScreenSurface[];
  activeSurface?: AdminScreenSurface;
  resolvedFromSlug?: string;
  prototypeRefs?: string[];
}
