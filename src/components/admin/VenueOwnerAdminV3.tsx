"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActionToast,
  AgentCard,
  ApprovalTracker,
  AuditLogPanel,
  DecisionPanel,
  MetricCard,
  OperationalStatesPanel,
  PublicPreviewFrame,
  StatusBadge,
  VenuePolicySelector,
  venuePolicyLabels,
} from "./admin-ui";
import { roleBasePaths } from "@/lib/admin-data";
import type {
  AdminScreenDefinition,
  AdminScreenSurface,
  ApprovalStatus,
  VenuePolicyMode,
} from "@/lib/admin-types";
import {
  applyOrganizerAccessDecision,
  applyVenueGateDecision,
  applyVenuePolicyMode,
  calculateOwnerMetrics,
  canChangeVenuePolicy,
  canEditVenueProfile,
  createOwnerCampaign,
  detectScheduleConflicts,
  eventCoverForOwner,
  getInitialOwnerAccessRequests,
  getInitialOwnerCampaigns,
  getInitialOwnerEventRequests,
  getInitialOwnerExternalEvents,
  getInitialOwnerVenues,
  initialVenueDraft,
  makeOwnerAudit,
  ownerAnalyticsSummary,
  ownerAuditSeed,
  ownerCalendarItems,
  ownerClaims,
  ownerInboxThreads,
  ownerTeamMembers,
  ownerVenueAgentSet,
  validateClaimEvidence,
  validateVenueBasics,
  type OwnerAuditEntry,
  type OwnerEventRequest,
  type OwnerOrganizerAccessRequest,
  type OwnerPromotionCampaign,
  type OwnerVenueClaim,
  type OwnerVenueProfile,
  type VenueEditDraft,
} from "@/lib/owner-v3";
import { demoVenueCover } from "@/lib/demo-assets";
import { appendSharedAuditEntry } from "@/lib/shared-audit";
import { cn } from "@/lib/utils";

