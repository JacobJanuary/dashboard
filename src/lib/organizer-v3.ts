import {
  adminEvents,
  adminVenues,
  aiAgents,
  auditLogs,
  participants,
  promotionCampaigns,
} from "./admin-data";
import { canPublishEvent, derivePublicationStatus } from "./admin-guards";
import type {
  AdminEvent,
  AdminVenue,
  AIAgent,
  ApprovalGate,
  AuditLogEntry,
  Participant,
  ParticipantStatus,
  PromotionCampaign,
  VenuePolicy,
} from "./admin-types";
import { organizerEvents } from "./organizer-data";
import { events as publicEvents } from "./data";

export type OrganizerLocationType = AdminEvent["locationType"];

export interface OrganizerEventDraft {
  id: string;
  source: "manual" | "ai";
  event: AdminEvent;
  requiredFieldsConfirmed: boolean;
  missingFields: string[];
}

export interface CreateEventWizardState {
  mode: "manual" | "ai";
  locationType: OrganizerLocationType;
  venueId?: string;
  locationText: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  date: string;
  time: string;
  endTime: string;
  timezone: string;
  capacity: number;
  ticketName: string;
  ticketType: "free" | "paid";
  ticketPrice: number;
  refundPolicy: string;
  rsvpMode: "open" | "approval_required";
  waitlistEnabled: boolean;
  chatEnabled: boolean;
  aiAgentMode: AIAgent["mode"];
  faqQuestion: string;
  faqAnswer: string;
  promotionEnabled: boolean;
  promotionBudget: number;
  publicPreviewChecked: boolean;
}

export interface AIEventDraft {
  title: string;
  description: string;
  schedule: string;
  faq: string[];
  promoCopy: string;
  suggestedTicketPrice: number;
  suggestedCapacity: number;
  suggestedVenueRequirements: string[];
  requiredConfirmations: string[];
}

export interface VenueRequest {
  id: string;
  venueId: string;
  venueName: string;
  organizerName: string;
  status: "draft" | "pending" | "approved" | "rejected" | "changes_requested";
  policyMode: VenuePolicy["mode"];
  message: string;
  lastReply: string;
  requestedAt: string;
}

export interface OrganizerParticipant extends Participant {
  eventTitle: string;
  applicationMessage: string;
}

export interface OrganizerCampaign extends PromotionCampaign {
  channel: "boost" | "referral" | "social" | "search";
  impressions: number;
  saves: number;
  joins: number;
  checkIns: number;
}

export interface OrganizerLedgerEntry {
  id: string;
  eventTitle: string;
  type: "ticket_sale" | "fee" | "refund" | "payout" | "hold";
  amount: number;
  status: "posted" | "pending" | "blocked";
  createdAt: string;
}

export type OrganizerAuditEntry = AuditLogEntry;

export const organizerEventTemplates = [
  {
    id: "tpl_music",
    title: "Sunset mixer",
    description: "Music, light icebreakers, paid tickets, chat enabled.",
    category: "Social / Music",
  },
  {
    id: "tpl_workshop",
    title: "Guided workshop",
    description: "Instructor-led workshop with materials, waitlist and refunds.",
    category: "Workshop",
  },
  {
    id: "tpl_networking",
    title: "Networking breakfast",
    description: "Morning format with sponsor slots and AI FAQ.",
    category: "Networking",
  },
];

export const initialWizardState: CreateEventWizardState = {
  mode: "manual",
  locationType: "external_venue",
  venueId: adminVenues[0]?.id,
  locationText: adminVenues[0]?.name ?? "The Penmar",
  title: "Sunset Singles Mixer",
  description:
    "A relaxed singles mixer with guided icebreakers, light music and a safe participant chat.",
  category: "Social / Music",
  coverImage: "/demo/events/sunset-mixer.png",
  date: "24 May 2026",
  time: "18:00",
  endTime: "21:00",
  timezone: "Los Angeles",
  capacity: 80,
  ticketName: "General Admission",
  ticketType: "paid",
  ticketPrice: 25,
  refundPolicy: "Refunds available until 24 hours before the event.",
  rsvpMode: "approval_required",
  waitlistEnabled: true,
  chatEnabled: true,
  aiAgentMode: "draft_replies",
  faqQuestion: "Can I come alone?",
  faqAnswer: "Yes. The format is designed for solo guests and small group introductions.",
  promotionEnabled: true,
  promotionBudget: 120,
  publicPreviewChecked: false,
};

