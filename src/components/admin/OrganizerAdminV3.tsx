"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Plus,
  QrCode,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActionToast,
  AgentCard,
  ApprovalTracker,
  AuditLogPanel,
  MetricCard,
  OperationalStatesPanel,
  PublicPreviewFrame,
  StatusBadge,
} from "./admin-ui";
import {
  adminVenues,
  roleBasePaths,
  roleLabels,
} from "@/lib/admin-data";
import type {
  AdminEvent,
  AdminScreenDefinition,
  AdminScreenSurface,
  ParticipantStatus,
} from "@/lib/admin-types";
import {
  auditLogs,
  calculateCampaignFunnel,
  calculateLedgerTotals,
  calculateParticipantCounts,
  canOrganizerPublish,
  createDraftEventFromAI,
  createDraftEventFromWizard,
  createWizardStateFromAI,
  generateAIEventDraft,
  getInitialOrganizerEvents,
  initialVenueRequests,
  initialWizardState,
  makeOrganizerAudit,
  nextBestOrganizerTasks,
  organizerAgentSet,
  organizerCampaigns,
  organizerEventTemplates,
  organizerLedgerEntries,
  organizerParticipants,
  validateWizardStep,
  type AIEventDraft,
  type CreateEventWizardState,
  type OrganizerAuditEntry,
  type OrganizerCampaign,
  type OrganizerLedgerEntry,
  type OrganizerParticipant,
  type VenueRequest,
} from "@/lib/organizer-v3";
import { demoAdminImages, demoEventCover, demoEventCovers, demoVenueCover } from "@/lib/demo-assets";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { appendSharedAuditEntry } from "@/lib/shared-audit";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function activeSlug(screen: AdminScreenDefinition, surface: AdminScreenSurface) {
  return surface.slug || screen.resolvedFromSlug || screen.slug;
}

const aiCreatePromptDefaults = {
  en: "A sunset singles mixer with safe chat, paid tickets and guided rotations.",
  ru: "Вечер знакомств на закате с безопасным чатом, билетами и ведущими ротациями.",
};

const canonicalSurfaceHrefs: Record<string, string> = {
  dashboard: "/organizer",
  pipeline: "/organizer/events/pipeline",
  events: "/organizer/events",
  calendar: "/organizer/events/calendar",
  templates: "/organizer/templates",
  create: "/organizer/events/new",
  "create/location-type": "/organizer/events/new/location",
  "create/basics": "/organizer/events/new/basics",
  "create/schedule-capacity": "/organizer/events/new/schedule",
  "create/tickets-refunds": "/organizer/events/new/tickets",
  "create/chat-ai": "/organizer/events/new/chat-ai",
  "create/promotion-preview": "/organizer/events/new/promotion",
  "events/new/policy": "/organizer/events/new/policy",
  "ai-builder": "/organizer/events/ai",
  "ai-builder/prompt": "/organizer/events/ai",
  "ai-builder/generated-plan": "/organizer/events/ai/plan",
  "ai-builder/review-edit": "/organizer/events/ai/confirm",
  "events/ai/success": "/organizer/events/ai/success",
  "venue-finder": "/organizer/venues",
  "venue-detail": "/organizer/venues/ven_456/preview",
  "venue-unavailable": "/organizer/venues/ven_closed/unavailable",
  "venue-requests": "/organizer/venue-requests",
  "venue-request-thread": "/organizer/venue-requests/vr_101",
  "approval-tracker": "/organizer/events/evt_123/approval",
  workspace: "/organizer/events/evt_123",
  "event-settings": "/organizer/events/evt_123/settings",
  "event-version-history": "/organizer/events/evt_123/history",
  "cancel-event": "/organizer/events/evt_123/cancel",
  participants: "/organizer/participants",
  applications: "/organizer/events/evt_123/applications",
  "participant-detail": "/organizer/participants/part_1",
  waitlist: "/organizer/events/evt_123/waitlist",
  "check-in": "/organizer/events/evt_123/check-in",
  "qr-scanner": "/organizer/events/evt_123/check-in/qr",
  "manual-check-in": "/organizer/events/evt_123/check-in/manual",
  tickets: "/organizer/events/evt_123/tickets",
  refunds: "/organizer/events/evt_123/refunds",
  disputes: "/organizer/payouts/disputes",
  "promo-codes": "/organizer/events/evt_123/promo-codes",
  chats: "/organizer/events/evt_123/chat",
  "direct-messages": "/organizer/inbox",
  announcements: "/organizer/events/evt_123/announcements",
  "ai-draft-replies": "/organizer/inbox/ai-drafts",
  "ai-agents": "/organizer/ai-agents",
  "event-ai-agent": "/organizer/ai-agents/event/evt_123",
  "organizer-ai-agent": "/organizer/ai-agents/organizer",
  "knowledge-base": "/organizer/ai/knowledge",
  "ai-test-conversation": "/organizer/ai/test",
  "ai-analytics": "/organizer/ai/analytics",
  promotion: "/organizer/promotion",
  "campaign-builder": "/organizer/promotion/new",
  "creative-studio": "/organizer/promotion/creative",
  "promotion-targeting": "/organizer/promotion/targeting",
  "campaign-analytics": "/organizer/promotion/camp_1/analytics",
  payouts: "/organizer/payouts",
  "event-payouts": "/organizer/events/evt_123/payouts",
  "payout-ledger": "/organizer/payouts/ledger",
  profile: "/organizer/profile/edit",
  "public-profile-preview": "/organizer/profile/preview",
  reviews: "/organizer/reviews",
  "review-response": "/organizer/reviews",
  team: "/organizer/team",
  settings: "/organizer/settings",
  "audit-log": "/organizer/audit",
  "empty-first-launch": "/organizer/empty",
};

const organizerVenuePolicyLabels: Record<string, string> = {
  approve_organizers: "Требуется одобрение организатора",
  moderate_every_event: "Каждое событие требует подтверждения",
  no_external_events: "Не принимает заявки",
};

const organizerRequestStatusLabels: Record<string, string> = {
  pending: "Ждёт ответа владельца",
  approved: "Уже одобрено",
  rejected: "Отклонено",
  changes_requested: "Требует подтверждения",
  draft: "Ждёт отправки",
};

const venueFilterOptions = [
  { key: "all", label: "Все" },
  { key: "requestable", label: "Можно запросить" },
  { key: "pending", label: "Ждёт ответа" },
  { key: "approved", label: "Уже одобрено" },
  { key: "closed", label: "Не принимает заявки" },
] as const;