function activeSlug(screen: AdminScreenDefinition, surface: AdminScreenSurface) {
  return surface.slug || screen.resolvedFromSlug || screen.slug;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

const ownerSurfaceHrefs: Record<string, string> = {
  dashboard: "/owner",
  venues: "/owner/venues",
  "add-claim": "/owner/venues/new",
  "add-venue": "/owner/venues/new/basics",
  "claim-venue": "/owner/venues/claim/search",
  "claim-evidence": "/owner/venues/claim/evidence",
  "claim-status": "/owner/claims/claim_venue_789/status",
  "claim-needs-info": "/owner/claims/claim_needs_info/needs-info",
  "venue-detail": "/owner/venues/ven_456",
  "edit-profile": "/owner/venues/ven_456/edit",
  photos: "/owner/venues/ven_456/photos",
  "address-map": "/owner/venues/ven_456/address",
  "capacity-amenities": "/owner/venues/ven_456/capacity",
  "venue-capacity": "/owner/venues/ven_456/capacity",
  "venue-amenities": "/owner/venues/ven_456/amenities",
  rules: "/owner/venues/ven_456/rules",
  accessibility: "/owner/venues/ven_456/accessibility",
  availability: "/owner/venues/ven_456/availability",
  "access-policy": "/owner/venues/ven_456/access-policy",
  "policy-organizers": "/owner/venues/ven_456/policy/organizers",
  "policy-events": "/owner/venues/ven_456/policy/events",
  "policy-closed": "/owner/venues/ven_456/policy/closed",
  "approved-organizers": "/owner/venues/ven_456/approved-organizers",
  "blocked-organizers": "/owner/venues/ven_456/blocked-organizers",
  "public-preview": "/owner/venues/ven_456/preview",
  "ownership-limited": "/owner/venues/ven_789/limited",
  "organizer-access": "/owner/approvals/organizers",
  "organizer-access-detail": "/owner/approvals/organizers/req_218",
  "event-requests": "/owner/approvals/events",
  "event-request-detail": "/owner/approvals/events/owner_req_evt_123",
  "request-changes": "/owner/approvals/events/owner_req_evt_123/request-changes",
  calendar: "/owner/calendar/month",
  "calendar-week": "/owner/calendar/week",
  conflicts: "/owner/calendar/conflicts",
  "external-events": "/owner/external-events",
  "external-event-detail": "/owner/external-events/external_evt_123",
  "venue-ops-thread": "/owner/external-events/external_evt_123/ops-thread",
  inbox: "/owner/inbox",
  "ai-agent": "/owner/ai-agent",
  "knowledge-base": "/owner/ai-agent/knowledge",
  "ai-agent/test-conversation": "/owner/ai-agent/test",
  promotion: "/owner/promotion",
  "venue-campaign-builder": "/owner/promotion/new",
  analytics: "/owner/analytics",
  "reviews-complaints": "/owner/analytics",
  team: "/owner/team",
  settings: "/owner/settings",
  "audit-log": "/owner/audit",
  "my-events": "/owner/my-events",
  "create-event": "/owner/my-events",
};

function surfaceHref(surface: AdminScreenSurface) {
  return ownerSurfaceHrefs[surface.slug] ?? `${roleBasePaths.venue_owner}/${surface.slug}`;
}

function SectionTabs({
  screen,
  activeSurface,
}: {
  screen: AdminScreenDefinition;
  activeSurface: AdminScreenSurface;
}) {
  if (!screen.tabs || screen.tabs.length <= 1) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3">
        <div className="flex gap-2 overflow-x-auto">
          {screen.tabs.map((surface) => {
            const active = surface.slug === activeSurface.slug;
            return (
              <Link key={surface.slug} href={surfaceHref(surface)} className="shrink-0">
                <button
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-border bg-white text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <span>{surface.title}</span>
                  {surface.prototypeRefs?.[0] && surface.prototypeRefs[0] !== "v4" && (
                    <span className={cn("font-mono text-[10px]", active ? "text-white/70" : "text-[#647084]")}>
                      {surface.prototypeRefs[0]}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "email";
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm disabled:bg-secondary/60"
      />
    </label>
  );
}

function InlineNotice({
  tone = "info",
  title,
  text,
}: {
  tone?: "info" | "warn" | "danger" | "good";
  title: string;
  text: string;
}) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-900",
    good: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return (
    <div className={cn("rounded-xl border p-3 text-sm", classes[tone])}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-xs opacity-85">{text}</p>
    </div>
  );
}

export function VenueOwnerAdminV3({
  screen,
  activeSurface,
}: {
  screen: AdminScreenDefinition;
  activeSurface: AdminScreenSurface;
}) {
  const [venues, setVenues] = useState<OwnerVenueProfile[]>(() => getInitialOwnerVenues());
  const [draft, setDraft] = useState<VenueEditDraft>(initialVenueDraft);
  const [claimEvidence, setClaimEvidence] = useState(["Business registration", "Utility bill"]);
  const [claims, setClaims] = useState<OwnerVenueClaim[]>(ownerClaims);
  const [accessRequests, setAccessRequests] = useState<OwnerOrganizerAccessRequest[]>(() =>
    getInitialOwnerAccessRequests(),
  );
  const [eventRequests, setEventRequests] = useState<OwnerEventRequest[]>(() =>
    getInitialOwnerEventRequests(),
  );
  const [campaigns, setCampaigns] = useState<OwnerPromotionCampaign[]>(() => getInitialOwnerCampaigns());
  const [localAudit, setLocalAudit] = useState<OwnerAuditEntry[]>([]);
  const [toast, setToast] = useState("");
  const [showEdgeStates, setShowEdgeStates] = useState(false);
  const [policyReason, setPolicyReason] = useState("");
  const [reviewReason, setReviewReason] = useState("");

  const pathname = usePathname();
  const currentSlug = activeSlug(screen, activeSurface);
  const isOwnerToday = screen.slug === "dashboard";
  const isOwnerPlaces = screen.slug === "places" && ["/owner/places", "/owner/venues"].includes(pathname);
  const isOwnerRequests = screen.slug === "requests" && pathname === "/owner/requests";
  const selectedVenue = venues[0];
  const selectedClaim = currentSlug === "claim-needs-info" ? claims[1] : claims[0];
  const conflicts = useMemo(() => detectScheduleConflicts(ownerCalendarItems), []);
  const metrics = useMemo(
    () => calculateOwnerMetrics({ venues, accessRequests, eventRequests, conflicts }),
    [venues, accessRequests, eventRequests, conflicts],
  );
  const externalEvents = useMemo(() => getInitialOwnerExternalEvents(), []);

  const audit = (action: string, entity: string, reasonCode?: string) => {
    setToast(`${action}: ${entity}${reasonCode ? ` · ${reasonCode}` : ""}`);
    setLocalAudit((items) => [makeOwnerAudit(action, entity, reasonCode), ...items]);
    appendSharedAuditEntry({ actor: "Владелец площадки", actorRole: "venue_owner", action, entity, reasonCode });
  };

  const updateVenue = (venueId: string, patch: Partial<OwnerVenueProfile>) => {
    setVenues((items) => items.map((venue) => (venue.id === venueId ? { ...venue, ...patch } : venue)));
  };

  const updateVenuePolicy = (venue: OwnerVenueProfile, mode: VenuePolicyMode) => {
    if (!canChangeVenuePolicy(venue)) {
      audit("Denied policy edit", venue.name, "claim_not_verified");
      return;
    }
    if (mode === "no_external_events" && !policyReason) {
      setToast("Switching to No external events requires a reason code.");
      return;
    }
    setVenues((items) =>
      items.map((item) => (item.id === venue.id ? applyVenuePolicyMode(item, mode) : item)),
    );
    audit("Venue policy changed", venue.name, mode === "no_external_events" ? policyReason : mode);
  };

  const decideAccess = (
    request: OwnerOrganizerAccessRequest,
    status: ApprovalStatus | "blocked",
    reasonCode?: string,
  ) => {
    setAccessRequests((items) =>
      items.map((item) => (item.id === request.id ? applyOrganizerAccessDecision(item, status) : item)),
    );
    audit(`Organizer access ${status}`, request.organizerName, reasonCode);
  };

  const decideEventRequest = (request: OwnerEventRequest, decision: string, reasonCode?: string) => {
    const nextEvent = applyVenueGateDecision(request.event, decision, reasonCode);
    const nextStatus = nextEvent.approvalGates.find((gate) => gate.type === "venue")?.status ?? request.status;
    setEventRequests((items) =>
      items.map((item) =>
        item.id === request.id ? { ...item, event: nextEvent, status: nextStatus } : item,
      ),
    );
    audit(`Event request ${nextStatus}`, request.event.title, reasonCode);
  };

  const submitClaim = () => {
    if (!validateClaimEvidence(claimEvidence)) return;
    const claim: OwnerVenueClaim = {
      id: `claim_local_${Date.now()}`,
      venueName: draft.name,
      status: "pending",
      evidence: claimEvidence,
      submittedAt: "Только что",
      moderatorNote: "Claim queued for moderator verification.",
    };
    setClaims((items) => [claim, ...items]);
    audit("Submitted venue claim", draft.name);
  };

  const createCampaign = () => {
    const campaign = createOwnerCampaign(selectedVenue.name);
    setCampaigns((items) => [campaign, ...items]);
    audit("Created venue campaign", campaign.targetEntity);
  };

  const saveDraft = () => {
    if (!validateVenueBasics(draft) || !canEditVenueProfile(selectedVenue)) return;
    updateVenue(selectedVenue.id, {
      name: draft.name,
      description: draft.description,
      address: draft.address,
      city: draft.city,
      capacity: Number(draft.capacity),
      publicNotes: draft.publicNotes,
      contactEmail: draft.contactEmail,
    });
    audit("Updated venue profile", draft.name);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="admin-page-head flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Владелец площадки</span>
            <span>/</span>
            <span>{isOwnerToday || isOwnerPlaces || isOwnerRequests ? "Рабочая зона" : "Simple workspace"}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-normal">
            {isOwnerToday ? "Сегодня" : isOwnerPlaces ? "Площадки" : isOwnerRequests ? "Заявки" : activeSurface.title ?? screen.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {isOwnerToday
              ? "Что требует решения по вашим площадкам."
              : isOwnerPlaces
                ? "Управляйте профилями, правилами доступа и публичным видом площадок."
                : isOwnerRequests
                  ? "Организаторы и события, которые ждут вашего решения."
                : activeSurface.description ?? screen.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isOwnerToday && !isOwnerPlaces && !isOwnerRequests && <Button variant="outline" onClick={() => setShowEdgeStates((value) => !value)}>
            <FileText className="h-4 w-4" />
            Preview states
          </Button>}
          <Link href={isOwnerRequests ? "/owner/calendar" : "/owner/venues/new"}>
            <Button>
              {isOwnerRequests ? <CalendarDays className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isOwnerRequests ? "Открыть календарь" : isOwnerToday || isOwnerPlaces ? "Добавить площадку" : "Add place"}
            </Button>
          </Link>
        </div>
      </div>

      {!isOwnerRequests && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {isOwnerToday ? (
            <>
              <MetricCard label="Мои площадки" value={venues.length} helper="Готово" tone="good" />
              <MetricCard label="Заявки организаторов" value={metrics.pendingAccess} helper="Нужно решение" tone="warn" />
              <MetricCard label="Заявки на события" value={metrics.pendingEvents} helper="Ждёт вас" tone="info" />
              <MetricCard label="Конфликты календаря" value={metrics.conflicts} helper="Конфликт" tone="danger" />
            </>
          ) : isOwnerPlaces ? (
            <>
              <MetricCard label="Мои площадки" value={venues.length} helper="Готово" tone="good" />
              <MetricCard label="Одобрено" value={metrics.verifiedVenues} helper="Можно принимать заявки" tone="good" />
              <MetricCard label="Нужны данные" value={venues.filter((venue) => venue.claimStatus !== "approved").length} helper="Проверьте профиль" tone="warn" />
              <MetricCard label="Правила доступа" value={venues.length} helper="Настроены" tone="info" />
            </>
          ) : (
            <>
              <MetricCard label="Verified places" value={metrics.verifiedVenues} helper="Ready for requests" tone="good" />
              <MetricCard label="Organizer requests" value={metrics.pendingAccess} helper="Need a decision" tone="warn" />
              <MetricCard label="Event requests" value={metrics.pendingEvents} helper="Waiting for you" tone="info" />
              <MetricCard label="Schedule conflicts" value={metrics.conflicts} helper="Need attention" tone="danger" />
            </>
          )}
        </div>
      )}

      {!isOwnerToday && !isOwnerPlaces && !isOwnerRequests && <SectionTabs screen={screen} activeSurface={activeSurface} />}
      {!isOwnerToday && !isOwnerPlaces && !isOwnerRequests && showEdgeStates && (
        <OperationalStatesPanel partialData={screen.partialData ?? activeSurface.partialData} permissionRole="venue_owner" />
      )}

      {renderOwnerSurface({
        screen,
        pathname,
        currentSlug,
        venues,
        selectedVenue,
        draft,
        setDraft,
        claimEvidence,
        setClaimEvidence,
        claims,
        selectedClaim,
        accessRequests,
        eventRequests,
        conflicts,
        externalEvents,
        campaigns,
        policyReason,
        setPolicyReason,
        reviewReason,
        setReviewReason,
        audit,
        saveDraft,
        submitClaim,
        updateVenue,
        updateVenuePolicy,
        decideAccess,
        decideEventRequest,
        createCampaign,
        localAudit,
      })}

      <ActionToast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

type OwnerViewProps = {
  screen: AdminScreenDefinition;
  pathname: string;
  currentSlug: string;
  venues: OwnerVenueProfile[];
  selectedVenue: OwnerVenueProfile;
  draft: VenueEditDraft;
  setDraft: (draft: VenueEditDraft) => void;
  claimEvidence: string[];
  setClaimEvidence: (evidence: string[]) => void;
  claims: OwnerVenueClaim[];
  selectedClaim: OwnerVenueClaim;
  accessRequests: OwnerOrganizerAccessRequest[];
  eventRequests: OwnerEventRequest[];
  conflicts: ReturnType<typeof detectScheduleConflicts>;
  externalEvents: ReturnType<typeof getInitialOwnerExternalEvents>;
  campaigns: OwnerPromotionCampaign[];
  policyReason: string;
  setPolicyReason: (value: string) => void;
  reviewReason: string;
  setReviewReason: (value: string) => void;
  audit: (action: string, entity: string, reasonCode?: string) => void;
  saveDraft: () => void;
  submitClaim: () => void;
  updateVenue: (venueId: string, patch: Partial<OwnerVenueProfile>) => void;
  updateVenuePolicy: (venue: OwnerVenueProfile, mode: VenuePolicyMode) => void;
  decideAccess: (
    request: OwnerOrganizerAccessRequest,
    status: ApprovalStatus | "blocked",
    reasonCode?: string,
  ) => void;
  decideEventRequest: (request: OwnerEventRequest, decision: string, reasonCode?: string) => void;
  createCampaign: () => void;
  localAudit: OwnerAuditEntry[];
};

function renderOwnerSurface(props: OwnerViewProps) {
  const { screen, currentSlug } = props;
  if (screen.slug === "dashboard") return <OwnerTodayView {...props} />;
  if (
    screen.slug === "places" ||
    screen.slug === "venues" ||
    [
      "venue-detail",
      "edit-profile",
      "photos",
      "address-map",
      "capacity-amenities",
      "venue-capacity",
      "venue-amenities",
      "rules",
      "accessibility",
      "availability",
      "access-policy",
      "policy-organizers",
      "policy-events",
      "policy-closed",
      "approved-organizers",
      "blocked-organizers",
      "public-preview",
      "ownership-limited",
    ].includes(currentSlug)
  ) {
    return <OwnerVenuesView {...props} />;
  }
  if (screen.slug === "add-claim" || ["add-venue", "claim-venue", "claim-status", "claim-evidence", "claim-needs-info"].includes(currentSlug)) {
    return <OwnerClaimView {...props} />;
  }
  if (screen.slug === "requests" || screen.slug === "organizer-access" || ["event-requests", "event-request-detail", "request-changes", "organizer-access-detail", "approved-organizers", "blocked-organizers"].includes(currentSlug)) {
    return <OwnerApprovalsView {...props} />;
  }
  if (screen.slug === "calendar") return <OwnerCalendarView {...props} />;
  if (screen.slug === "external-events") return <OwnerExternalEventsView {...props} />;
  if (screen.slug === "inbox") return <OwnerInboxView {...props} />;
  if (screen.slug === "ai-agent") return <OwnerAIAgentView {...props} />;
  if (screen.slug === "promotion") return <OwnerPromotionView {...props} />;
  if (screen.slug === "analytics") return <OwnerAnalyticsView />;
  if (screen.slug === "my-events") return <OwnerMyEventsView {...props} />;
  if (screen.slug === "team" || screen.slug === "settings") return <OwnerTeamSettingsView {...props} />;
  if (screen.slug === "audit-log") return <AuditLogPanel logs={ownerAuditSeed()} localLogs={props.localAudit} />;
  return <OwnerTodayView {...props} />;
}

function OwnerTodayView({
  venues,
  accessRequests,
  eventRequests,
  conflicts,
}: OwnerViewProps) {
  const pendingAccess = accessRequests.find((request) => request.status === "pending");
  const pendingEvent = eventRequests.find((request) => request.status === "pending");
  const calendarConflict = conflicts[0];
  const venueNeedsData = venues.find((venue) => venue.claimStatus !== "approved") ?? venues[1] ?? venues[0];
  const actionItems = [
    {
      title: "Организатор ждёт доступа к площадке",
      description: `${pendingAccess?.organizerName ?? "Организатор"} хочет проводить события в ${pendingAccess?.venueName ?? venues[0]?.name ?? "вашей площадке"}.`,
      status: "Нужно решение",
      action: "Рассмотреть",
      secondaryActions: ["Написать организатору", "Отклонить"],
      href: "/owner/requests",
      icon: Users,
      tone: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "Событие ждёт вашего решения",
      description: `${pendingEvent?.event.title ?? "Новое событие"} просит дату в ${pendingEvent?.venueName ?? venues[0]?.name ?? "площадке"}.`,
      status: "Ждёт вас",
      action: "Одобрить",
      secondaryActions: ["Написать организатору", "Отклонить"],
      href: "/owner/requests",
      icon: ShieldCheck,
      tone: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      title: "Конфликт в календаре",
      description: `${calendarConflict?.title ?? "Запрос на событие"} пересекается с другим бронированием.`,
      status: "Конфликт",
      action: "Открыть календарь",
      href: "/owner/calendar",
      icon: CalendarDays,
      tone: "bg-red-50 text-red-800 border-red-200",
    },
    {
      title: "Площадке нужны данные",
      description: `${venueNeedsData?.name ?? "Площадке"} нужно добавить или подтвердить данные перед работой с заявками.`,
      status: "Нужны данные",
      action: "Добавить данные",
      href: "/owner/places",
      icon: MapPin,
      tone: "bg-slate-50 text-slate-700 border-slate-200",
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Что требует внимания сегодня</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-2">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <Badge variant="outline" className={item.tone}>{item.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      <Link href={item.href}>
                        <Button size="sm" variant="outline" className="mt-3">
                          {item.action}
                        </Button>
                      </Link>
                      {item.secondaryActions && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.secondaryActions.map((action) => (
                            <Button key={action} size="sm" variant="ghost" className="h-8 px-2 text-xs">
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/owner/requests" className="block">
            <Button className="w-full justify-start">
              <ShieldCheck className="h-4 w-4" />
              Проверить заявки
            </Button>
          </Link>
          <Link href="/owner/calendar" className="block">
            <Button variant="outline" className="w-full justify-start">
              <CalendarDays className="h-4 w-4" />
              Открыть календарь
            </Button>
          </Link>
          <Link href="/owner/venues/new" className="block">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4" />
              Добавить площадку
            </Button>
          </Link>
          <InlineNotice
            title="Что решаете вы"
            text="Вы решаете, кто и когда может проводить события в ваших площадках. Организаторы управляют содержанием своих событий."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ownerVenueStatusLabel(status: OwnerVenueProfile["claimStatus"]) {
  if (status === "approved") return "Одобрено";
  if (status === "pending") return "Ждёт проверки";
  if (status === "rejected") return "Скрыто";
  return "Нужны данные";
}

function ownerVenueStatusClass(status: OwnerVenueProfile["claimStatus"]) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "pending") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "rejected") return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function ownerAccessRuleLabel(mode: VenuePolicyMode) {
  if (mode === "approve_organizers") return "Я одобряю организаторов один раз";
  if (mode === "moderate_every_event") return "Я проверяю каждое внешнее событие";
  return "Закрыто для внешних событий";
}

function ownerVenueAddressLabel(address: string) {
  if (address.toLowerCase().startsWith("hidden address until")) return "Адрес скрыт до подтверждения";
  return address;
}

function OwnerVenuesView(props: OwnerViewProps) {
  const {
    currentSlug,
    venues,
    selectedVenue,
    draft,
    setDraft,
    policyReason,
    setPolicyReason,
    accessRequests,
    updateVenuePolicy,
    saveDraft,
    audit,
  } = props;

  if (currentSlug === "venues" || currentSlug === "places") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Площадки</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {venues.map((venue) => {
            const isApproved = venue.claimStatus === "approved";
            const isClosedToExternalEvents = venue.policy.mode === "no_external_events";
            return (
              <div key={venue.id} className="rounded-xl border border-border bg-white p-4">
                <div className="relative h-36 overflow-hidden rounded-xl">
                  <Image src={venue.coverImage} alt={venue.name} fill className="object-cover" sizes="360px" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{venue.name}</h3>
                    <p className="text-xs text-muted-foreground">{ownerVenueAddressLabel(venue.address)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Вместимость: {venue.capacity}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", ownerVenueStatusClass(venue.claimStatus))}>
                      {ownerVenueStatusLabel(venue.claimStatus)}
                    </span>
                    {isClosedToExternalEvents && (
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        Скрыто
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{ownerAccessRuleLabel(venue.policy.mode)}</Badge>
                  <Badge variant="outline">Сегодня: {venue.utilizationToday}%</Badge>
                  <Badge variant="outline">★ {venue.rating}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/owner/venues/${venue.id}`}>
                    <Button size="sm">Открыть</Button>
                  </Link>
                  {isApproved ? (
                    <>
                      <Link href={`/owner/venues/${venue.id}/edit`}>
                        <Button size="sm" variant="outline">Изменить</Button>
                      </Link>
                      <Link href={`/owner/venues/${venue.id}/access-policy`}>
                        <Button size="sm" variant="outline">Правила доступа</Button>
                      </Link>
                      <Link href={`/owner/venues/${venue.id}/preview`}>
                        <Button size="sm" variant="outline">Предпросмотр</Button>
                      </Link>
                    </>
                  ) : (
                    <Link href={`/owner/venues/${venue.id}/limited`}>
                      <Button size="sm" variant="outline">Добавить данные</Button>
                    </Link>
                  )}
                </div>
                {!isApproved && (
                  <div className="mt-4">
                    <InlineNotice tone="warn" title="Площадке нужны данные" text="Добавьте недостающие данные, чтобы открыть редактирование и заявки." />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  if (currentSlug === "ownership-limited") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Ownership limited</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This venue is visible but profile edits, access policy and event approvals are disabled until the claim is verified.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button disabled>Edit profile</Button>
                  <Button disabled variant="outline">Change policy</Button>
                  <Link href="/owner/claims/claim_venue_789/status">
                    <Button variant="outline">View claim</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <OperationalStatesPanel permissionRole="venue_owner" partialData />
      </div>
    );
  }

  if (currentSlug === "public-preview") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <VenueOverviewCard venue={selectedVenue} />
        <PublicPreviewFrame href={`/venue/${selectedVenue.id}`} />
      </div>
    );
  }

  const canEdit = canEditVenueProfile(selectedVenue);
  const showPolicy =
    currentSlug === "access-policy" ||
    currentSlug === "policy-organizers" ||
    currentSlug === "policy-events" ||
    currentSlug === "policy-closed";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{selectedVenue.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{selectedVenue.address} · {selectedVenue.hours}</p>
            </div>
            <StatusBadge value={selectedVenue.claimStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {!canEdit && (
            <InlineNotice tone="warn" title="Edits locked" text="Venue profile and policy actions require approved ownership claim." />
          )}
          {currentSlug === "venue-detail" && <VenueOverviewCard venue={selectedVenue} compact />}
          {currentSlug === "edit-profile" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Venue name" value={draft.name} disabled={!canEdit} onChange={(value) => setDraft({ ...draft, name: value })} />
              <Field label="City" value={draft.city} disabled={!canEdit} onChange={(value) => setDraft({ ...draft, city: value })} />
              <Field label="Address" value={draft.address} disabled={!canEdit} onChange={(value) => setDraft({ ...draft, address: value })} />
              <Field label="Capacity" type="number" value={draft.capacity} disabled={!canEdit} onChange={(value) => setDraft({ ...draft, capacity: Number(value) })} />
              <Field label="Contact email" type="email" value={draft.contactEmail} disabled={!canEdit} onChange={(value) => setDraft({ ...draft, contactEmail: value })} />
              <Field label="Public notes" value={draft.publicNotes} disabled={!canEdit} onChange={(value) => setDraft({ ...draft, publicNotes: value })} />
              <label className="grid gap-1.5 text-sm md:col-span-2">
                <span className="font-medium">Description</span>
                <textarea
                  rows={4}
                  disabled={!canEdit}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:bg-secondary/60"
                />
              </label>
              <Button disabled={!canEdit || !validateVenueBasics(draft)} onClick={saveDraft}>
                Save venue profile
              </Button>
            </div>
          )}
          {currentSlug === "photos" && (
            <div className="grid gap-3 md:grid-cols-3">
              {selectedVenue.photos.map((photo, index) => (
                <div key={`${photo}-${index}`} className="relative h-40 overflow-hidden rounded-xl border border-border">
                  <Image src={photo} alt={`${selectedVenue.name} media ${index + 1}`} fill className="object-cover" sizes="320px" />
                </div>
              ))}
              <button className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                Add media
              </button>
            </div>
          )}
          {currentSlug === "address-map" && (
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="flex h-64 items-center justify-center rounded-xl bg-[#eef2f7] text-sm text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                Map QA placeholder · exact address visible after approval
              </div>
              <div className="space-y-3">
                <InlineNotice title="Visibility" text="Organizers see address, setup entrance and parking. Guests see public address after ticket approval." />
                <Button onClick={() => audit("Updated venue map visibility", selectedVenue.name)}>Save map visibility</Button>
              </div>
            </div>
          )}
          {(currentSlug === "venue-capacity" || currentSlug === "capacity-amenities") && (
            <CapacityAmenities venue={selectedVenue} mode="capacity" />
          )}
          {currentSlug === "venue-amenities" && <CapacityAmenities venue={selectedVenue} mode="amenities" />}
          {currentSlug === "rules" && (
            <RulesList
              title="Rules & restrictions"
              items={[...selectedVenue.rules, ...selectedVenue.policy.restrictedCategories.map((item) => `Restricted: ${item}`)]}
              onSave={() => audit("Updated venue rules", selectedVenue.name, "house_rules")}
            />
          )}
          {currentSlug === "accessibility" && (
            <RulesList title="Accessibility" items={selectedVenue.accessibility} onSave={() => audit("Updated accessibility", selectedVenue.name)} />
          )}
          {currentSlug === "availability" && (
            <RulesList
              title="Hours & blackout dates"
              items={[selectedVenue.hours, ...selectedVenue.blackoutDates.map((date) => `Blackout: ${date}`)]}
              onSave={() => audit("Updated availability", selectedVenue.name, "calendar_hold")}
            />
          )}
          {showPolicy && (
            <div className="space-y-4">
              <InlineNotice
                tone={selectedVenue.policy.mode === "no_external_events" ? "danger" : "info"}
                title={venuePolicyLabels[selectedVenue.policy.mode]}
                text="Access rules decide whether organizers are approved once, every event is reviewed, or external events are closed."
              />
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Reason code for sensitive policy changes</span>
                <select
                  value={policyReason}
                  onChange={(event) => setPolicyReason(event.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select reason</option>
                  <option value="owner_policy_change">owner_policy_change</option>
                  <option value="safety_or_capacity">safety_or_capacity</option>
                  <option value="external_events_paused">external_events_paused</option>
                </select>
              </label>
              <VenuePolicySelector
                policy={selectedVenue.policy}
                onChange={(policy) => updateVenuePolicy(selectedVenue, policy.mode)}
              />
              {currentSlug === "policy-organizers" && (
                <InlineNotice title="Approve organizers" text={`${accessRequests.length} organizers are evaluated once, then can create without event-by-event owner review.`} />
              )}
              {currentSlug === "policy-events" && (
                <InlineNotice tone="warn" title="I approve every external event" text="Every external event waits for your review before it can use this place." />
              )}
              {currentSlug === "policy-closed" && (
                <InlineNotice tone="danger" title="No external events" text="External organizers see this venue as unavailable and pending requests are blocked." />
              )}
            </div>
          )}
          {currentSlug === "approved-organizers" && <OrganizerAccessList requests={accessRequests.filter((request) => request.status === "approved")} />}
          {currentSlug === "blocked-organizers" && <OrganizerAccessList requests={accessRequests.filter((request) => request.status === "blocked" || request.status === "rejected")} />}
        </CardContent>
      </Card>
      <div className="space-y-6">
        <VenueOverviewCard venue={selectedVenue} compact />
        <AuditLogPanel logs={ownerAuditSeed()} />
      </div>
    </div>
  );
}

function VenueOverviewCard({ venue, compact = false }: { venue: OwnerVenueProfile; compact?: boolean }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className={cn("grid gap-4", !compact && "lg:grid-cols-[300px_1fr]")}>
          <div className="relative h-44 overflow-hidden rounded-xl">
            <Image src={venue.coverImage} alt={venue.name} fill className="object-cover" sizes="420px" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold">{venue.name}</h3>
              <StatusBadge value={venue.claimStatus} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{venue.description}</p>
            <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <span>Capacity: {venue.capacity}</span>
              <span>Policy: {venuePolicyLabels[venue.policy.mode]}</span>
              <span>Setup buffer: {venue.policy.setupBufferMinutes} min</span>
              <span>Hours: {venue.hours}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CapacityAmenities({ venue, mode }: { venue: OwnerVenueProfile; mode: "capacity" | "amenities" }) {
  if (mode === "capacity") {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {["Seated", "Standing", "Workshop"].map((layout, index) => (
          <div key={layout} className="rounded-xl border border-border p-4">
            <p className="font-semibold">{layout}</p>
            <p className="mt-2 text-2xl font-bold">{Math.max(12, venue.capacity - index * 24)}</p>
            <p className="text-xs text-muted-foreground">Max guests with setup buffer</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {venue.amenities.map((amenity) => (
        <Badge key={amenity} variant="secondary" className="px-3 py-2">
          {amenity}
        </Badge>
      ))}
    </div>
  );
}

function RulesList({ title, items, onSave }: { title: string; items: string[]; onSave: () => void }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-border p-3 text-sm">
            {item}
          </div>
        ))}
      </div>
      <Button onClick={onSave}>Save changes</Button>
    </div>
  );
}

function OwnerClaimView({
  currentSlug,
  draft,
  setDraft,
  claimEvidence,
  setClaimEvidence,
  selectedClaim,
  submitClaim,
}: OwnerViewProps) {
  const evidenceValid = validateClaimEvidence(claimEvidence);
  const basicsValid = validateVenueBasics(draft);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add / claim venue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {currentSlug === "claim-status" && (
            <InlineNotice title="Claim verification status" text={`${selectedClaim.venueName}: ${selectedClaim.status}. ${selectedClaim.moderatorNote}`} />
          )}
          {currentSlug === "claim-needs-info" && (
            <InlineNotice tone="warn" title="Needs more info" text={selectedClaim.moderatorNote ?? "Moderator requested more evidence."} />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Venue name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
            <Field label="City" value={draft.city} onChange={(value) => setDraft({ ...draft, city: value })} />
            <Field label="Address" value={draft.address} onChange={(value) => setDraft({ ...draft, address: value })} />
            <Field label="Capacity" type="number" value={draft.capacity} onChange={(value) => setDraft({ ...draft, capacity: Number(value) })} />
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Search existing venue</p>
                <p className="text-xs text-muted-foreground">Duplicate search before manual add or claim.</p>
              </div>
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            {["AUM Sound Center", "Gallery Loft", "The Working Capitol"].map((venue) => (
              <div key={venue} className="flex items-center justify-between border-t border-border py-3 text-sm">
                <span>{venue}</span>
                <Button size="sm" variant="outline">Claim</Button>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">Evidence upload</p>
            <div className="mt-3 grid gap-2">
              {claimEvidence.map((item, index) => (
                <input
                  key={index}
                  value={item}
                  onChange={(event) =>
                    setClaimEvidence(claimEvidence.map((value, itemIndex) => (itemIndex === index ? event.target.value : value)))
                  }
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              ))}
            </div>
            <Button className="mt-3" variant="outline" onClick={() => setClaimEvidence([...claimEvidence, ""])}>
              Add evidence
            </Button>
          </div>
          <Button disabled={!basicsValid || !evidenceValid} onClick={submitClaim}>
            Submit claim
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <InlineNotice
          tone={evidenceValid ? "good" : "warn"}
          title={evidenceValid ? "Evidence ready" : "Evidence required"}
          text="Claim submission requires at least two ownership documents or signals."
        />
        <OperationalStatesPanel permissionRole="venue_owner" partialData />
      </div>
    </div>
  );
}

const ownerRequestFilters = ["Все", "Организаторы", "События", "Ждут решения", "Нужны правки", "Одобрено"];

type OwnerRequestStatus = ApprovalStatus | "blocked";

function ownerRequestStatusLabel(status: OwnerRequestStatus, conflict = false) {
  if (conflict && status === "pending") return "Конфликт времени";
  if (status === "pending") return "Ждёт решения";
  if (status === "changes_requested" || status === "escalated") return "Нужны правки";
  if (status === "approved" || status === "not_required") return "Одобрено";
  return "Отклонено";
}

function ownerRequestStatusClass(status: OwnerRequestStatus, conflict = false) {
  if (conflict && status === "pending") return "border-red-200 bg-red-50 text-red-800";
  if (status === "pending") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "changes_requested" || status === "escalated") return "border-blue-200 bg-blue-50 text-blue-800";
  if (status === "approved" || status === "not_required") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function ownerSetupNeedsText(text: string) {
  if (text.includes("80 chairs")) return "80 стульев, обогреватели для патио, стол регистрации";
  if (text.includes("Security plan")) return "План охраны, поздний монтаж, страховка";
  return text;
}

function ownerOrganizerHistoryText(text: string) {
  if (text.includes("18 past events")) return "18 прошлых событий, 0 жалоб, рейтинг 4.7";
  if (text.includes("New organizer")) return "Новый организатор, нужны уточнения по безопасности";
  return text;
}

function OwnerRequestsInbox({
  accessRequests,
  eventRequests,
}: {
  accessRequests: OwnerOrganizerAccessRequest[];
  eventRequests: OwnerEventRequest[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ownerRequestFilters.map((filter) => (
          <Button key={filter} size="sm" variant={filter === "Все" ? "default" : "outline"}>
            {filter}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {accessRequests.map((request) => (
          <Card key={request.id} className="border-0 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="secondary">Организатор</Badge>
                  <h3 className="mt-3 text-lg font-bold">{request.organizerName}</h3>
                  <p className="text-sm text-muted-foreground">{request.venueName}</p>
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", ownerRequestStatusClass(request.status))}>
                  {ownerRequestStatusLabel(request.status)}
                </span>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Рейтинг и опыт</p>
                  <p className="mt-1 font-medium">
                    {request.rating} рейтинг · {request.pastEvents} событий · {request.complaintCount} жалоб
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Когда пришла заявка</p>
                  <p className="mt-1 font-medium">{request.requestedAt}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="text-xs text-muted-foreground">Сообщение организатора</p>
                <p className="mt-1">{request.note}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Рассмотреть</Button>
                <Button size="sm" variant="outline">Одобрить</Button>
                <Button size="sm" variant="outline">Отклонить</Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4" />
                  Написать
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {eventRequests.map((request) => (
          <Card key={request.id} className="border-0 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="secondary">Событие</Badge>
                  <h3 className="mt-3 text-lg font-bold">{request.event.title}</h3>
                  <p className="text-sm text-muted-foreground">{request.event.organizerName} · {request.venueName}</p>
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", ownerRequestStatusClass(request.status, request.conflict))}>
                  {ownerRequestStatusLabel(request.status, request.conflict)}
                </span>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Дата и время</p>
                  <p className="mt-1 font-medium">{request.event.date}</p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Гости / вместимость</p>
                  <p className="mt-1 font-medium">{request.event.ticketsSold} / {request.event.capacity}</p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Что нужно подготовить</p>
                  <p className="mt-1 font-medium">{ownerSetupNeedsText(request.setupNeeds)}</p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Опыт организатора</p>
                  <p className="mt-1 font-medium">{ownerOrganizerHistoryText(request.organizerHistory)}</p>
                </div>
              </div>
              {request.conflict && (
                <InlineNotice tone="warn" title="Конфликт времени" text="Запрос пересекается с другим бронированием или подготовкой площадки." />
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Рассмотреть</Button>
                <Button size="sm" variant="outline">Одобрить</Button>
                <Button size="sm" variant="outline">Запросить правки</Button>
                <Button size="sm" variant="outline">Отклонить</Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4" />
                  Написать
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OwnerApprovalsView({
  pathname,
  currentSlug,
  accessRequests,
  eventRequests,
  reviewReason,
  setReviewReason,
  decideAccess,
  decideEventRequest,
}: OwnerViewProps) {
  if (pathname === "/owner/requests") {
    return <OwnerRequestsInbox accessRequests={accessRequests} eventRequests={eventRequests} />;
  }

  const request = accessRequests[0];
  const eventRequest = eventRequests[0];
  const showEvents =
    currentSlug === "requests" ||
    currentSlug === "event-requests" ||
    currentSlug === "event-request-detail" ||
    currentSlug === "request-changes";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{showEvents ? "Event requests" : "Organizer access requests"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showEvents ? (
            <>
              <OrganizerAccessList requests={accessRequests} />
              {(currentSlug === "organizer-access-detail" || currentSlug === "organizer-access") && (
                <div className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{request.organizerName}</p>
                      <p className="text-sm text-muted-foreground">{request.venueName} · {request.pastEvents} past events · {request.complaintCount} complaints</p>
                    </div>
                    <StatusBadge value={request.status} />
                  </div>
                  <p className="mt-3 text-sm">{request.note}</p>
                  <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                    {request.thread.map((message) => (
                      <span key={message} className="rounded-lg bg-secondary/50 px-3 py-2">{message}</span>
                    ))}
                  </div>
                  <label className="mt-4 grid gap-1.5 text-sm">
                    <span className="font-medium">Reason code</span>
                    <select value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                      <option value="">Required for reject/block/revoke</option>
                      <option value="organizer_risk">organizer_risk</option>
                      <option value="missing_setup_plan">missing_setup_plan</option>
                      <option value="venue_policy_conflict">venue_policy_conflict</option>
                    </select>
                  </label>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => decideAccess(request, "approved")}>Approve</Button>
                    <Button variant="outline" onClick={() => decideAccess(request, "changes_requested", "owner_question")}>Ask question</Button>
                    <Button variant="outline" disabled={!reviewReason} onClick={() => decideAccess(request, "rejected", reviewReason)}>Reject</Button>
                    <Button variant="destructive" disabled={!reviewReason} onClick={() => decideAccess(request, "blocked", reviewReason)}>Block</Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <EventRequestTable requests={eventRequests} />
              <div className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{eventRequest.event.title}</p>
                    <p className="text-sm text-muted-foreground">{eventRequest.venueName} · {eventRequest.event.date}</p>
                  </div>
                  <StatusBadge value={eventRequest.status} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <InlineNotice tone={eventRequest.conflict ? "warn" : "good"} title="Schedule" text={eventRequest.conflict ? "Overlap with owner hold." : "No conflicts found."} />
                  <InlineNotice title="Setup needs" text={eventRequest.setupNeeds} />
                  <InlineNotice title="Organizer history" text={eventRequest.organizerHistory} />
                </div>
                {currentSlug === "request-changes" && (
                  <InlineNotice tone="warn" title="Request changes drawer" text="Owner must specify venue-scoped changes. Event content edits remain organizer-owned." />
                )}
                <div className="mt-4">
                  <ApprovalTracker event={eventRequest.event} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <DecisionPanel
        role="venue_owner"
        title={showEvents ? "Event request decision" : "Organizer request decision"}
        destructive
        action={showEvents ? "approval:venue_gate" : "venue:approve_organizer"}
        resource={{ ownsVenue: true }}
        onDecision={(decision, reason) =>
          showEvents ? decideEventRequest(eventRequest, decision, reason) : decideAccess(request, decision === "Одобрить" ? "approved" : "changes_requested", reason)
        }
      />
    </div>
  );
}

function OrganizerAccessList({ requests }: { requests: OwnerOrganizerAccessRequest[] }) {
  if (requests.length === 0) {
    return <InlineNotice title="Empty state" text="No organizers in this list yet." />;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Organizer</th>
            <th className="px-3 py-2">Venue</th>
            <th className="px-3 py-2">Risk</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="border-t border-border">
              <td className="px-3 py-3 font-medium">{request.organizerName}</td>
              <td className="px-3 py-3">{request.venueName}</td>
              <td className="px-3 py-3">{request.rating} rating · {request.complaintCount} complaints</td>
              <td className="px-3 py-3"><StatusBadge value={request.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventRequestTable({ requests }: { requests: OwnerEventRequest[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Event</th>
            <th className="px-3 py-2">Venue</th>
            <th className="px-3 py-2">Capacity</th>
            <th className="px-3 py-2">Decision</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="border-t border-border">
              <td className="px-3 py-3 font-medium">{request.event.title}</td>
              <td className="px-3 py-3">{request.venueName}</td>
              <td className="px-3 py-3">{request.event.capacity}</td>
              <td className="px-3 py-3"><StatusBadge value={request.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OwnerCalendarView({ currentSlug, conflicts, audit }: OwnerViewProps) {
  const items = currentSlug === "conflicts" ? conflicts : ownerCalendarItems;
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">
            {currentSlug === "calendar-week" ? "Week schedule" : currentSlug === "conflicts" ? "Schedule conflicts" : "Month calendar"}
          </CardTitle>
          <Button variant="outline" onClick={() => audit("Exported venue calendar", "Owned venues")}>Export</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.venueName} · {item.startsAt} - {item.endsAt}</p>
              </div>
              <Badge variant="outline">{item.kind}</Badge>
            </div>
            {currentSlug === "conflicts" && (
              <InlineNotice tone="warn" title="Recommended action" text="Request a time change or increase setup buffer before approving this request." />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function OwnerExternalEventsView({ currentSlug, externalEvents, audit }: OwnerViewProps) {
  const selected = externalEvents[0];
  if (currentSlug === "venue-ops-thread") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Venue ops thread</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected.opsThread.map((message, index) => (
              <div key={message} className={cn("max-w-[78%] rounded-xl p-3 text-sm", index % 2 ? "ml-auto bg-blue-50 text-blue-950" : "bg-secondary")}>
                {message}
              </div>
            ))}
            <div className="flex gap-2">
              <input placeholder="Message organizer about setup, entrance, capacity..." className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
              <Button onClick={() => audit("Sent ops thread message", selected.event.title)}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
        <InlineNotice title="Privacy boundary" text="This is not participant chat. It is organizer-owner operational communication only." />
      </div>
    );
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">External events in owned venues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {externalEvents.map((event, index) => (
            <div key={event.id} className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-[120px_1fr_auto]">
              <div className="relative h-24 overflow-hidden rounded-lg">
                <Image src={eventCoverForOwner(index)} alt={event.event.title} fill className="object-cover" sizes="160px" />
              </div>
              <div>
                <p className="font-semibold">{event.event.title}</p>
                <p className="text-sm text-muted-foreground">{event.venueName} · {event.event.date}</p>
                <p className="mt-2 text-xs text-muted-foreground">{event.readOnlyReason}</p>
              </div>
              <Link href={`/owner/external-events/${event.id}/ops-thread`}>
                <Button variant="outline">Ops</Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
      <InlineNotice title="Read-only content" text="Owner cannot edit organizer title, price, tickets, refund policy or participant operations." />
    </div>
  );
}

function OwnerInboxView({ audit }: OwnerViewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Venue inbox</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {ownerInboxThreads.map((thread) => (
            <div key={thread.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{thread.title}</p>
                  <p className="text-sm text-muted-foreground">{thread.venueName} · {thread.kind}</p>
                </div>
                <Badge variant={thread.unread ? "default" : "secondary"}>{thread.unread} unread</Badge>
              </div>
              <p className="mt-3 text-sm">{thread.lastMessage}</p>
              <p className="mt-2 text-xs text-muted-foreground">{thread.privacyBoundary}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea className="h-28 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue="Thanks. Please send the setup plan and insurance certificate before we approve this request." />
          <Button onClick={() => audit("Sent venue inbox reply", "Organizer thread")}>
            <MessageSquare className="h-4 w-4" />
            Send reply
          </Button>
          <InlineNotice tone="warn" title="Participant chat hidden" text="Venue owner only sees operational threads unless they are also the event organizer." />
        </CardContent>
      </Card>
    </div>
  );
}

function OwnerAIAgentView({ currentSlug, audit }: OwnerViewProps) {
  const agents = ownerVenueAgentSet();
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {currentSlug === "knowledge-base" ? "Venue knowledge base" : currentSlug === "ai-agent/test-conversation" ? "AI test conversation" : "Venue AI agent"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSlug === "knowledge-base" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {["Parking: lot behind venue after 18:00", "Accessibility: step-free entrance", "Rules: insurance over 100 guests", "Hours: quiet after 22:30"].map((doc) => (
                <div key={doc} className="rounded-xl border border-border p-4 text-sm">{doc}</div>
              ))}
            </div>
          ) : currentSlug === "ai-agent/test-conversation" ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-secondary p-3 text-sm">Organizer: Can we use patio heaters?</div>
              <div className="rounded-xl bg-purple-50 p-3 text-sm text-purple-950">AI draft: Yes, if setup remains inside patio boundary. Confidence 0.82.</div>
              <InlineNotice tone="warn" title="Low confidence sample" text="Escalate questions about late-night alcohol, legal exceptions, refunds or capacity overrides." />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["off", "draft_replies", "auto_reply_safe", "auto_reply_escalate"].map((mode) => (
            <button key={mode} className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left text-sm">
              <span>{mode}</span>
              {mode === "draft_replies" && <CheckCircle2 className="h-4 w-4 text-emerald-700" />}
            </button>
          ))}
          <Button onClick={() => audit("Updated venue AI agent", "The Penmar", "ai_policy")}>
            <Bot className="h-4 w-4" />
            Save AI settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function OwnerPromotionView({ currentSlug, campaigns, selectedVenue, createCampaign, audit }: OwnerViewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{currentSlug === "venue-campaign-builder" ? "Venue campaign builder" : "Venue promotion"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSlug === "venue-campaign-builder" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Target entity" value={selectedVenue.name} onChange={() => undefined} />
              <Field label="Budget" type="number" value={180} onChange={() => undefined} />
              <InlineNotice title="Risk pre-check" text="Creative is clear unless it makes unsafe capacity, guarantee or urgency claims." />
              <Button onClick={createCampaign}>Create campaign</Button>
            </div>
          )}
          <div className="grid gap-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.targetEntity} · {formatMoney(campaign.spend)} spend</p>
                  </div>
                  <StatusBadge value={campaign.status} />
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <span>{campaign.impressions.toLocaleString()} impressions</span>
                  <span>{campaign.requests} requests</span>
                  <span>{campaign.riskReview}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI creative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative h-48 overflow-hidden rounded-xl">
            <Image src={demoVenueCover(2)} alt="Venue creative" fill className="object-cover" sizes="360px" />
          </div>
          <InlineNotice title="Promotion review" text="Risky venue or event promotion can be routed to moderator review in Phase 4." />
          <Button variant="outline" onClick={() => audit("Generated venue promo creative", selectedVenue.name)}>
            <Sparkles className="h-4 w-4" />
            Generate creative
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function OwnerAnalyticsView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Venue analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Utilization" value={`${ownerAnalyticsSummary.utilization}%`} helper="This month" tone="info" />
          <MetricCard label="Request conversion" value={`${ownerAnalyticsSummary.requestConversion}%`} helper="Access to approved events" tone="good" />
          <MetricCard label="Organizer quality" value={ownerAnalyticsSummary.organizerQuality} helper="Avg approved organizer rating" tone="good" />
          <MetricCard label="Complaint rate" value={`${ownerAnalyticsSummary.complaintRate}%`} helper="Venue-scoped only" tone="warn" />
          <MetricCard label="Campaign ROI" value={`${ownerAnalyticsSummary.campaignRoi}x`} helper="Modeled attribution" tone="info" />
        </CardContent>
      </Card>
      <OperationalStatesPanel permissionRole="venue_owner" partialData={ownerAnalyticsSummary.partialData} />
    </div>
  );
}

function OwnerMyEventsView({ eventRequests }: OwnerViewProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">My events bridge</CardTitle>
          <Link href="/organizer/events/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create as organizer
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {eventRequests.map((request, index) => (
          <div key={request.id} className="rounded-xl border border-border p-4">
            <div className="relative mb-3 h-32 overflow-hidden rounded-lg">
              <Image src={eventCoverForOwner(index)} alt={request.event.title} fill className="object-cover" sizes="360px" />
            </div>
            <p className="font-semibold">{request.event.title}</p>
            <p className="text-sm text-muted-foreground">Owner may operate only events they created as organizer.</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function OwnerTeamSettingsView({ screen, audit }: OwnerViewProps) {
  if (screen.slug === "settings") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Venue settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {["Default policy: approve organizers", "Notifications: event requests and claims", "Billing contact: finance@example", "Integrations: calendar sync pending"].map((setting) => (
            <div key={setting} className="rounded-xl border border-border p-4 text-sm">{setting}</div>
          ))}
          <Button onClick={() => audit("Updated venue settings", "Owner account")}>
            <Settings className="h-4 w-4" />
            Save settings
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Venue team & permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ownerTeamMembers.map((member) => (
          <div key={member.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.venueScope}</p>
              </div>
              <Badge variant="outline">{member.role}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {member.permissions.map((permission) => <Badge key={permission} variant="secondary">{permission}</Badge>)}
            </div>
          </div>
        ))}
        <Button onClick={() => audit("Invited venue staff", "Team")}>Invite staff</Button>
      </CardContent>
    </Card>
  );
}
