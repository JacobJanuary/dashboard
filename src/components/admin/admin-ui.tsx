"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Lock,
  MessageSquare,
  Radio,
  ShieldAlert,
  ShieldCheck,
  WifiOff,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AdminEvent,
  AdminRole,
  AIAgent,
  ApprovalGate,
  ApprovalStatus,
  AuditLogEntry,
  EventPublicationStatus,
  ParticipantStatus,
  Severity,
  VenuePolicy,
  VenuePolicyMode,
} from "@/lib/admin-types";
import { roleLabels } from "@/lib/admin-data";
import {
  actionRequiresReason,
  canPerformAction,
  type AdminAction,
  type AdminResourceContext,
} from "@/lib/admin-guards";
import { demoEventCovers } from "@/lib/demo-assets";
import { cn } from "@/lib/utils";

const approvalLabels: Record<ApprovalStatus, string> = {
  not_required: "Не нужно",
  pending: "Ждёт решения",
  approved: "Одобрено",
  rejected: "Отклонено",
  changes_requested: "Нужны правки",
  escalated: "Передано на проверку",
};

const publicationLabels: Record<EventPublicationStatus, string> = {
  draft: "Черновик",
  blocked_until_gates_pass: "Ждёт площадку",
  ready_to_publish: "Можно публиковать",
  published: "Опубликовано",
  paused: "Пауза",
  cancelled: "Отменено",
  completed: "Завершено",
  archived: "Архив",
};

const participantLabels: Record<ParticipantStatus, string> = {
  applied: "Заявка",
  approved: "Одобрен",
  paid: "Оплачено",
  waitlist: "Waitlist",
  checked_in: "Check-in",
  no_show: "Неявка",
  refund_requested: "Возврат",
  refunded: "Возвращено",
};

const venuePolicyLabels: Record<VenuePolicyMode, string> = {
  approve_organizers: "Я одобряю организаторов один раз",
  moderate_every_event: "Я одобряю каждое внешнее событие",
  no_external_events: "Закрыто для внешних событий",
};

const statusClasses: Record<string, string> = {
  not_required: "bg-[#f8fafc] text-[#475569] border border-[#dde4ee]",
  pending: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
  approved: "bg-[#e9f8ef] text-[#138a4a] border border-[#b7e8c7]",
  rejected: "bg-[#fff0ef] text-[#c52b20] border border-[#ffb3ad]",
  changes_requested: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
  escalated: "bg-[#eef2ff] text-[#3949d7] border border-[#ccd5ff]",
  draft: "bg-[#f8fafc] text-[#475569] border border-[#dde4ee]",
  blocked_until_gates_pass: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
  ready_to_publish: "bg-[#eaf4ff] text-[#0969b9] border border-[#b7ddff]",
  published: "bg-[#e9f8ef] text-[#138a4a] border border-[#b7e8c7]",
  paused: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
  cancelled: "bg-[#fff0ef] text-[#c52b20] border border-[#ffb3ad]",
  completed: "bg-[#e9f8ef] text-[#138a4a] border border-[#b7e8c7]",
  archived: "bg-[#f8fafc] text-[#475569] border border-[#dde4ee]",
  low: "bg-[#f8fafc] text-[#475569] border border-[#dde4ee]",
  medium: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
  high: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
  critical: "bg-[#fff0ef] text-[#c52b20] border border-[#ffb3ad]",
  applied: "bg-[#eaf4ff] text-[#0969b9] border border-[#b7ddff]",
  paid: "bg-[#e9f8ef] text-[#138a4a] border border-[#b7e8c7]",
  checked_in: "bg-[#e9f8ef] text-[#138a4a] border border-[#b7e8c7]",
  waitlist: "bg-[#eef2ff] text-[#3949d7] border border-[#ccd5ff]",
  refund_requested: "bg-[#fff5dd] text-[#a76100] border border-[#ffd88c]",
  refunded: "bg-[#f8fafc] text-[#475569] border border-[#dde4ee]",
};

