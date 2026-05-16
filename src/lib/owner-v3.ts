import {
  adminEvents,
  adminVenues,
  aiAgents,
  auditLogs,
  organizerAccessRequests,
  promotionCampaigns,
} from "./admin-data";
import { applyGateDecision } from "./admin-guards";
import type {
  AdminEvent,
  AdminVenue,
  AIAgent,
  ApprovalStatus,
  AuditLogEntry,
  PromotionCampaign,
  VenueOrganizerAccess,
  VenuePolicy,
  VenuePolicyMode,
} from "./admin-types";
import { demoEventCover, demoVenueCover } from "./demo-assets";
import { venues as publicVenues } from "./venue-data";

export interface OwnerVenueProfile extends AdminVenue {
  coverImage: string;
  photos: string[];
  description: string;
  contactEmail: string;
  phone: string;
  hours: string;
  blackoutDates: string[];
  utilizationToday: number;
  utilizationWeek: number;
  publicNotes: string;
  suspended?: boolean;
}

export interface OwnerVenueClaim {
  id: string;
  venueName: string;
  status: ApprovalStatus;
  evidence: string[];
  submittedAt: string;
  moderatorNote?: string;
}

export interface VenueEditDraft {
  name: string;
  description: string;
  address: string;
  city: string;
  capacity: number;
  publicNotes: string;
  contactEmail: string;
}

export interface OwnerOrganizerAccessRequest extends VenueOrganizerAccess {
  venueName: string;
  thread: string[];
  sla: string;
}

export interface OwnerEventRequest {
  id: string;
  event: AdminEvent;
  venueId: string;
  venueName: string;
  status: ApprovalStatus;
  setupNeeds: string;
  conflict: boolean;
  organizerHistory: string;
}

export interface OwnerCalendarItem {
  id: string;
  venueId: string;
  venueName: string;
  title: string;
  kind: "owner_event" | "external_event" | "request" | "blackout" | "hold";
  startsAt: string;
  endsAt: string;
  status: ApprovalStatus | "confirmed" | "blocked";
}

export interface OwnerExternalEvent {
  id: string;
  event: AdminEvent;
  venueId: string;
  venueName: string;
  readOnlyReason: string;
  opsThread: string[];
}

export interface OwnerInboxThread {
  id: string;
  title: string;
  venueName: string;
  kind: "access_request" | "event_request" | "ops" | "ai_escalation";
  unread: number;
  lastMessage: string;
  privacyBoundary: string;
}

export interface OwnerPromotionCampaign extends PromotionCampaign {
  targetType: "venue" | "owner_event";
  impressions: number;
  requests: number;
  riskReview: "clear" | "review_required";
}

export interface OwnerAnalyticsSummary {
  utilization: number;
  requestConversion: number;
  organizerQuality: number;
  complaintRate: number;
  campaignRoi: number;
  partialData: boolean;
}

export interface OwnerTeamMember {
  id: string;
  name: string;
  role: "owner" | "admin" | "staff" | "check_in" | "support";
  venueScope: string;
  permissions: string[];
}

export type OwnerAuditEntry = AuditLogEntry;

export const initialVenueDraft: VenueEditDraft = {
  name: "The Penmar",
  description: "Patio restaurant and social venue for intimate mixers, brunches and community gatherings.",
  address: "1234 Rose Ave",
  city: "Los Angeles",
  capacity: 120,
  publicNotes: "Outdoor patio, light music after 18:00, insurance required over 100 guests.",
  contactEmail: "events@thepenmar.example",
};

export const ownerClaims: OwnerVenueClaim[] = [
  {
    id: "claim_venue_789",
    venueName: "Gallery Loft",
    status: "pending",
    evidence: ["Business registration", "Utility bill"],
    submittedAt: "Yesterday, 15:42",
    moderatorNote: "Waiting for address match.",
  },
  {
    id: "claim_needs_info",
    venueName: "AUM Sound Center",
    status: "changes_requested",
    evidence: ["Website ownership"],
    submittedAt: "2 days ago",
    moderatorNote: "Upload tax document or signed lease.",
  },
];

export const ownerCalendarItems: OwnerCalendarItem[] = [
  {
    id: "cal_1",
    venueId: "ven_456",
    venueName: "The Penmar",
    title: "Sunset Singles Mixer",
    kind: "external_event",
    startsAt: "Fri 18:00",
    endsAt: "Fri 21:00",
    status: "pending",
  },
  {
    id: "cal_2",
    venueId: "ven_456",
    venueName: "The Penmar",
    title: "Owner hold: patio reset",
    kind: "hold",
    startsAt: "Fri 17:00",
    endsAt: "Fri 18:00",
    status: "confirmed",
  },
  {
    id: "cal_3",
    venueId: "ven_789",
    venueName: "Gallery Loft",
    title: "Blackout: private installation",
    kind: "blackout",
    startsAt: "Sat all day",
    endsAt: "Sun 10:00",
    status: "blocked",
  },
  {
    id: "cal_4",
    venueId: "ven_456",
    venueName: "The Penmar",
    title: "Wine social request",
    kind: "request",
    startsAt: "Fri 20:30",
    endsAt: "Fri 23:30",
    status: "changes_requested",
  },
];