function surfaceHref(surface: AdminScreenSurface) {
  return canonicalSurfaceHrefs[surface.slug] ?? `${roleBasePaths.organizer}/${surface.slug}`;
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

export function OrganizerAdminV3({
  screen,
  activeSurface,
}: {
  screen: AdminScreenDefinition;
  activeSurface: AdminScreenSurface;
}) {
  const { locale } = useLanguage();
  const pathname = usePathname();
  const [events, setEvents] = useState<AdminEvent[]>(() => getInitialOrganizerEvents());
  const [wizard, setWizard] = useState<CreateEventWizardState>(initialWizardState);
  const [aiPrompt, setAiPrompt] = useState(aiCreatePromptDefaults.en);
  const [aiDraft, setAiDraft] = useState<AIEventDraft | null>(null);
  const [confirmedAIFields, setConfirmedAIFields] = useState<string[]>([]);
  const [venueRequests, setVenueRequests] = useState<VenueRequest[]>(initialVenueRequests);
  const [participants, setParticipants] = useState<OrganizerParticipant[]>(organizerParticipants);
  const [campaigns, setCampaigns] = useState<OrganizerCampaign[]>(organizerCampaigns);
  const [ledgerEntries] = useState<OrganizerLedgerEntry[]>(organizerLedgerEntries);
  const [localAudit, setLocalAudit] = useState<OrganizerAuditEntry[]>([]);
  const [toast, setToast] = useState("");
  const [showEdgeStates, setShowEdgeStates] = useState(false);

  const currentSlug = activeSlug(screen, activeSurface);
  const selectedEvent = events[0];
  const participantCounts = useMemo(() => calculateParticipantCounts(participants), [participants]);
  const ledgerTotals = useMemo(() => calculateLedgerTotals(ledgerEntries), [ledgerEntries]);
  const tasks = useMemo(() => nextBestOrganizerTasks(events, venueRequests), [events, venueRequests]);
  const isCreateSurface =
    screen.slug === "create" ||
    screen.slug.startsWith("create/") ||
    activeSurface.slug.startsWith("create/") ||
    screen.slug === "ai-builder" ||
    screen.slug.startsWith("ai-builder/") ||
    activeSurface.slug.startsWith("ai-builder/");
  const isTodaySurface = screen.slug === "dashboard";
  const isEventsListSurface = screen.slug === "events" && currentSlug === "events";
  const isEventWorkspaceSurface =
    screen.slug === "events" &&
    ["workspace", "guests", "chat", "promote", "event-money", "workspace-settings"].includes(currentSlug);
  const isMessagesSurface = screen.slug === "messages" && currentSlug === "messages";
  const isProfileSurface =
    screen.slug === "profile" ||
    screen.slug === "reviews" ||
    ["public-profile-preview", "review-response"].includes(currentSlug);
  const isMoneySurface = screen.slug === "money" && ["/organizer/money", "/organizer/payouts"].includes(pathname);
  const isAnalyticsSurface = pathname === "/organizer/analytics" && currentSlug === "analytics";
  const isVenueSurface = currentSlug === "venues" || currentSlug.startsWith("venues/") || currentSlug.startsWith("venue-requests");

  useEffect(() => {
    setAiPrompt((current) => (
      current === aiCreatePromptDefaults.en || current === aiCreatePromptDefaults.ru
        ? aiCreatePromptDefaults[locale]
        : current
    ));
  }, [locale]);

  const audit = (action: string, entity: string, reasonCode?: string) => {
    setToast(`${action}: ${entity}${reasonCode ? ` · ${reasonCode}` : ""}`);
    setLocalAudit((items) => [makeOrganizerAudit(action, entity, reasonCode), ...items]);
    appendSharedAuditEntry({ actor: roleLabels.organizer, actorRole: "organizer", action, entity, reasonCode });
  };

  const updateParticipant = (id: string, status: ParticipantStatus) => {
    setParticipants((items) =>
      items.map((participant) =>
        participant.id === id
          ? {
              ...participant,
              status,
              checkedInAt: status === "checked_in" ? "Только что" : participant.checkedInAt,
            }
          : participant,
      ),
    );
    audit("Participant updated", id, status);
  };

  const submitManualDraft = () => {
    const venue = adminVenues.find((item) => item.id === wizard.venueId) ?? adminVenues[0];
    const draft = createDraftEventFromWizard(wizard, venue);
    setEvents((items) => [draft.event, ...items]);
    audit("Draft saved", draft.event.title);
  };

  const generateDraft = () => {
    const nextDraft = generateAIEventDraft(aiPrompt);
    setAiDraft(nextDraft);
    setConfirmedAIFields([]);
    audit("AI draft generated", nextDraft.title);
  };

  const submitAIDraft = () => {
    if (!aiDraft) return;
    const draft = createDraftEventFromAI(aiDraft, confirmedAIFields, adminVenues[0]);
    setEvents((items) => [draft.event, ...items]);
    audit(
      "AI event draft created",
      draft.event.title,
      draft.missingFields.length ? "critical_fields_missing" : undefined,
    );
  };

  const requestVenueAccess = (venue = adminVenues[0]) => {
    const next: VenueRequest = {
      id: `vr_${Date.now()}`,
      venueId: venue.id,
      venueName: venue.name,
      organizerName: "The Penmar Events",
      status: "pending",
      policyMode: venue.policy.mode,
      message: "Requesting access with proposed capacity, setup plan and event category.",
      lastReply: "Waiting for venue owner response.",
      requestedAt: "Только что",
    };
    setVenueRequests((items) => [next, ...items]);
    audit("Venue access requested", venue.name);
  };

  const publishSelectedEvent = () => {
    if (!canOrganizerPublish(selectedEvent)) {
      audit("Publish blocked", selectedEvent.title, "approval_gates_required");
      return;
    }
    setEvents((items) =>
      items.map((event) =>
        event.id === selectedEvent.id ? { ...event, publicationStatus: "published" } : event,
      ),
    );
    audit("Event published", selectedEvent.title);
  };

  const metrics = [
    {
      label: isTodaySurface ? "Требуют внимания" : "Needs attention",
      value: tasks.length,
      helper: isTodaySurface ? "Подтверждения, сообщения и выплаты" : "Approvals, messages, payouts",
      tone: "warn" as const,
    },
    {
      label: isTodaySurface ? "Активные события" : "Active events",
      value: events.filter((event) => !["cancelled", "archived"].includes(event.publicationStatus)).length,
      helper: isTodaySurface ? "Черновики и ближайшие события" : "Drafts and upcoming",
      tone: "info" as const,
    },
    {
      label: isTodaySurface ? "Гости" : "Guests",
      value: participantCounts.total,
      helper: isTodaySurface ? `${participantCounts.checked_in} пришли на событие` : `${participantCounts.checked_in} checked in`,
      tone: "good" as const,
    },
    {
      label: isTodaySurface ? "Ожидается выплата" : "Pending payout",
      value: formatMoney(ledgerTotals.pending),
      helper: isTodaySurface
        ? ledgerTotals.blocked ? "Нужны данные для выплаты" : "Всё в порядке"
        : ledgerTotals.blocked ? "Tax info needed" : "On track",
      tone: ledgerTotals.blocked ? "danger" as const : "neutral" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {!isEventWorkspaceSurface && !isVenueSurface && (
        <div className="admin-page-head flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-[#eef2ff] text-[#3949d7] border-0">{roleLabels.organizer}</Badge>
              <Badge className="bg-[#f8fafc] text-[#475569] border border-[#dde4ee]">
                {isProfileSurface ? "Публичный профиль" : isMoneySurface ? "Финансы" : isAnalyticsSurface ? "Аналитика" : "Simple workspace"}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-normal">
              {isTodaySurface
                ? "Сегодня"
                : isEventsListSurface
                  ? "События"
                  : isMessagesSurface
                    ? "Сообщения"
                    : isProfileSurface
                      ? "Профиль организатора"
                      : isMoneySurface
                        ? "Деньги"
                      : isAnalyticsSurface
                        ? "Аналитика"
                    : isCreateSurface
                      ? "Create Event"
                      : activeSurface.title}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {isTodaySurface
                ? "Главная очередь действий организатора."
                : isEventsListSurface
                  ? "Управляйте черновиками, ближайшими и прошедшими событиями."
                  : isMessagesSurface
                    ? "Ответы участникам, владельцам площадок и черновики ИИ."
                    : isProfileSurface
                      ? "Настройте публичную страницу, описание и доверие."
                      : isMoneySurface
                        ? "Выручка, выплаты и возвраты по вашим событиям."
                      : isAnalyticsSurface
                        ? "Просмотры, гости, продажи и эффективность продвижения."
                  : activeSurface.description}
            </p>
          </div>
          {!isCreateSurface && (
            <div className="flex flex-wrap gap-2">
              {!isTodaySurface && !isEventsListSurface && !isMessagesSurface && !isProfileSurface && !isMoneySurface && !isAnalyticsSurface && !isVenueSurface && (
                <Button variant="outline" onClick={() => setShowEdgeStates((value) => !value)}>
                  <AlertTriangle className="h-4 w-4" />
                  Preview states
                </Button>
              )}
              <Link href={isMessagesSurface ? "/organizer/events/evt_123/announcements" : isProfileSurface ? "/organizer/profile/preview" : isMoneySurface ? "/organizer/money" : isAnalyticsSurface ? "/organizer/events" : "/organizer/events/new"}>
                <Button className="bg-primary hover:bg-primary/90">
                  {isAnalyticsSurface ? <Search className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isMessagesSurface
                    ? "Создать объявление"
                    : isProfileSurface
                      ? "Предпросмотр"
                      : isMoneySurface
                        ? "Настроить выплаты"
                      : isAnalyticsSurface
                        ? "Открыть события"
                    : isTodaySurface || isEventsListSurface
                      ? "Создать событие"
                      : "Create event"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {!isCreateSurface && !isEventsListSurface && !isEventWorkspaceSurface && !isMessagesSurface && !isProfileSurface && !isMoneySurface && !isAnalyticsSurface && !isVenueSurface && <SectionTabs screen={screen} activeSurface={activeSurface} />}

      {!isCreateSurface && !isEventsListSurface && !isEventWorkspaceSurface && !isMessagesSurface && !isProfileSurface && !isMoneySurface && !isAnalyticsSurface && !isVenueSurface && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      )}

      {!isCreateSurface && !isTodaySurface && !isEventsListSurface && !isEventWorkspaceSurface && !isMessagesSurface && !isProfileSurface && !isMoneySurface && !isAnalyticsSurface && !isVenueSurface && showEdgeStates && <OrganizerEdgeStates currentSlug={currentSlug} event={selectedEvent} />}

      {isAnalyticsSurface ? <OrganizerAnalyticsView events={events} campaigns={campaigns} participants={participants} /> : renderOrganizerSurface({
        screen,
        activeSurface,
        currentSlug,
        events,
        selectedEvent,
        setEvents,
        wizard,
        setWizard,
        aiPrompt,
        setAiPrompt,
        aiDraft,
        confirmedAIFields,
        setConfirmedAIFields,
        venueRequests,
        participants,
        campaigns,
        setCampaigns,
        ledgerEntries,
        localAudit,
        audit,
        updateParticipant,
        submitManualDraft,
        generateDraft,
        submitAIDraft,
        requestVenueAccess,
        publishSelectedEvent,
      })}

      {!isCreateSurface && !isTodaySurface && !isEventsListSurface && !isEventWorkspaceSurface && !isMessagesSurface && !isProfileSurface && !isMoneySurface && !isAnalyticsSurface && !isVenueSurface && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <OperationalStatesPanel partialData={screen.partialData || activeSurface.partialData} permissionRole="organizer" />
          <AuditLogPanel logs={auditLogs.filter((log) => log.actorRole === "organizer")} localLogs={localAudit} />
        </div>
      )}

      <ActionToast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function renderOrganizerSurface(props: OrganizerSurfaceProps) {
  const { screen, currentSlug } = props;

  if (screen.slug === "dashboard") return <TodayView {...props} />;
  if (screen.slug === "events") return <OrganizerEventsView {...props} />;
  if (screen.slug === "messages") return <OrganizerChatsView {...props} />;
  if (screen.slug === "money") return <OrganizerFinanceView {...props} />;
  if (screen.slug === "create") return <CreateWizardView {...props} />;
  if (screen.slug === "ai-builder") return <AIBuilderView {...props} />;
  if (screen.slug === "venue-finder" || currentSlug === "venues" || currentSlug.startsWith("venues/")) return <VenueFinderView {...props} />;
  if (screen.slug === "venue-requests" || currentSlug.startsWith("venue-requests")) return <VenueRequestsView {...props} />;
  if (screen.slug === "participants" || screen.slug === "check-in") return <ParticipantsView {...props} />;
  if (screen.slug === "chats") return <OrganizerChatsView {...props} />;
  if (screen.slug === "ai-agents") return <OrganizerAIAgentsView {...props} />;
  if (screen.slug === "promotion") return <OrganizerPromotionView {...props} />;
  if (screen.slug === "payouts" || ["refunds", "disputes", "event-payouts", "payout-ledger"].includes(currentSlug)) {
    return <OrganizerFinanceView {...props} />;
  }
  if (screen.slug === "profile" || screen.slug === "reviews") return <OrganizerProfileView {...props} />;
  if (screen.slug === "team" || screen.slug === "settings") return <OrganizerSettingsView {...props} />;
  if (screen.slug === "audit-log") return <AuditLogPanel logs={auditLogs.filter((log) => log.actorRole === "organizer")} localLogs={props.localAudit} />;

  return <OrganizerFallbackView {...props} />;
}

function TodayView({ events, venueRequests, participants, audit, currentSlug }: OrganizerSurfaceProps) {
  const tasks = nextBestOrganizerTasks(events, venueRequests);
  const isEmptyLaunch = currentSlug === "empty-first-launch";

  if (isEmptyLaunch) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Create your first event</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Start with the manual wizard or generate a draft with AI. We will show any venue or platform review in plain language.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/organizer/events/new"><Button>Create event</Button></Link>
            <Link href="/organizer/events/ai"><Button variant="outline">Use AI</Button></Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Что требует внимания сегодня</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div key={`${task.title}-${task.entity}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-muted-foreground">{task.entity}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={task.state} type="plain" />
                <Button variant="outline" size="sm" onClick={() => audit("Открыли задачу", task.entity ?? task.title)}>
                  {task.action}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="space-y-6">
        <TodayPublicationCard event={events[0]} />
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Гости сегодня</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <InfoRow label="Заявки" value={participants.filter((item) => item.status === "applied").length} />
            <InfoRow label="Лист ожидания" value={participants.filter((item) => item.status === "waitlist").length} />
            <InfoRow label="Запрошен возврат" value={participants.filter((item) => item.status === "refund_requested").length} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TodayPublicationCard({ event }: { event?: AdminEvent }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Публикация события</CardTitle>
        {event && <p className="text-xs text-muted-foreground">{event.title}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        <TodayPublicationRow
          icon="clock"
          title="Подтверждение площадки"
          status="Ждёт решения"
          text="Владелец площадки проверяет дату и формат."
        />
        <TodayPublicationRow
          icon="check"
          title="Проверка платформы"
          status="Одобрено"
          text="Платформа уже проверила событие."
        />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
          Можно публиковать после подтверждения площадки.
        </div>
      </CardContent>
    </Card>
  );
}

function TodayPublicationRow({
  icon,
  title,
  status,
  text,
}: {
  icon: "clock" | "check";
  title: string;
  status: string;
  text: string;
}) {
  const Icon = icon === "check" ? CheckCircle2 : Clock;
  return (
    <div className="flex gap-3 rounded-xl border border-border p-3">
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        icon === "check" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{title}</p>
          <Badge className={icon === "check" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
            {status}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function OrganizerEventsView(props: OrganizerSurfaceProps) {
  const { currentSlug } = props;
  if (["workspace", "guests", "chat", "promote", "event-money", "workspace-settings"].includes(currentSlug)) {
    return <EventWorkspace {...props} />;
  }
  if (currentSlug === "pipeline") return <EventsPipeline {...props} />;
  if (currentSlug === "calendar") return <EventsCalendar {...props} />;
  if (currentSlug === "templates") return <EventTemplates audit={props.audit} />;
  if (currentSlug === "approval-tracker") return <ApprovalTrackerDetail {...props} />;
  if (currentSlug === "event-settings") return <EventSettings {...props} />;
  if (currentSlug === "event-version-history") return <VersionHistory event={props.selectedEvent} />;
  if (currentSlug === "cancel-event") return <CancelEventFlow {...props} />;
  if (currentSlug === "tickets") return <TicketsAndCapacity {...props} />;
  if (currentSlug === "analytics") return <EventAnalytics {...props} />;
  return <EventsList {...props} />;
}

function EventsPipeline({ events }: OrganizerSurfaceProps) {
  const columns = [
    { title: "Draft", match: (event: AdminEvent) => event.publicationStatus === "draft" },
    { title: "Waiting", match: (event: AdminEvent) => event.publicationStatus === "blocked_until_gates_pass" },
    { title: "Ready", match: (event: AdminEvent) => event.publicationStatus === "ready_to_publish" },
    { title: "Published", match: (event: AdminEvent) => event.publicationStatus === "published" },
    { title: "Settlement", match: (event: AdminEvent) => ["completed", "archived"].includes(event.publicationStatus) },
  ];

  return (
    <div className="grid gap-3 xl:grid-cols-5">
      {columns.map((column) => (
        <Card key={column.title} className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{column.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.filter(column.match).map((event) => (
              <Link key={event.id} href={`/organizer/events/${event.id}`}>
                <div className="rounded-xl border border-border p-3 hover:bg-secondary/40">
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.date}</p>
                  <div className="mt-2"><StatusBadge value={event.publicationStatus} type="publication" /></div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type OrganizerEventsFilter = "all" | "attention" | "drafts" | "upcoming" | "past";

const organizerEventFilters: Array<{ id: OrganizerEventsFilter; label: string }> = [
  { id: "all", label: "Все" },
  { id: "attention", label: "Требуют внимания" },
  { id: "drafts", label: "Черновики" },
  { id: "upcoming", label: "Скоро" },
  { id: "past", label: "Прошли" },
];

function organizerEventDisplay(event: AdminEvent) {
  const venueReview = event.approvalGates.find((item) => item.type === "venue");
  const platformReview = event.approvalGates.find((item) => item.type === "platform");

  if (event.publicationStatus === "draft") {
    return {
      status: "Черновик",
      group: "drafts" as OrganizerEventsFilter,
      action: "Продолжить черновик",
      href: "/organizer/events/new",
      tone: "bg-[#f8fafc] text-[#475569] border border-[#dde4ee]",
    };
  }

  if (event.publicationStatus === "blocked_until_gates_pass") {
    const needsOwnerReply = venueReview?.status === "changes_requested" || venueReview?.status === "escalated" || platformReview?.status === "rejected";
    return {
      status: needsOwnerReply ? "Нужно ответить владельцу" : "Ждёт подтверждения площадки",
      group: "attention" as OrganizerEventsFilter,
      action: needsOwnerReply ? "Ответить владельцу" : "Посмотреть, что осталось",
      href: needsOwnerReply ? "/organizer/venue-requests" : `/organizer/events/${event.id}/approval`,
      tone: needsOwnerReply
        ? "bg-[#fff0ef] text-[#c52b20] border border-[#ffb3ad]"
        : "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
    };
  }

  if (event.publicationStatus === "ready_to_publish") {
    return {
      status: "Можно публиковать",
      group: "upcoming" as OrganizerEventsFilter,
      action: "Открыть событие",
      href: `/organizer/events/${event.id}`,
      tone: "bg-[#eaf4ff] text-[#0969b9] border border-[#b7ddff]",
    };
  }

  if (event.publicationStatus === "published") {
    return {
      status: event.ticketsSold > 0 ? "Продажи открыты" : "Опубликовано",
      group: "upcoming" as OrganizerEventsFilter,
      action: event.ticketsSold > 0 ? "Проверить гостей" : "Открыть событие",
      href: event.ticketsSold > 0 ? `/organizer/events/${event.id}/guests` : `/organizer/events/${event.id}`,
      tone: "bg-[#e9f8ef] text-[#138a4a] border border-[#b7e8c7]",
    };
  }

  if (["completed", "archived"].includes(event.publicationStatus)) {
    return {
      status: event.revenue > 0 ? "Требуется выплата" : "Завершено",
      group: "past" as OrganizerEventsFilter,
      action: event.revenue > 0 ? "Открыть выплату" : "Посмотреть итоги",
      href: event.revenue > 0 ? "/organizer/money" : `/organizer/events/${event.id}`,
      tone: event.revenue > 0
        ? "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]"
        : "bg-[#f8fafc] text-[#475569] border border-[#dde4ee]",
    };
  }

  return {
    status: "Скоро",
    group: "upcoming" as OrganizerEventsFilter,
    action: "Открыть событие",
    href: `/organizer/events/${event.id}`,
    tone: "bg-[#eaf4ff] text-[#0969b9] border border-[#b7ddff]",
  };
}

function EventsList({ events }: OrganizerSurfaceProps) {
  const [activeFilter, setActiveFilter] = useState<OrganizerEventsFilter>("all");
  const eventRows = events.map((event, index) => ({
    event,
    index,
    display: organizerEventDisplay(event),
  }));
  const visibleRows = activeFilter === "all"
    ? eventRows
    : eventRows.filter((row) => row.display.group === activeFilter);

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Мои события</CardTitle>
            <div className="flex flex-wrap gap-2">
              {organizerEventFilters.map((filter) => {
                const count = filter.id === "all"
                  ? eventRows.length
                  : eventRows.filter((row) => row.display.group === filter.id).length;
                const active = filter.id === activeFilter;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-[#d8e0ec] bg-white text-[#475569] hover:bg-[#f8fafc]",
                    )}
                  >
                    {filter.label}
                    <span className={cn("ml-2", active ? "text-white/70" : "text-[#647084]")}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleRows.map(({ event, index, display }) => (
          <Card key={event.id} className="overflow-hidden border-0 shadow-sm">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-[148px_1fr]">
              <div className="relative min-h-[132px] overflow-hidden rounded-xl bg-[#eef2f7]">
                <Image
                  src={demoEventCover(index)}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 148px"
                />
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#111827] shadow-sm">
                  {event.category}
                </div>
              </div>
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{event.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{event.date}</p>
                    <p className="text-sm text-muted-foreground">{event.venueName}</p>
                  </div>
                  <Badge className={display.tone}>{display.status}</Badge>
                </div>

                <div className="grid gap-2 text-sm text-[#475569] sm:grid-cols-2">
                  <div className="rounded-xl bg-[#f8fafc] px-3 py-2">
                    <p className="text-xs text-muted-foreground">Гости</p>
                    <p className="font-semibold text-[#111827]">{event.ticketsSold}/{event.capacity}</p>
                  </div>
                  {event.revenue > 0 && (
                    <div className="rounded-xl bg-[#f8fafc] px-3 py-2">
                      <p className="text-xs text-muted-foreground">Выручка</p>
                      <p className="font-semibold text-[#111827]">{formatMoney(event.revenue)}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link href={display.href}>
                    <Button size="sm" className="min-w-[160px]">{display.action}</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EventsCalendar({ events, audit }: OrganizerSurfaceProps) {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Event calendar</CardTitle>
          <Button variant="outline" size="sm" onClick={() => audit("Calendar conflict scan", "Event calendar")}>Scan conflicts</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const event = events[day % 7 === 3 ? 0 : day % 11 === 0 ? 1 : -1];
            return (
              <div key={day} className={cn("min-h-24 rounded-xl border p-2", event ? "border-primary/20 bg-primary/5" : "border-border bg-card")}>
                <p className="text-xs text-muted-foreground">{day}</p>
                {event && (
                  <Link href={`/organizer/events/${event.id}`}>
                    <div className="mt-2 rounded-lg bg-background p-2 text-[11px] shadow-sm">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-muted-foreground">{event.ticketsSold}/{event.capacity}</p>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function EventTemplates({ audit }: { audit: (action: string, entity: string, reasonCode?: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {organizerEventTemplates.map((template) => (
        <Card key={template.id} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold">{template.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
            <Badge className="mt-3 bg-secondary text-foreground border-0">{template.category}</Badge>
            <Button className="mt-4 w-full" variant="outline" onClick={() => audit("Template used", template.title)}>
              Use template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ApprovalTrackerDetail({ selectedEvent, publishSelectedEvent }: OrganizerSurfaceProps) {
  const canPublish = canOrganizerPublish(selectedEvent);
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <ApprovalTracker event={selectedEvent} />
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Publish controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={cn("rounded-xl border p-3 text-sm", canPublish ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900")}>
            {canPublish
              ? "Everything is ready. You can publish this event."
              : "Publishing is waiting for the needed confirmations."}
          </div>
          <Button className="w-full" disabled={!canPublish} onClick={publishSelectedEvent}>
            Publish event
          </Button>
          {!canPublish && (
            <Button className="w-full" variant="outline" onClick={publishSelectedEvent}>
              Try publish and log denial
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventWorkspace({
  currentSlug,
  selectedEvent,
  participants,
  ledgerEntries,
  audit,
  updateParticipant,
  publishSelectedEvent,
}: OrganizerSurfaceProps) {
  const activeTab = currentSlug === "workspace" ? "overview" : currentSlug;
  const tabs = [
    { slug: "overview", label: "Обзор", href: `/organizer/events/${selectedEvent.id}` },
    { slug: "guests", label: "Гости", href: `/organizer/events/${selectedEvent.id}/guests` },
    { slug: "chat", label: "Чат", href: `/organizer/events/${selectedEvent.id}/chat` },
    { slug: "promote", label: "Промо", href: `/organizer/events/${selectedEvent.id}/promote` },
    { slug: "event-money", label: "Деньги", href: `/organizer/events/${selectedEvent.id}/money` },
    { slug: "workspace-settings", label: "Настройки", href: `/organizer/events/${selectedEvent.id}/workspace-settings` },
  ];
  const totals = calculateLedgerTotals(ledgerEntries);
  const refundTotal = Math.abs(
    ledgerEntries.filter((entry) => entry.type === "refund").reduce((sum, entry) => sum + entry.amount, 0),
  );
  const display = organizerEventDisplay(selectedEvent);
  const primaryAction = selectedEvent.publicationStatus === "ready_to_publish"
    ? { label: "Опубликовать", href: "", onClick: publishSelectedEvent }
    : { label: display.action, href: display.href, onClick: () => audit("Открыли действие", selectedEvent.title) };
  const nextStep = selectedEvent.publicationStatus === "blocked_until_gates_pass"
    ? "Событие ждёт подтверждения площадки."
    : selectedEvent.publicationStatus === "ready_to_publish"
      ? "Проверки пройдены. Можно опубликовать событие."
      : selectedEvent.publicationStatus === "published"
        ? "Продажи открыты. Проверьте гостей и ответьте на сообщения."
        : ["completed", "archived"].includes(selectedEvent.publicationStatus)
          ? "Событие завершено. Проверьте итоги и выплату."
          : "Проверьте детали события и продолжайте подготовку.";

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="grid gap-5 p-4 lg:grid-cols-[220px_1fr_auto]">
          <div className="relative min-h-[172px] overflow-hidden rounded-2xl bg-[#eef2f7]">
            <Image
              src={demoEventCover(0)}
              alt={selectedEvent.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 220px"
            />
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#111827] shadow-sm">
              {selectedEvent.category}
            </div>
          </div>
          <div className="min-w-0 space-y-4">
            <div>
              <Badge className={display.tone}>{display.status}</Badge>
              <h1 className="mt-3 text-2xl font-bold tracking-normal">{selectedEvent.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{selectedEvent.date}</p>
              <p className="text-sm text-muted-foreground">{selectedEvent.venueName}</p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-[#f8fafc] px-3 py-2">
                <p className="text-xs text-muted-foreground">Гости</p>
                <p className="font-semibold text-[#111827]">{selectedEvent.ticketsSold}/{selectedEvent.capacity}</p>
              </div>
              <div className="rounded-xl bg-[#f8fafc] px-3 py-2">
                <p className="text-xs text-muted-foreground">Выручка</p>
                <p className="font-semibold text-[#111827]">{formatMoney(selectedEvent.revenue)}</p>
              </div>
              <div className="rounded-xl bg-[#f8fafc] px-3 py-2">
                <p className="text-xs text-muted-foreground">Сообщения</p>
                <p className="font-semibold text-[#111827]">3 требуют ответа</p>
              </div>
            </div>
          </div>
          <div className="flex items-start justify-end">
            {primaryAction.href ? (
              <Link href={primaryAction.href}>
                <Button className="min-w-[180px]">{primaryAction.label}</Button>
              </Link>
            ) : (
              <Button className="min-w-[180px]" onClick={primaryAction.onClick}>{primaryAction.label}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <Link key={tab.slug} href={tab.href} className="shrink-0">
                <button
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                    activeTab === tab.slug
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-border bg-white text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-4 p-5">

          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-semibold">Что нужно сделать</p>
                <p className="mt-1">{nextStep}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => audit("Написали владельцу", selectedEvent.venueName)}>Написать владельцу</Button>
                  <Button size="sm" variant="outline" onClick={() => audit("Открыли изменение места", selectedEvent.title)}>Изменить место</Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <MetricCard label="Гости" value={`${selectedEvent.ticketsSold}/${selectedEvent.capacity}`} helper="зарегистрированы" tone="info" />
                <MetricCard label="Выручка" value={formatMoney(selectedEvent.revenue)} helper="по билетам" tone="good" />
                <MetricCard label="Сообщения" value="3" helper="нужен ответ" tone="warn" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <p className="font-semibold">Публикация</p>
                  <Badge className={cn("mt-3", display.tone)}>{display.status}</Badge>
                  <p className="mt-3 text-sm text-muted-foreground">{nextStep}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="font-semibold">Билеты и деньги</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <InfoRow label="Продано" value={`${selectedEvent.ticketsSold}/${selectedEvent.capacity}`} />
                    <InfoRow label="Выручка" value={formatMoney(selectedEvent.revenue)} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-blue-950">Сообщения</p>
                    <p className="mt-1 text-sm text-blue-950/80">3 новых сообщения</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="border border-blue-200 bg-white text-blue-950">Черновик ответа ИИ</Badge>
                      <Badge className="border border-blue-200 bg-white text-blue-950">Только черновики</Badge>
                    </div>
                  </div>
                  <Link href={`/organizer/events/${selectedEvent.id}/chat`}>
                    <Button size="sm">Открыть чат</Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="font-semibold">Быстрые действия</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Проверить гостей", `/organizer/events/${selectedEvent.id}/guests`],
                    ["Ответить в чате", `/organizer/events/${selectedEvent.id}/chat`],
                    ["Продвинуть событие", `/organizer/events/${selectedEvent.id}/promote`],
                    ["Открыть выплату", `/organizer/events/${selectedEvent.id}/money`],
                  ].map(([label, href]) => (
                    <Link key={label} href={href}>
                      <Button className="w-full" variant="outline" size="sm">{label}</Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "guests" && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-secondary/60 text-left text-xs text-muted-foreground">
                  <tr><th className="px-3 py-2">Гость</th><th className="px-3 py-2">Статус</th><th className="px-3 py-2">Оплачено</th><th className="px-3 py-2">Действия</th></tr>
                </thead>
                <tbody>
                  {participants.slice(0, 6).map((participant) => (
                    <tr key={participant.id} className="border-t border-border">
                      <td className="px-3 py-3">
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">{participant.notes}</p>
                      </td>
                      <td className="px-3 py-3"><StatusBadge value={participant.status} type="participant" /></td>
                      <td className="px-3 py-3">{formatMoney(participant.paid)}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateParticipant(participant.id, "approved")}>Одобрить</Button>
                          <Button size="sm" variant="outline" onClick={() => audit("Написали гостю", participant.name)}>Написать</Button>
                          <Button size="sm" variant="outline" onClick={() => updateParticipant(participant.id, "checked_in")}>Отметить вход</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "chat" && (
              <div className="grid gap-3">
                <div className="rounded-xl border border-border p-4">
                  <p className="font-semibold">Maya</p>
                <p className="mt-1 text-sm text-muted-foreground">Можно прийти с другом?</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="font-semibold text-blue-950">Черновик ответа ИИ</p>
                <p className="mt-1 text-sm text-blue-950/80">Да, если билеты ещё доступны. Гость может добавить +1 на странице билета.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => audit("Отправили черновик ИИ", selectedEvent.title)}>Отправить</Button>
                  <Button size="sm" variant="outline">Изменить</Button>
                  <Button size="sm" variant="outline">Убрать</Button>
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-semibold">ИИ-помощник для этого события</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Выключен", "Только черновики", "Авто FAQ"].map((mode) => (
                    <Button key={mode} size="sm" variant={mode === "Только черновики" ? "default" : "outline"} onClick={() => audit("Выбрали режим ИИ", mode)}>
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "promote" && (
            <div className="grid gap-3 md:grid-cols-2">
              {["Продвинуть событие", "Скопировать ссылку", "Текст промо с ИИ", "Промокод"].map((item, index) => (
                <button key={item} onClick={() => audit("Открыли промо-действие", item)} className={cn("rounded-xl border p-4 text-left", index === 0 ? "border-primary/30 bg-primary/5" : "border-border")}>
                  <p className="font-semibold">{item}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Простой способ привлечь больше гостей на это событие.</p>
                </button>
              ))}
            </div>
          )}

          {activeTab === "event-money" && (
            <div className="grid gap-3 md:grid-cols-4">
              <MetricCard label="Выручка" value={formatMoney(totals.gross)} tone="good" />
              <MetricCard label="К выплате" value={formatMoney(Math.max(totals.gross - totals.fees, 0))} tone="info" />
              <MetricCard label="Возвраты" value={formatMoney(refundTotal)} tone="warn" />
              <MetricCard label="Дата выплаты" value="22 мая" tone="neutral" />
            </div>
          )}

          {activeTab === "workspace-settings" && (
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Билеты и гости", `${selectedEvent.capacity} мест`],
                ["Политика возврата", selectedEvent.refundPolicy],
                ["Чат и ИИ", "Только черновики"],
                ["Публичная страница", "Готово к просмотру"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border p-4">
                  <p className="font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Публичная страница</CardTitle>
            </CardHeader>
            <CardContent>
              <PublicPreviewFrame href={selectedEvent.publicPreviewUrl} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EventSettings({ selectedEvent, audit }: OrganizerSurfaceProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Event settings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {[
          ["Visibility", "Public after approvals"],
          ["Capacity", `${selectedEvent.capacity} total seats`],
          ["Chat", "Participant chat enabled"],
          ["Cancellation", "Requires reason and refund impact"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{value}</p>
          </div>
        ))}
        <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4" /> Protected actions</div>
          <p className="mt-1 text-xs">Organizer cannot override venue or platform rejection. Cancellation requires reason and audit.</p>
          <Button className="mt-3" variant="destructive" onClick={() => audit("Cancel flow opened", selectedEvent.title, "organizer_cancel")}>Open cancel flow</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VersionHistory({ event }: { event: AdminEvent }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">Version history</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {[
          ["Created draft", "Location type selected; review needs calculated."],
          ["Updated tickets", "General Admission quantity changed to match capacity."],
          ["Submitted for approval", "Venue and platform review started."],
        ].map(([title, text], index) => (
          <div key={title} className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">{index + 1}. {title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{event.title} · {text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CancelEventFlow({ selectedEvent, audit }: OrganizerSurfaceProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">Cancel event flow</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Cancellation impacts participants, refunds, promotion spend and public notifications.
        </div>
        <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          <option>venue_unavailable</option>
          <option>organizer_emergency</option>
          <option>safety_concern</option>
        </select>
        <textarea className="h-24 w-full resize-none rounded-lg border border-input bg-background p-3 text-sm" defaultValue="Explain the cancellation and participant refund path." />
        <Button variant="destructive" onClick={() => audit("Cancellation requested", selectedEvent.title, "venue_unavailable")}>
          Request cancellation
        </Button>
      </CardContent>
    </Card>
  );
}

function TicketsAndCapacity({ selectedEvent }: OrganizerSurfaceProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">Tickets & capacity</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <InfoRow label="Capacity" value={`${selectedEvent.capacity}`} />
        <InfoRow label="Tickets sold" value={`${selectedEvent.ticketsSold}`} />
        <InfoRow label="Remaining" value={`${selectedEvent.capacity - selectedEvent.ticketsSold}`} />
        <InfoRow label="Refund policy" value={selectedEvent.refundPolicy} />
      </CardContent>
    </Card>
  );
}

function OrganizerAnalyticsView({
  events,
  campaigns,
  participants,
}: {
  events: AdminEvent[];
  campaigns: OrganizerCampaign[];
  participants: OrganizerParticipant[];
}) {
  const eventRows = events.slice(0, 3).map((event, index) => {
    const views = 1240 - index * 320;
    const detailOpens = Math.round(views * (0.34 - index * 0.04));
    const saves = Math.round(detailOpens * (0.26 - index * 0.03));
    const checkIns = Math.max(0, Math.round(event.ticketsSold * (0.78 - index * 0.08)));
    const conversion = Math.round((event.ticketsSold / views) * 100);
    const status = index === 0 ? "Хорошо" : conversion < 8 ? "Низкая конверсия" : "Нужно внимание";

    return {
      ...event,
      views,
      detailOpens,
      saves,
      checkIns,
      conversion,
      status,
    };
  });

  if (eventRows.length < 3) {
    eventRows.push({
      ...events[0],
      id: "analytics_new_format",
      title: "Новый формат события",
      ticketsSold: 0,
      revenue: 0,
      views: 180,
      detailOpens: 42,
      saves: 8,
      checkIns: 0,
      conversion: 0,
      status: "Недостаточно данных",
    });
  }

  const totalViews = eventRows.reduce((sum, event) => sum + event.views, 0);
  const totalGuests = events.reduce((sum, event) => sum + event.ticketsSold, 0);
  const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
  const totalConversion = totalViews > 0 ? Math.round((totalGuests / totalViews) * 100) : 0;
  const checkedInGuests = participants.filter((participant) => participant.status === "checked_in").length;

  const analyticsCards = [
    { label: "Просмотры", value: totalViews.toLocaleString(), helper: "по страницам событий", tone: "info" as const },
    { label: "Гости", value: totalGuests.toLocaleString(), helper: "билеты и регистрации", tone: "good" as const },
    { label: "Продажи", value: formatMoney(totalRevenue), helper: "по билетам", tone: "good" as const },
    { label: "Конверсия", value: `${totalConversion}%`, helper: "из просмотров в гостей", tone: "warn" as const },
  ];

  const channelLabels: Record<OrganizerCampaign["channel"], string> = {
    boost: "Буст в ленте",
    referral: "Реферальные ссылки",
    search: "Поиск",
    social: "Социальные сети",
  };
  const promotionRows = campaigns.slice(0, 3).map((campaign, index) => ({
    channel: channelLabels[campaign.channel],
    reach: campaign.impressions,
    clicks: campaign.saves,
    conversions: campaign.joins,
    status: index === 0 ? "Продвижение работает" : "Нужно внимание",
    recommendation: index === 0 ? "Увеличьте бюджет на лучший канал." : "Обновите текст и обложку.",
  }));

  const audienceRows = [
    ["Интересы", "Музыка, знакомства, городские встречи"],
    ["Источник", "Промо в ленте и профиль организатора"],
    ["Возвращаются", `${Math.max(18, checkedInGuests)} гостей уже были на ваших событиях`],
    ["Город / район", "Лос-Анджелес, западная часть города"],
  ];

  const recommendations = [
    { title: "Улучшить обложку", action: "Улучшить страницу", text: "У первого события много открытий, но часть гостей не доходит до покупки." },
    { title: "Добавить описание", action: "Открыть событие", text: "Короткое описание помогает поднять конверсию из просмотра в гостя." },
    { title: "Запустить продвижение", action: "Запустить продвижение", text: "Лучший канал уже даёт заявки, можно усилить охват." },
    { title: "Ответить гостям", action: "Посмотреть гостей", text: "Быстрые ответы повышают доверие перед оплатой." },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Эффективность событий</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {eventRows.map((event) => (
            <div key={event.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Просмотры: {event.views.toLocaleString()} · Открытия страницы: {event.detailOpens.toLocaleString()} · Сохранили: {event.saves}
                  </p>
                </div>
                <Badge className="border-0 bg-secondary text-foreground">{event.status}</Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                <InfoRow label="Гости" value={`${event.ticketsSold}/${event.capacity}`} />
                <InfoRow label="Продажи" value={formatMoney(event.revenue)} />
                <InfoRow label="Конверсия" value={`${event.conversion}%`} />
                <InfoRow label="Пришли" value={`${event.checkIns}`} />
              </div>
              <div className="mt-3">
                <Link href={`/organizer/events/${event.id}`}>
                  <Button size="sm" variant="outline">Открыть событие</Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Продвижение</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {promotionRows.map((row) => (
              <div key={row.channel} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{row.channel}</p>
                  <Badge className="border-0 bg-emerald-50 text-emerald-700">{row.status}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <InfoRow label="Охват" value={row.reach.toLocaleString()} />
                  <InfoRow label="Клики" value={row.clicks.toLocaleString()} />
                  <InfoRow label="Заявки" value={row.conversions.toLocaleString()} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{row.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Аудитория</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {audienceRows.map(([label, value]) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Рекомендации</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {recommendations.map((item) => (
            <div key={item.title} className="rounded-xl border border-border p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              <Button className="mt-3" size="sm" variant="outline">{item.action}</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EventAnalytics({ selectedEvent }: OrganizerSurfaceProps) {
  const funnel = [
    ["Views", 1240],
    ["Detail opens", 356],
    ["Saves", 89],
    ["Tickets", selectedEvent.ticketsSold],
    ["Check-ins", 0],
  ];
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">Event analytics</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {funnel.map(([label, value]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-28 text-sm">{label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(8, Number(value) / 14)}%` }} />
            </div>
            <span className="w-16 text-right text-sm font-semibold">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CreateWizardView({
  currentSlug,
  wizard,
  setWizard,
  submitManualDraft,
}: OrganizerSurfaceProps) {
  const step = normalizeCreateStep(currentSlug);
  const validation = step === "preview-publish" ? validateFullCreateWizard(wizard) : validateWizardStep(step, wizard);
  const selectedVenue = adminVenues.find((venue) => venue.id === wizard.venueId) ?? adminVenues[0];
  const eventPreview = createDraftEventFromWizard(wizard, selectedVenue).event;
  const currentStep = createSteps.find((item) => item.slug === step) ?? createSteps[0];
  const stepIndex = createSteps.findIndex((item) => item.slug === step);
  const previousStep = stepIndex > 0 ? createSteps[stepIndex - 1] : undefined;
  const nextStep = stepIndex < createSteps.length - 1 ? createSteps[stepIndex + 1] : undefined;
  const publishState = getCreatePublishState(wizard);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">{currentStep.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{currentStep.helper}</p>
            </div>
            <Badge className="bg-secondary text-foreground border-0">
              Step {stepIndex + 1} of {createSteps.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <WizardStepRail activeSlug={step} />
          {step === "hosting" && <HostingStep wizard={wizard} setWizard={setWizard} />}
          {step === "where-when" && <WhereWhenStep wizard={wizard} setWizard={setWizard} />}
          {step === "guests-tickets" && <GuestsTicketsStep wizard={wizard} setWizard={setWizard} />}
          {step === "chat-ai" && <ChatAIStep wizard={wizard} setWizard={setWizard} />}
          {step === "preview-publish" && <PreviewPublishStep wizard={wizard} setWizard={setWizard} event={eventPreview} />}
          {!validation.valid && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Please add: {validation.missing.join(", ")}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <div className="flex flex-wrap gap-2">
              {previousStep && (
                <Link href={previousStep.href}>
                  <Button variant="outline">Back</Button>
                </Link>
              )}
              <Button variant="outline" onClick={submitManualDraft}>Save draft</Button>
            </div>
            {nextStep ? (
              <Link href={nextStep.href} className={cn(!validation.valid && "pointer-events-none")}>
                <Button disabled={!validation.valid}>Continue</Button>
              </Link>
            ) : (
              <Button disabled={!validation.valid} onClick={submitManualDraft}>
                {publishState.action}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <CreateSidePreview wizard={wizard} publishState={publishState} />
    </div>
  );
}

const createSteps = [
  {
    slug: "hosting",
    title: "What are you hosting?",
    helper: "Name the event, choose the category, add a short description and cover image.",
    href: "/organizer/events/new",
  },
  {
    slug: "where-when",
    title: "Where and when?",
    helper: "Choose the location type, place or link, date, time and timezone.",
    href: "/organizer/events/new/where-when",
  },
  {
    slug: "guests-tickets",
    title: "Guests and tickets",
    helper: "Set capacity, price, RSVP style, waitlist and attendance rules.",
    href: "/organizer/events/new/guests-tickets",
  },
  {
    slug: "chat-ai",
    title: "Chat and AI helper",
    helper: "Decide whether guests can chat and how the AI helper should answer.",
    href: "/organizer/events/new/chat-ai",
  },
  {
    slug: "preview-publish",
    title: "Preview and publish",
    helper: "Check the public card, fix missing fields and save or submit.",
    href: "/organizer/events/new/preview",
  },
];

function normalizeCreateStep(slug: string) {
  if (slug.includes("where-when") || slug.includes("location") || slug.includes("schedule")) return "where-when";
  if (slug.includes("guests-tickets") || slug.includes("tickets") || slug.includes("policy")) return "guests-tickets";
  if (slug.includes("chat-ai")) return "chat-ai";
  if (slug.includes("preview") || slug.includes("publish") || slug.includes("submit") || slug.includes("promotion")) return "preview-publish";
  return "hosting";
}

function validateFullCreateWizard(wizard: CreateEventWizardState) {
  const missing = [
    ...validateWizardStep("hosting", wizard).missing,
    ...validateWizardStep("where-when", wizard).missing,
    ...validateWizardStep("guests-tickets", wizard).missing,
    ...validateWizardStep("chat-ai", wizard).missing,
    ...validateWizardStep("preview-publish", wizard).missing,
  ];
  return {
    valid: missing.length === 0,
    missing: Array.from(new Set(missing)),
  };
}

function WizardStepRail({ activeSlug }: { activeSlug: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {createSteps.map((item, index) => {
        const active = item.slug === activeSlug;
        return (
          <Link key={item.slug} href={item.href}>
            <div className={cn(
              "h-full rounded-xl border p-3 text-xs transition-colors",
              active ? "border-[#111827] bg-[#111827] text-white" : "border-border bg-white text-muted-foreground hover:bg-secondary/50",
            )}>
              <p className="font-bold">{index + 1}</p>
              <p className="mt-1 font-semibold">{item.title}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function HostingStep({ wizard, setWizard }: WizardProps) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Event name</span>
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.title} onChange={(event) => setWizard({ ...wizard, title: event.target.value })} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Category</span>
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.category} onChange={(event) => setWizard({ ...wizard, category: event.target.value })} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Short description</span>
        <textarea className="h-28 resize-none rounded-lg border border-input bg-background p-3 text-sm" value={wizard.description} onChange={(event) => setWizard({ ...wizard, description: event.target.value })} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Cover image</span>
        <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.coverImage} onChange={(event) => setWizard({ ...wizard, coverImage: event.target.value })}>
          <option value={demoEventCovers.sunsetMixer}>Sunset social</option>
          <option value={demoEventCovers.rooftopSocial}>Rooftop social</option>
          <option value={demoEventCovers.triviaNight}>Trivia night</option>
          <option value={demoEventCovers.ceramicsWorkshop}>Workshop</option>
        </select>
      </label>
      <Link href="/organizer/events/ai" className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm hover:bg-primary/10">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Want help writing it?</p>
            <p className="mt-1 text-muted-foreground">Start with AI, then edit the same five steps.</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function WhereWhenStep({ wizard, setWizard }: WizardProps) {
  const options: { value: CreateEventWizardState["locationType"]; label: string; helper: string }[] = [
    { value: "own_venue", label: "My place", helper: "A place you already manage." },
    { value: "external_venue", label: "Other place", helper: "The owner may need to approve the event." },
    { value: "public_place", label: "Public place", helper: "Add a clear address and meeting point." },
    { value: "online", label: "Online", helper: "Add the meeting link and timezone." },
  ];
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setWizard({ ...wizard, locationType: option.value })}
            className={cn("rounded-xl border p-4 text-left", wizard.locationType === option.value ? "border-primary bg-primary/5" : "border-border")}
          >
            <p className="font-semibold">{option.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{option.helper}</p>
          </button>
        ))}
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">{wizard.locationType === "online" ? "Event link" : "Venue or address"}</span>
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.locationText} onChange={(event) => setWizard({ ...wizard, locationText: event.target.value })} />
      </label>
      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Date</span>
          <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.date} onChange={(event) => setWizard({ ...wizard, date: event.target.value })} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Start time</span>
          <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.time} onChange={(event) => setWizard({ ...wizard, time: event.target.value })} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">End time</span>
          <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.endTime} onChange={(event) => setWizard({ ...wizard, endTime: event.target.value })} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Timezone</span>
          <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.timezone} onChange={(event) => setWizard({ ...wizard, timezone: event.target.value })} />
        </label>
      </div>
    </div>
  );
}

function GuestsTicketsStep({ wizard, setWizard }: WizardProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Capacity</span>
          <input type="number" className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.capacity} onChange={(event) => setWizard({ ...wizard, capacity: Number(event.target.value) })} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">RSVP style</span>
          <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.rsvpMode} onChange={(event) => setWizard({ ...wizard, rsvpMode: event.target.value as CreateEventWizardState["rsvpMode"] })}>
            <option value="open">Open RSVP</option>
            <option value="approval_required">Approval required</option>
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-border p-4 text-sm">
          <input type="checkbox" checked={wizard.waitlistEnabled} onChange={(event) => setWizard({ ...wizard, waitlistEnabled: event.target.checked })} />
          Waitlist on
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Ticket type</span>
          <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.ticketType} onChange={(event) => setWizard({ ...wizard, ticketType: event.target.value as CreateEventWizardState["ticketType"], ticketPrice: event.target.value === "free" ? 0 : wizard.ticketPrice })}>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Ticket name</span>
          <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.ticketName} onChange={(event) => setWizard({ ...wizard, ticketName: event.target.value })} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Ticket price</span>
          <input type="number" disabled={wizard.ticketType === "free"} className="h-10 rounded-lg border border-input bg-background px-3 text-sm disabled:bg-secondary/60" value={wizard.ticketPrice} onChange={(event) => setWizard({ ...wizard, ticketPrice: Number(event.target.value) })} />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Refund or attendance rule</span>
        <textarea className="h-24 w-full resize-none rounded-lg border border-input bg-background p-3 text-sm" value={wizard.refundPolicy} onChange={(event) => setWizard({ ...wizard, refundPolicy: event.target.value })} />
      </label>
    </div>
  );
}