export function StatusBadge({
  value,
  type = "approval",
  className,
}: {
  value: ApprovalStatus | EventPublicationStatus | ParticipantStatus | Severity | string;
  type?: "approval" | "publication" | "participant" | "severity" | "plain";
  className?: string;
}) {
  const label =
    type === "approval"
      ? approvalLabels[value as ApprovalStatus] ?? value
      : type === "publication"
        ? publicationLabels[value as EventPublicationStatus] ?? value
        : type === "participant"
          ? participantLabels[value as ParticipantStatus] ?? value
          : value;

  return (
    <Badge className={cn(statusClasses[value] ?? "bg-secondary text-foreground border-0", className)}>
      {label}
    </Badge>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "neutral" | "good" | "warn" | "danger" | "info";
}) {
  const toneClasses = {
    neutral: "bg-[#f8fafc] text-[#647084]",
    good: "bg-[#e9f8ef] text-[#138a4a]",
    warn: "bg-[#fff5dd] text-[#a76100]",
    danger: "bg-[#fff0ef] text-[#c52b20]",
    info: "bg-[#eaf4ff] text-[#0969b9]",
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className={cn("mb-3 flex h-8 w-8 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Circle className="h-3.5 w-3.5 fill-current" />
        </div>
        <p className="text-[26px] font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        {helper && <p className="mt-2 text-[11px] text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  );
}

export function ApprovalTracker({ event }: { event: AdminEvent }) {
  const canPublish = event.approvalGates.every(
    (gate) => gate.status === "approved" || gate.status === "not_required",
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Путь к публикации</CardTitle>
            <p className="text-xs text-muted-foreground">
              Событие можно опубликовать, когда площадка и платформа закончат нужные проверки.
            </p>
          </div>
          <StatusBadge value={event.publicationStatus} type="publication" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.approvalGates.map((gate) => (
          <GateStatusCard key={gate.id} gate={gate} />
        ))}
        <div
          className={cn(
            "rounded-xl border p-3 text-sm",
            canPublish
              ? "border-[#b7e8c7] bg-[#e9f8ef] text-[#0d5f34]"
              : "border-[#ffd88c] bg-[#fff5dd] text-[#7a4c00]",
          )}
        >
          {canPublish
            ? "Всё готово. Событие можно публиковать."
            : "Пока ждём нужные подтверждения перед публикацией."}
        </div>
      </CardContent>
    </Card>
  );
}

export function GateStatusCard({ gate }: { gate: ApprovalGate }) {
  const Icon =
    gate.status === "approved" || gate.status === "not_required"
      ? CheckCircle2
      : gate.status === "rejected"
        ? XCircle
        : gate.status === "escalated"
          ? ShieldAlert
          : Clock;

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-white p-3">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          statusClasses[gate.status] ?? "bg-secondary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">
            {gate.type === "venue" ? "Подтверждение площадки" : "Проверка платформы"}
          </p>
          <StatusBadge value={gate.status} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{gate.requiredBecause}</p>
        {gate.decidedBy && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Решение: {gate.decidedBy} · {gate.decidedAt}
          </p>
        )}
        {gate.reason && <p className="mt-1 text-[11px] text-red-700">Reason: {gate.reason}</p>}
      </div>
    </div>
  );
}