export const ownerInboxThreads: OwnerInboxThread[] = [
  {
    id: "thread_access_218",
    title: "Organizer access request",
    venueName: "The Penmar",
    kind: "access_request",
    unread: 2,
    lastMessage: "Can share insurance and setup plan by EOD.",
    privacyBoundary: "Venue owner can see only organizer-owner operational context.",
  },
  {
    id: "thread_ops_evt123",
    title: "Sunset Singles setup",
    venueName: "The Penmar",
    kind: "ops",
    unread: 1,
    lastMessage: "We need 45 chairs and patio heaters.",
    privacyBoundary: "Participant chat remains hidden unless the owner is also event organizer.",
  },
  {
    id: "thread_ai_low_conf",
    title: "AI escalation: accessibility",
    venueName: "Gallery Loft",
    kind: "ai_escalation",
    unread: 3,
    lastMessage: "AI confidence 0.54 on lift access after 21:00.",
    privacyBoundary: "AI escalation includes question and KB source, not participant private chat.",
  },
];

export const ownerTeamMembers: OwnerTeamMember[] = [
  {
    id: "team_owner",
    name: "Mara Chen",
    role: "owner",
    venueScope: "All venues",
    permissions: ["policy", "claims", "approvals", "team"],
  },
  {
    id: "team_ops",
    name: "Luis Parker",
    role: "admin",
    venueScope: "The Penmar",
    permissions: ["approvals", "calendar", "inbox"],
  },
  {
    id: "team_door",
    name: "Nina Patel",
    role: "check_in",
    venueScope: "The Penmar",
    permissions: ["calendar", "ops_thread"],
  },
];

export const ownerAnalyticsSummary: OwnerAnalyticsSummary = {
  utilization: 68,
  requestConversion: 42,
  organizerQuality: 4.7,
  complaintRate: 1.8,
  campaignRoi: 2.4,
  partialData: true,
};

export function getInitialOwnerVenues(): OwnerVenueProfile[] {
  return adminVenues.map((venue, index) => {
    const publicVenue = publicVenues[index % publicVenues.length];
    return {
      ...venue,
      coverImage: demoVenueCover(index),
      photos: [demoVenueCover(index), demoVenueCover(index + 1), demoVenueCover(index + 2)],
      description: publicVenue?.description ?? `${venue.name} venue profile for owner operations.`,
      contactEmail: `events@${venue.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example`,
      phone: publicVenue?.phone ?? "+1 555 0100",
      hours: index === 1 ? "Tue-Sun 10:00-22:00" : "Daily 09:00-23:00",
      blackoutDates: index === 1 ? ["May 25", "Jun 02"] : ["May 18"],
      utilizationToday: [72, 38, 91][index % 3],
      utilizationWeek: [68, 54, 77][index % 3],
      publicNotes: "Organizer setup must respect house rules, insurance threshold and quiet hours.",
      suspended: venue.claimStatus === "rejected",
    };
  });
}

export function getInitialOwnerAccessRequests(): OwnerOrganizerAccessRequest[] {
  return organizerAccessRequests.map((request, index) => ({
    ...request,
    venueName: adminVenues.find((venue) => venue.id === request.venueId)?.name ?? "Owned venue",
    thread: [
      request.note,
      index === 0 ? "Owner asked for insurance certificate." : "Organizer shared past event references.",
    ],
    sla: index === 0 ? "18h left" : "SLA met",
  }));
}

export function getInitialOwnerEventRequests(): OwnerEventRequest[] {
  return adminEvents
    .filter((event) => event.locationType === "external_venue")
    .map((event, index) => {
      const venueGate = event.approvalGates.find((gate) => gate.type === "venue");
      return {
        id: `owner_req_${event.id}`,
        event,
        venueId: venueGate?.venueId ?? adminVenues[index % adminVenues.length]?.id ?? "ven_456",
        venueName: event.venueName,
        status: venueGate?.status ?? "pending",
        setupNeeds: index === 0 ? "80 chairs, patio heaters, check-in table" : "Security plan, late-night setup, insurance",
        conflict: index === 0,
        organizerHistory: index === 0 ? "18 past events, 0 complaints, 4.7 rating" : "New organizer, high-risk signals",
      };
    });
}

