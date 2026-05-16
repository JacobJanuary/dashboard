"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  KeyRound,
  Megaphone,
  MessageSquare,
  Plus,
  QrCode,
  Sparkles,
} from "lucide-react";
import {
  adminEvents,
  adminVenues,
  aiAgents,
  appeals,
  auditLogs,
  claims,
  complaints,
  enforcementActions,
  evidenceItems,
  getScreen,
  moderationCases,
  organizerAccessRequests,
  participants,
  promotionCampaigns,
  roleBasePaths,
  roleLabels,
} from "@/lib/admin-data";
import {
  applyGateDecision,
  canAccessRoute,
  canPerformAction,
  type AdminAction,
} from "@/lib/admin-guards";
import type {
  AdminEvent,
  AdminRole,
  AdminScreenDefinition,
  AdminScreenSurface,
  AdminVenue,
  AuditLogEntry,
  VenuePolicy,
} from "@/lib/admin-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActionToast,
  AgentCard,
  ApprovalTracker,
  AuditLogPanel,
  ChatThread,
  DecisionPanel,
  MetricCard,
  OperationalStatesPanel,
  PermissionDeniedState,
  PublicPreviewFrame,
  SkeletonState,
  StatusBadge,
  VenuePolicySelector,
  venuePolicyLabels,
} from "./admin-ui";
import { OrganizerAdminV3 } from "./OrganizerAdminV3";
import { VenueOwnerAdminV3 } from "./VenueOwnerAdminV3";
import { ModeratorAdminV3 } from "./ModeratorAdminV3";
import { cn } from "@/lib/utils";
import { demoAdminImages, demoVenueCover } from "@/lib/demo-assets";