export const initialVenueRequests: VenueRequest[] = [
  {
    id: "vr_101",
    venueId: "ven_456",
    venueName: "The Penmar",
    organizerName: "The Penmar Events",
    status: "pending",
    policyMode: "moderate_every_event",
    message: "Requesting patio access for a small sunset mixer with setup buffer.",
    lastReply: "Owner asked for setup plan and insurance confirmation.",
    requestedAt: "Today, 11:20",
  },
  {
    id: "vr_102",
    venueId: "ven_789",
    venueName: "Gallery Loft",
    organizerName: "The Penmar Events",
    status: "approved",
    policyMode: "approve_organizers",
    message: "Recurring creative workshop series.",
    lastReply: "Approved for workshops under 70 guests.",
    requestedAt: "Yesterday, 14:05",
  },
];

export const organizerParticipants: OrganizerParticipant[] = participants.map(
  (participant, index) => ({
    ...participant,
    eventTitle: adminEvents[index % adminEvents.length]?.title ?? "Sunset Singles Mixer",
    applicationMessage:
      participant.status === "applied"
        ? "I am coming solo and would love a relaxed table assignment."
        : "Confirmed attendee profile.",
  }),
);

export const organizerCampaigns: OrganizerCampaign[] = promotionCampaigns.map(
  (campaign, index) => ({
    ...campaign,
    channel: index === 0 ? "boost" : index === 1 ? "social" : "referral",
    impressions: 8400 - index * 1800,
    saves: 420 - index * 90,
    joins: 82 - index * 20,
    checkIns: 51 - index * 14,
  }),
);

export const organizerLedgerEntries: OrganizerLedgerEntry[] = [
  {
    id: "ledger_1",
    eventTitle: "Sunset Singles Mixer",
    type: "ticket_sale",
    amount: 1050,
    status: "posted",
    createdAt: "Today, 09:15",
  },
  {
    id: "ledger_2",
    eventTitle: "Sunset Singles Mixer",
    type: "fee",
    amount: -84,
    status: "posted",
    createdAt: "Today, 09:16",
  },
  {
    id: "ledger_3",
    eventTitle: "AI Networking Breakfast",
    type: "payout",
    amount: 541,
    status: "pending",
    createdAt: "Tomorrow",
  },
  {
    id: "ledger_4",
    eventTitle: "Late Night Warehouse Party",
    type: "hold",
    amount: 0,
    status: "blocked",
    createdAt: "Today, 10:04",
  },
];