function ChatAIStep({ wizard, setWizard }: WizardProps) {
  return (
    <div className="grid gap-4">
      <label className="flex items-center gap-2 rounded-xl border border-border p-4 text-sm">
        <input type="checkbox" checked={wizard.chatEnabled} onChange={(event) => setWizard({ ...wizard, chatEnabled: event.target.checked })} />
        Event chat on
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">AI helper</span>
        <select className="h-12 rounded-xl border border-input bg-background px-3 text-sm" value={wizard.aiAgentMode} onChange={(event) => setWizard({ ...wizard, aiAgentMode: event.target.value as CreateEventWizardState["aiAgentMode"] })}>
          <option value="off">Off</option>
          <option value="draft_replies">Draft replies</option>
          <option value="auto_reply_safe">Auto FAQ</option>
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">FAQ question</span>
          <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.faqQuestion} onChange={(event) => setWizard({ ...wizard, faqQuestion: event.target.value })} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">FAQ answer</span>
          <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={wizard.faqAnswer} onChange={(event) => setWizard({ ...wizard, faqAnswer: event.target.value })} />
        </label>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <p className="font-semibold">AI stays simple here</p>
        <p className="mt-1">It can draft replies or answer common questions from your FAQ. You can change this later inside the event.</p>
      </div>
    </div>
  );
}

