"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  Network,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActionToast,
  ApprovalTracker,
  AuditLogPanel,
  MetricCard,
  OperationalStatesPanel,
  PublicPreviewFrame,
  StatusBadge,
} from "./admin-ui";
import { roleBasePaths } from "@/lib/admin-data";
import type {
  AdminScreenDefinition,
  AdminScreenSurface,
  Appeal,
  ApprovalStatus,
  EnforcementAction,
} from "@/lib/admin-types";
import {
  applyAppealDecision,
  applyChatModerationDecision,
  applyClaimDecision,
  applyComplaintDecision,
  applyEnforcementAction,
  applyPlatformGateDecision,
  applyPromotionDecision,
  getInitialAISafetyCases,
  getInitialClaimReviews,
  getInitialComplaintCases,
  getInitialContentScans,
  getInitialEvidenceVault,
  getInitialFlaggedChats,
  getInitialModeratorEvents,
  getInitialModeratorQueue,
  getInitialPolicyRules,
  getInitialPromotionReviews,
  initialAppeals,
  initialEnforcementActions,
  incidentTimeline,
  legalEscalations,
  limitedFinanceContexts,
  makeModeratorAudit,
  moderatorAuditSeed,
  moderatorWorkload,
  repeatOffenderNodes,
  simulateRiskRule,
  type AISafetyCase,
  type EvidenceVaultItem,
  type FlaggedChatCase,
  type ModeratorAuditEntry,
  type ModeratorClaimReview,
  type ModeratorComplaintCase,
  type ModeratorEventReview,
  type ModeratorQueueItem,
  type PolicyRule,
  type PromotionReviewCase,
} from "@/lib/moderator-v3";
import { demoAdminImages } from "@/lib/demo-assets";
import { appendSharedAuditEntry } from "@/lib/shared-audit";
import { cn } from "@/lib/utils";