export function OperationalStatesPanel({
  partialData,
  permissionRole,
}: {
  partialData?: boolean;
  permissionRole: AdminRole;
}) {
  const states = [
    {
      title: "Loading",
      text: "Skeleton rows shown after 200ms.",
      icon: Radio,
      className: "bg-secondary/60",
    },
    {
      title: "Empty",
      text: "Useful next action instead of a blank table.",
      icon: FileText,
      className: "bg-secondary/60",
    },
    {
      title: "Error",
      text: "Retry and human-readable cause.",
      icon: AlertTriangle,
      className: "bg-red-50 text-red-800",
    },
    {
      title: "Offline",
      text: "Cached read-only mode blocks irreversible actions.",
      icon: WifiOff,
      className: "bg-amber-50 text-amber-900",
    },
    {
      title: "Partial",
      text: partialData ? "Webhook delayed; stale data is labelled." : "Available where API may lag.",
      icon: Clock,
      className: "bg-blue-50 text-blue-900",
    },
    {
      title: "403",
      text: `Required role: ${roleLabels[permissionRole]}.`,
      icon: Lock,
      className: "bg-purple-50 text-purple-900",
    },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Состояния экрана</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {states.map((state) => {
            const Icon = state.icon;
            return (
              <div key={state.title} className={cn("rounded-xl border border-border p-3", state.className)}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <p className="text-sm font-semibold">{state.title}</p>
                </div>
                <p className="mt-1 text-xs opacity-80">{state.text}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function AuditLogPanel({
  logs,
  localLogs,
}: {
  logs: AuditLogEntry[];
  localLogs?: AuditLogEntry[];
}) {
  const merged = [...(localLogs ?? []), ...logs].slice(0, 7);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Audit log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {merged.map((log) => (
          <div key={log.id} className="rounded-xl bg-secondary/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{log.action}</p>
              <Badge variant="outline" className="text-[10px]">
                {roleLabels[log.actorRole]}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {log.entity} · {log.actor} · {log.createdAt}
            </p>
            {log.reasonCode && (
              <p className="mt-1 text-[11px] text-muted-foreground">Reason: {log.reasonCode}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DecisionPanel({
  role,
  title = "Decision",
  destructive = false,
  action = "audit:write",
  resource,
  onDecision,
}: {
  role: AdminRole;
  title?: string;
  destructive?: boolean;
  action?: AdminAction;
  resource?: AdminResourceContext;
  onDecision: (decision: string, reasonCode?: string) => void;
}) {
  const [reasonCode, setReasonCode] = useState("");
  const [note, setNote] = useState("");
  const allowed = canPerformAction(role, action, resource);
  const reasonRequired = destructive || actionRequiresReason(action);
  const disabled = reasonRequired && !reasonCode;
  const options = useMemo(() => {
    if (role === "venue_owner") {
      return ["owner_policy_conflict", "capacity_conflict", "missing_setup_plan", "organizer_risk"];
    }
    if (role === "moderator") {
      return ["policy_clear", "missing_safety_plan", "harassment", "unsafe_ai_answer", "fraud_risk"];
    }
    return ["participant_request", "refund_policy", "capacity_release", "manual_override"];
  }, [role]);

  const emit = (decision: string) => {
    if (!allowed || (reasonRequired && !reasonCode)) return;
    onDecision(decision, reasonCode || undefined);
    setNote("");
  };

  if (!allowed) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <div className="flex items-center gap-2 font-semibold">
              <Lock className="h-4 w-4" />
              Действие недоступно
            </div>
            <p className="mt-1 text-xs">
              Роль {roleLabels[role]} не может выполнить `{action}` в этом контексте.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Причина обязательна для отказов, блокировок, отмены, удаления, legal enforcement и AI limitations.
        </div>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Reason code</span>
          <select
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Выберите причину</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Internal note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Контекст решения для audit log"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled} onClick={() => emit("Одобрить")} className="bg-emerald-600 hover:bg-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Одобрить
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Запросить правки")}>
            Запросить правки
          </Button>
          <Button variant="outline" disabled={disabled} onClick={() => emit("Эскалировать")}>
            Эскалировать
          </Button>
          <Button variant="destructive" disabled={disabled} onClick={() => emit("Отклонить")}>
            <ShieldAlert className="h-4 w-4" />
            Отклонить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function VenuePolicySelector({
  policy,
  onChange,
}: {
  policy: VenuePolicy;
  onChange: (policy: VenuePolicy) => void;
}) {
  const modes: { mode: VenuePolicyMode; text: string }[] = [
    {
      mode: "approve_organizers",
      text: "Recommended: approve an organizer once, then they can create events here.",
    },
    {
      mode: "moderate_every_event",
      text: "Every external event waits for your review before it can use this place.",
    },
    {
      mode: "no_external_events",
      text: "Внешние организаторы не могут создать событие в этой площадке.",
    },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Venue access policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {modes.map((item) => (
          <button
            key={item.mode}
            onClick={() => onChange({ ...policy, mode: item.mode })}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition-colors",
              policy.mode === item.mode
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:bg-secondary/50",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{venuePolicyLabels[item.mode]}</p>
              {policy.mode === item.mode && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
          </button>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Setup buffer</span>
            <input
              type="number"
              value={policy.setupBufferMinutes}
              onChange={(event) =>
                onChange({ ...policy, setupBufferMinutes: Number(event.target.value) })
              }
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Blocked categories</span>
            <input
              value={policy.restrictedCategories.join(", ")}
              onChange={(event) =>
                onChange({
                  ...policy,
                  restrictedCategories: event.target.value
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChatThread({ moderator = false }: { moderator?: boolean }) {
  const messages = [
    { author: "Maya", text: "Can I bring a friend?", tone: "other" },
    {
      author: "AI draft",
      text: "Yes, if tickets are available. You can add +1 from your ticket page.",
      tone: "ai",
    },
    {
      author: moderator ? "Flagged user" : "Organizer",
      text: moderator ? "Removed phrase retained in evidence vault." : "Reminder goes out tomorrow at 10:00.",
      tone: moderator ? "danger" : "self",
    },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          {moderator ? "Flagged transcript" : "Event chat"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-[180px_1fr_220px]">
          <div className="rounded-xl bg-secondary/50 p-3 text-sm">
            <p className="font-semibold">Threads</p>
            <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
              <span className="rounded-lg bg-background px-2 py-1 text-foreground">Sunset group</span>
              <span className="rounded-lg px-2 py-1">VIP questions</span>
              <span className="rounded-lg px-2 py-1">Organizer ↔ venue</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              Pinned: address, refund policy, dress code, escalation rules.
            </div>
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={`${message.author}-${message.text}`}
                  className={cn(
                    "max-w-[85%] rounded-xl p-3 text-sm",
                    message.tone === "self" && "ml-auto bg-blue-50 text-blue-950",
                    message.tone === "ai" && "bg-purple-50 text-purple-950",
                    message.tone === "danger" && "bg-red-50 text-red-900",
                    message.tone === "other" && "bg-secondary text-foreground",
                  )}
                >
                  <p className="font-semibold">{message.author}</p>
                  <p className="mt-1 text-xs opacity-85">{message.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3 text-sm">
            <p className="font-semibold">AI context</p>
            <div className="mt-2 grid gap-2 text-xs text-muted-foreground">
              <span>Confidence: 0.86</span>
              <span>Mode: Draft replies only</span>
              <span>Escalate: refunds, safety, harassment</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentCard({ agent }: { agent: AIAgent }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{agent.name}</p>
              <Badge variant="outline">{agent.scope}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{agent.ownerName}</p>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
              <span>Mode: {agent.mode}</span>
              <span>Confidence threshold: {agent.confidenceThreshold}</span>
              <span>Forbidden: {agent.forbiddenTopics.join(", ")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicPreviewFrame({ href = "/event/1" }: { href?: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Public preview QA</CardTitle>
          <Link href={href}>
            <Button variant="outline" size="sm">Open</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mx-auto w-full max-w-[280px] rounded-[2rem] bg-foreground p-3">
          <div className="rounded-[1.5rem] bg-background p-4">
            <div className="relative h-28 overflow-hidden rounded-2xl">
              <Image
                src={demoEventCovers.sunsetMixer}
                alt="Sunset Singles Mixer preview"
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
            <h3 className="mt-4 text-lg font-bold">Sunset Singles Mixer</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              The Penmar · Social / Music · 17 Apr
            </p>
            <div className="mt-3 flex gap-2">
              <Badge className="bg-primary text-white border-0">$25</Badge>
              <Badge variant="secondary">42/80</Badge>
            </div>
            <Button className="mt-4 w-full rounded-full">Join event</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonState() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-4">
          <div className="h-16 animate-pulse rounded-lg bg-secondary" />
          <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function PermissionDeniedState({ role }: { role: AdminRole }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <Lock className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold">Недостаточно прав</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Это действие доступно роли {roleLabels[role]}. Для смены контекста используйте role switcher.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionToast({
  message,
  onClose,
}: {
  message?: string;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-[#b7e8c7] bg-white p-4 text-sm shadow-lg">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Состояние обновлено</p>
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          ×
        </button>
      </div>
    </div>
  );
}

export { approvalLabels, participantLabels, publicationLabels, venuePolicyLabels };