function PreviewPublishStep({ wizard, setWizard, event }: WizardProps & { event: AdminEvent }) {
  const missing = validateFullCreateWizard(wizard).missing;
  const publishState = getCreatePublishState(wizard);
  return (
    <div className="grid gap-4">
      <CreatePreviewCard wizard={wizard} />
      <div className={cn("rounded-xl border p-4 text-sm", missing.length ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950")}>
        <p className="font-semibold">{missing.length ? "Missing required fields" : publishState.status}</p>
        <p className="mt-1">{missing.length ? missing.join(", ") : publishState.helper}</p>
      </div>
      <label className="flex items-center gap-2 rounded-xl border border-border p-4 text-sm">
        <input type="checkbox" checked={wizard.publicPreviewChecked} onChange={(event) => setWizard({ ...wizard, publicPreviewChecked: event.target.checked })} />
        I checked the public card, location, time and attendance rule.
      </label>
      <div className="rounded-xl border border-border p-4 text-sm">
        <p className="font-semibold">Public page preview</p>
        <p className="mt-1 text-muted-foreground">{event.title} will use this cover, place, schedule and ticket setup.</p>
      </div>
    </div>
  );
}

function CreateSidePreview({ wizard, publishState }: { wizard: CreateEventWizardState; publishState: ReturnType<typeof getCreatePublishState> }) {
  return (
    <div className="space-y-4">
      <CreatePreviewCard wizard={wizard} compact />
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Publish status</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border p-4 text-sm">
            <p className="font-semibold">{publishState.status}</p>
            <p className="mt-1 text-muted-foreground">{publishState.helper}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreatePreviewCard({ wizard, compact = false }: { wizard: CreateEventWizardState; compact?: boolean }) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={wizard.coverImage || demoEventCovers.sunsetMixer} alt={wizard.title || "Event cover"} fill className="object-cover" sizes={compact ? "360px" : "(max-width: 1280px) 100vw, 720px"} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className="mb-2 bg-primary text-white border-0">{wizard.category || "Event"}</Badge>
          <h3 className="text-xl font-bold leading-tight text-white drop-shadow">{wizard.title || "Untitled event"}</h3>
          <p className="mt-1 text-sm text-white/90">{wizard.locationText || "Location"} · {wizard.date || "Date"}</p>
        </div>
      </div>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold">{wizard.ticketType === "free" ? "Free" : `$${wizard.ticketPrice}`}</p>
          <p className="text-xs text-muted-foreground">{wizard.capacity} guests · {wizard.rsvpMode === "open" ? "Open RSVP" : "Approval required"}</p>
        </div>
        <Badge className="bg-mint/20 text-emerald-700 border-0">{wizard.waitlistEnabled ? "Waitlist on" : "No waitlist"}</Badge>
      </CardContent>
    </Card>
  );
}

function getCreatePublishState(wizard: CreateEventWizardState) {
  if (wizard.locationType === "external_venue") {
    return {
      status: "Waiting for venue approval",
      action: "Submit for venue approval",
      helper: "The place owner needs to approve the date and setup before this event goes live.",
    };
  }
  if (wizard.locationType === "public_place") {
    return {
      status: "Waiting for platform review",
      action: "Submit for platform review",
      helper: "We will do a quick safety check before this event goes live.",
    };
  }
  return {
    status: "Ready to publish",
    action: "Publish event",
    helper: "Everything needed is filled in. You can publish when the preview looks right.",
  };
}

function AIBuilderView(props: OrganizerSurfaceProps) {
  const {
    aiPrompt,
    setAiPrompt,
    aiDraft,
    confirmedAIFields,
    setConfirmedAIFields,
    generateDraft,
    wizard,
    setWizard,
  } = props;
  const allConfirmed = aiDraft
    ? aiDraft.requiredConfirmations.every((field) => confirmedAIFields.includes(field))
    : false;

  if (wizard.mode === "ai" && aiDraft && allConfirmed) {
    return <CreateWizardView {...props} currentSlug="create" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-4 w-4 text-primary" /> Start with AI</CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe the event idea. AI will draft the basics, then you edit the same five steps.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="h-40 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm"
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            placeholder="Example: a casual rooftop mixer for 60 people with music, $25 tickets and an easy-going vibe."
          />
          <Button onClick={generateDraft}>Generate draft</Button>
          {aiDraft && (
            <div className="rounded-xl border border-border p-4">
              <GeneratedAIPlan draft={aiDraft} />
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Confirm before continuing</CardTitle>
          <p className="text-xs text-muted-foreground">These fields must be checked by a person.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {(aiDraft?.requiredConfirmations ?? ["Venue or location", "Date and time", "Capacity", "Price", "Attendance rule", "AI helper mode"]).map((field) => (
            <label key={field} className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
              <input
                type="checkbox"
                checked={confirmedAIFields.includes(field)}
                disabled={!aiDraft}
                onChange={(event) =>
                  setConfirmedAIFields(
                    event.target.checked
                      ? [...confirmedAIFields, field]
                      : confirmedAIFields.filter((item) => item !== field),
                  )
                }
              />
              {field}
            </label>
          ))}
          <Button
            className="w-full"
            disabled={!aiDraft || !allConfirmed}
            onClick={() => aiDraft && setWizard(createWizardStateFromAI(aiDraft, wizard))}
          >
            Continue in 5-step wizard
          </Button>
          {!aiDraft && <p className="text-xs text-muted-foreground">Generate a draft first.</p>}
          {aiDraft && !allConfirmed && <p className="text-xs text-muted-foreground">Confirm the critical fields before continuing.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function GeneratedAIPlan({ draft }: { draft: AIEventDraft }) {
  return (
    <div className="space-y-4">
      <InfoBlock title={draft.title} rows={[draft.description, draft.schedule, draft.promoCopy]} />
      <div className="grid gap-3 md:grid-cols-2">
        <InfoBlock title="FAQ" rows={draft.faq} />
        <InfoBlock title="Venue requirements" rows={draft.suggestedVenueRequirements} />
      </div>
    </div>
  );
}

function VenueFinderView({ currentSlug, requestVenueAccess, venueRequests }: OrganizerSurfaceProps) {
  const [filter, setFilter] = useState<string>("all");

  const allVenues = useMemo(() => {
    const closedVenue = {
      ...adminVenues[1],
      policy: { ...adminVenues[1].policy, mode: "no_external_events" as const },
    };
    return [...adminVenues, closedVenue];
  }, []);

  const venueRequestMap = useMemo(() => {
    const map = new Map<string, VenueRequest>();
    for (const req of venueRequests) {
      const existing = map.get(req.venueId);
      if (!existing) {
        map.set(req.venueId, req);
      }
    }
    return map;
  }, [venueRequests]);

  const filteredVenues = useMemo(() => {
    return allVenues.filter((venue) => {
      const req = venueRequestMap.get(venue.id);
      const hasPending = req?.status === "pending" || req?.status === "draft";
      const hasApproved = req?.status === "approved";
      const isClosed = venue.policy.mode === "no_external_events";

      switch (filter) {
        case "requestable":
          return !isClosed && !hasPending && !hasApproved;
        case "pending":
          return hasPending;
        case "approved":
          return hasApproved;
        case "closed":
          return isClosed;
        default:
          return true;
      }
    });
  }, [allVenues, venueRequestMap, filter]);

  if (currentSlug === "venue-unavailable") {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-xl font-bold">Площадка недоступна для внешних событий</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Владелец не принимает заявки от внешних организаторов. Выберите другую площадку.
          </p>
          <Link href="/organizer/venues"><Button className="mt-5">Выбрать другую площадку</Button></Link>
        </CardContent>
      </Card>
    );
  }

  if (currentSlug === "venue-detail") {
    const venue = adminVenues[0];
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="relative h-52 overflow-hidden rounded-xl">
              <Image src={demoVenueCover(0)} alt={venue.name} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 60vw" />
            </div>
            <h2 className="mt-4 text-xl font-bold">{venue.name}</h2>
            <p className="text-sm text-muted-foreground">{venue.address} · {venue.capacity} мест</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoBlock title="Правила доступа" rows={[organizerVenuePolicyLabels[venue.policy.mode] ?? venue.policy.mode, `${venue.policy.setupBufferMinutes} мин на подготовку`]} />
              <InfoBlock title="Правила площадки" rows={venue.rules} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Запросить площадку</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Запрос уйдёт владельцу площадки на рассмотрение.</p>
            <Button className="w-full" onClick={() => requestVenueAccess(venue)}>Запросить площадку</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Площадки</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Найдите площадку для события или проверьте запросы владельцам.
          </p>
        </div>
        <Button onClick={() => requestVenueAccess(adminVenues[0])}>
          <Plus className="mr-2 h-4 w-4" />
          Найти площадку
        </Button>
      </div>

      {venueRequests.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Мои запросы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {venueRequests.map((request) => (
              <Link key={request.id} href={`/organizer/venue-requests/${request.id}`}>
                <div className="rounded-xl border border-border p-4 hover:bg-secondary/40">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{request.venueName}</p>
                      <p className="text-sm text-muted-foreground">
                        {organizerRequestStatusLabels[request.status] ?? request.status} · {request.requestedAt}
                      </p>
                    </div>
                    <StatusBadge value={request.status === "draft" ? "pending" : request.status} />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {venueFilterOptions.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {filteredVenues.map((venue, index) => {
          const req = venueRequestMap.get(venue.id);
          const closed = venue.policy.mode === "no_external_events";
          return (
            <Card key={`${venue.id}-${index}`} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="relative h-32 overflow-hidden rounded-xl">
                  <Image src={demoVenueCover(index)} alt={venue.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
                </div>
                <h3 className="mt-4 font-bold">{venue.name}</h3>
                <p className="text-sm text-muted-foreground">{venue.city} · {venue.capacity} мест</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className={cn("border-0", closed ? "bg-red-100 text-red-700" : "bg-secondary text-foreground")}>
                    {organizerVenuePolicyLabels[venue.policy.mode] ?? venue.policy.mode}
                  </Badge>
                  {venue.rating ? (
                    <span className="text-xs text-muted-foreground">★ {venue.rating}</span>
                  ) : null}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={closed ? `/organizer/venues/${venue.id}/unavailable` : `/organizer/venues/${venue.id}/preview`} className="flex-1">
                    <Button className="w-full" variant="outline">{closed ? "Недоступно" : "Подробнее"}</Button>
                  </Link>
                  <Button className="flex-1" disabled={closed} onClick={() => requestVenueAccess(venue)}>
                    {req ? "Посмотреть запрос" : "Запросить"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function VenueRequestsView({ venueRequests, requestVenueAccess, currentSlug }: OrganizerSurfaceProps) {
  if (currentSlug === "venue-request-thread") {
    const request = venueRequests[0];
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">{request.venueName}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[request.message, request.lastReply, "Организатор: загружаю план рассадки и страховку."].map((message, index) => (
              <div key={message} className={cn("rounded-xl p-3 text-sm", index === 1 ? "bg-secondary" : "bg-blue-50 text-blue-950")}>
                {message}
              </div>
            ))}
            <div className="flex gap-2">
              <input className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Сообщение владельцу площадки" />
              <Button><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
        <InfoBlock title="Статус запроса" rows={[organizerRequestStatusLabels[request.status] ?? request.status, organizerVenuePolicyLabels[request.policyMode] ?? request.policyMode, request.requestedAt]} />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Запросы площадок</CardTitle>
          <Button size="sm" onClick={() => requestVenueAccess(adminVenues[0])}><Plus className="h-4 w-4" /> Новый запрос</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {venueRequests.map((request) => (
          <Link key={request.id} href={`/organizer/venue-requests/${request.id}`}>
            <div className="rounded-xl border border-border p-4 hover:bg-secondary/40">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{request.venueName}</p>
                  <p className="text-sm text-muted-foreground">
                    {organizerRequestStatusLabels[request.status] ?? request.status} · {request.requestedAt}
                  </p>
                </div>
                <StatusBadge value={request.status === "draft" ? "pending" : request.status} />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function ParticipantsView({ currentSlug, participants, updateParticipant }: OrganizerSurfaceProps) {
  const mode =
    currentSlug === "applications"
      ? "applications"
      : currentSlug === "waitlist"
        ? "waitlist"
        : currentSlug === "qr-scanner"
          ? "qr"
          : currentSlug === "manual-check-in"
            ? "manual"
            : currentSlug === "check-in"
              ? "check-in"
              : "all";

  const visible = participants.filter((participant) => {
    if (mode === "applications") return participant.status === "applied";
    if (mode === "waitlist") return participant.status === "waitlist";
    return true;
  });

  if (mode === "qr" || mode === "manual") {
    return <CheckInMode mode={mode} participants={participants} updateParticipant={updateParticipant} />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{mode === "check-in" ? "Check-in mode" : "Participants CRM"}</CardTitle>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Participant</th>
                  <th className="px-3 py-2">Event</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Ticket</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((participant) => (
                  <tr key={participant.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">{participant.email}</p>
                    </td>
                    <td className="px-3 py-3">{participant.eventTitle}</td>
                    <td className="px-3 py-3"><StatusBadge value={participant.status} type="participant" /></td>
                    <td className="px-3 py-3">{participant.ticketTier} · {formatMoney(participant.paid)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateParticipant(participant.id, "approved")}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => updateParticipant(participant.id, "waitlist")}>Waitlist</Button>
                        <Button size="sm" onClick={() => updateParticipant(participant.id, "checked_in")}>Check-in</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <InfoBlock
        title="Participant actions"
        rows={["Approve/reject applications", "Move to waitlist", "Manual check-in", "Message participant", "Refund and note"]}
      />
    </div>
  );
}

function CheckInMode({
  mode,
  participants,
  updateParticipant,
}: {
  mode: "qr" | "manual";
  participants: OrganizerParticipant[];
  updateParticipant: (id: string, status: ParticipantStatus) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card className="border-0 bg-[#111827] text-white shadow-sm">
        <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
          {mode === "qr" ? <QrCode className="h-24 w-24" /> : <Search className="h-24 w-24" />}
          <h2 className="mt-5 text-xl font-bold">{mode === "qr" ? "QR scanner state" : "Manual check-in"}</h2>
          <p className="mt-2 text-sm text-white/70">Offline cache active. Refunds are locked during event-day mode.</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Guest list</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {participants.slice(0, 5).map((participant) => (
            <div key={participant.id} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="font-semibold">{participant.name}</p>
                <p className="text-xs text-muted-foreground">{participant.ticketTier}</p>
              </div>
              <Button size="sm" onClick={() => updateParticipant(participant.id, "checked_in")}>Check-in</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const organizerConversationFilters = [
  "Все",
  "Требуют ответа",
  "Участники",
  "Площадки",
  "Черновики ИИ",
  "Объявления",
];

const organizerInboxConversations = [
  {
    title: "Чат участников",
    context: "Sunset Singles Mixer",
    preview: "Можно прийти с другом?",
    time: "12 мин назад",
    status: "Нужно ответить",
    action: "Ответить",
    tone: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
  },
  {
    title: "Черновик ответа ИИ",
    context: "Sunset Singles Mixer · участники",
    preview: "Да, если билеты ещё доступны. Добавьте гостя на странице билета.",
    time: "18 мин назад",
    status: "Есть черновик ИИ",
    action: "Проверить черновик",
    tone: "bg-[#eef2ff] text-[#3949d7] border border-[#c7d2fe]",
  },
  {
    title: "Владелец площадки",
    context: "The Penmar · Sunset Singles Mixer",
    preview: "План расстановки получили, ждём подтверждение по звуку.",
    time: "Сегодня, 10:40",
    status: "Ожидает владельца",
    action: "Написать владельцу",
    tone: "bg-[#f8fafc] text-[#475569] border border-[#dde4ee]",
  },
  {
    title: "Объявление гостям",
    context: "Sunset Singles Mixer",
    preview: "Напоминание о времени входа и правилах чата готово к отправке.",
    time: "Черновик",
    status: "Объявление готово",
    action: "Создать объявление",
    tone: "bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]",
  },
  {
    title: "Сообщения участникам",
    context: "AI Networking Breakfast",
    preview: "Новых сообщений нет.",
    time: "Вчера",
    status: "Без новых сообщений",
    action: "Открыть чат",
    tone: "bg-white text-[#475569] border border-[#dde4ee]",
  },
];

function OrganizerMessagesInbox({ audit }: Pick<OrganizerSurfaceProps, "audit">) {
  return (
    <div className="space-y-5">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex gap-2 overflow-x-auto">
            {organizerConversationFilters.map((filter, index) => (
              <button
                key={filter}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                  index === 0
                    ? "border-[#111827] bg-[#111827] text-white"
                    : "border-border bg-white text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {organizerInboxConversations.map((conversation) => (
          <Card key={`${conversation.title}-${conversation.context}`} className="border-0 shadow-sm">
            <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold tracking-normal text-[#111827]">{conversation.title}</h2>
                  <Badge className={conversation.tone}>{conversation.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{conversation.context}</p>
                <p className="mt-3 text-sm text-[#111827]">{conversation.preview}</p>
                <p className="mt-2 text-xs text-muted-foreground">{conversation.time}</p>
              </div>
              <Button
                className="w-full lg:w-auto"
                variant={conversation.action === "Открыть чат" ? "outline" : "default"}
                onClick={() => audit(conversation.action, conversation.context)}
              >
                {conversation.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrganizerChatsView({ currentSlug, audit }: OrganizerSurfaceProps) {
  if (currentSlug === "messages") {
    return <OrganizerMessagesInbox audit={audit} />;
  }

  const isAnnouncement = currentSlug === "announcements";
  const isDrafts = currentSlug === "ai-draft-replies";
  const isInbox = currentSlug === "direct-messages";

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_1fr_320px]">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          {["Event chat", "Direct messages", "Venue owner", "AI drafts"].map((thread) => (
            <Link key={thread} href={thread === "Direct messages" ? "/organizer/inbox" : thread === "AI drafts" ? "/organizer/inbox/ai-drafts" : "/organizer/events/evt_123/chat"}>
              <div className="rounded-xl p-3 text-sm hover:bg-secondary/50">{thread}</div>
            </Link>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{isAnnouncement ? "Announcements composer" : isDrafts ? "AI draft replies" : isInbox ? "Direct messages" : "Event chat"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Maya", "Can I bring a friend?"],
            ["AI draft", "Yes, if tickets are available. Add +1 from your ticket page."],
            ["Organizer", "Reminder goes out tomorrow at 10:00."],
          ].map(([author, text]) => (
            <div key={`${author}-${text}`} className={cn("max-w-[86%] rounded-xl p-3 text-sm", author === "Organizer" ? "ml-auto bg-blue-50 text-blue-950" : author === "AI draft" ? "bg-purple-50 text-purple-950" : "bg-secondary")}>
              <p className="font-semibold">{author}</p>
              <p className="mt-1 text-xs opacity-85">{text}</p>
            </div>
          ))}
          <textarea className="h-24 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm" placeholder={isAnnouncement ? "Write announcement..." : "Type reply..."} />
          <Button onClick={() => audit(isAnnouncement ? "Announcement sent" : "Chat reply sent", "Sunset Singles Mixer")}>
            <Send className="h-4 w-4" /> Send
          </Button>
        </CardContent>
      </Card>
      <InfoBlock title="AI context" rows={["Mode: Draft replies only", "Confidence threshold: 0.82", "Escalate: refunds, safety, harassment", "Forbidden: legal advice"]} />
    </div>
  );
}

function OrganizerAIAgentsView({ currentSlug, audit }: OrganizerSurfaceProps) {
  const agents = organizerAgentSet();
  if (currentSlug === "knowledge-base") {
    return <InfoBlock title="AI Knowledge Base" rows={["Organizer FAQ", "Refund policy", "Venue rules", "Failed answers review", "Source freshness check"]} />;
  }
  if (currentSlug === "ai-test-conversation") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">AI test conversation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <textarea className="h-28 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm" defaultValue="Can I get a refund if I cannot attend?" />
          <div className="rounded-xl bg-purple-50 p-4 text-sm text-purple-950">Draft answer generated. Confidence 78%, no auto-send because refund topic triggers escalation.</div>
          <Button onClick={() => audit("AI test run", "Refund question", "ai_low_confidence")}>Run test</Button>
        </CardContent>
      </Card>
    );
  }
  if (currentSlug === "ai-analytics") {
    return <InfoBlock title="AI Analytics" rows={["124 questions answered", "18 human handoffs", "6 low-confidence drafts", "12 ticket conversions"]} />;
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Mode controls</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {["Off", "Draft replies only", "Auto-reply safe questions", "Auto-reply + escalation"].map((mode) => (
            <button key={mode} onClick={() => audit("AI mode selected", mode)} className="w-full rounded-xl border border-border p-3 text-left text-sm hover:bg-secondary/50">
              {mode}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizerPromotionView({ currentSlug, campaigns, setCampaigns, audit }: OrganizerSurfaceProps) {
  if (currentSlug === "campaign-builder" || currentSlug === "promotion-targeting") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Campaign builder</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <input className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" defaultValue="Sunset Singles boost" />
          <div className="grid gap-3 md:grid-cols-3">
            {["Audience", "Budget", "Schedule"].map((item) => (
              <input key={item} className="h-10 rounded-lg border border-input bg-background px-3 text-sm" defaultValue={item} />
            ))}
          </div>
          <Button onClick={() => {
            setCampaigns([{ ...campaigns[0], id: `camp_${Date.now()}`, name: "New boost campaign", status: "pending" }, ...campaigns]);
            audit("Campaign draft created", "New boost campaign");
          }}>Create campaign</Button>
        </CardContent>
      </Card>
    );
  }
  if (currentSlug === "creative-studio") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="relative h-48 overflow-hidden rounded-xl">
              <Image src={demoAdminImages.promoCreative} alt="AI creative" fill className="object-cover" sizes="(max-width: 1280px) 100vw, 60vw" />
            </div>
            <textarea className="mt-4 h-28 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm" defaultValue="Generate three safe promo variants for a sunset social." />
            <Button className="mt-3" onClick={() => audit("AI creative generated", "Sunset social creative")}>Generate creative</Button>
          </CardContent>
        </Card>
        <InfoBlock title="Policy pre-check" rows={["No misleading urgency", "No unsafe dating claims", "AI generated label visible"]} />
      </div>
    );
  }
  if (currentSlug === "campaign-analytics") {
    const funnel = calculateCampaignFunnel(campaigns[0]);
    return <FunnelCard title="Campaign analytics" rows={funnel} />;
  }
  if (currentSlug === "promo-codes") {
    return <InfoBlock title="Promo Codes" rows={["EARLY20 · 12/50 used", "FRIEND10 · referral attribution", "VIP25 · hidden ticket tier"]} />;
  }
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="relative h-28 overflow-hidden rounded-xl">
              <Image src={demoAdminImages.promoCreative} alt={campaign.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
            </div>
            <h3 className="mt-4 font-bold">{campaign.name}</h3>
            <p className="text-sm text-muted-foreground">{campaign.channel} · {formatMoney(campaign.spend)}</p>
            <div className="mt-3 flex items-center justify-between">
              <StatusBadge value={campaign.status} type="plain" />
              <Button size="sm" variant="outline" onClick={() => audit("Campaign opened", campaign.name)}>Open</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrganizerFinanceView({ currentSlug, ledgerEntries, selectedEvent, audit }: OrganizerSurfaceProps) {
  const pathname = usePathname();
  const totals = calculateLedgerTotals(ledgerEntries);
  const isTopLevelMoney = ["/organizer/money", "/organizer/payouts"].includes(pathname);
  const isRefunds = currentSlug === "refunds";
  const isDisputes = currentSlug === "disputes";

  if (isTopLevelMoney) {
    const available = Math.max(totals.gross - totals.fees, 0);
    const refundTotal = Math.abs(
      ledgerEntries.filter((entry) => entry.type === "refund").reduce((sum, entry) => sum + entry.amount, 0),
    );
    const revenueRows = [
      {
        event: "Sunset Singles Mixer",
        tickets: "42/80",
        gross: formatMoney(1050),
        fees: formatMoney(84),
        net: formatMoney(966),
        status: "Готово к выплате",
        tone: "bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]",
      },
      {
        event: "AI Networking Breakfast",
        tickets: "28/60",
        gross: formatMoney(625),
        fees: formatMoney(50),
        net: formatMoney(541),
        status: "Ожидает обработки",
        tone: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
      },
      {
        event: "Late Night Warehouse Party",
        tickets: "0/120",
        gross: formatMoney(0),
        fees: formatMoney(0),
        net: formatMoney(0),
        status: "Нужны данные для выплаты",
        tone: "bg-[#fff0ef] text-[#c52b20] border border-[#ffb3ad]",
      },
    ];
    const setupRows = [
      ["Способ выплаты", "Добавлен"],
      ["Налоговая информация", "Нужны данные для выплаты"],
      ["Подтверждение личности", "Добавьте данные"],
    ];

    return (
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Доступно к выплате" value={formatMoney(available)} helper="после комиссий" tone="good" />
          <MetricCard label="Ожидает выплаты" value={formatMoney(totals.pending)} helper="следующая обработка" tone="warn" />
          <MetricCard label="Выручка за месяц" value={formatMoney(totals.gross)} helper="по билетам" tone="info" />
          <MetricCard label="Возвраты" value={formatMoney(refundTotal)} helper="нет новых списаний" tone="neutral" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Статус выплаты</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <InfoRow label="Следующая сумма" value={formatMoney(totals.pending)} />
                  <InfoRow label="Ожидаемая дата" value="Завтра" />
                  <InfoRow label="Подготовка" value="Нужны данные для выплаты" />
                  <InfoRow label="Последняя выплата" value="Выплачено" />
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  Добавьте налоговую информацию и подтвердите личность, чтобы следующая выплата прошла без задержки.
                </div>
                <Button onClick={() => audit("Открыли настройки выплат", "Деньги")}>Добавить данные</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Выручка по событиям</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {revenueRows.map((row) => (
                  <div key={row.event} className="grid gap-3 rounded-xl border border-border p-4 lg:grid-cols-[1.3fr_repeat(5,minmax(88px,auto))] lg:items-center">
                    <div>
                      <p className="font-semibold text-[#111827]">{row.event}</p>
                      <p className="text-xs text-muted-foreground">Билеты: {row.tickets}</p>
                    </div>
                    <InfoRow label="Выручка" value={row.gross} />
                    <InfoRow label="Комиссии" value={row.fees} />
                    <InfoRow label="К выплате" value={row.net} />
                    <Badge className={row.tone}>{row.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => audit("Открыли событие", row.event)}>Открыть событие</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Возвраты и споры</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <Badge className="border border-[#ffd88c] bg-[#fff5dd] text-[#a76100]">Возврат запрошен</Badge>
                  <p className="mt-3 font-semibold text-[#111827]">1 запрос на возврат</p>
                  <p className="mt-1 text-sm text-muted-foreground">Гость просит вернуть билет в разрешённый срок.</p>
                  <Button className="mt-3" size="sm" variant="outline" onClick={() => audit("Проверили возврат", selectedEvent.title)}>Проверить возврат</Button>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <Badge className="border border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]">Возврат выполнен</Badge>
                  <p className="mt-3 font-semibold text-[#111827]">{formatMoney(refundTotal)} возвращено</p>
                  <p className="mt-1 text-sm text-muted-foreground">Новых спорных платежей нет.</p>
                  <Button className="mt-3" size="sm" variant="outline" onClick={() => audit("Открыли детали возвратов", "Деньги")}>Посмотреть детали</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Настройка выплат</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {setupRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                  <span className="font-medium text-[#111827]">{label}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
              <div className="rounded-xl bg-[#fff7ed] p-3 text-sm text-[#9a3412]">
                Следующее действие: добавьте данные для выплаты.
              </div>
              <Button className="w-full" onClick={() => audit("Открыли настройки выплат", "Деньги")}>Настроить выплаты</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{isRefunds ? "Refund requests" : isDisputes ? "Disputes" : "Payouts & ledger"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Gross" value={formatMoney(totals.gross)} tone="good" />
            <MetricCard label="Fees" value={formatMoney(totals.fees)} tone="neutral" />
            <MetricCard label="Pending" value={formatMoney(totals.pending)} tone="warn" />
            <MetricCard label="Blocked" value={totals.blocked} tone="danger" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs text-muted-foreground">
                <tr><th className="px-3 py-2">Entry</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Status</th></tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-border">
                    <td className="px-3 py-3">{entry.eventTitle}</td>
                    <td className="px-3 py-3">{entry.type}</td>
                    <td className="px-3 py-3">{formatMoney(entry.amount)}</td>
                    <td className="px-3 py-3"><Badge variant="outline">{entry.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{isRefunds ? "Refund decision" : "KYC required"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Payout transfer is blocked until KYC is complete. Ledger continues accruing.
          </div>
          <Button
            variant={isRefunds ? "destructive" : "outline"}
            onClick={() => audit(isRefunds ? "Refund requested" : "KYC opened", selectedEvent.title, isRefunds ? "refund_policy" : undefined)}
          >
            {isRefunds ? "Approve refund" : "Open KYC"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const organizerProfileReviews = [
  {
    text: "Очень тёплый формат: ведущий помог всем познакомиться без неловкости.",
    author: "Maya Chen",
    event: "Sunset Singles Mixer",
  },
  {
    text: "Понятные правила, хорошая музыка и быстрые ответы перед событием.",
    author: "Jordan Blake",
    event: "AI Networking Breakfast",
  },
  {
    text: "Хочу больше вариантов для гостей с особыми пожеланиями по еде.",
    author: "Emma Wilson",
    event: "Candlelit Ceramics Workshop",
  },
];

const organizerProfileCompleteness = [
  { label: "Аватар", value: "Добавлен" },
  { label: "Обложка", value: "Добавлена" },
  { label: "Описание", value: "Заполнено" },
  { label: "Соцсети", value: "Добавьте сайт" },
  { label: "Доверие", value: "Подтвердите контакт" },
];

function OrganizerPublicProfileCard() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className="relative h-40 bg-[#eef2f7]">
        <Image src={demoEventCovers.sunsetMixer} alt="Обложка организатора" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 520px" />
      </div>
      <CardContent className="space-y-4 p-5">
        <div className="-mt-12 flex items-end gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm">
            <Image src="/demo/avatars/avatar-01.png" alt="Аватар организатора" fill className="object-cover" sizes="80px" />
          </div>
          <div className="pb-1">
            <h2 className="text-xl font-bold tracking-normal text-[#111827]">The Penmar Events</h2>
            <p className="text-sm text-muted-foreground">Los Angeles · Venice</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">4.8 рейтинг</Badge>
          <Badge className="border border-[#dde4ee] bg-white text-[#475569]">12 ближайших событий</Badge>
          <Badge className="border border-[#dde4ee] bg-white text-[#475569]">Социальные встречи</Badge>
          <Badge className="border border-[#dde4ee] bg-white text-[#475569]">Музыка</Badge>
        </div>

        <p className="text-sm leading-relaxed text-[#475569]">
          Организуем тёплые социальные события с понятными правилами, дружелюбным ведущим и безопасным общением для гостей.
        </p>
      </CardContent>
    </Card>
  );
}

function OrganizerProfileView({ currentSlug, audit }: OrganizerSurfaceProps) {
  const reviewsOnly = currentSlug === "reviews" || currentSlug === "review-response";

  if (currentSlug === "public-profile-preview") {
    return (
      <div className="grid gap-6 xl:grid-cols-[520px_1fr]">
        <OrganizerPublicProfileCard />
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Предпросмотр профиля</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Так гости видят карточку организатора перед покупкой билета или заявкой на событие.</p>
            <Link href="/host/org1">
              <Button variant="outline">Открыть публичную страницу</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reviewsOnly) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Отзывы и доверие</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Рейтинг" value="4.8" helper="средняя оценка" tone="good" />
            <MetricCard label="Отзывы" value="38" helper="от гостей" tone="info" />
            <MetricCard label="Профиль" value="подтверждён" helper="доверие гостей" tone="good" />
            <MetricCard label="Ответ" value="2 ч" helper="обычно отвечаете" tone="neutral" />
          </div>
          {organizerProfileReviews.map((review) => (
            <div key={`${review.author}-${review.event}`} className="rounded-xl border border-border p-4">
              <p className="text-sm text-[#111827]">{review.text}</p>
              <p className="mt-2 text-xs text-muted-foreground">{review.author} · {review.event}</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => audit("Ответ на отзыв подготовлен", review.event)}>
                Ответить на отзыв
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[520px_1fr]">
      <OrganizerPublicProfileCard />

      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Редактирование профиля</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Название организатора</span>
              <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" defaultValue="The Penmar Events" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Описание</span>
              <textarea
                className="h-24 resize-none rounded-lg border border-input bg-background p-3 text-sm"
                defaultValue="Организуем тёплые социальные события с понятными правилами, дружелюбным ведущим и безопасным общением для гостей."
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Категории и интересы</span>
                <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" defaultValue="Социальные встречи, музыка, нетворкинг" />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Соцсети</span>
                <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" defaultValue="@thepenmarevents" />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Как с вами связываться</span>
              <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" defaultValue="messages">
                <option value="messages">Сообщения в SparkIRL</option>
                <option value="email">Email для гостей</option>
              </select>
            </label>
            <Button onClick={() => audit("Профиль сохранён", "The Penmar Events")}>Сохранить профиль</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Отзывы и доверие</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <MetricCard label="Рейтинг" value="4.8" helper="средняя оценка" tone="good" />
              <MetricCard label="Отзывы" value="38" helper="от гостей" tone="info" />
              <MetricCard label="Профиль" value="подтверждён" helper="доверие гостей" tone="good" />
              <MetricCard label="Ответ" value="2 ч" helper="обычно отвечаете" tone="neutral" />
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-[#111827]">{organizerProfileReviews[0].text}</p>
              <p className="mt-2 text-xs text-muted-foreground">{organizerProfileReviews[0].author} · {organizerProfileReviews[0].event}</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => audit("Ответ на отзыв подготовлен", organizerProfileReviews[0].event)}>
                Ответить на отзыв
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Заполненность профиля</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {organizerProfileCompleteness.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                <span className="font-medium text-[#111827]">{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
            ))}
            <div className="rounded-xl bg-[#fff7ed] p-3 text-sm text-[#9a3412]">
              Следующее действие: добавьте сайт и подтвердите контакт, чтобы гостям было проще вам доверять.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrganizerSettingsView({ screen, audit }: OrganizerSurfaceProps) {
  const isTeam = screen.slug === "team";
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{isTeam ? "Team & permissions" : "Organizer settings"}</CardTitle>
          <Button onClick={() => audit(isTeam ? "Teammate invited" : "Settings saved", isTeam ? "Team" : "Settings")}>{isTeam ? "Invite" : "Save"}</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {(isTeam
          ? [["Maya", "Check-in staff"], ["Nina", "Event manager"], ["Alex", "Finance"]]
          : [["Notifications", "Approval, refund and chat alerts"], ["Integrations", "Pixel, GTM, Zapier"], ["Safety", "AI escalation and forbidden topics"]]
        ).map(([title, text]) => (
          <div key={title} className="rounded-xl border border-border p-4">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function OrganizerFallbackView({ activeSurface, audit }: OrganizerSurfaceProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{activeSurface.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{activeSurface.description}</p>
            <Button className="mt-4" variant="outline" onClick={() => audit("Surface opened", activeSurface.title)}>
              Log action
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrganizerEdgeStates({ currentSlug, event }: { currentSlug: string; event: AdminEvent }) {
  const states = [
    ["Loading", "Skeleton tables and wizard panels after 200ms.", Clock],
    ["Empty", "First launch and empty venue request states are actionable.", FileText],
    ["Error", "Retry with human-readable failure.", AlertTriangle],
    ["Offline", "Read-only cache, check-in allowed, refunds locked.", Lock],
    ["Partial", "Analytics and payout webhooks can lag operational data.", CalendarDays],
    ["Permission", "Organizer waits for venue/platform decisions.", ShieldCheck],
  ];
  const contextual = [
    currentSlug.includes("unavailable") && "No external events disabled venue",
    event.approvalGates.some((gate) => gate.status === "rejected") && "Rejected review with path forward",
    event.approvalGates.some((gate) => gate.status === "changes_requested") && "Changes requested checklist",
    currentSlug.includes("payout") && "KYC required payout state",
    currentSlug.includes("ai") && "AI confidence low: draft only",
  ].filter(Boolean);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {states.map(([title, text, Icon]) => {
            const TypedIcon = Icon as typeof Clock;
            return (
              <div key={title as string} className="rounded-xl border border-border bg-secondary/40 p-3">
                <TypedIcon className="h-4 w-4 text-primary" />
                <p className="mt-2 text-sm font-semibold">{title as string}</p>
                <p className="mt-1 text-xs text-muted-foreground">{text as string}</p>
              </div>
            );
          })}
        </div>
        {contextual.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {contextual.map((item) => <Badge key={item as string} variant="outline">{item}</Badge>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function InfoBlock({ title, rows }: { title: string; rows: string[] }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>{row}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FunnelCard({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map((row) => row.value));
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-24 text-sm">{row.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(6, (row.value / max) * 100)}%` }} />
            </div>
            <span className="w-14 text-right text-sm font-semibold">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

type WizardProps = {
  wizard: CreateEventWizardState;
  setWizard: (state: CreateEventWizardState) => void;
};

interface OrganizerSurfaceProps {
  screen: AdminScreenDefinition;
  activeSurface: AdminScreenSurface;
  currentSlug: string;
  events: AdminEvent[];
  selectedEvent: AdminEvent;
  setEvents: (events: AdminEvent[] | ((events: AdminEvent[]) => AdminEvent[])) => void;
  wizard: CreateEventWizardState;
  setWizard: (state: CreateEventWizardState) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  aiDraft: AIEventDraft | null;
  confirmedAIFields: string[];
  setConfirmedAIFields: (fields: string[]) => void;
  venueRequests: VenueRequest[];
  participants: OrganizerParticipant[];
  campaigns: OrganizerCampaign[];
  setCampaigns: (campaigns: OrganizerCampaign[] | ((campaigns: OrganizerCampaign[]) => OrganizerCampaign[])) => void;
  ledgerEntries: OrganizerLedgerEntry[];
  localAudit: OrganizerAuditEntry[];
  audit: (action: string, entity: string, reasonCode?: string) => void;
  updateParticipant: (id: string, status: ParticipantStatus) => void;
  submitManualDraft: () => void;
  generateDraft: () => void;
  submitAIDraft: () => void;
  requestVenueAccess: (venue?: (typeof adminVenues)[number]) => void;
  publishSelectedEvent: () => void;
}
