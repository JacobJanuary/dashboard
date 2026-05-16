"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Calendar,
  CalendarPlus,
  Users,
  BadgeCheck,
  ChevronLeft,
  Share,
  Heart,
  Star,
  Shield,
  Wine,
  Accessibility,
  ArrowRight,
  Lock,
  CheckCircle2,
  Clock4,
  Send,
  Copy,
  Link2,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { events, attendees, attendanceRequests } from "@/lib/data";
import { getHostIdByEventHostName } from "@/lib/host-profile-data";
import { generateICS, downloadICS } from "@/lib/calendar";
import { TrackingScripts } from "@/components/tracking-scripts";

const avatarPool = [
  "/demo/avatars/avatar-01.png",
  "/demo/avatars/avatar-02.png",
  "/demo/avatars/avatar-03.png",
  "/demo/avatars/avatar-04.png",
  "/demo/avatars/avatar-05.png",
  "/demo/avatars/avatar-01.png",
  "/demo/avatars/avatar-02.png",
  "/demo/avatars/avatar-03.png",
];

export default function EventDetailClient({ id }: { id: string }) {
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Событие не найдено</p>
      </div>
    );
  }

  const eventAttendees = attendees.filter((a) => a.eventId === event.id).slice(0, 6);

  return (
    <div className="min-h-full pb-24">
      <TrackingScripts metaPixelId={event.metaPixelId} gtmContainerId={event.gtmContainerId} />
      {/* Hero Image */}
      <div className="relative aspect-[4/3]">
        <Image
          src={event.coverImage}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge className="bg-primary/90 text-white border-0 mb-2">
            {event.category}
          </Badge>
          <h1 className="text-white text-2xl font-bold leading-tight">
            {event.title}
          </h1>
          <div className="flex items-center text-white/90 text-sm mt-2 gap-3">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {event.venue}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {event.time}
            </span>
          </div>
          {event.privacy === "approval_required" && (
            <div className="flex items-center text-white/90 text-sm mt-2">
              <Lock className="w-4 h-4 mr-1" />
              Требуется подтверждение организатора
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-6">
        {/* Date & Price Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{event.date}</span>
            <span className="text-muted-foreground">{event.time} – {event.endTime}</span>
            <button
              onClick={() => {
                // Parse date like "Apr 17, 2026" to "2026-04-17"
                const dateObj = new Date(event.date);
                const dateStr = dateObj.toISOString().split("T")[0];
                const ics = generateICS({
                  title: event.title,
                  description: event.description,
                  location: event.venue,
                  startDate: dateStr,
                  startTime: event.time.includes(":") ? event.time : "18:00",
                  endDate: dateStr,
                  endTime: event.endTime?.includes(":") ? event.endTime : "20:00",
                });
                downloadICS(`${event.slug || event.id}.ics`, ics);
              }}
              className="flex items-center gap-1 text-xs text-primary font-medium ml-2"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              В календарь
            </button>
          </div>
          {event.price ? (
            <span className="text-xl font-bold">{event.currency}{event.price}</span>
          ) : (
            <Badge className="bg-mint/20 text-emerald-700 border-0">Бесплатно</Badge>
          )}
        </div>

        {/* Who's Going */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base">Кто идёт</h2>
            <span className="text-sm text-muted-foreground">
              {event.verifiedInterested} верифицировано
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {eventAttendees.map((attendee) => (
                <Avatar key={attendee.id} className="w-10 h-10 border-2 border-background">
                  <AvatarImage src={attendee.avatar} />
                  <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {eventAttendees.length === 0 && (
                <>
                  {[0, 1, 2, 3].map((i) => (
                    <Avatar key={i} className="w-10 h-10 border-2 border-background">
                      <AvatarImage src={avatarPool[i % avatarPool.length]} alt="" />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-purple-600/20 text-xs">
                        ??
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              +{event.interested} интересно
            </div>
          </div>
        </div>

        {/* Host */}
        <Link href={`/host/${getHostIdByEventHostName(event.host.name) || ""}`}>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 active:scale-[0.98] transition-transform">
            <Avatar className="w-12 h-12">
              <AvatarImage src={event.host.avatar} />
              <AvatarFallback>{event.host.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">{event.host.name}</span>
                {event.host.verified && (
                  <BadgeCheck className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center">
                  <Star className="w-3 h-3 mr-0.5 text-amber-400 fill-amber-400" />
                  {event.host.rating}
                </span>
                <span>·</span>
                <span>{event.host.eventsCount} событий</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>

        {/* Refund Protection */}
        {event.refundProtectionEnabled && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-mint/10 border border-mint/20">
            <Shield className="w-5 h-5 text-mint shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">Защита покупки</p>
              <p className="text-xs text-muted-foreground">
                Вернём деньги, если вы не сможете прийти. Комиссия {event.refundProtectionFeePercent}% через {event.refundProtectionProvider}.
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className="font-semibold text-base mb-2">О событии</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Referral Link */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Пригласи друга</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Поделись ссылкой — каждый друг, который придёт по ней, получит бонус
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 truncate font-mono">
              sparkirl.com/e/{event.slug || event.id}?ref=YOU
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`sparkirl.com/e/${event.slug || event.id}?ref=YOU`);
              }}
              className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Approval info */}
        {event.privacy === "approval_required" && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 space-y-2">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-amber-800">
              <Lock className="w-4 h-4" />
              Закрытое событие
            </h2>
            <p className="text-sm text-amber-700/80 leading-relaxed">
              Организатор вручную рассматривает заявки на участие. Вы получите уведомление, когда ваша заявка будет рассмотрена.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-700/60">
              <Clock4 className="w-3.5 h-3.5" />
              Обычно ответ приходит в течение 24 часов
            </div>
          </div>
        )}

        {/* Rules & Safety */}
        <div className="space-y-2">
          <h2 className="font-semibold text-base">Важно знать</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-emerald-500" />
            Требуется фотоверификация для участия
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wine className="w-4 h-4 text-muted-foreground" />
            Событие {event.ageMin}+
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Accessibility className="w-4 h-4 text-muted-foreground" />
            Доступно для инвалидных колясок
          </div>
        </div>

        {/* Venue */}
        <div>
          <h2 className="font-semibold text-base mb-2">Место проведения</h2>
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-600/5" />
              <div className="text-center z-10">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">{event.venue}</p>
                <p className="text-xs text-muted-foreground">{event.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40"
      >
        {event.privacy === "approval_required" ? (
          <div className="bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-lg">
            {/* Check if user has a request for this event */}
            {(() => {
              const myRequest = attendanceRequests.find(
                (r) => r.eventId === event.id
              );
              if (myRequest?.status === "approved") {
                return (
                  <div className="space-y-2">
                    <Button className="w-full rounded-full bg-mint hover:bg-mint/90 text-white font-semibold h-12 gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Вы одобрены
                    </Button>
                    <Link href={`/ticket/demo-${event.id}`} className="block">
                      <Button variant="outline" className="w-full rounded-full h-12 gap-2">
                        <QrCode className="w-5 h-5" />
                        Мой билет
                      </Button>
                    </Link>
                  </div>
                );
              }
              if (myRequest?.status === "pending") {
                return (
                  <Button
                    disabled
                    className="w-full rounded-full bg-amber-100 text-amber-700 font-semibold h-12 gap-2"
                  >
                    <Clock4 className="w-5 h-5" />
                    Заявка на рассмотрении
                  </Button>
                );
              }
              return (
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 gap-2">
                  <Send className="w-5 h-5" />
                  Подать заявку
                </Button>
              );
            })()}
          </div>
        ) : (
          <div className="bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-lg flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shrink-0"
            >
              <Heart className="w-5 h-5" />
            </Button>
            <Button className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold h-12">
              Мне интересно
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