function makeLocalAudit(
  role: AdminRole,
  action: string,
  entity: string,
  reasonCode?: string,
): AuditLogEntry {
  return {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    actor: roleLabels[role],
    actorRole: role,
    action,
    entity,
    reasonCode,
    createdAt: "Только что",
  };
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

const surfaceTypeLabels: Record<AdminScreenSurface["surfaceType"], string> = {
  page: "Section",
  tab: "Tab",
  drawer: "Detail drawer",
  detail_panel: "Detail panel",
  wizard_step: "Wizard step",
  action: "Action",
};

function getActiveSurface(screen: AdminScreenDefinition): AdminScreenSurface {
  return (
    screen.activeSurface ?? {
      slug: screen.slug,
      title: screen.title,
      description: screen.description,
      surfaceType: "page",
      variant: screen.variant,
      detail: screen.detail,
      destructiveActions: screen.destructiveActions,
      partialData: screen.partialData,
      prototypeRefs: screen.prototypeRefs,
    }
  );
}

function surfaceHref(role: AdminRole, screen: AdminScreenDefinition, surface: AdminScreenSurface) {
  const basePath = roleBasePaths[role];
  if (surface.slug === screen.slug || surface.surfaceType === "page") {
    return screen.slug === "dashboard" ? basePath : `${basePath}/${screen.slug}`;
  }
  return `${basePath}/${surface.slug}`;
}

function SectionTabs({
  role,
  screen,
  activeSurface,
}: {
  role: AdminRole;
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
              <Link key={surface.slug} href={surfaceHref(role, screen, surface)} className="shrink-0">
                <button
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-border bg-white text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <span>{surface.title}</span>
                  {surface.prototypeRefs && surface.prototypeRefs.length > 0 && (
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

export function RoleAdminScreen({
  role,
  slug,
}: {
  role: AdminRole;
  slug?: string;
}) {
  const screen = getScreen(role, slug);
  const activeSurface = getActiveSurface(screen);
  const [events, setEvents] = useState(adminEvents);
  const [venuePolicy, setVenuePolicy] = useState<VenuePolicy>(adminVenues[0].policy);
  const [localAudit, setLocalAudit] = useState<AuditLogEntry[]>([]);
  const [toast, setToast] = useState("");
  const [permissionDemo, setPermissionDemo] = useState(false);

  const selectedEvent = events[0];

  const registerDecision = (
    decision: string,
    reasonCode?: string,
    entity = selectedEvent.title,
    action: AdminAction = "audit:write",
  ) => {
    setToast(`${decision}: ${entity}${reasonCode ? ` · ${reasonCode}` : ""}`);
    setLocalAudit((logs) => [
      makeLocalAudit(role, decision, entity, reasonCode),
      ...logs,
    ]);

    if (action === "approval:venue_gate" || action === "approval:platform_gate") {
      setEvents((current) =>
        current.map((event) =>
          event.id === selectedEvent.id
            ? applyGateDecision({
                event,
                role,
                decision,
                reasonCode,
                decidedBy: roleLabels[role],
              })
            : event,
        ),
      );
    }
  };

  const metrics = getTopMetrics(role, events);

  if (!canAccessRoute(role, screen)) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <PermissionDeniedState role={screen.requiredRole} />
      </div>
    );
  }

  if (role === "organizer") {
    return <OrganizerAdminV3 screen={screen} activeSurface={activeSurface} />;
  }

  if (role === "venue_owner") {
    return <VenueOwnerAdminV3 screen={screen} activeSurface={activeSurface} />;
  }

  if (role === "moderator") {
    return <ModeratorAdminV3 screen={screen} activeSurface={activeSurface} />;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="admin-page-head flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-[#eef2ff] text-[#3949d7] border-0">{roleLabels[role]}</Badge>
            <Badge className="bg-[#f8fafc] text-[#475569] border border-[#dde4ee]">{screen.navGroup}</Badge>
            {activeSurface.surfaceType !== "page" && (
              <Badge className="bg-[#eef2ff] text-[#3949d7] border-0">
                {surfaceTypeLabels[activeSurface.surfaceType]}
              </Badge>
            )}
            {(activeSurface.partialData || screen.partialData) && (
              <Badge className="bg-[#eaf4ff] text-[#0969b9] border-0">Partial data ready</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-normal">{activeSurface.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{activeSurface.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPermissionDemo((value) => !value)}>
            <KeyRound className="h-4 w-4" />
            403 state
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => registerDecision("Quick audit ping")}>
            <Plus className="h-4 w-4" />
            Audit action
          </Button>
        </div>
      </div>

      <SectionTabs role={role} screen={screen} activeSurface={activeSurface} />

      {permissionDemo && <PermissionDeniedState role={screen.requiredRole} />}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {renderVariant({
        role,
        screen,
        events,
        venues: adminVenues,
        venuePolicy,
        setVenuePolicy,
        registerDecision,
        localAudit,
      })}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <OperationalStatesPanel partialData={screen.partialData} permissionRole={screen.requiredRole} />
        <AuditLogPanel logs={auditLogs.filter((log) => log.actorRole === role || role === "moderator")} localLogs={localAudit} />
      </div>

      <ActionToast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function getTopMetrics(role: AdminRole, events: AdminEvent[]) {
  if (role === "moderator") {
    return [
      { label: "Open review items", value: moderationCases.length, helper: "SLA prioritized", tone: "warn" as const },
      { label: "Critical risks", value: moderationCases.filter((item) => item.severity === "critical").length, helper: "Escalated now", tone: "danger" as const },
      { label: "Claims pending", value: claims.filter((claim) => claim.status === "pending").length, helper: "Ownership verification", tone: "info" as const },
      { label: "Appeals", value: appeals.length, helper: "Final decision audit", tone: "neutral" as const },
    ];
  }

  if (role === "venue_owner") {
    return [
      { label: "Owned venues", value: adminVenues.length, helper: "2 verified, 1 pending", tone: "good" as const },
      { label: "Organizer requests", value: organizerAccessRequests.length, helper: "1 needs changes", tone: "warn" as const },
      { label: "External event gates", value: events.filter((event) => event.locationType === "external_venue").length, helper: "Owner decisions", tone: "info" as const },
      { label: "Utilization", value: "68%", helper: "Month to date", tone: "neutral" as const },
    ];
  }

  return [
    { label: "Active events", value: events.length, helper: "Across all statuses", tone: "info" as const },
    { label: "Tickets sold", value: events.reduce((sum, event) => sum + event.ticketsSold, 0), helper: "This month", tone: "good" as const },
    { label: "Blocked by gates", value: events.filter((event) => event.publicationStatus === "blocked_until_gates_pass").length, helper: "Approval tracker", tone: "warn" as const },
    { label: "Revenue", value: formatMoney(events.reduce((sum, event) => sum + event.revenue, 0)), helper: "Before payouts", tone: "neutral" as const },
  ];
}

function renderVariant(props: {
  role: AdminRole;
  screen: AdminScreenDefinition;
  events: AdminEvent[];
  venues: AdminVenue[];
  venuePolicy: VenuePolicy;
  setVenuePolicy: (policy: VenuePolicy) => void;
  registerDecision: (decision: string, reasonCode?: string, entity?: string, action?: AdminAction) => void;
  localAudit: AuditLogEntry[];
}) {
  const variant = getActiveSurface(props.screen).variant ?? props.screen.variant;
  switch (variant) {
    case "dashboard":
      return <DashboardView {...props} />;
    case "events":
      return <EventsView {...props} />;
    case "event_detail":
      return <EventDetailView {...props} />;
    case "create":
      return <CreateOrClaimView {...props} />;
    case "ai_builder":
      return <AIBuilderView {...props} />;
    case "venues":
      return <VenuesView {...props} />;
    case "venue_detail":
      return <VenueDetailView {...props} />;
    case "policy":
      return <PolicyView {...props} />;
    case "approvals":
      return <ApprovalsView {...props} />;
    case "participants":
      return <ParticipantsView {...props} />;
    case "chats":
      return <ChatsView {...props} />;
    case "ai_agents":
      return <AIAgentsView {...props} />;
    case "promotion":
      return <PromotionView {...props} />;
    case "finance":
      return <FinanceView {...props} />;
    case "calendar":
      return <CalendarView {...props} />;
    case "team":
      return <TeamView {...props} />;
    case "audit":
      return <AuditLogPanel logs={auditLogs} localLogs={props.localAudit} />;
    case "moderation_queue":
      return <ModerationQueueView {...props} />;
    case "complaints":
      return <ComplaintsView {...props} />;
    case "claims":
      return <ClaimsView {...props} />;
    case "evidence":
      return <EvidenceView />;
    case "enforcement":
      return <EnforcementView {...props} />;
    case "appeals":
      return <AppealsView {...props} />;
    case "rules":
      return <RulesView {...props} />;
    default:
      return <GenericView {...props} />;
  }
}

function getCurrentSurfaceSlug(screen: AdminScreenDefinition) {
  return getActiveSurface(screen).slug;
}

function DashboardView({ role, events, registerDecision }: VariantProps) {
  const primaryEvent = events[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Сегодня в работе</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              icon: Calendar,
              title: role === "moderator" ? "3 moderation cases before SLA" : "Проверить approval gates",
              text: role === "venue_owner" ? "1 event request ожидает venue gate." : "Venue gate pending, platform gate approved.",
            },
            {
              icon: MessageSquare,
              title: "Ответить в inbox",
              text: "AI подготовил draft replies, human review требуется для refunds/safety.",
            },
            {
              icon: Megaphone,
              title: "Promotion check",
              text: "1 campaign needs policy pre-check before running.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => registerDecision("Marked reviewed", undefined, item.title)}>
                  Review
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <ApprovalTracker event={primaryEvent} />
    </div>
  );
}

function EventsView({ role, events, registerDecision }: VariantProps) {
  const canCreate = canPerformAction(role, "event:create");
  const showRevenue = role !== "moderator";
  const gateAction: AdminAction =
    role === "venue_owner" ? "approval:venue_gate" : "approval:platform_gate";

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Events and gates</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              {canCreate && (
                <Link href={role === "venue_owner" ? "/owner/create-event" : "/organizer/events/new"}>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Create
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Event</th>
                  <th className="px-3 py-2">Publication</th>
                  <th className="px-3 py-2">Venue gate</th>
                  <th className="px-3 py-2">Platform gate</th>
                  {showRevenue && <th className="px-3 py-2">Revenue</th>}
                  <th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const venueGate = event.approvalGates.find((gate) => gate.type === "venue")!;
                  const platformGate = event.approvalGates.find((gate) => gate.type === "platform")!;
                  return (
                    <tr key={event.id} className="border-t border-border">
                      <td className="px-3 py-3">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.organizerName} · {event.venueName}</p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge value={event.publicationStatus} type="publication" />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge value={venueGate.status} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge value={platformGate.status} />
                      </td>
                      {showRevenue && <td className="px-3 py-3">{formatMoney(event.revenue)}</td>}
                      <td className="px-3 py-3">
                        <StatusBadge value={event.riskScore > 80 ? "critical" : event.riskScore > 40 ? "medium" : "low"} type="severity" />
                      </td>
                      <td className="px-3 py-3">
                        <Button variant="outline" size="sm" onClick={() => registerDecision("Opened detail", undefined, event.title)}>
                          Open
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {role !== "organizer" && (
        <DecisionPanel
          role={role}
          title={role === "venue_owner" ? "Venue gate decision" : "Platform gate decision"}
          destructive
          action={gateAction}
          resource={{ ownsVenue: role === "venue_owner", fraudContext: false }}
          onDecision={(decision, reason) => registerDecision(decision, reason, undefined, gateAction)}
        />
      )}
    </div>
  );
}

function EventDetailView({ role, events, registerDecision }: VariantProps) {
  const event = events[0];
  const gateAction: AdminAction =
    role === "venue_owner" ? "approval:venue_gate" : "approval:platform_gate";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {event.organizerName} · {event.venueName} · {event.date}
                </p>
              </div>
              <StatusBadge value={event.publicationStatus} type="publication" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="text-lg font-bold">{event.ticketsSold}/{event.capacity}</p>
              </div>
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Refund policy</p>
                <p className="text-sm font-medium">{event.refundPolicy}</p>
              </div>
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Risk score</p>
                <p className="text-lg font-bold">{event.riskScore}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">AI / content scan</p>
              <p className="mt-1 text-sm text-muted-foreground">{event.aiSummary}</p>
            </div>
            <PublicPreviewFrame href={event.publicPreviewUrl} />
          </CardContent>
        </Card>
        <ApprovalTracker event={event} />
      </div>
      <div className="space-y-6">
        {role === "organizer" ? (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Organizer next steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <StepRow done text="Draft complete" />
              <StepRow done={event.approvalGates[0].status === "approved"} text="Venue gate approved" />
              <StepRow done={event.approvalGates[1].status === "approved"} text="Platform gate approved" />
              <Button className="w-full" disabled={event.publicationStatus === "blocked_until_gates_pass"}>
                Publish when gates pass
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DecisionPanel
            role={role}
            destructive
            action={gateAction}
            resource={{ ownsVenue: role === "venue_owner" }}
            onDecision={(decision, reason) => registerDecision(decision, reason, event.title, gateAction)}
          />
        )}
      </div>
    </div>
  );
}

function CreateOrClaimView({ role, registerDecision }: VariantProps) {
  if (role === "venue_owner") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Add / claim venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Search existing venue</span>
                <input className="h-9 rounded-lg border border-input bg-background px-3" defaultValue="Gallery Loft" />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">City</span>
                <input className="h-9 rounded-lg border border-input bg-background px-3" defaultValue="Los Angeles" />
              </label>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">Gallery Loft</p>
                  <p className="text-sm text-muted-foreground">Claim required before editing binding venue policy.</p>
                </div>
                <StatusBadge value="pending" />
              </div>
            </div>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Evidence</span>
              <textarea
                rows={4}
                className="resize-none rounded-lg border border-input bg-background px-3 py-2"
                defaultValue="Business license, domain email, lease screenshot"
              />
            </label>
            <Button onClick={() => registerDecision("Submitted venue claim", undefined, "Gallery Loft")}>
              Submit claim
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verification status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StepRow done text="Duplicate search complete" />
            <StepRow done text="Evidence uploaded" />
            <StepRow text="Moderator review" />
            <StepRow text="Owner rights active" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Create event wizard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Location type", "Basics", "Date and capacity", "Tickets", "Refund policy", "Chat and AI agent", "Promotion", "Public preview"].map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-semibold">{step}</p>
                <p className="text-xs text-muted-foreground">Inline validation and disabled submit until valid.</p>
              </div>
            </div>
          ))}
          <Link href="/organizer/events/new">
            <Button>Open existing wizard</Button>
          </Link>
        </CardContent>
      </Card>
      <ApprovalTracker event={adminEvents[0]} />
    </div>
  );
}

function AIBuilderView({ registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Event Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Event idea</span>
            <textarea
              rows={5}
              className="resize-none rounded-lg border border-input bg-background px-3 py-2"
              defaultValue="A relaxed sunset singles mixer with guided icebreakers, light music, paid tickets, and safe participant chat."
            />
          </label>
          <Button onClick={() => registerDecision("Generated AI event draft", undefined, "Sunset Singles Mixer")}>
            Generate draft
          </Button>
          <div className="grid gap-3 md:grid-cols-2">
            {["Title and description", "Schedule and FAQ", "Suggested tickets", "Venue requirements", "Promo copy", "Risk checklist"].map((item) => (
              <div key={item} className="rounded-xl bg-secondary/40 p-3 text-sm">
                <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Manual confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Exact venue", "Date and time", "Refund policy", "Capacity", "Age restriction", "Promotion budget"].map((item) => (
            <label key={item} className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
          <Link href="/organizer/events/evt_123/approval">
            <Button className="w-full">Continue to approval tracker</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function VenuesView({ role, venues, registerDecision }: VariantProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {venues.map((venue, index) => (
        <Card key={venue.id} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="relative h-28 overflow-hidden rounded-xl">
              <Image
                src={demoVenueCover(index)}
                alt={`${venue.name} demo venue`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{venue.name}</h3>
                <p className="text-sm text-muted-foreground">{venue.city} · {venue.capacity} cap</p>
              </div>
              <StatusBadge value={venue.claimStatus} />
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p>Policy: {venuePolicyLabels[venue.policy.mode]}</p>
              <p>Amenities: {venue.amenities.slice(0, 3).join(", ")}</p>
            </div>
            <div className="mt-4 flex gap-2">
              {role === "organizer" && venue.policy.mode === "no_external_events" ? (
                <Button className="flex-1" variant="outline" disabled>Unavailable</Button>
              ) : (
                <Button className="flex-1" variant="outline" onClick={() => registerDecision("Opened venue", undefined, venue.name)}>
                  Open
                </Button>
              )}
              {role === "organizer" && (
                <Button className="flex-1" onClick={() => registerDecision("Requested venue access", undefined, venue.name)}>
                  Request
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function VenueDetailView({ venues }: VariantProps) {
  const venue = venues[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{venue.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="relative h-24 overflow-hidden rounded-xl"
              >
                <Image
                  src={demoVenueCover(index)}
                  alt={`${venue.name} gallery ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock title="Address / map" rows={[venue.address, venue.city, "Map QA ready"]} />
            <InfoBlock title="Capacity / amenities" rows={[`${venue.capacity} guests`, ...venue.amenities]} />
            <InfoBlock title="Rules" rows={venue.rules} />
            <InfoBlock title="Accessibility" rows={venue.accessibility} />
          </div>
        </CardContent>
      </Card>
      <PublicPreviewFrame href="/host/h1" />
    </div>
  );
}

function PolicyView({ venuePolicy, setVenuePolicy, registerDecision, role }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <VenuePolicySelector policy={venuePolicy} onChange={setVenuePolicy} />
      <DecisionPanel
        role={role}
        title="Policy change audit"
        destructive
        action="venue:policy_edit"
        resource={{ ownsVenue: true, claimStatus: adminVenues[0].claimStatus }}
        onDecision={(decision, reason) =>
          registerDecision(decision, reason, `Policy: ${venuePolicyLabels[venuePolicy.mode]}`, "venue:policy_edit")
        }
      />
    </div>
  );
}

function ApprovalsView({ role, registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {organizerAccessRequests.map((request) => (
            <div key={request.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{request.organizerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.pastEvents} events · {request.rating} rating · {request.complaintCount} complaints
                  </p>
                </div>
                <StatusBadge value={request.status === "blocked" ? "rejected" : request.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{request.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <DecisionPanel
        role={role}
        destructive
        action="venue:approve_organizer"
        resource={{ ownsVenue: role === "venue_owner" }}
        onDecision={(decision, reason) =>
          registerDecision(decision, reason, "Venue organizer request", "venue:approve_organizer")
        }
      />
    </div>
  );
}

function ParticipantsView({ screen, registerDecision }: VariantProps) {
  const surfaceSlug = getCurrentSurfaceSlug(screen);
  const checkInMode = surfaceSlug === "check-in";
  const visibleParticipants =
    surfaceSlug === "applications"
      ? participants.filter((participant) => participant.status === "applied")
      : surfaceSlug === "waitlist"
        ? participants.filter((participant) => participant.status === "waitlist")
        : participants;
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{checkInMode ? "Check-in mode" : "Participants CRM"}</CardTitle>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Ticket</th>
                  <th className="px-3 py-2">Paid</th>
                  <th className="px-3 py-2">Notes</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleParticipants.map((participant) => (
                  <tr key={participant.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">{participant.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge value={participant.status} type="participant" />
                    </td>
                    <td className="px-3 py-3">{participant.ticketTier}</td>
                    <td className="px-3 py-3">{formatMoney(participant.paid)}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{participant.notes}</td>
                    <td className="px-3 py-3">
                      <Button size="sm" onClick={() => registerDecision(checkInMode ? "Checked in" : "Participant updated", undefined, participant.name)}>
                        {checkInMode ? "Check-in" : "Open"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {checkInMode ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">QR scanner state</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-44 items-center justify-center rounded-2xl bg-foreground text-background">
              <QrCode className="h-16 w-16" />
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Offline cached mode: manual check-in is allowed, refunds are locked.
            </div>
          </CardContent>
        </Card>
      ) : (
        <DecisionPanel
          role="organizer"
          action="audit:write"
          onDecision={(decision, reason) => registerDecision(decision, reason, "Participant CRM", "audit:write")}
        />
      )}
    </div>
  );
}

function ChatsView({ role }: VariantProps) {
  if (role === "venue_owner") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Venue inbox</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[220px_1fr]">
          <div className="rounded-xl bg-secondary/50 p-3 text-sm">
            <p className="font-semibold">Venue-scoped threads</p>
            <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
              <span className="rounded-lg bg-background px-2 py-1 text-foreground">Organizer access request</span>
              <span className="rounded-lg px-2 py-1">Event setup questions</span>
              <span className="rounded-lg px-2 py-1">Staff handoff</span>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4 text-sm">
            <p className="font-semibold">Privacy boundary active</p>
            <p className="mt-1 text-muted-foreground">
              Venue owners see organizer-to-venue operational threads only. Participant chat remains hidden unless
              the venue owner is also the event organizer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ChatThread moderator={role === "moderator"} />;
}

function AIAgentsView({ role, registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="grid gap-4 md:grid-cols-2">
        {aiAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
      <DecisionPanel
        role={role}
        title={role === "moderator" ? "AI safety enforcement" : "AI mode change"}
        destructive={role === "moderator"}
        action={role === "moderator" ? "ai:moderate" : "ai:configure"}
        onDecision={(decision, reason) =>
          registerDecision(
            decision,
            reason,
            role === "moderator" ? "AI safety case" : "AI agent settings",
            role === "moderator" ? "ai:moderate" : "ai:configure",
          )
        }
      />
    </div>
  );
}

function PromotionView({ registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {promotionCampaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-xl border border-border p-4">
              <div className="relative mb-3 h-28 overflow-hidden rounded-xl">
                <Image
                  src={demoAdminImages.promoCreative}
                  alt={`${campaign.name} creative`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 60vw"
                />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground">{campaign.targetEntity} · spend {formatMoney(campaign.spend)}</p>
                </div>
                <StatusBadge value={campaign.status === "running" || campaign.status === "paused" ? campaign.status : campaign.status} type="plain" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{campaign.creativeSummary}</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusBadge value={campaign.riskScore > 80 ? "critical" : campaign.riskScore > 40 ? "medium" : "low"} type="severity" />
                <Button size="sm" variant="outline" onClick={() => registerDecision("Campaign state changed", undefined, campaign.name)}>
                  Review
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <PublicPreviewFrame href="/event/1" />
    </div>
  );
}

function FinanceView({ role, screen, registerDecision }: VariantProps) {
  const surfaceSlug = getCurrentSurfaceSlug(screen);
  const isRefunds = surfaceSlug.includes("refund") || surfaceSlug.includes("dispute");
  const isFraudContext = surfaceSlug.includes("fraud") || surfaceSlug.includes("finance-context");
  const financeAction: AdminAction = isRefunds
    ? "finance:refund"
    : role === "moderator"
      ? "finance:read_limited"
      : "finance:read_own";
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{isRefunds ? "Refunds & disputes" : "Finance / analytics"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard label="Gross sales" value="$2,175" helper="Ticket revenue" tone="good" />
            <MetricCard label="Refund holds" value="$175" helper="2 requests" tone="warn" />
            <MetricCard label="Payout status" value="KYC" helper="Identity required" tone="danger" />
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Payouts can continue accruing, but transfer is locked until KYC is complete.
          </div>
          <SkeletonState />
        </CardContent>
      </Card>
      <DecisionPanel
        role={role}
        destructive={isRefunds}
        action={financeAction}
        resource={{ ownsEvent: role === "organizer", ownsVenue: role === "venue_owner", fraudContext: isFraudContext }}
        onDecision={(decision, reason) => registerDecision(decision, reason, "Finance workspace", financeAction)}
      />
    </div>
  );
}

function CalendarView({ role, registerDecision }: VariantProps) {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Calendar</CardTitle>
          <Button variant="outline" size="sm" onClick={() => registerDecision("Conflict scan refreshed", undefined, "Calendar")}>
            Refresh conflicts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const hasEvent = [4, 8, 11, 17, 24].includes(day);
            return (
              <div key={day} className={cn("min-h-24 rounded-xl border p-2", hasEvent ? "bg-primary/5 border-primary/20" : "bg-card border-border")}>
                <p className="text-xs text-muted-foreground">{day}</p>
                {hasEvent && (
                  <div className="mt-2 rounded-lg bg-background p-2 text-[11px]">
                    {role === "venue_owner" ? "Venue gate pending" : "Sunset Mixer"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamView({ role, registerDecision }: VariantProps) {
  const rows = [
    ["Alex", "Owner", "All permissions"],
    ["Nina", role === "moderator" ? "Senior moderator" : "Manager", "Approvals + audit"],
    ["Maya", "Staff", "Check-in + inbox"],
  ];
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Team & permissions</CardTitle>
          <Button onClick={() => registerDecision("Invited teammate", undefined, "Team")}>Invite</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([name, title, permissions]) => (
          <div key={name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
            <Badge variant="outline">{permissions}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModerationQueueView({ registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Review queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {moderationCases.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                </div>
                <StatusBadge value={item.severity} type="severity" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Assignee: {item.assignee} · Due: {item.dueAt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <DecisionPanel
        role="moderator"
        destructive
        action="moderation:decide"
        onDecision={(decision, reason) => registerDecision(decision, reason, "Moderation queue", "moderation:decide")}
      />
    </div>
  );
}

function ComplaintsView({ registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Complaints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{complaint.targetName}</p>
                  <p className="text-sm text-muted-foreground">{complaint.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Reporter: {complaint.reporterName} · Evidence: {complaint.evidenceCount}</p>
                </div>
                <StatusBadge value={complaint.severity} type="severity" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <DecisionPanel
        role="moderator"
        destructive
        action="moderation:decide"
        onDecision={(decision, reason) => registerDecision(decision, reason, "Complaint case", "moderation:decide")}
      />
    </div>
  );
}

function ClaimsView({ registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ownership claims</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{claim.targetName}</p>
                  <p className="text-sm text-muted-foreground">{claim.claimantName} · {claim.type} · {claim.submittedAt}</p>
                </div>
                <StatusBadge value={claim.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {claim.evidence.map((item) => (
                  <Badge key={item} variant="outline">{item}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <DecisionPanel
        role="moderator"
        destructive
        action="moderation:decide"
        onDecision={(decision, reason) => registerDecision(decision, reason, "Ownership claim", "moderation:decide")}
      />
    </div>
  );
}

function EvidenceView() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Evidence vault</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative h-36 overflow-hidden rounded-xl">
          <Image
            src={demoAdminImages.evidenceVault}
            alt="Evidence vault demo"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 60vw"
          />
        </div>
        {evidenceItems.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.source} · retained until {item.retainedUntil}</p>
            </div>
            <code className="rounded-lg bg-secondary px-2 py-1 text-xs">{item.hash}</code>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EnforcementView({ registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Enforcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {enforcementActions.map((action) => (
            <div key={action.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{action.target}</p>
                  <p className="text-sm text-muted-foreground">{action.action} · {action.createdAt}</p>
                </div>
                <Badge variant="outline">{action.status}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Reason: {action.reasonCode}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <DecisionPanel
        role="moderator"
        destructive
        action="enforcement:write"
        onDecision={(decision, reason) => registerDecision(decision, reason, "Enforcement action", "enforcement:write")}
      />
    </div>
  );
}

function AppealsView({ registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Appeals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appeals.map((appeal) => (
            <div key={appeal.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{appeal.target}</p>
                  <p className="text-sm text-muted-foreground">{appeal.originalDecision}</p>
                </div>
                <Badge variant="outline">{appeal.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {appeal.newEvidence.map((item) => (
                  <Badge key={item} variant="secondary">{item}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <DecisionPanel
        role="moderator"
        destructive
        action="moderation:decide"
        onDecision={(decision, reason) => registerDecision(decision, reason, "Appeal", "moderation:decide")}
      />
    </div>
  );
}

function RulesView({ registerDecision }: VariantProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Policy rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["high_capacity_new_org", "New account + capacity > 150", "Escalate"],
            ["unsafe_ai_answer", "AI answer touches legal/medical advice", "Draft-only"],
            ["promo_urgency_claim", "Promotion uses unsafe urgency claims", "Review"],
          ].map(([id, condition, action]) => (
            <div key={id} className="rounded-xl border border-border p-4">
              <p className="font-semibold">{id}</p>
              <p className="text-sm text-muted-foreground">{condition}</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800 border-0">{action}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Risk rule builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" defaultValue="risk_score > 80 && venue_gate != approved" />
          <textarea className="h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue="Escalate to senior moderator and pause promotion campaign." />
          <Button onClick={() => registerDecision("Saved risk rule", "policy_clear", "Risk rule builder", "moderation:decide")}>Save rule</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function GenericView({ screen, registerDecision }: VariantProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold">{screen.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{screen.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoBlock title="Core controls" rows={["Filters", "Status badges", "Inline validation", "Toast feedback"]} />
              <InfoBlock title="RBAC boundary" rows={["Only relevant actions visible", "Permission denied state", "Audit on critical actions"]} />
            </div>
          </div>
          <DecisionPanel
            role={screen.requiredRole}
            destructive={screen.destructiveActions}
            action={screen.requiredRole === "moderator" ? "moderation:decide" : "audit:write"}
            onDecision={(decision, reason) =>
              registerDecision(
                decision,
                reason,
                screen.title,
                screen.requiredRole === "moderator" ? "moderation:decide" : "audit:write",
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoBlock({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>{row}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepRow({ done, text }: { done?: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex h-5 w-5 items-center justify-center rounded-full", done ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground")}>
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

interface VariantProps {
  role: AdminRole;
  screen: AdminScreenDefinition;
  events: AdminEvent[];
  venues: AdminVenue[];
  venuePolicy: VenuePolicy;
  setVenuePolicy: (policy: VenuePolicy) => void;
  registerDecision: (decision: string, reasonCode?: string, entity?: string, action?: AdminAction) => void;
  localAudit: AuditLogEntry[];
}
