"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Heart,
  Info,
  MapPin,
  Clock,
  Ticket,
  MessageSquare,
  Pencil,
  Ban,
  AlertTriangle,
  ChevronLeft,
  Send,
  Search,
  Star,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  UserCheck,
  BarChart3,
  Settings,
  Copy,
  Share2,
  ExternalLink,
} from "lucide-react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { VoiceMessage } from "@/components/voice-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  type OrganizerEvent,
  type AttendeeRecord,
  organizerEvents,
} from "@/lib/organizer-data";

export function generateStaticParams() {
  return organizerEvents.map((e) => ({ id: e.id }));
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  live: "bg-emerald-100 text-emerald-700",
  upcoming: "bg-primary/10 text-primary",
  completed: "bg-mint/20 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  draft: "Черновик",
  live: "Активно",
  upcoming: "Предстоящее",
  completed: "Завершено",
  cancelled: "Отменено",
};

const attendeeStatusConfig: Record<string, { label: string; color: string }> = {
  rsvp: { label: "Запись", color: "bg-primary/10 text-primary" },
  paid: { label: "Оплачено", color: "bg-amber-100 text-amber-700" },
  checked_in: { label: "Зачекинено", color: "bg-mint/20 text-emerald-700" },
  no_show: { label: "Неявка", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Отменено", color: "bg-gray-100 text-gray-700" },
};

function getEventBadge(event: OrganizerEvent) {
  if (event.status === "cancelled") return { label: "Отменено", className: "bg-red-100 text-red-700 border-0" };
  if (event.status === "completed") return { label: "Завершено", className: "bg-mint/20 text-emerald-700 border-0" };
  if (event.status === "draft") return { label: "Черновик", className: "bg-gray-100 text-gray-700 border-0" };
  if (event.rsvpCount >= event.capacity) return { label: "Sold Out", className: "bg-red-100 text-red-700 border-0" };
  const fillRate = event.rsvpCount / event.capacity;
  if (fillRate >= 0.8) {
    const remaining = event.capacity - event.rsvpCount;
    return { label: `Осталось ${remaining} мест`, className: "bg-amber-100 text-amber-700 border-0" };
  }
  if (event.status === "live") return { label: "Активно", className: "bg-emerald-100 text-emerald-700 border-0" };
  return { label: "Предстоящее", className: "bg-primary/10 text-primary border-0" };
}

const tabs = [
  { id: "overview", label: "Обзор", icon: Info },
  { id: "attendees", label: "Участники", icon: Users },
  { id: "chat", label: "Чат", icon: MessageSquare },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "settings", label: "Настройки", icon: Settings },
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<OrganizerEvent | undefined>(
    organizerEvents.find((e) => e.id === eventId)
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [groupMessageText, setGroupMessageText] = useState("");
  const [attendeeFilter, setAttendeeFilter] = useState("all");
  const [attendeeSearch, setAttendeeSearch] = useState("");

  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    price: "",
    capacity: "",
  });

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-1">Событие не найдено</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          Возможно, оно было удалено или у вас нет доступа.
        </p>
        <Button className="rounded-full" onClick={() => router.push("/organizer/events")}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          К событиям
        </Button>
      </div>
    );
  }

  const badge = getEventBadge(event);
  const canEdit = event.soldTickets === 0 && event.status !== "completed" && event.status !== "cancelled";
  const canCancel = event.status !== "completed" && event.status !== "cancelled";
  const cancelPenalty = event.soldTickets > 0 && event.price ? Math.round(event.soldTickets * event.price * 0.15) : 0;

  const openEdit = () => {
    setEditForm({
      title: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
      price: event.price?.toString() ?? "",
      capacity: event.capacity.toString(),
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    setEvent((prev) =>
      prev
        ? {
            ...prev,
            title: editForm.title,
            date: editForm.date,
            time: editForm.time,
            venue: editForm.venue,
            description: editForm.description,
            price: editForm.price ? Number(editForm.price) : null,
            capacity: Number(editForm.capacity),
          }
        : prev
    );
    setEditOpen(false);
  };

  const confirmCancel = () => {
    if (!cancelReason) return;
    setEvent((prev) => (prev ? { ...prev, status: "cancelled" as const } : prev));
    setCancelReason("");
    setCancelNote("");
    setCancelOpen(false);
  };

  const sendGroupMessage = (voice?: { audioUrl: string; duration: number; transcription?: string }) => {
    if (!voice && !groupMessageText.trim()) return;
    setEvent((prev) =>
      prev
        ? {
            ...prev,
            groupMessages: [
              ...prev.groupMessages,
              voice
                ? { type: "voice" as const, audioUrl: voice.audioUrl, duration: voice.duration, transcription: voice.transcription, sentAt: "Только что" }
                : { type: "text" as const, text: groupMessageText.trim(), sentAt: "Только что" },
            ],
          }
        : prev
    );
    setGroupMessageText("");
  };

  const updateGroupTranscription = (audioUrl: string, transcription: string) => {
    setEvent((prev) =>
      prev
        ? {
            ...prev,
            groupMessages: prev.groupMessages.map((msg) =>
              msg.type === "voice" && msg.audioUrl === audioUrl
                ? { ...msg, transcription }
                : msg
            ),
          }
        : prev
    );
  };

  const filteredAttendees = event.attendees.filter((a) => {
    const matchesFilter = attendeeFilter === "all" || a.status === attendeeFilter;
    const matchesSearch = a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) || a.email.toLowerCase().includes(attendeeSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const attendeeFilters = [
    { label: "Все", value: "all" },
    { label: "Оплачено", value: "paid" },
    { label: "Запись", value: "rsvp" },
    { label: "Зачекинено", value: "checked_in" },
  ];

  const totalRevenue = event.tickets.reduce((sum, t) => sum + (t.price ?? 0) * t.sold, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shrink-0"
          onClick={() => router.push("/organizer/events")}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold truncate">{event.title}</h1>
            <Badge className={`${badge.className} text-xs`}>{badge.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {event.venue}
          </p>
        </div>
      </div>

      {/* Cover */}
      <div className="relative h-56 rounded-2xl overflow-hidden">
        <Image src={event.coverImage} alt={event.title} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="text-white">
            <p className="text-sm opacity-90 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {event.date} · {event.time}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="rounded-full gap-1.5 bg-white/90 text-foreground hover:bg-white">
              <Share2 className="w-3.5 h-3.5" />
              Поделиться
            </Button>
            <Button variant="secondary" size="sm" className="rounded-full gap-1.5 bg-white/90 text-foreground hover:bg-white">
              <ExternalLink className="w-3.5 h-3.5" />
              Открыть
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "chat" && event.unreadMessages > 0 && (
                  <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {event.unreadMessages}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <OverviewTab
              event={event}
              totalRevenue={totalRevenue}
              onEdit={openEdit}
              onCancel={() => setCancelOpen(true)}
              canEdit={canEdit}
              canCancel={canCancel}
            />
          )}
          {activeTab === "attendees" && (
            <AttendeesTab
              attendees={filteredAttendees}
              totalAttendees={event.attendees.length}
              filters={attendeeFilters}
              activeFilter={attendeeFilter}
              onFilterChange={setAttendeeFilter}
              search={attendeeSearch}
              onSearchChange={setAttendeeSearch}
            />
          )}
          {activeTab === "chat" && (
            <ChatTab
              messages={event.groupMessages}
              messageText={groupMessageText}
              onMessageChange={setGroupMessageText}
              onSend={sendGroupMessage}
              onTranscriptionReady={updateGroupTranscription}
              attendeeCount={event.attendees.length}
            />
          )}
          {activeTab === "analytics" && <AnalyticsTab event={event} />}
          {activeTab === "settings" && (
            <SettingsTab
              event={event}
              onEdit={openEdit}
              onCancel={() => setCancelOpen(true)}
              canEdit={canEdit}
              canCancel={canCancel}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Редактировать событие</DialogTitle>
          <DialogDescription>Измените детали мероприятия. Сохраните, когда закончите.</DialogDescription>
          {event.soldTickets > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">Редактирование ограничено: уже продано {event.soldTickets} билетов.</p>
            </div>
          )}
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-sm font-medium">Название</label>
              <Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} disabled={!canEdit} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Дата</label>
                <Input value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} disabled={!canEdit} />
              </div>
              <div>
                <label className="text-sm font-medium">Время</label>
                <Input value={editForm.time} onChange={(e) => setEditForm((f) => ({ ...f, time: e.target.value }))} disabled={!canEdit} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Место проведения</label>
              <Input value={editForm.venue} onChange={(e) => setEditForm((f) => ({ ...f, venue: e.target.value }))} disabled={!canEdit} />
            </div>
            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea rows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} disabled={!canEdit} className="resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Цена ($)</label>
                <Input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} disabled={!canEdit} />
              </div>
              <div>
                <label className="text-sm font-medium">Вместимость</label>
                <Input type="number" value={editForm.capacity} onChange={(e) => setEditForm((f) => ({ ...f, capacity: e.target.value }))} disabled={!canEdit} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" className="rounded-full" onClick={() => setEditOpen(false)}>Отмена</Button>
            <Button className="rounded-full" onClick={saveEdit} disabled={!canEdit}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="w-5 h-5" />
            Отменить мероприятие
          </DialogTitle>
          <DialogDescription>Вы уверены, что хотите отменить «{event.title}»?</DialogDescription>
          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800">Это действие нельзя отменить</p>
                <ul className="text-xs text-red-700/80 space-y-1 list-disc list-inside">
                  {event.soldTickets > 0 && (
                    <>
                      <li>Всем {event.soldTickets} участникам будет произведён возврат денег</li>
                      <li>Финансовый штраф: ${cancelPenalty}</li>
                    </>
                  )}
                  <li>Ваш рейтинг понизится на 0.5</li>
                  <li>Событие получит статус «Отменено»</li>
                </ul>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reason code</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Выберите причину</option>
                <option value="organizer_unavailable">organizer_unavailable</option>
                <option value="venue_conflict">venue_conflict</option>
                <option value="safety_issue">safety_issue</option>
                <option value="low_sales">low_sales</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Audit note</label>
              <Textarea
                rows={3}
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder="Кратко объясните отмену для журнала действий"
                className="resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" className="rounded-full" onClick={() => setCancelOpen(false)}>Назад</Button>
            <Button variant="destructive" className="rounded-full gap-2" onClick={confirmCancel} disabled={!cancelReason}>
              <Ban className="w-4 h-4" />
              Да, отменить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({
  event,
  totalRevenue,
  onEdit,
  onCancel,
  canEdit,
  canCancel,
}: {
  event: OrganizerEvent;
  totalRevenue: number;
  onEdit: () => void;
  onCancel: () => void;
  canEdit: boolean;
  canCancel: boolean;
}) {
  const spotsLeft = Math.max(0, event.capacity - event.rsvpCount);
  const fillRate = event.capacity > 0 ? Math.round((event.rsvpCount / event.capacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Участники" value={`${event.rsvpCount}`} sub={`из ${event.capacity}`} color="bg-primary/10 text-primary" />
        <StatCard icon={DollarSign} label="Выручка" value={`$${totalRevenue}`} sub={`${event.soldTickets} билетов`} color="bg-amber-100 text-amber-700" />
        <StatCard icon={Eye} label="Просмотры" value={`${event.stats.views}`} sub={`${event.stats.detailOpens} подробнее`} color="bg-plum/10 text-plum" />
        <StatCard icon={Heart} label="Избранное" value={`${event.stats.favorites}`} sub="добавили" color="bg-red-50 text-red-600" />
      </div>

      {/* Fill Rate */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Заполняемость</span>
            <span className="text-sm font-bold">{fillRate}%</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${fillRate}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{event.rsvpCount} записались</span>
            <span>{spotsLeft} мест осталось</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Description */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {event.time}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {event.venue}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ticket className="w-4 h-4" />
                {event.price ? `$${event.price}` : "Бесплатно"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Билеты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.tickets.map((ticket) => (
              <div key={ticket.id} className="p-3 rounded-xl bg-secondary/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{ticket.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {ticket.type === "free" ? "Бесплатно" : ticket.type === "donation" ? "Донейшн" : `$${ticket.price}`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Продано {ticket.sold} из {ticket.quantity}</span>
                  <span>{Math.round((ticket.sold / ticket.quantity) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(ticket.sold / ticket.quantity) * 100}%` }} />
                </div>
              </div>
            ))}
            {event.promoCodes.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Промокоды</p>
                {event.promoCodes.map((pc) => (
                  <div key={pc.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono bg-secondary px-2 py-0.5 rounded">{pc.code}</span>
                    <span className="text-xs text-muted-foreground">
                      {pc.discountType === "percentage" ? `${pc.discountValue}%` : `$${pc.discountValue}`} · {pc.usedCount}/{pc.usageLimit ?? "∞"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-full gap-2" onClick={onEdit} disabled={!canEdit}>
          <Pencil className="w-4 h-4" />
          Редактировать
        </Button>
        <Button variant="outline" className="rounded-full gap-2" onClick={() => {}}>
          <Copy className="w-4 h-4" />
          Скопировать ссылку
        </Button>
        <Button variant="destructive" className="rounded-full gap-2 ml-auto" onClick={onCancel} disabled={!canCancel}>
          <Ban className="w-4 h-4" />
          Отменить событие
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof Users; label: string; value: string; sub: string; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Attendees Tab ─── */
function AttendeesTab({
  attendees,
  totalAttendees,
  filters,
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
}: {
  attendees: AttendeeRecord[];
  totalAttendees: number;
  filters: { label: string; value: string }[];
  activeFilter: string;
  onFilterChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const statusCounts: Record<string, number> = {};
  attendees.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Участники ({totalAttendees})</h2>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск по имени или email..." className="pl-9 rounded-full" value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <Button key={f.value} variant={activeFilter === f.value ? "default" : "outline"} size="sm" className={`rounded-full text-xs ${activeFilter === f.value ? "bg-primary text-white" : ""}`} onClick={() => onFilterChange(f.value)}>
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {attendees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Участники не найдены</p>
          </div>
        )}
        {attendees.map((a) => {
          const cfg = attendeeStatusConfig[a.status];
          return (
            <Card key={a.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={a.avatar} alt={a.name} />
                  <AvatarFallback className="text-xs">{a.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">{a.email}</p>
                </div>
                <div className="text-right">
                  <Badge className={`${cfg.color} border-0 text-[10px]`}>{cfg.label}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.ticketType}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Chat Tab ─── */
function ChatTab({
  messages,
  messageText,
  onMessageChange,
  onSend,
  onTranscriptionReady,
  attendeeCount,
}: {
  messages: { type: "text" | "voice"; text?: string; audioUrl?: string; duration?: number; transcription?: string; sentAt: string }[];
  messageText: string;
  onMessageChange: (v: string) => void;
  onSend: (voice?: { audioUrl: string; duration: number; transcription?: string }) => void;
  onTranscriptionReady?: (audioUrl: string, transcription: string) => void;
  attendeeCount: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Групповой чат
        </h2>
        <span className="text-xs text-muted-foreground">{attendeeCount} участников</span>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Напишите первое сообщение всем участникам</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="p-3 rounded-xl bg-secondary/30">
                {msg.type === "voice" && msg.audioUrl ? (
                  <VoiceMessage audioUrl={msg.audioUrl} duration={msg.duration} transcription={msg.transcription} />
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{msg.sentAt}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            <Textarea
              placeholder="Введите сообщение..."
              rows={2}
              value={messageText}
              onChange={(e) => onMessageChange(e.target.value)}
              className="resize-none flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <VoiceRecorder
              onVoiceRecorded={(url, dur) => onSend({ audioUrl: url, duration: dur })}
              onTranscriptionReady={onTranscriptionReady}
            />
            <Button className="rounded-full px-3 shrink-0 self-end" onClick={() => onSend()} disabled={!messageText.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Analytics Tab ─── */
function AnalyticsTab({ event }: { event: OrganizerEvent }) {
  const funnel = [
    { label: "Просмотры", value: event.stats.views, icon: Eye, color: "text-primary" },
    { label: "Подробнее", value: event.stats.detailOpens, icon: Info, color: "text-plum" },
    { label: "Избранное", value: event.stats.favorites, icon: Heart, color: "text-red-500" },
    { label: "Записались", value: event.rsvpCount, icon: Users, color: "text-emerald-600" },
  ];

  const conversionRate = event.stats.views > 0 ? Math.round((event.rsvpCount / event.stats.views) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Конверсия" value={`${conversionRate}%`} sub="запись / просмотр" color="bg-mint/20 text-emerald-700" />
        <StatCard icon={UserCheck} label="Зачекинено" value={`${event.checkedIn}`} sub={`из ${event.rsvpCount}`} color="bg-primary/10 text-primary" />
        <StatCard icon={DollarSign} label="Средний чек" value={event.price ? `$${event.price}` : "Бесплатно"} sub="на участника" color="bg-amber-100 text-amber-700" />
        <StatCard icon={Star} label="Рейтинг" value="4.7" sub="средний" color="bg-plum/10 text-plum" />
      </div>

      {/* Funnel */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Воронка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {funnel.map((step, i) => {
            const Icon = step.icon;
            const prevValue = i > 0 ? funnel[i - 1].value : step.value;
            const dropOff = i > 0 && prevValue > 0 ? Math.round(((prevValue - step.value) / prevValue) * 100) : 0;
            const maxValue = Math.max(...funnel.map((f) => f.value));
            return (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${step.color}`} />
                    {step.label}
                  </span>
                  <span className="font-semibold">{step.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${maxValue > 0 ? (step.value / maxValue) * 100 : 0}%` }} />
                </div>
                {dropOff > 0 && (
                  <p className="text-[10px] text-muted-foreground">Отток: {dropOff}%</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Demographics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Возраст</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "18–24", value: 28 },
              { label: "25–29", value: 42 },
              { label: "30–34", value: 22 },
              { label: "35+", value: 8 },
            ].map((d) => (
              <div key={d.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{d.label}</span>
                  <span className="font-medium">{d.value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-plum rounded-full" style={{ width: `${d.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Пол</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Женщины", value: 48, color: "bg-pink-400" },
              { label: "Мужчины", value: 46, color: "bg-blue-400" },
              { label: "Небинарные", value: 6, color: "bg-purple-400" },
            ].map((d) => (
              <div key={d.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{d.label}</span>
                  <span className="font-medium">{d.value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Settings Tab ─── */
function SettingsTab({
  event,
  onEdit,
  onCancel,
  canEdit,
  canCancel,
}: {
  event: OrganizerEvent;
  onEdit: () => void;
  onCancel: () => void;
  canEdit: boolean;
  canCancel: boolean;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Настройки события</h2>

      <div className="space-y-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Основная информация</p>
              <p className="text-xs text-muted-foreground">Название, дата, время, место, описание</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5" onClick={onEdit} disabled={!canEdit}>
              <Pencil className="w-3.5 h-3.5" />
              Изменить
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Билеты и цены</p>
              <p className="text-xs text-muted-foreground">{event.tickets.length} типов билетов</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5" disabled>
              <Pencil className="w-3.5 h-3.5" />
              Изменить
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Промокоды</p>
              <p className="text-xs text-muted-foreground">{event.promoCodes.length} активных кодов</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5" disabled>
              <Pencil className="w-3.5 h-3.5" />
              Управлять
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Лист ожидания</p>
              <p className="text-xs text-muted-foreground">{event.waitlistEnabled ? "Включён" : "Выключен"}</p>
            </div>
            <Badge variant={event.waitlistEnabled ? "default" : "secondary"} className="text-[10px]">
              {event.waitlistEnabled ? "Активно" : "Неактивно"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Цифровые билеты</p>
              <p className="text-xs text-muted-foreground">QR-коды для входа</p>
            </div>
            <Badge variant={event.digitalTicketsEnabled ? "default" : "secondary"} className="text-[10px]">
              {event.digitalTicketsEnabled ? "Включены" : "Выключены"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Защита возврата</p>
              <p className="text-xs text-muted-foreground">Страховка для участников</p>
            </div>
            <Badge variant={event.refundProtectionEnabled ? "default" : "secondary"} className="text-[10px]">
              {event.refundProtectionEnabled ? "Включена" : "Выключена"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 border-t border-border">
        <Button variant="destructive" className="rounded-full gap-2 w-full sm:w-auto" onClick={onCancel} disabled={!canCancel}>
          <Ban className="w-4 h-4" />
          Отменить событие
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Отмена события необратима. Всем участникам будет произведён возврат.
        </p>
      </div>
    </div>
  );
}