function activeSlug(screen: AdminScreenDefinition, surface: AdminScreenSurface) {
  return surface.slug || screen.resolvedFromSlug || screen.slug;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

const moderatorSurfaceHrefs: Record<string, string> = {
  dashboard: "/moderator",
  events: "/moderator/events",
  "event-approval-detail": "/moderator/events/evt_123",
  "event-content-scan": "/moderator/events/evt_123/content-scan",
  "event-change-request": "/moderator/events/evt_123/request-changes",
  complaints: "/moderator/complaints",
  "complaint-detail": "/moderator/complaints/cmp_1",
  "incident-timeline": "/moderator/incidents/inc_1/timeline",
  "reports-severity": "/moderator/reports/severity",
  "case-merge": "/moderator/cases/merge",
  "chat-moderation": "/moderator/chats",
  "chat-moderation-detail": "/moderator/chats/chat_1",
  "remove-message": "/moderator/chats/chat_1/remove",
  "evidence-vault": "/moderator/evidence",
  "evidence-item-detail": "/moderator/evidence/ev_1",
  "organization-claims": "/moderator/claims/organizations",
  "organization-claim-detail": "/moderator/claims/organizations/claim_1",
  "venue-claims": "/moderator/claims/venues",
  "venue-claim-detail": "/moderator/claims/venues/claim_2",
  "ownership-evidence-review": "/moderator/claims/venues/claim_2",
  "ai-safety": "/moderator/ai-safety",
  "ai-conversation-review": "/moderator/ai-safety/conversations/ai_1",
  "ai-agent-enforcement": "/moderator/ai-safety/disable/agent_1",
  "promotion-review": "/moderator/promotion",
  "promotion-review-detail": "/moderator/promotion/camp_1",
  "promo-policy-scan": "/moderator/promotion/camp_1/scan",
  enforcement: "/moderator/enforcement",
  "enforcement-action-detail": "/moderator/enforcement/enf_1",
  "block-flow": "/moderator/enforcement/block",
  appeals: "/moderator/appeals",
  "appeal-detail": "/moderator/appeals/apl_1",
  "policy-rules": "/moderator/policy-rules",
  "risk-rule-builder": "/moderator/policy-rules/new",
  "risk-simulator": "/moderator/risk-simulator",
  "safety-keywords": "/moderator/safety-keywords",
  "audit-log": "/moderator/audit",
  "team-settings": "/moderator/settings",
  workload: "/moderator/workload",
  legal: "/moderator/legal",
  "platform-health": "/moderator/platform-health",
  sla: "/moderator/sla",
  "bulk-warning": "/moderator/bulk-warning",
  "finance-context": "/moderator/finance-context/fraud_case_1",
  "repeat-offenders": "/moderator/repeat-offenders",
  "escalation-handoff": "/moderator/escalations/esc_1/handoff",
  "empty-review-queue": "/moderator/empty",
};

function surfaceHref(surface: AdminScreenSurface) {
  return moderatorSurfaceHrefs[surface.slug] ?? `${roleBasePaths.moderator}/${surface.slug}`;
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

function InlineNotice({
  title,
  text,
  tone = "info",
}: {
  title: string;
  text: string;
  tone?: "info" | "warn" | "danger" | "good";
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

function SensitiveDecisionPanel({
  title = "Sensitive decision",
  primaryLabel = "Apply decision",
  danger,
  onDecision,
}: {
  title?: string;
  primaryLabel?: string;
  danger?: boolean;
  onDecision: (payload: {
    decision: string;
    reasonCode: string;
    policySection: string;
    evidenceId: string;
    scope: string;
    notificationCopy: string;
  }) => void;
}) {
  const [reasonCode, setReasonCode] = useState("");
  const [policySection, setPolicySection] = useState("");
  const [evidenceId, setEvidenceId] = useState("ev_001");
  const [scope, setScope] = useState("case_only");
  const [notificationCopy, setNotificationCopy] = useState("We reviewed this case under platform policy.");
  const disabled = !reasonCode || !policySection || !evidenceId || !scope || !notificationCopy.trim();

  const emit = (decision: string) => {
    if (disabled) return;
    onDecision({ decision, reasonCode, policySection, evidenceId, scope, notificationCopy });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InlineNotice
          tone={danger ? "danger" : "warn"}
          title="Reason required"
          text="Legal-sensitive moderation requires reason code, policy section, evidence, scope and notification copy."
        />
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Reason code</span>
          <select
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Select reason</option>
            <option value="policy_clear">policy_clear</option>
            <option value="missing_safety_plan">missing_safety_plan</option>
            <option value="unsafe_ai_answer">unsafe_ai_answer</option>
            <option value="harassment">harassment</option>
            <option value="fraud_risk">fraud_risk</option>
            <option value="ownership_mismatch">ownership_mismatch</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Policy section</span>
          <input
            value={policySection}
            onChange={(event) => setPolicySection(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="Safety 2.1 / Claims 4.3"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Evidence</span>
            <input
              value={evidenceId}
              onChange={(event) => setEvidenceId(event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Scope / duration</span>
            <input
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Notification copy</span>
          <textarea
            value={notificationCopy}
            onChange={(event) => setNotificationCopy(event.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled} onClick={() => emit("Одобрить")} className="bg-emerald-600 hover:bg-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            {primaryLabel}
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Запросить правки")}>
            Request changes
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Эскалировать")}>
            Escalate
          </Button>
          <Button variant="destructive" disabled={disabled} onClick={() => emit("Отклонить")}>
            Reject / block
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ModeratorAdminV3({
  screen,
  activeSurface,
}: {
  screen: AdminScreenDefinition;
  activeSurface: AdminScreenSurface;
}) {
  const [queue] = useState<ModeratorQueueItem[]>(() => getInitialModeratorQueue());
  const [eventReviews, setEventReviews] = useState<ModeratorEventReview[]>(() => getInitialModeratorEvents());
  const [contentScans] = useState(() => getInitialContentScans());
  const [complaintCases, setComplaintCases] = useState<ModeratorComplaintCase[]>(() => getInitialComplaintCases());
  const [flaggedChats, setFlaggedChats] = useState<FlaggedChatCase[]>(() => getInitialFlaggedChats());
  const [evidence, setEvidence] = useState<EvidenceVaultItem[]>(() => getInitialEvidenceVault());
  const [claimReviews, setClaimReviews] = useState<ModeratorClaimReview[]>(() => getInitialClaimReviews());
  const [aiCases, setAiCases] = useState<AISafetyCase[]>(() => getInitialAISafetyCases());
  const [promotionReviews, setPromotionReviews] = useState<PromotionReviewCase[]>(() => getInitialPromotionReviews());
  const [enforcement, setEnforcement] = useState<EnforcementAction[]>(() => initialEnforcementActions());
  const [appealItems, setAppealItems] = useState<Appeal[]>(() => initialAppeals());
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>(() => getInitialPolicyRules());
  const [localAudit, setLocalAudit] = useState<ModeratorAuditEntry[]>([]);
  const [toast, setToast] = useState("");
  const [showEdgeStates, setShowEdgeStates] = useState(false);

  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/$/, "");
  const currentSlug = activeSlug(screen, activeSurface);
  const isModeratorQueue = screen.slug === "dashboard" && normalizedPathname === "/moderator";
  const isModeratorEvents = normalizedPathname === "/moderator/events";
  const isModeratorClaims = normalizedPathname === "/moderator/hosts" || normalizedPathname.startsWith("/moderator/claims");
  const isModeratorReports =
    normalizedPathname === "/moderator/reports" ||
    normalizedPathname === "/moderator/complaints" ||
    /^\/moderator\/complaints\/[^/]+$/.test(normalizedPathname);
  const metrics = useMemo(
    () => ({
      open: queue.filter((item) => item.status !== "closed").length,
      critical: queue.filter((item) => item.severity === "critical").length,
      evidence: evidence.length,
      sla: queue.filter((item) => item.dueAt.includes("m")).length,
    }),
    [queue, evidence.length],
  );

  const audit = ({
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
  }) => {
    setToast(`${action}: ${entity}${reasonCode ? ` · ${reasonCode}` : ""}`);
    setLocalAudit((items) => [
      makeModeratorAudit({ action, entity, reasonCode, policySection, evidenceId }),
      ...items,
    ]);
    appendSharedAuditEntry({ actor: "Модератор", actorRole: "moderator", action, entity, reasonCode });
  };

  const decidePlatformGate = (
    review: ModeratorEventReview,
    decision: string,
    reasonCode?: string,
    policySection?: string,
    evidenceId?: string,
  ) => {
    setEventReviews((items) =>
      items.map((item) =>
        item.id === review.id ? applyPlatformGateDecision(item, decision, reasonCode) : item,
      ),
    );
    audit({ action: `Platform review ${decision}`, entity: review.event.title, reasonCode, policySection, evidenceId });
  };

  const decideComplaint = (complaint: ModeratorComplaintCase, status: ModeratorComplaintCase["status"], reasonCode?: string) => {
    setComplaintCases((items) =>
      items.map((item) => (item.id === complaint.id ? applyComplaintDecision(item, status) : item)),
    );
    audit({ action: `Complaint ${status}`, entity: complaint.targetName, reasonCode });
  };

  const decideChat = (
    chat: FlaggedChatCase,
    status: FlaggedChatCase["status"],
    reasonCode?: string,
    policySection?: string,
    evidenceId?: string,
  ) => {
    setFlaggedChats((items) =>
      items.map((item) => (item.id === chat.id ? applyChatModerationDecision(item, status) : item)),
    );
    if (status === "removed" || status === "hidden") {
      setEvidence((items) => [
        {
          ...items[0],
          id: `ev_chat_${Date.now()}`,
          title: `Retained original: ${chat.title}`,
          preview: chat.messages[0]?.excerpt ?? "Flagged message retained",
          linkedDecision: status,
          hash: chat.messages[0]?.retainedHash ?? "sha256:retained",
          accessLog: ["Original retained before moderation action"],
          immutable: true,
        },
        ...items,
      ]);
    }
    audit({ action: `Chat ${status}`, entity: chat.title, reasonCode, policySection, evidenceId });
  };

  const decideClaim = (claim: ModeratorClaimReview, status: ApprovalStatus, reasonCode?: string) => {
    setClaimReviews((items) =>
      items.map((item) => (item.id === claim.id ? applyClaimDecision(item, status) : item)),
    );
    audit({ action: `Claim ${status}`, entity: claim.targetName, reasonCode });
  };

  const decidePromotion = (promotion: PromotionReviewCase, status: ApprovalStatus | "running" | "paused", reasonCode?: string) => {
    setPromotionReviews((items) =>
      items.map((item) => (item.id === promotion.id ? applyPromotionDecision(item, status) : item)),
    );
    audit({ action: `Promotion ${status}`, entity: promotion.name, reasonCode });
  };

  const decideEnforcement = (action: EnforcementAction, status: EnforcementAction["status"], reasonCode?: string) => {
    setEnforcement((items) =>
      items.map((item) => (item.id === action.id ? applyEnforcementAction(item, status) : item)),
    );
    audit({ action: `Enforcement ${status}`, entity: action.target, reasonCode });
  };

  const decideAppeal = (appeal: Appeal, status: Appeal["status"], reasonCode?: string) => {
    setAppealItems((items) =>
      items.map((item) => (item.id === appeal.id ? applyAppealDecision(item, status) : item)),
    );
    audit({ action: `Appeal ${status}`, entity: appeal.target, reasonCode });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="admin-page-head flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Модератор</span>
            <span>/</span>
            <span>
              {isModeratorQueue
                ? "Рабочая зона"
                : isModeratorEvents
                  ? "События"
                : isModeratorClaims
                  ? "Права"
                : isModeratorReports
                  ? "Жалобы"
                : "Case workspace"}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-normal">
            {isModeratorQueue
              ? "Очередь"
              : isModeratorEvents
                ? "События"
              : isModeratorClaims
                ? "Права"
              : isModeratorReports
                ? "Жалобы"
              : activeSurface.title ?? screen.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {isModeratorQueue
              ? "Кейсы модерации: события, жалобы, чаты, права и апелляции."
              : isModeratorEvents
                ? "Проверка событий перед публикацией и после жалоб."
              : isModeratorClaims
                ? "Проверка прав на организации и площадки."
              : isModeratorReports
                ? "Жалобы пользователей, флаги чатов и обращения по безопасности."
              : activeSurface.description ?? screen.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isModeratorQueue && !isModeratorEvents && !isModeratorClaims && !isModeratorReports && <Button variant="outline" onClick={() => setShowEdgeStates((value) => !value)}>
            <FileText className="h-4 w-4" />
            Preview states
          </Button>}
          <Link href="/moderator">
            <Button>
              <Scale className="h-4 w-4" />
              {isModeratorQueue || isModeratorEvents || isModeratorClaims || isModeratorReports ? "Открыть очередь" : "Queue"}
            </Button>
          </Link>
        </div>
      </div>

      {!isModeratorEvents && !isModeratorClaims && !isModeratorReports && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {isModeratorQueue ? (
          <>
            <MetricCard label="Открытые кейсы" value={metrics.open} helper="Все очереди" tone="info" />
            <MetricCard label="Срочные" value={metrics.critical} helper="Критический приоритет" tone="danger" />
            <MetricCard label="На проверке" value={metrics.evidence} helper="Материалы" tone="neutral" />
            <MetricCard label="Скоро дедлайн" value={metrics.sla} helper="Нужно действие" tone="warn" />
          </>
        ) : (
          <>
            <MetricCard label="Open cases" value={metrics.open} helper="Queue" tone="info" />
            <MetricCard label="Urgent" value={metrics.critical} helper="High priority" tone="danger" />
            <MetricCard label="Saved context" value={metrics.evidence} helper="For review" tone="neutral" />
            <MetricCard label="Due soon" value={metrics.sla} helper="Needs action" tone="warn" />
          </>
        )}
      </div>}

      {!isModeratorQueue && !isModeratorEvents && !isModeratorClaims && !isModeratorReports && <SectionTabs screen={screen} activeSurface={activeSurface} />}
      {!isModeratorQueue && !isModeratorEvents && !isModeratorClaims && !isModeratorReports && showEdgeStates && (
        <OperationalStatesPanel partialData={screen.partialData ?? activeSurface.partialData} permissionRole="moderator" />
      )}

      {renderModeratorSurface({
        screen,
        isModeratorQueue,
        isModeratorEvents,
        isModeratorClaims,
        isModeratorReports,
        currentSlug,
        queue,
        eventReviews,
        contentScans,
        complaintCases,
        flaggedChats,
        evidence,
        claimReviews,
        aiCases,
        setAiCases,
        promotionReviews,
        enforcement,
        appealItems,
        policyRules,
        setPolicyRules,
        localAudit,
        audit,
        decidePlatformGate,
        decideComplaint,
        decideChat,
        decideClaim,
        decidePromotion,
        decideEnforcement,
        decideAppeal,
      })}

      <ActionToast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

type ModeratorViewProps = {
  screen: AdminScreenDefinition;
  isModeratorQueue: boolean;
  isModeratorEvents: boolean;
  isModeratorClaims: boolean;
  isModeratorReports: boolean;
  currentSlug: string;
  queue: ModeratorQueueItem[];
  eventReviews: ModeratorEventReview[];
  contentScans: ReturnType<typeof getInitialContentScans>;
  complaintCases: ModeratorComplaintCase[];
  flaggedChats: FlaggedChatCase[];
  evidence: EvidenceVaultItem[];
  claimReviews: ModeratorClaimReview[];
  aiCases: AISafetyCase[];
  setAiCases: (items: AISafetyCase[] | ((items: AISafetyCase[]) => AISafetyCase[])) => void;
  promotionReviews: PromotionReviewCase[];
  enforcement: EnforcementAction[];
  appealItems: Appeal[];
  policyRules: PolicyRule[];
  setPolicyRules: (items: PolicyRule[] | ((items: PolicyRule[]) => PolicyRule[])) => void;
  localAudit: ModeratorAuditEntry[];
  audit: (payload: {
    action: string;
    entity: string;
    reasonCode?: string;
    policySection?: string;
    evidenceId?: string;
  }) => void;
  decidePlatformGate: (
    review: ModeratorEventReview,
    decision: string,
    reasonCode?: string,
    policySection?: string,
    evidenceId?: string,
  ) => void;
  decideComplaint: (complaint: ModeratorComplaintCase, status: ModeratorComplaintCase["status"], reasonCode?: string) => void;
  decideChat: (
    chat: FlaggedChatCase,
    status: FlaggedChatCase["status"],
    reasonCode?: string,
    policySection?: string,
    evidenceId?: string,
  ) => void;
  decideClaim: (claim: ModeratorClaimReview, status: ApprovalStatus, reasonCode?: string) => void;
  decidePromotion: (promotion: PromotionReviewCase, status: ApprovalStatus | "running" | "paused", reasonCode?: string) => void;
  decideEnforcement: (action: EnforcementAction, status: EnforcementAction["status"], reasonCode?: string) => void;
  decideAppeal: (appeal: Appeal, status: Appeal["status"], reasonCode?: string) => void;
};

function renderModeratorSurface(props: ModeratorViewProps) {
  const { screen, currentSlug } = props;
  if (props.isModeratorEvents) return <ModeratorEventsView {...props} />;
  if (props.isModeratorClaims) return <ModeratorClaimsView {...props} />;
  if (props.isModeratorReports) return <ModeratorComplaintsView {...props} />;
  if (screen.slug === "dashboard") return <ModeratorQueueView {...props} />;
  if (screen.slug === "reports") return <ModeratorComplaintsView {...props} />;
  if (screen.slug === "claims") return <ModeratorClaimsView {...props} />;
  if (screen.slug === "history") return <ModeratorHistoryView {...props} />;
  if (screen.slug === "events") return <ModeratorEventsView {...props} />;
  if (screen.slug === "complaints") return <ModeratorComplaintsView {...props} />;
  if (screen.slug === "chat-moderation") return <ModeratorChatsView {...props} />;
  if (screen.slug === "evidence-vault") return <ModeratorEvidenceView {...props} />;
  if (screen.slug === "organization-claims") return <ModeratorClaimsView {...props} />;
  if (screen.slug === "ai-safety") return <ModeratorAIView {...props} />;
  if (screen.slug === "promotion-review") return <ModeratorPromotionView {...props} />;
  if (screen.slug === "enforcement") return <ModeratorEnforcementView {...props} />;
  if (screen.slug === "appeals") return <ModeratorAppealsView {...props} />;
  if (screen.slug === "policy-rules") return <ModeratorPolicyView {...props} />;
  if (screen.slug === "audit-log") return <ModeratorHistoryView {...props} />;
  if (currentSlug.includes("finance-context")) return <ModeratorAuditHealthView {...props} />;
  return <ModeratorQueueView {...props} />;
}

function moderatorQueueKindLabel(kind: ModeratorQueueItem["kind"]) {
  const labels: Record<ModeratorQueueItem["kind"], string> = {
    event: "Событие",
    complaint: "Жалоба",
    chat: "Чат",
    claim: "Права",
    ai: "Нарушение",
    promotion: "Промо",
    enforcement: "Нарушение",
    appeal: "Апелляция",
  };
  return labels[kind];
}

function moderatorQueueSeverityLabel(severity: ModeratorQueueItem["severity"]) {
  const labels: Record<ModeratorQueueItem["severity"], string> = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    critical: "Критический",
  };
  return labels[severity];
}

function moderatorQueueSeverityClass(severity: ModeratorQueueItem["severity"]) {
  if (severity === "critical") return "border-red-200 bg-red-50 text-red-800";
  if (severity === "high") return "border-orange-200 bg-orange-50 text-orange-800";
  if (severity === "medium") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function moderatorQueueTitle(item: ModeratorQueueItem) {
  if (item.kind === "event") return "Проверка события: Sunset Singles Mixer";
  if (item.kind === "complaint") return "Жалоба: сообщения в чате";
  if (item.kind === "promotion") return "Промо: Warehouse Flash Sale";
  if (item.kind === "enforcement") return "Нарушение: заявка площадки";
  return item.title;
}

function moderatorQueueSummary(item: ModeratorQueueItem) {
  if (item.kind === "event") return "Проверьте площадку, возвраты и промо-текст перед публикацией.";
  if (item.kind === "complaint") return "Есть жалоба на поведение в чате, нужна оценка безопасности.";
  if (item.kind === "promotion") return "Промо остановлено до проверки площадки и рекламного текста.";
  if (item.kind === "enforcement") return "Возможна подмена площадки, нужны материалы перед решением.";
  return item.summary;
}

function moderatorQueueDueLabel(dueAt: string) {
  if (dueAt === "Now") return "Сейчас";
  if (dueAt.endsWith("m")) return `${dueAt.replace("m", "")} мин`;
  return dueAt;
}

function moderatorQueueAssigneeLabel(assignee: string) {
  if (assignee === "Unassigned") return "Не назначен";
  if (assignee === "Senior mod") return "Старший модератор";
  return assignee;
}

function moderatorQueueActionLabel(item: ModeratorQueueItem) {
  if (item.kind === "promotion" || item.severity === "critical") return "Эскалировать";
  if (item.kind === "enforcement") return "Запросить данные";
  if (item.kind === "event") return "Рассмотреть";
  return "Открыть кейс";
}

function materialCountLabel(count: number) {
  if (count === 1) return "1 материал";
  if (count > 1 && count < 5) return `${count} материала`;
  return `${count} материалов`;
}

const moderatorEventFilters = ["Все", "Ждут проверки", "Нужны правки", "Жалобы", "Высокий риск", "Одобрено", "Отклонено"];

function moderatorEventSeverity(review: ModeratorEventReview) {
  if (review.event.riskScore > 80) return "critical";
  if (review.event.riskScore > 55) return "high";
  if (review.event.riskScore > 25) return "medium";
  return "low";
}

function moderatorEventSeverityLabel(severity: ReturnType<typeof moderatorEventSeverity>) {
  const labels: Record<ReturnType<typeof moderatorEventSeverity>, string> = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    critical: "Критический",
  };
  return labels[severity];
}

function moderatorEventStatusLabel(review: ModeratorEventReview) {
  const platformStatus = review.event.approvalGates.find((gate) => gate.type === "platform")?.status ?? "pending";
  const labels: Record<ApprovalStatus, string> = {
    not_required: "Одобрено",
    pending: "Ждёт проверки",
    approved: "Одобрено",
    rejected: "Отклонено",
    changes_requested: "Нужны правки",
    escalated: "Эскалировано",
  };
  return labels[platformStatus];
}

function moderatorEventStatusClass(review: ModeratorEventReview) {
  const platformStatus = review.event.approvalGates.find((gate) => gate.type === "platform")?.status ?? "pending";
  if (platformStatus === "approved" || platformStatus === "not_required") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (platformStatus === "rejected") return "border-red-200 bg-red-50 text-red-800";
  if (platformStatus === "escalated") return "border-indigo-200 bg-indigo-50 text-indigo-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function moderatorEventVenueStatusLabel(review: ModeratorEventReview) {
  const venueStatus = review.event.approvalGates.find((gate) => gate.type === "venue")?.status ?? "pending";
  const labels: Record<ApprovalStatus, string> = {
    not_required: "Не требуется",
    pending: "Ждёт площадку",
    approved: "Площадка одобрила",
    rejected: "Площадка отклонила",
    changes_requested: "Ждёт площадку",
    escalated: "Ждёт площадку",
  };
  return labels[venueStatus];
}

function moderatorEventPlaceLabel(review: ModeratorEventReview) {
  if (review.event.locationType === "online") return "Онлайн";
  if (review.event.locationType === "public_place") return "Публичное место";
  return review.event.venueName;
}

function moderatorEventReasonLabel(review: ModeratorEventReview, index: number) {
  if (review.event.riskScore > 80) return "Автофлаг по описанию";
  if (review.event.publicationStatus === "published" || index === 1) return "Изменение после публикации";
  if (review.riskSignals.some((signal) => signal.includes("promo"))) return "Промо требует проверки";
  return "Новое событие";
}

function moderatorEventCheckLabel(review: ModeratorEventReview) {
  if (review.event.riskScore > 80) return "Описание, безопасность и подтверждение площадки.";
  if (review.event.locationType === "external_venue") return "Описание, площадка и правила возврата.";
  return "Описание события и публичный предпросмотр.";
}

function ModeratorQueueDecisionPanel({ audit }: { audit: ModeratorViewProps["audit"] }) {
  const [reasonCode, setReasonCode] = useState("");
  const [policySection, setPolicySection] = useState("");
  const [note, setNote] = useState("Проверить материалы кейса и зафиксировать решение.");
  const disabled = !reasonCode || !policySection || !note.trim();

  const emit = (decision: string) => {
    if (disabled) return;
    audit({
      action: decision,
      entity: "Очередь модерации",
      reasonCode,
      policySection,
      evidenceId: "Материалы кейса",
    });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Решение по кейсу</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InlineNotice
          tone="warn"
          title="Причина обязательна"
          text="Перед действием выберите код причины, раздел политики и добавьте заметку."
        />
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Код причины</span>
          <select
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Выберите причину</option>
            <option value="policy_clear">Правила соблюдены</option>
            <option value="missing_safety_plan">Нужен план безопасности</option>
            <option value="harassment">Жалоба на поведение</option>
            <option value="ownership_mismatch">Нужно подтвердить права</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Раздел политики</span>
          <input
            value={policySection}
            onChange={(event) => setPolicySection(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="Безопасность / Права / Промо"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Заметка</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled} onClick={() => emit("Рассмотреть")}>
            Рассмотреть
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Запросить данные")}>
            Запросить данные
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Эскалировать")}>
            Эскалировать
          </Button>
          <Button variant="destructive" disabled={disabled} onClick={() => emit("Ограничить")}>
            Ограничить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ModeratorQueueCard({ item }: { item: ModeratorQueueItem }) {
  return (
    <Link href={item.href} className="block rounded-xl border border-border p-4 transition hover:bg-secondary/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{moderatorQueueTitle(item)}</p>
            <Badge variant="outline">{moderatorQueueKindLabel(item.kind)}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{moderatorQueueSummary(item)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Ответственный: {moderatorQueueAssigneeLabel(item.assignee)} · Срок: {moderatorQueueDueLabel(item.dueAt)} · Материалы: {materialCountLabel(item.evidenceCount)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", moderatorQueueSeverityClass(item.severity))}>
            {moderatorQueueSeverityLabel(item.severity)}
          </span>
          <Button size="sm" variant="outline">
            {moderatorQueueActionLabel(item)}
          </Button>
        </div>
      </div>
    </Link>
  );
}

function ModeratorQueueView({ currentSlug, queue, audit, isModeratorQueue }: ModeratorViewProps) {
  if (isModeratorQueue) {
    const filters = ["Все", "События", "Жалобы", "Чаты", "Права", "Промо", "Апелляции", "Срочные"];
    const visibleQueue: ModeratorQueueItem[] = [
      ...queue,
      {
        id: "display_appeal_low",
        kind: "appeal",
        title: "Апелляция: повторная проверка решения",
        severity: "low",
        status: "open",
        assignee: "Nina M.",
        dueAt: "Сегодня, 18:00",
        evidenceCount: 1,
        href: "/moderator/appeals",
        summary: "Проверьте новую информацию и предыдущее решение.",
      },
    ];
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button key={filter} variant={filter === "Все" ? "default" : "outline"} size="sm">
                {filter}
              </Button>
            ))}
          </div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Все кейсы</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {visibleQueue.map((item) => (
                <ModeratorQueueCard key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <InlineNotice
            tone="warn"
            title="Что проверить"
            text="Проверьте тип кейса, материалы, срок и ответственного перед действием."
          />
          <ModeratorQueueDecisionPanel audit={audit} />
        </div>
      </div>
    );
  }

  if (currentSlug === "empty-review-queue") {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold">Empty review queue</h3>
          <p className="mt-1 text-sm text-muted-foreground">No moderation cases are waiting. Platform health remains available.</p>
          <Link href="/moderator/platform-health">
            <Button className="mt-4">View health</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (currentSlug === "legal" || currentSlug === "escalation-handoff") {
    return <LegalEscalationView currentSlug={currentSlug} audit={audit} />;
  }

  if (currentSlug === "bulk-warning") {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <InlineNotice
            tone="danger"
            title="Bulk review is blocked"
            text="Risky moderation cases must be reviewed individually with evidence and reason codes. Bulk approval is not allowed."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {queue.slice(0, 3).map((item) => (
              <QueueCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Queue</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {queue.map((item) => (
            <QueueCard key={item.id} item={item} />
          ))}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <InlineNotice
          tone="warn"
          title="What to review"
          text="Review reports, event safety checks, chat flags, claims and appeals. Business settings stay with organizers and owners."
        />
        <SensitiveDecisionPanel
          title="Case decision"
          onDecision={(payload) =>
            audit({
              action: payload.decision,
              entity: "Review queue",
              reasonCode: payload.reasonCode,
              policySection: payload.policySection,
              evidenceId: payload.evidenceId,
            })
          }
        />
      </div>
    </div>
  );
}

function QueueCard({ item }: { item: ModeratorQueueItem }) {
  return (
    <Link href={item.href} className="block rounded-xl border border-border p-4 transition hover:bg-secondary/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{item.title}</p>
            <Badge variant="outline">{item.kind}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Assignee: {item.assignee} · Due: {item.dueAt} · Saved context: {item.evidenceCount}
          </p>
        </div>
        <StatusBadge value={item.severity} type="severity" />
      </div>
    </Link>
  );
}

function LegalEscalationView({
  currentSlug,
  audit,
}: {
  currentSlug: string;
  audit: ModeratorViewProps["audit"];
}) {
  const escalation = legalEscalations[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{currentSlug === "escalation-handoff" ? "Escalation handoff" : "Legal escalation queue"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InlineNotice tone="danger" title={escalation.title} text={escalation.reason} />
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">Handoff target</p>
            <p className="mt-1 text-sm text-muted-foreground">{escalation.handoffTarget} · evidence bundle required</p>
          </div>
        </CardContent>
      </Card>
      <SensitiveDecisionPanel
        danger
        primaryLabel="Complete handoff"
        onDecision={(payload) =>
          audit({
            action: "Escalation handoff",
            entity: escalation.title,
            reasonCode: payload.reasonCode,
            policySection: payload.policySection,
            evidenceId: payload.evidenceId,
          })
        }
      />
    </div>
  );
}

function ModeratorEventsDecisionPanel({ audit }: { audit: ModeratorViewProps["audit"] }) {
  const [reasonCode, setReasonCode] = useState("");
  const [policySection, setPolicySection] = useState("");
  const [note, setNote] = useState("Проверить событие и зафиксировать решение.");
  const disabled = !reasonCode || !policySection || !note.trim();

  const emit = (decision: string) => {
    if (disabled) return;
    audit({
      action: decision,
      entity: "Проверка события",
      reasonCode,
      policySection,
      evidenceId: "Материалы события",
    });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Решение</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InlineNotice
          tone="warn"
          title="Причина обязательна"
          text="Перед решением выберите код причины, раздел политики и добавьте заметку."
        />
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Код причины</span>
          <select
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Выберите причину</option>
            <option value="policy_clear">Правила соблюдены</option>
            <option value="needs_changes">Нужны правки</option>
            <option value="safety_review">Нужна проверка безопасности</option>
            <option value="complaint_review">Жалоба требует проверки</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Раздел политики</span>
          <input
            value={policySection}
            onChange={(event) => setPolicySection(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="Безопасность / Контент / Промо"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Заметка</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled} onClick={() => emit("Одобрить")}>
            Одобрить
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Запросить правки")}>
            Запросить правки
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Эскалировать")}>
            Эскалировать
          </Button>
          <Button variant="destructive" disabled={disabled} onClick={() => emit("Отклонить")}>
            Отклонить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ModeratorEventReviewCard({ review, index }: { review: ModeratorEventReview; index: number }) {
  const severity = moderatorEventSeverity(review);

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{review.event.title}</h3>
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", moderatorEventStatusClass(review))}>
              {moderatorEventStatusLabel(review)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {review.event.organizerName} · {moderatorEventPlaceLabel(review)} · {review.event.date}
          </p>
        </div>
        <Link href={`/moderator/events/${review.event.id}`}>
          <Button size="sm" variant="outline">Рассмотреть</Button>
        </Link>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Причина</p>
          <p className="mt-1 font-medium">{moderatorEventReasonLabel(review, index)}</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Риск</p>
          <p className="mt-1 font-medium">{moderatorEventSeverityLabel(severity)}</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Площадка</p>
          <p className="mt-1 font-medium">{moderatorEventVenueStatusLabel(review)}</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Что проверить</p>
          <p className="mt-1 font-medium">{moderatorEventCheckLabel(review)}</p>
        </div>
      </div>
    </div>
  );
}

function ModeratorEventVenueStatusLegend() {
  const statuses = ["Площадка одобрила", "Ждёт площадку", "Площадка отклонила", "Не требуется"];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Статусы площадки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {statuses.map((status) => (
          <div key={status} className="rounded-xl bg-secondary/50 px-3 py-2 font-medium">
            {status}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModeratorEventsView({
  currentSlug,
  eventReviews,
  contentScans,
  audit,
  decidePlatformGate,
  isModeratorEvents,
}: ModeratorViewProps) {
  const review = eventReviews[0];
  const scan = contentScans.find((item) => item.eventId === review.event.id) ?? contentScans[0];

  if (isModeratorEvents) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {moderatorEventFilters.map((filter) => (
              <Button key={filter} variant={filter === "Все" ? "default" : "outline"} size="sm">
                {filter}
              </Button>
            ))}
          </div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">События на проверке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventReviews.map((item, index) => (
                <ModeratorEventReviewCard key={item.id} review={item} index={index} />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <InlineNotice
            tone="warn"
            title="Что проверить"
            text="Проверьте причину, площадку, риск и материалы перед решением."
          />
          <ModeratorEventVenueStatusLegend />
          <ModeratorEventsDecisionPanel audit={audit} />
        </div>
      </div>
    );
  }

  if (currentSlug === "events") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Event review queue</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Publication</th>
                <th className="px-3 py-2">Venue approval</th>
                <th className="px-3 py-2">Platform review</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {eventReviews.map((item) => {
                const venueGate = item.event.approvalGates.find((gate) => gate.type === "venue");
                const platformGate = item.event.approvalGates.find((gate) => gate.type === "platform");
                return (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <p className="font-medium">{item.event.title}</p>
                      <p className="text-xs text-muted-foreground">{item.event.organizerName} · {item.event.venueName}</p>
                    </td>
                    <td className="px-3 py-3"><StatusBadge value={item.event.publicationStatus} type="publication" /></td>
                    <td className="px-3 py-3"><StatusBadge value={venueGate?.status ?? "pending"} /></td>
                    <td className="px-3 py-3"><StatusBadge value={platformGate?.status ?? "pending"} /></td>
                    <td className="px-3 py-3"><StatusBadge value={item.event.riskScore > 80 ? "critical" : item.event.riskScore > 40 ? "medium" : "low"} type="severity" /></td>
                    <td className="px-3 py-3">
                      <Link href={`/moderator/events/${item.event.id}`}>
                        <Button size="sm" variant="outline">Open</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }

  if (currentSlug === "event-content-scan") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Event content scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InlineNotice title="Scan summary" text={scan.summary} tone={review.event.riskScore > 80 ? "danger" : "warn"} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {scan.categories.map((category) => (
                <div key={category.label} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{category.label}</p>
                    <Badge variant={category.status === "blocked" ? "destructive" : "outline"}>{category.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Confidence {Math.round(category.confidence * 100)}%</p>
                  {category.evidenceId && <p className="mt-1 text-xs text-muted-foreground">Evidence: {category.evidenceId}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <PolicyMatches rules={scan.matchedRules} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{review.event.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{review.event.organizerName} · {review.event.venueName} · {review.event.date}</p>
              </div>
              <StatusBadge value={review.event.publicationStatus} type="publication" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <InlineNotice title="Business fields locked" text="Moderator reviews safety and platform rules only. Price, tickets, venue, capacity and schedule are read-only." />
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="Capacity" value={review.event.capacity} helper="Read-only" tone="neutral" />
              <MetricCard label="Tickets sold" value={review.event.ticketsSold} helper="Fraud context hidden" tone="info" />
              <MetricCard label="Priority" value={review.event.riskScore} helper="Review priority" tone={review.event.riskScore > 80 ? "danger" : "warn"} />
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="font-semibold">Organizer history</p>
              <p className="mt-1 text-sm text-muted-foreground">{review.organizerHistory}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {review.riskSignals.map((signal) => <Badge key={signal} variant="secondary">{signal}</Badge>)}
            </div>
            <PublicPreviewFrame href={review.event.publicPreviewUrl} />
          </CardContent>
        </Card>
        <ApprovalTracker event={review.event} />
      </div>
      <SensitiveDecisionPanel
        title={currentSlug === "event-change-request" ? "Request event changes" : "Platform review decision"}
        danger={review.event.riskScore > 80}
        onDecision={(payload) =>
          decidePlatformGate(review, payload.decision, payload.reasonCode, payload.policySection, payload.evidenceId)
        }
      />
    </div>
  );
}

function PolicyMatches({ rules }: { rules: string[] }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Matched rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rules.map((rule) => (
          <div key={rule} className="rounded-xl bg-secondary/50 p-3 text-sm">{rule}</div>
        ))}
      </CardContent>
    </Card>
  );
}

const moderatorReportFilters = ["Все", "Чаты", "События", "Пользователи", "Площадки", "Срочные", "Нужны данные", "Закрыто"];
const moderatorReportTypeCoverage = ["Чат", "Событие", "Пользователь", "Площадка", "Спам", "Безопасность"];
const moderatorReportReasonCoverage = [
  "Жалоба пользователя",
  "Флаг чата",
  "Небезопасное поведение",
  "Спам или мошенничество",
  "Нарушение правил события",
  "Дискриминация / харассмент",
];
const moderatorReportStatusCoverage = ["Ждёт проверки", "Нужны данные", "На проверке", "Закрыто", "Эскалировано"];
const moderatorReportSeverityCoverage = ["Низкий", "Средний", "Высокий", "Критический"];

function moderatorReportTypeLabel(type: ModeratorComplaintCase["targetType"]) {
  const labels: Record<ModeratorComplaintCase["targetType"], string> = {
    chat: "Чат",
    event: "Событие",
    organizer: "Пользователь",
    participant: "Пользователь",
    venue: "Площадка",
    ai_agent: "Безопасность",
  };
  return labels[type];
}

function moderatorReportStatusLabel(status: ModeratorComplaintCase["status"]) {
  const labels: Record<ModeratorComplaintCase["status"], string> = {
    new: "Ждёт проверки",
    investigating: "На проверке",
    resolved: "Закрыто",
    appealed: "Эскалировано",
  };
  return labels[status];
}

function moderatorReportStatusClass(status: ModeratorComplaintCase["status"]) {
  if (status === "resolved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "appealed") return "border-indigo-200 bg-indigo-50 text-indigo-800";
  if (status === "investigating") return "border-blue-200 bg-blue-50 text-blue-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function moderatorReportSeverityLabel(severity: ModeratorComplaintCase["severity"]) {
  const labels: Record<ModeratorComplaintCase["severity"], string> = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    critical: "Критический",
  };
  return labels[severity];
}

function moderatorReportSeverityClass(severity: ModeratorComplaintCase["severity"]) {
  if (severity === "critical") return "border-red-200 bg-red-50 text-red-800";
  if (severity === "high") return "border-orange-200 bg-orange-50 text-orange-800";
  if (severity === "medium") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function moderatorReportReasonLabel(complaint: ModeratorComplaintCase) {
  if (complaint.targetType === "chat") return "Дискриминация / харассмент";
  if (complaint.targetType === "event" && complaint.severity === "critical") return "Нарушение правил события";
  if (complaint.targetType === "ai_agent") return "Небезопасное поведение";
  if (complaint.severity === "high") return "Жалоба пользователя";
  return "Флаг чата";
}

function moderatorReportTargetLabel(complaint: ModeratorComplaintCase) {
  if (complaint.targetType === "chat") return "Групповой чат Sunset Mixer";
  if (complaint.targetType === "ai_agent") return "Ответ помощника площадки";
  return complaint.targetName;
}

function moderatorReportContextLabel(complaint: ModeratorComplaintCase) {
  if (complaint.targetType === "chat") return "Есть материалы жалобы и контекст общения.";
  if (complaint.targetType === "event") return "Проверьте описание, площадку и безопасность события.";
  if (complaint.targetType === "ai_agent") return "Проверьте ответ и влияние на безопасность пользователя.";
  return "Есть обращение пользователя и связанные материалы.";
}

function ModeratorReportCard({ complaint }: { complaint: ModeratorComplaintCase }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{moderatorReportTypeLabel(complaint.targetType)}</Badge>
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", moderatorReportStatusClass(complaint.status))}>
              {moderatorReportStatusLabel(complaint.status)}
            </span>
          </div>
          <h3 className="mt-2 font-semibold">{moderatorReportTargetLabel(complaint)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">Заявитель: {complaint.reporterName}</p>
        </div>
        <Link href="/moderator/complaints/cmp_1">
          <Button size="sm" variant="outline">Рассмотреть</Button>
        </Link>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Причина</p>
          <p className="mt-1 font-medium">{moderatorReportReasonLabel(complaint)}</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Срочность</p>
          <p className={cn("mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-semibold", moderatorReportSeverityClass(complaint.severity))}>
            {moderatorReportSeverityLabel(complaint.severity)}
          </p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Материалы</p>
          <p className="mt-1 font-medium">{materialCountLabel(complaint.evidenceCount)}</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Что известно</p>
          <p className="mt-1 font-medium">{moderatorReportContextLabel(complaint)}</p>
        </div>
      </div>
    </div>
  );
}

function ModeratorReportsReferencePanel() {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Типы жалоб</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {moderatorReportTypeCoverage.map((label) => (
            <Badge key={label} variant="secondary">{label}</Badge>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Причины</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {moderatorReportReasonCoverage.map((label) => (
            <Badge key={label} variant="outline">{label}</Badge>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Статусы</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {moderatorReportStatusCoverage.map((label) => (
            <Badge key={label} variant="outline">{label}</Badge>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Срочность</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {moderatorReportSeverityCoverage.map((label) => (
            <Badge key={label} variant="outline">{label}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ModeratorReportsDecisionPanel({
  complaint,
  decideComplaint,
}: {
  complaint: ModeratorComplaintCase;
  decideComplaint: ModeratorViewProps["decideComplaint"];
}) {
  const [reasonCode, setReasonCode] = useState("");
  const [policySection, setPolicySection] = useState("");
  const [note, setNote] = useState("Проверить материалы жалобы и зафиксировать решение.");
  const disabled = !reasonCode || !policySection || !note.trim();

  const emit = (label: string, status: ModeratorComplaintCase["status"]) => {
    if (disabled) return;
    decideComplaint(complaint, status, label);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Решение</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InlineNotice
          tone="warn"
          title="Причина обязательна"
          text="Перед решением выберите код причины, раздел политики и добавьте заметку."
        />
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Код причины</span>
          <select
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Выберите причину</option>
            <option value="report_confirmed">Жалоба подтверждена</option>
            <option value="needs_context">Нужны данные</option>
            <option value="safety_review">Срочная безопасность</option>
            <option value="policy_violation">Нарушение правил</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Раздел политики</span>
          <input
            value={policySection}
            onChange={(event) => setPolicySection(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="Жалобы / Чаты / Безопасность"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Заметка</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={disabled} onClick={() => emit("Запросить данные", "investigating")}>
            Запросить данные
          </Button>
          <Button disabled={disabled} onClick={() => emit("Закрыть", "resolved")}>
            Закрыть
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Эскалировать", "appealed")}>
            Эскалировать
          </Button>
          <Button variant="destructive" disabled={disabled} onClick={() => emit("Ограничить", "resolved")}>
            Ограничить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ModeratorComplaintsView({
  currentSlug,
  complaintCases,
  decideComplaint,
  audit,
  isModeratorReports,
}: ModeratorViewProps) {
  const complaint = complaintCases[0];
  if (currentSlug === "incident-timeline") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Incident timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidentTimeline.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold">{item.event}</p>
                <Badge variant="outline">{item.time}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.actor}{item.evidenceId ? ` · ${item.evidenceId}` : ""}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (currentSlug === "reports-severity") {
    const rows = ["critical", "high", "medium", "low"].map((severity) => ({
      severity,
      count: complaintCases.filter((item) => item.severity === severity).length,
    }));
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Reports by severity</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {rows.map((row) => <MetricCard key={row.severity} label={row.severity} value={row.count} tone={row.severity === "critical" ? "danger" : "warn"} />)}
        </CardContent>
      </Card>
    );
  }

  if (currentSlug === "case-merge") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Case merge / split</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {complaintCases.slice(0, 2).map((item) => <ComplaintCard key={item.id} complaint={item} />)}
            <InlineNotice tone="warn" title="Merge review" text="Merge only duplicate reports about the same incident. Split unrelated targets into separate cases." />
          </CardContent>
        </Card>
        <SensitiveDecisionPanel
          title="Merge cases"
          onDecision={(payload) => audit({ action: "Merged/split cases", entity: "Complaint cases", reasonCode: payload.reasonCode, policySection: payload.policySection, evidenceId: payload.evidenceId })}
        />
      </div>
    );
  }

  if (isModeratorReports) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {moderatorReportFilters.map((filter) => (
              <Button key={filter} variant={filter === "Все" ? "default" : "outline"} size="sm">
                {filter}
              </Button>
            ))}
          </div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Жалобы на проверке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {complaintCases.map((item) => (
                <ModeratorReportCard key={item.id} complaint={item} />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <InlineNotice
            tone="warn"
            title="Что проверить"
            text="Сверьте тип жалобы, заявителя, материалы, срочность и статус перед решением."
          />
          <ModeratorReportsReferencePanel />
          <ModeratorReportsDecisionPanel complaint={complaint} decideComplaint={decideComplaint} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Complaints</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {complaintCases.map((item) => <ComplaintCard key={item.id} complaint={item} />)}
        </CardContent>
      </Card>
      <SensitiveDecisionPanel
        title={currentSlug === "complaint-detail" ? "Complaint decision" : "Complaint queue action"}
        onDecision={(payload) => decideComplaint(complaint, payload.decision === "Отклонить" ? "resolved" : "investigating", payload.reasonCode)}
      />
    </div>
  );
}

function ComplaintCard({ complaint }: { complaint: ModeratorComplaintCase }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{complaint.targetName}</p>
          <p className="text-sm text-muted-foreground">{complaint.summary}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Reporter: {complaint.reporterName} · {complaint.reporterHistory} · Evidence: {complaint.linkedEvidenceIds.join(", ")}
          </p>
        </div>
        <StatusBadge value={complaint.severity} type="severity" />
      </div>
      <p className="mt-3 text-sm">{complaint.recommendedAction}</p>
    </div>
  );
}

function ModeratorChatsView({ currentSlug, flaggedChats, decideChat }: ModeratorViewProps) {
  const chat = flaggedChats[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{currentSlug === "remove-message" ? "Hide / remove message flow" : "Flagged chat moderation"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InlineNotice
            tone="warn"
            title="Privacy boundary"
            text="Moderator can view flagged excerpts and retained evidence only. Full participant chat browsing is not available."
          />
          {flaggedChats.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.eventTitle} · reporter {item.reporterName}</p>
                </div>
                <StatusBadge value={item.severity} type="severity" />
              </div>
              <p className="mt-2 text-sm">{item.reason}</p>
              <div className="mt-3 space-y-2">
                {item.messages.map((message) => (
                  <div key={message.id} className="rounded-xl bg-red-50 p-3 text-sm text-red-950">
                    <p className="font-semibold">{message.author}</p>
                    <p className="mt-1 text-xs">{message.excerpt}</p>
                    <p className="mt-1 text-[11px] opacity-75">{message.flagReason} · {message.retainedHash}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <SensitiveDecisionPanel
        danger={currentSlug === "remove-message"}
        title={currentSlug === "remove-message" ? "Remove and retain original" : "Chat moderation decision"}
        primaryLabel="Apply chat action"
        onDecision={(payload) =>
          decideChat(
            chat,
            payload.decision === "Отклонить" ? "removed" : payload.decision === "Эскалировать" ? "locked" : "hidden",
            payload.reasonCode,
            payload.policySection,
            payload.evidenceId,
          )
        }
      />
    </div>
  );
}

function ModeratorEvidenceView({ currentSlug, evidence, audit }: ModeratorViewProps) {
  const selected = evidence[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evidence vault</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-44 overflow-hidden rounded-xl">
            <Image src={demoAdminImages.evidenceVault} alt="Evidence vault" fill className="object-cover" sizes="(max-width: 1280px) 100vw, 60vw" />
          </div>
          {evidence.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.preview}</p>
                </div>
                <code className="rounded-lg bg-secondary px-2 py-1 text-xs">{item.hash}</code>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Retained until {item.retainedUntil} · {item.linkedDecision}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{currentSlug === "evidence-item-detail" ? "Evidence item detail" : "Retention"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <InlineNotice title="Immutable original" text="Evidence cannot be deleted locally. It can only be retained, linked, exported or audited." />
          {selected.accessLog.map((row) => <div key={row} className="rounded-xl bg-secondary/50 p-3 text-sm">{row}</div>)}
          <Button onClick={() => audit({ action: "Opened evidence detail", entity: selected.title, evidenceId: selected.id })}>Audit evidence read</Button>
        </CardContent>
      </Card>
    </div>
  );
}

const moderatorClaimFilters = ["Все", "Организации", "Площадки", "Ждут проверки", "Нужны данные", "Одобрено", "Отклонено"];
const moderatorClaimTypeLabels = ["Организация", "Площадка", "Бренд", "Команда"];
const moderatorClaimProofLabels = ["Документы", "Сайт / соцсети", "Фото площадки", "Договор аренды", "Письмо от владельца", "Контакт подтверждён"];

function moderatorClaimTypeLabel(type: ModeratorClaimReview["type"]) {
  return type === "organization" ? "Организация" : "Площадка";
}

function moderatorClaimStatusLabel(status: ApprovalStatus) {
  const labels: Record<ApprovalStatus, string> = {
    not_required: "Одобрено",
    pending: "Ждёт проверки",
    approved: "Одобрено",
    rejected: "Отклонено",
    changes_requested: "Нужны данные",
    escalated: "Эскалировано",
  };
  return labels[status];
}

function moderatorClaimStatusClass(status: ApprovalStatus) {
  if (status === "approved" || status === "not_required") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-800";
  if (status === "escalated") return "border-indigo-200 bg-indigo-50 text-indigo-800";
  if (status === "changes_requested") return "border-orange-200 bg-orange-50 text-orange-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function moderatorClaimRiskLabel(claim: ModeratorClaimReview) {
  if (claim.duplicateOwnerRisk) return "Высокий";
  if (!claim.domainMatch || !claim.addressMatch) return "Средний";
  return "Низкий";
}

function moderatorClaimProofLabel(proof: string) {
  const labels: Record<string, string> = {
    "Business license": "Документы",
    "Domain email": "Сайт / соцсети",
    "Website ownership": "Сайт / соцсети",
    "Lease screenshot": "Договор аренды",
    "Tax document": "Документы",
    "Phone verification": "Контакт подтверждён",
  };
  return labels[proof] ?? "Документы";
}

function uniqueClaimProofs(claim: ModeratorClaimReview) {
  return Array.from(new Set(claim.evidence.map(moderatorClaimProofLabel)));
}

function moderatorClaimChecks(claim: ModeratorClaimReview) {
  return [
    `Сайт / соцсети: ${claim.domainMatch ? "подтверждено" : "нужно проверить"}`,
    `Адрес: ${claim.addressMatch ? "подтверждено" : "нужно проверить"}`,
    `Похожие заявки: ${claim.duplicateOwnerRisk ? "есть риск" : "не найдено"}`,
  ];
}

function moderatorClaimMissingItems(claim: ModeratorClaimReview) {
  const items: string[] = [];
  if (!claim.domainMatch) items.push("Сайт / соцсети");
  if (!claim.addressMatch) items.push("Адрес");
  if (claim.duplicateOwnerRisk) items.push("Похожие заявки");
  return items.length ? `Нужно проверить: ${items.join(", ")}` : "Недостающих данных не видно";
}

function moderatorClaimHref(claim: ModeratorClaimReview) {
  return claim.type === "organization" ? "/moderator/claims/organizations/claim_1" : "/moderator/claims/venues/claim_2";
}

function ModeratorClaimCard({ claim }: { claim: ModeratorClaimReview }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{moderatorClaimTypeLabel(claim.type)}</Badge>
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", moderatorClaimStatusClass(claim.status))}>
              {moderatorClaimStatusLabel(claim.status)}
            </span>
          </div>
          <h3 className="mt-2 font-semibold">{claim.targetName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {claim.claimantName} · {claim.submittedAt}
          </p>
        </div>
        <Link href={moderatorClaimHref(claim)}>
          <Button size="sm" variant="outline">Рассмотреть</Button>
        </Link>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Доказательства</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {uniqueClaimProofs(claim).map((proof) => (
              <Badge key={proof} variant="outline">{proof}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Риск</p>
          <p className="mt-1 font-medium">{moderatorClaimRiskLabel(claim)}</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Проверка</p>
          <div className="mt-1 space-y-1">
            {moderatorClaimChecks(claim).map((check) => (
              <p key={check} className="font-medium">{check}</p>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Что не хватает</p>
          <p className="mt-1 font-medium">{moderatorClaimMissingItems(claim)}</p>
        </div>
      </div>

      {claim.selfApprovalBlocked && (
        <InlineNotice tone="danger" title="Нужна независимая проверка" text="Заявку должен проверить другой модератор." />
      )}
    </div>
  );
}

function ModeratorClaimReferencePanel() {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Типы прав</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {moderatorClaimTypeLabels.map((label) => (
            <Badge key={label} variant="secondary">{label}</Badge>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Что может быть доказательством</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {moderatorClaimProofLabels.map((label) => (
            <Badge key={label} variant="outline">{label}</Badge>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Статусы</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {(["pending", "changes_requested", "approved", "rejected", "escalated"] as ApprovalStatus[]).map((status) => (
            <div key={status} className={cn("rounded-xl border px-3 py-2 font-medium", moderatorClaimStatusClass(status))}>
              {moderatorClaimStatusLabel(status)}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Риск</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["Низкий", "Средний", "Высокий"].map((label) => (
            <Badge key={label} variant="outline">{label}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ModeratorClaimsDecisionPanel({
  claim,
  decideClaim,
}: {
  claim: ModeratorClaimReview;
  decideClaim: ModeratorViewProps["decideClaim"];
}) {
  const [reasonCode, setReasonCode] = useState("");
  const [policySection, setPolicySection] = useState("");
  const [note, setNote] = useState("Проверить доказательства и зафиксировать решение.");
  const disabled = !reasonCode || !policySection || !note.trim();

  const emit = (label: string, status: ApprovalStatus) => {
    if (disabled) return;
    decideClaim(claim, status, label);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Решение</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InlineNotice
          tone="warn"
          title="Причина обязательна"
          text="Перед решением выберите код причины, раздел политики и добавьте заметку."
        />
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Код причины</span>
          <select
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Выберите причину</option>
            <option value="rights_confirmed">Права подтверждены</option>
            <option value="missing_documents">Нужны документы</option>
            <option value="ownership_mismatch">Не совпадает владелец</option>
            <option value="duplicate_claim">Похожие заявки</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Раздел политики</span>
          <input
            value={policySection}
            onChange={(event) => setPolicySection(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="Права / Организации / Площадки"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Заметка</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled} onClick={() => emit("Одобрить", "approved")}>
            Одобрить
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Запросить данные", "changes_requested")}>
            Запросить данные
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Эскалировать", "escalated")}>
            Эскалировать
          </Button>
          <Button variant="destructive" disabled={disabled} onClick={() => emit("Отклонить", "rejected")}>
            Отклонить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ModeratorClaimsView({ currentSlug, claimReviews, decideClaim }: ModeratorViewProps) {
  const visible = currentSlug === "venue-claims" || currentSlug === "venue-claim-detail" || currentSlug === "ownership-evidence-review"
    ? claimReviews.filter((claim) => claim.type === "venue")
    : currentSlug === "organization-claims" || currentSlug === "organization-claim-detail"
      ? claimReviews.filter((claim) => claim.type === "organization")
      : claimReviews;
  const claim = visible[0] ?? claimReviews[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {moderatorClaimFilters.map((filter) => (
            <Button key={filter} variant={filter === "Все" ? "default" : "outline"} size="sm">
              {filter}
            </Button>
          ))}
        </div>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Права на проверке</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visible.map((item) => (
              <ModeratorClaimCard key={item.id} claim={item} />
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <InlineNotice
          tone="warn"
          title="Что проверить"
          text="Сверьте заявителя, объект, доказательства и похожие заявки перед решением."
        />
        <ModeratorClaimReferencePanel />
        <ModeratorClaimsDecisionPanel claim={claim} decideClaim={decideClaim} />
      </div>
    </div>
  );
}

function ModeratorAIView({ currentSlug, aiCases, setAiCases, audit }: ModeratorViewProps) {
  const item = aiCases[0];
  const updateCase = (status: AISafetyCase["status"]) => {
    setAiCases((items) => items.map((caseItem) => (caseItem.id === item.id ? { ...caseItem, status } : caseItem)));
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">AI safety</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {aiCases.map((caseItem) => (
            <div key={caseItem.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{caseItem.agent.name}</p>
                  <p className="text-sm text-muted-foreground">{caseItem.agent.ownerName} · {caseItem.forbiddenTopic}</p>
                </div>
                <StatusBadge value={caseItem.severity} type="severity" />
              </div>
              {(currentSlug === "ai-conversation-review" || currentSlug === "ai-agent-enforcement") && (
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl bg-secondary p-3 text-sm">Prompt: {caseItem.prompt}</div>
                  <div className="rounded-xl bg-purple-50 p-3 text-sm text-purple-950">Answer: {caseItem.answer}</div>
                  <p className="text-xs text-muted-foreground">Confidence {Math.round(caseItem.confidence * 100)}% · trigger {caseItem.escalationTrigger}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <SensitiveDecisionPanel
        danger={currentSlug === "ai-agent-enforcement"}
        title={currentSlug === "ai-agent-enforcement" ? "Disable / limit AI agent" : "AI safety decision"}
        primaryLabel="Limit agent"
        onDecision={(payload) => {
          updateCase(payload.decision === "Одобрить" ? "agent_limited" : "changes_requested");
          audit({ action: payload.decision, entity: item.agent.name, reasonCode: payload.reasonCode, policySection: payload.policySection, evidenceId: payload.evidenceId });
        }}
      />
    </div>
  );
}

function ModeratorPromotionView({ currentSlug, promotionReviews, decidePromotion }: ModeratorViewProps) {
  const item = promotionReviews[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Promotion review</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-44 overflow-hidden rounded-xl">
            <Image src={demoAdminImages.promoCreative} alt="Promo creative" fill className="object-cover" sizes="(max-width: 1280px) 100vw, 60vw" />
          </div>
          {promotionReviews.map((promotion) => (
            <div key={promotion.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{promotion.name}</p>
                  <p className="text-sm text-muted-foreground">{promotion.targetEntity} · {promotion.targeting}</p>
                </div>
                <StatusBadge value={promotion.riskScore > 80 ? "critical" : promotion.riskScore > 40 ? "medium" : "low"} type="severity" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{promotion.creativeSummary}</p>
              {(currentSlug === "promo-policy-scan" || currentSlug === "promotion-review-detail") && (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {promotion.scanChecks.map((check) => (
                    <div key={check.label} className="rounded-lg bg-secondary/50 p-3 text-xs">
                      {check.label}: {check.status}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <SensitiveDecisionPanel
        title={currentSlug === "promo-policy-scan" ? "Creative review decision" : "Promotion review decision"}
        onDecision={(payload) =>
          decidePromotion(item, payload.decision === "Одобрить" ? "approved" : payload.decision === "Запросить правки" ? "changes_requested" : "rejected", payload.reasonCode)
        }
      />
    </div>
  );
}

function ModeratorEnforcementView({ currentSlug, enforcement, decideEnforcement, audit }: ModeratorViewProps) {
  const action = enforcement[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{currentSlug === "block-flow" ? "Block flow" : "Enforcement"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {enforcement.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.target}</p>
                  <p className="text-sm text-muted-foreground">{item.action} · {item.createdAt}</p>
                </div>
                <Badge variant="outline">{item.status}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Reason: {item.reasonCode}</p>
            </div>
          ))}
          {currentSlug === "block-flow" && <InlineNotice tone="danger" title="Block target" text="Supports user, organization, event, venue or AI agent. Scope and duration are required." />}
        </CardContent>
      </Card>
      <SensitiveDecisionPanel
        danger
        title="Enforcement action"
        primaryLabel="Apply enforcement"
        onDecision={(payload) => {
          decideEnforcement(action, "active", payload.reasonCode);
          audit({ action: "Enforcement detail opened", entity: action.target, reasonCode: payload.reasonCode, policySection: payload.policySection, evidenceId: payload.evidenceId });
        }}
      />
    </div>
  );
}

function ModeratorAppealsView({ appealItems, decideAppeal }: ModeratorViewProps) {
  const appeal = appealItems[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Appeals</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {appealItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.target}</p>
                  <p className="text-sm text-muted-foreground">{item.originalDecision}</p>
                </div>
                <Badge variant="outline">{item.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.newEvidence.map((evidenceItem) => <Badge key={evidenceItem} variant="secondary">{evidenceItem}</Badge>)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <SensitiveDecisionPanel
        title="Appeal decision"
        onDecision={(payload) =>
          decideAppeal(appeal, payload.decision === "Одобрить" ? "overturned" : payload.decision === "Запросить правки" ? "under_review" : "upheld", payload.reasonCode)
        }
      />
    </div>
  );
}

function ModeratorPolicyView({ currentSlug, policyRules, setPolicyRules, audit }: ModeratorViewProps) {
  const simulation = simulateRiskRule("high capacity unsafe ai promotion", policyRules);
  if (currentSlug === "risk-simulator") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Risk scoring simulator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <textarea className="h-28 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue={simulation.input} />
          <MetricCard label="Simulated score" value={simulation.score} helper={simulation.recommendedAction} tone={simulation.score > 80 ? "danger" : "info"} />
          <div className="flex flex-wrap gap-2">
            {simulation.triggeredRules.map((rule) => <Badge key={rule} variant="secondary">{rule}</Badge>)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentSlug === "safety-keywords") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Safety keywords</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {["harassment", "policy bypass", "unsafe meetup", "fraud refund", "extremist signal", "illegal venue"].map((keyword) => (
            <div key={keyword} className="rounded-xl border border-border p-4 text-sm">{keyword}</div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Policy rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {policyRules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{rule.id}</p>
                  <p className="text-sm text-muted-foreground">{rule.condition}</p>
                </div>
                <StatusBadge value={rule.severity} type="severity" />
              </div>
              <Badge className="mt-3 bg-blue-100 text-blue-800 border-0">{rule.action}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Priority rule builder</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <input className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" defaultValue="High priority unsafe event needs senior review" />
          <textarea className="h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue="Escalate to senior moderator and pause promotion campaign." />
          <Button onClick={() => {
            setPolicyRules((items) => [{ ...items[0], id: `local_rule_${items.length + 1}` }, ...items]);
            audit({ action: "Saved risk rule", entity: "Policy rules", reasonCode: "policy_clear", policySection: "Rules" });
          }}>
            Save rule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ModeratorHistoryView({ localAudit }: ModeratorViewProps) {
  const rows = [...localAudit, ...moderatorAuditSeed()].slice(0, 8);
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{row.action}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.entity}</p>
              </div>
              <Badge variant="outline">{row.createdAt}</Badge>
            </div>
            {row.reasonCode && <p className="mt-2 text-xs text-muted-foreground">Reason: {row.reasonCode}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModeratorAuditHealthView({
  currentSlug,
  localAudit,
  audit,
}: ModeratorViewProps) {
  if (currentSlug === "finance-context") {
    const finance = limitedFinanceContexts[0];
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Limited finance context</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InlineNotice tone="warn" title="Fraud/dispute context only" text={finance.reason} />
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="Gross sales" value={formatMoney(finance.grossSales)} tone="neutral" />
              <MetricCard label="Refunds" value={formatMoney(finance.refunds)} tone="warn" />
              <MetricCard label="Chargebacks" value={finance.chargebacks} tone="danger" />
            </div>
          </CardContent>
        </Card>
        <Button onClick={() => audit({ action: "Opened limited finance context", entity: finance.caseId, reasonCode: "fraud_context" })}>
          Audit finance read
        </Button>
      </div>
    );
  }

  if (currentSlug === "workload" || currentSlug === "team-settings") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{currentSlug === "workload" ? "Workload assignment" : "Moderator settings"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {moderatorWorkload.map((row) => (
            <div key={row.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{row.assignee}</p>
                  <p className="text-sm text-muted-foreground">{row.queue} · {row.count} cases · SLA {row.sla}</p>
                </div>
                <StatusBadge value={row.severity} type="severity" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (currentSlug === "platform-health" || currentSlug === "sla") {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Queue load" value="74%" helper="All moderation queues" tone="warn" />
        <MetricCard label="False positives" value="6%" helper="Last 7 days" tone="good" />
        <MetricCard label="Legal escalations" value={legalEscalations.length} tone="danger" />
        <MetricCard label="SLA met" value="91%" tone="info" />
      </div>
    );
  }

  if (currentSlug === "repeat-offenders") {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Network className="h-4 w-4" />Repeat offender graph</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {repeatOffenderNodes.map((node) => (
            <div key={node.id} className="rounded-xl border border-border p-4">
              <p className="font-semibold">{node.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{node.kind} · {node.linkedCases} linked cases</p>
              <StatusBadge value={node.severity} type="severity" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return <AuditLogPanel logs={moderatorAuditSeed()} localLogs={localAudit} />;
}
