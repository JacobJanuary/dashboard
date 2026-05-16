"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, QrCode, Lock, CheckCircle2, Clock4, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { events, attendanceRequests } from "@/lib/data";

export default function GoingPage() {
  // Demo user requests
  const myRequests = attendanceRequests.filter((r) =>
    ["req1", "req2", "req3", "req4", "req5"].includes(r.id)
  );

  const approvedEventIds = myRequests
    .filter((r) => r.status === "approved")
    .map((r) => r.eventId);
  const pendingEventIds = myRequests
    .filter((r) => r.status === "pending")
    .map((r) => r.eventId);

  const approvedEvents = events.filter((e) => approvedEventIds.includes(e.id));
  const pendingEvents = events.filter((e) => pendingEventIds.includes(e.id));

  const upcomingPublic = events
    .filter((e) => e.status === "upcoming" && e.privacy !== "approval_required")
    .slice(0, 2);

  const past = events.filter((e) => e.status === "ended").slice(0, 2);

  return (
    <div className="min-h-full">
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">Иду</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ваши события и билеты
        </p>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Approved */}
        {approvedEvents.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Подтверждено
            </h2>
            <div className="space-y-3">
              {approvedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/event/${event.id}`} className="block">
                    <div className="flex gap-3 bg-card border border-mint/30 rounded-xl p-3 active:scale-[0.98] transition-transform">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={event.coverImage}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">
                            {event.title}
                          </h3>
                          <Badge className="bg-mint/20 text-emerald-700 border-0 text-[10px] shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Одобрено
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                          <span className="flex items-center">
                            <CalendarDays className="w-3 h-3 mr-1" />
                            {event.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.time}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.venue}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                          {event.price ? `$${event.price}` : "Бесплатно"}
                        </Badge>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <QrCode className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Pending approval */}
        {pendingEvents.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Ожидают подтверждения
            </h2>
            <div className="space-y-3">
              {pendingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/event/${event.id}`} className="block">
                    <div className="flex gap-3 bg-card border border-amber-200/60 rounded-xl p-3 active:scale-[0.98] transition-transform">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={event.coverImage}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">
                            {event.title}
                          </h3>
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] shrink-0">
                            <Clock4 className="w-3 h-3 mr-1" />
                            На рассмотрении
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                          <span className="flex items-center">
                            <CalendarDays className="w-3 h-3 mr-1" />
                            {event.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.time}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.venue}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                          <AlertCircle className="w-3 h-3" />
                          Организатор рассматривает вашу заявку
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-start">
                        <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                          {event.price ? `$${event.price}` : "Бесплатно"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming public */}
        {upcomingPublic.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Предстоящие
            </h2>
            <div className="space-y-3">
              {upcomingPublic.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/event/${event.id}`} className="block">
                    <div className="flex gap-3 bg-card border border-border rounded-xl p-3 active:scale-[0.98] transition-transform">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={event.coverImage}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {event.title}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                          <span className="flex items-center">
                            <CalendarDays className="w-3 h-3 mr-1" />
                            {event.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.time}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.venue}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                          {event.price ? `$${event.price}` : "Бесплатно"}
                        </Badge>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <QrCode className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Past */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Прошедшие
          </h2>
          <div className="space-y-3">
            {past.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Link href={`/event/${event.id}`} className="block">
                  <div className="flex gap-3 bg-secondary/30 border border-border/50 rounded-xl p-3 opacity-70">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {event.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.date}
                      </p>
                      <Badge className="mt-2 bg-mint/20 text-emerald-700 border-0 text-[10px]">
                        Посещено
                      </Badge>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