export function makeOrganizerAudit(
  action: string,
  entity: string,
  reasonCode?: string,
): OrganizerAuditEntry {
  return {
    id: `org_audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    actor: "Организатор",
    actorRole: "organizer",
    action,
    entity,
    reasonCode,
    createdAt: "Только что",
  };
}

export function getInitialOrganizerEvents(): AdminEvent[] {
  const adapted = organizerEvents.slice(0, 2).map<AdminEvent>((event, index) => ({
    id: `legacy_${event.id}`,
    title: event.title,
    organizerName: "The Penmar Events",
    venueName: event.venue,
    locationType: index === 0 ? "external_venue" : "public_place",
    category: event.category,
    date: `${event.date}, ${event.time}`,
    capacity: event.capacity,
    ticketsSold: event.soldTickets,
    revenue: event.revenue,
    refundPolicy: event.refundProtectionEnabled
      ? "Refund protection enabled plus organizer policy."
      : "Organizer policy applies.",
    riskScore: index === 0 ? 22 : 8,
    publicationStatus:
      event.status === "draft"
        ? "draft"
        : event.status === "cancelled"
          ? "cancelled"
          : event.status === "completed"
            ? "completed"
            : "published",
    publicPreviewUrl:
      publicEvents.find((publicEvent) => publicEvent.slug === event.slug)?.id
        ? `/event/${publicEvents.find((publicEvent) => publicEvent.slug === event.slug)?.id}`
        : "/event/1",
    aiSummary:
      "Legacy organizer event adapted into the v3 gate-aware admin model.",
    approvalGates: deriveRequiredGates({
      locationType: index === 0 ? "external_venue" : "public_place",
      venuePolicy: adminVenues[index]?.policy,
      venueId: adminVenues[index]?.id,
    }).map((gate, gateIndex) => ({
      ...gate,
      id: `legacy_${event.id}_${gate.type}_${gateIndex}`,
      status: gate.type === "venue" && index === 0 ? "approved" : gate.status,
      decidedBy: gate.type === "venue" && index === 0 ? "Venue owner" : undefined,
      decidedAt: gate.type === "venue" && index === 0 ? "Yesterday" : undefined,
    })),
  }));

  return [...adminEvents, ...adapted];
}

export function deriveRequiredGates({
  locationType,
  venuePolicy,
  venueId,
}: {
  locationType: OrganizerLocationType;
  venuePolicy?: VenuePolicy;
  venueId?: string;
}): ApprovalGate[] {
  const venueGateRequired =
    locationType === "external_venue" &&
    venuePolicy?.mode === "moderate_every_event";

  const venueGate: ApprovalGate = {
    id: "gate_venue_draft",
    type: "venue",
    actor: "venue_owner",
    status: venueGateRequired ? "pending" : "not_required",
    venueId,
    requiredBecause: venueGateRequired
      ? "External venue policy requires owner approval for every event."
      : "Venue gate is not required for this location policy.",
  };

  const platformGate: ApprovalGate = {
    id: "gate_platform_draft",
    type: "platform",
    actor: "moderator",
    status: "pending",
    requiredBecause: "Platform safety, legality and promotion policy scan.",
  };

  return [venueGate, platformGate];
}

export function validateWizardStep(
  stepSlug: string,
  state: CreateEventWizardState,
) {
  const missing: string[] = [];

  if (stepSlug.includes("hosting") || stepSlug.includes("basics") || stepSlug === "create") {
    if (!state.title.trim()) missing.push("Event name");
    if (!state.description.trim()) missing.push("Short description");
    if (!state.category.trim()) missing.push("Category");
    if (!state.coverImage.trim()) missing.push("Cover image");
  }
  if (stepSlug.includes("where-when") || stepSlug.includes("location") || stepSlug.includes("schedule")) {
    if (!state.locationType) missing.push("Location type");
    if (!state.locationText.trim()) missing.push("Venue, address or link");
    if (!state.date.trim()) missing.push("Date");
    if (!state.time.trim()) missing.push("Start time");
    if (!state.endTime.trim()) missing.push("End time");
    if (!state.timezone.trim()) missing.push("Timezone");
  }
  if (stepSlug.includes("guests-tickets") || stepSlug.includes("tickets") || stepSlug.includes("policy")) {
    if (state.capacity <= 0) missing.push("Capacity");
    if (!state.ticketName.trim()) missing.push("Ticket name");
    if (state.ticketType === "paid" && state.ticketPrice <= 0) missing.push("Ticket price");
    if (!state.refundPolicy.trim()) missing.push("Refund policy");
  }
  if (stepSlug.includes("chat-ai")) {
    if (state.chatEnabled && state.aiAgentMode !== "off" && (!state.faqQuestion.trim() || !state.faqAnswer.trim())) {
      missing.push("FAQ");
    }
  }
  if ((stepSlug.includes("preview") || stepSlug.includes("submit")) && !state.publicPreviewChecked) {
    missing.push("Preview confirmation");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function createDraftEventFromWizard(
  state: CreateEventWizardState,
  venue?: AdminVenue,
): OrganizerEventDraft {
  const gates = deriveRequiredGates({
    locationType: state.locationType,
    venuePolicy: venue?.policy,
    venueId: venue?.id,
  });

  const draftEvent: AdminEvent = {
    id: `evt_manual_${Date.now()}`,
    title: state.title,
    organizerName: "The Penmar Events",
    venueName:
      state.locationType === "online"
        ? state.locationText || "Online"
        : state.locationType === "public_place"
          ? state.locationText || "Public place"
          : venue?.name ?? state.locationText ?? "Selected venue",
    locationType: state.locationType,
    category: state.category,
    date: `${state.date}, ${state.time}-${state.endTime} · ${state.timezone}`,
    capacity: state.capacity,
    ticketsSold: 0,
    revenue: 0,
    refundPolicy: state.refundPolicy,
    riskScore: state.locationType === "external_venue" ? 34 : 12,
    publicationStatus: "draft",
    approvalGates: gates,
    aiSummary: state.chatEnabled
      ? "Manual draft with event AI configured for safe draft replies."
      : "Manual draft without event AI.",
    publicPreviewUrl: "/event/1",
  };

  return {
    id: `draft_${draftEvent.id}`,
    source: "manual",
    event: {
      ...draftEvent,
      publicationStatus: derivePublicationStatus(draftEvent),
    },
    requiredFieldsConfirmed: state.publicPreviewChecked,
    missingFields: validateWizardStep("events/new/submit", state).missing,
  };
}

export function generateAIEventDraft(prompt: string): AIEventDraft {
  const safePrompt = prompt.trim() || "A relaxed singles mixer with music and guided icebreakers.";
  return {
    title: "AI Sunset Social",
    description: `${safePrompt} Includes clear house rules, refund policy, participant chat and organizer review before publication.`,
    schedule: "6:00 PM doors, 6:30 PM welcome, 7:00 PM guided rotations, 8:30 PM open social.",
    faq: [
      "Can I come alone? Yes, the format is designed for solo arrivals.",
      "Is there a refund policy? Refunds are available until 24 hours before the event.",
      "Will AI reply in chat? AI drafts replies for organizer review.",
    ],
    promoCopy:
      "Meet new people at golden hour with light prompts, good music and a low-pressure patio setup.",
    suggestedTicketPrice: 25,
    suggestedCapacity: 72,
    suggestedVenueRequirements: [
      "Outdoor or semi-outdoor area",
      "Setup buffer of 60 minutes",
      "Accessible restrooms",
      "Clear noise policy",
    ],
    requiredConfirmations: [
      "Venue or location",
      "Date and time",
      "Capacity",
      "Price",
      "Refund or attendance rule",
      "AI helper mode",
    ],
  };
}

export function createWizardStateFromAI(
  draft: AIEventDraft,
  base: CreateEventWizardState = initialWizardState,
): CreateEventWizardState {
  return {
    ...base,
    mode: "ai",
    title: draft.title,
    description: draft.description,
    category: base.category || "Social / Music",
    capacity: draft.suggestedCapacity,
    ticketType: draft.suggestedTicketPrice > 0 ? "paid" : "free",
    ticketPrice: draft.suggestedTicketPrice,
    faqQuestion: draft.faq[0]?.replace(/\?.*$/, "?") ?? base.faqQuestion,
    faqAnswer: draft.faq[0]?.includes("?")
      ? draft.faq[0].split("?").slice(1).join("?").trim() || base.faqAnswer
      : base.faqAnswer,
    publicPreviewChecked: false,
  };
}

export function createDraftEventFromAI(
  draft: AIEventDraft,
  confirmed: string[],
  venue?: AdminVenue,
): OrganizerEventDraft {
  const state: CreateEventWizardState = {
    ...initialWizardState,
    mode: "ai",
    title: draft.title,
    description: draft.description,
    capacity: draft.suggestedCapacity,
    ticketPrice: draft.suggestedTicketPrice,
    publicPreviewChecked: confirmed.length >= draft.requiredConfirmations.length,
  };

  const eventDraft = createDraftEventFromWizard(state, venue);
  return {
    ...eventDraft,
    source: "ai",
    requiredFieldsConfirmed: confirmed.length >= draft.requiredConfirmations.length,
    missingFields: draft.requiredConfirmations.filter((item) => !confirmed.includes(item)),
  };
}

export function calculateParticipantCounts(items: OrganizerParticipant[]) {
  return items.reduce<Record<ParticipantStatus | "total", number>>(
    (counts, participant) => {
      counts.total += 1;
      counts[participant.status] += 1;
      return counts;
    },
    {
      total: 0,
      applied: 0,
      approved: 0,
      paid: 0,
      waitlist: 0,
      checked_in: 0,
      no_show: 0,
      refund_requested: 0,
      refunded: 0,
    },
  );
}

export function calculateCampaignFunnel(campaign: OrganizerCampaign) {
  return [
    { label: "Impressions", value: campaign.impressions },
    { label: "Saves", value: campaign.saves },
    { label: "Joins", value: campaign.joins },
    { label: "Check-ins", value: campaign.checkIns },
  ];
}

export function calculateLedgerTotals(entries: OrganizerLedgerEntry[]) {
  return {
    gross: entries
      .filter((entry) => entry.type === "ticket_sale")
      .reduce((sum, entry) => sum + entry.amount, 0),
    fees: Math.abs(
      entries
        .filter((entry) => entry.type === "fee")
        .reduce((sum, entry) => sum + entry.amount, 0),
    ),
    pending: entries
      .filter((entry) => entry.status === "pending")
      .reduce((sum, entry) => sum + entry.amount, 0),
    blocked: entries.filter((entry) => entry.status === "blocked").length,
  };
}

export function organizerAgentSet() {
  return aiAgents.filter((agent) => agent.scope !== "venue");
}

export function canOrganizerPublish(event: AdminEvent) {
  return canPublishEvent(event) && event.publicationStatus !== "cancelled";
}

export function nextBestOrganizerTasks(events: AdminEvent[], requests: VenueRequest[]) {
  return [
    {
      title: "Событие ждёт подтверждения площадки",
      entity: events.find((event) => event.publicationStatus === "blocked_until_gates_pass")?.title ?? events[0]?.title,
      state: "Ждёт подтверждения площадки",
      action: "Посмотреть, что осталось",
    },
    {
      title: "Ответьте владельцу площадки",
      entity: requests.find((request) => request.status === "pending")?.venueName ?? "Запрос площадки",
      state: "Нужно ответить",
      action: "Написать владельцу",
    },
    {
      title: "Проверьте черновики ответов ИИ",
      entity: "Входящие",
      state: "Черновики ИИ",
      action: "Проверить",
    },
    {
      title: "Проверьте выплату",
      entity: "Выплаты",
      state: "Нужны данные",
      action: "Открыть выплаты",
    },
  ];
}

export { auditLogs };