export function getInitialOwnerExternalEvents(): OwnerExternalEvent[] {
  return getInitialOwnerEventRequests().map((request) => ({
    id: `external_${request.event.id}`,
    event: request.event,
    venueId: request.venueId,
    venueName: request.venueName,
    readOnlyReason: "Owner can review venue fit, logistics and venue gate only. Event content remains organizer-owned.",
    opsThread: ["Setup plan requested.", "Organizer confirmed arrival 60 minutes before doors."],
  }));
}

export function getInitialOwnerCampaigns(): OwnerPromotionCampaign[] {
  return promotionCampaigns
    .filter((campaign) => campaign.ownerName.includes("Penmar") || campaign.targetEntity.includes("Sunset"))
    .map((campaign, index) => ({
      ...campaign,
      targetType: index % 2 === 0 ? "venue" : "owner_event",
      impressions: 8200 + index * 1300,
      requests: 34 + index * 12,
      riskReview: campaign.riskScore > 50 ? "review_required" : "clear",
    }));
}

export function ownerVenueAgentSet(): AIAgent[] {
  return aiAgents.filter((agent) => agent.scope === "venue");
}

export function validateVenueBasics(draft: VenueEditDraft) {
  return Boolean(
    draft.name.trim() &&
      draft.description.trim().length >= 20 &&
      draft.address.trim() &&
      draft.city.trim() &&
      draft.capacity > 0 &&
      draft.contactEmail.includes("@"),
  );
}

export function validateClaimEvidence(evidence: string[]) {
  return evidence.filter(Boolean).length >= 2;
}

export function canEditVenueProfile(venue: OwnerVenueProfile) {
  return venue.claimStatus === "approved" && !venue.suspended;
}

export function canChangeVenuePolicy(venue: OwnerVenueProfile) {
  return canEditVenueProfile(venue);
}

export function applyVenuePolicyMode(
  venue: OwnerVenueProfile,
  mode: VenuePolicyMode,
): OwnerVenueProfile {
  const nextPolicy: VenuePolicy = {
    ...venue.policy,
    mode,
    allowRecurring: mode !== "no_external_events" && venue.policy.allowRecurring,
  };
  return { ...venue, policy: nextPolicy };
}

export function applyOrganizerAccessDecision(
  request: OwnerOrganizerAccessRequest,
  status: ApprovalStatus | "blocked",
): OwnerOrganizerAccessRequest {
  return {
    ...request,
    status,
    thread: [`Owner decision: ${status}`, ...request.thread],
  };
}

export function applyVenueGateDecision(
  event: AdminEvent,
  decision: string,
  reasonCode?: string,
) {
  return applyGateDecision({
    event,
    role: "venue_owner",
    decision,
    reasonCode,
    decidedBy: "Venue Owner",
  });
}

export function detectScheduleConflicts(items: OwnerCalendarItem[]) {
  return items.filter((item) => item.kind === "request" || item.status === "changes_requested");
}

export function calculateOwnerMetrics({
  venues,
  accessRequests,
  eventRequests,
  conflicts,
}: {
  venues: OwnerVenueProfile[];
  accessRequests: OwnerOrganizerAccessRequest[];
  eventRequests: OwnerEventRequest[];
  conflicts: OwnerCalendarItem[];
}) {
  return {
    verifiedVenues: venues.filter((venue) => venue.claimStatus === "approved").length,
    pendingAccess: accessRequests.filter((request) => request.status === "pending").length,
    pendingEvents: eventRequests.filter((request) => request.status === "pending").length,
    conflicts: conflicts.length,
  };
}

export function createOwnerCampaign(targetEntity: string): OwnerPromotionCampaign {
  return {
    id: `owner_campaign_${Date.now()}`,
    name: `${targetEntity} venue boost`,
    ownerName: "The Penmar Group",
    targetEntity,
    targetType: "venue",
    spend: 180,
    status: "pending",
    riskScore: 28,
    creativeSummary: "Local discovery creative with venue photos, no unsafe claims.",
    impressions: 0,
    requests: 0,
    riskReview: "clear",
  };
}

export function makeOwnerAudit(
  action: string,
  entity: string,
  reasonCode?: string,
): OwnerAuditEntry {
  return {
    id: `owner_local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    actor: "Venue Owner",
    actorRole: "venue_owner",
    action,
    entity,
    reasonCode,
    createdAt: "Только что",
  };
}

export function ownerAuditSeed() {
  return auditLogs.filter((log) => log.actorRole === "venue_owner");
}

export function eventCoverForOwner(index: number) {
  return demoEventCover(index);
}
