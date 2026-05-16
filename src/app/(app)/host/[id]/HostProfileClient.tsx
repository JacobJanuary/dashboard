"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Users,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  ExternalLink,
  BadgeCheck,
  Crown,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getHostProfileById,
  toggleFollowHost,
  isFollowingHost,
  type HostProfile,
  type HostRole,
} from "@/lib/host-profile-data";
import { events } from "@/lib/data";
import { getVenueById } from "@/lib/venue-data";

const roleLabels: Record<HostRole, string> = {
  venue_owner: "Владелец заведения",
  independent_organizer: "Независимый организатор",
  curator: "Куратор",
};

const roleIcons: Record<HostRole, React.ReactNode> = {
  venue_owner: <Crown className="w-3 h-3" />,
  independent_organizer: <Sparkles className="w-3 h-3" />,
  curator: <BadgeCheck className="w-3 h-3" />,
};

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return String(num);
}

export default function HostProfileClient({ id }: { id: string }) {
  const hostId = id;
  const host = getHostProfileById(hostId);

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    setIsFollowing(isFollowingHost(hostId));
  }, [hostId]);

  if (!host) {
    return (
      <div className="flex flex-col items-center justify-center h-[80dvh] px-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold">Организатор не найден</p>
        <p className="text-sm text-muted-foreground mt-1">
          Возможно, профиль был удалён или ссылка устарела
        </p>
        <Link href="/">
          <Button className="mt-6 rounded-full">На главную</Button>
        </Link>
      </div>
    );
  }

  // Filter events by host name
  const hostEvents = events.filter((e) => e.host.name === host.name);
  const upcomingEvents = hostEvents.filter((e) => e.status === "upcoming" || e.status === "live");
  const pastEvents = hostEvents.filter((e) => e.status === "ended");

  // Get venues
  const hostVenues = host.venueIds.map((id) => getVenueById(id)).filter(Boolean);

  const handleFollow = () => {
    const nowFollowing = toggleFollowHost(hostId);
    setIsFollowing(nowFollowing);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: host.name,
        text: host.bio,
        url: window.location.href,
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-full">
      {/* Cover */}
      <div className="relative h-48">
        <Image
          src={host.coverPhoto}
          alt={host.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile header */}
      <div className="px-4 -mt-12 relative">
        <div className="flex items-end gap-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-background shadow-lg shrink-0">
            <Image src={host.avatar} alt={host.name} fill className="object-cover" />
          </div>
          <div className="pb-2 flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-tight">{host.name}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 gap-1"
              >
                {roleIcons[host.role]}
                {roleLabels[host.role]}
              </Badge>
              <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-4 flex gap-2">
        <Button
          onClick={handleFollow}
          className={`flex-1 rounded-full h-11 font-semibold transition-all ${
            isFollowing
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : "bg-primary hover:bg-primary/90 text-white"
          }`}
        >
          <Heart
            className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`}
          />
          {isFollowing ? "Вы подписаны" : "Следить"}
        </Button>
        <Button variant="outline" className="flex-1 rounded-full h-11 font-semibold">
          <MessageCircle className="w-4 h-4 mr-2" />
          Написать
        </Button>
      </div>

      {/* Stats */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <div className="text-lg font-bold">{host.stats.eventsCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
              Событий
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <div className="text-lg font-bold">{formatNumber(host.stats.totalAttendees)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
              Участников
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <div className="text-lg font-bold">{formatNumber(host.stats.followers)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
              Подписчики
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <div className="flex items-center justify-center gap-0.5 text-lg font-bold">
              {host.stats.avgRating}
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
              Рейтинг
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 mt-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{host.bio}</p>
      </div>

      {/* Socials */}
      {Object.keys(host.socials).length > 0 && (
        <div className="px-4 mt-4 flex gap-2">
          {host.socials.instagram && (
            <a
              href={`https://instagram.com/${host.socials.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {host.socials.instagram}
            </a>
          )}
          {host.socials.website && (
            <a
              href={host.socials.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Сайт
            </a>
          )}
        </div>
      )}

      {/* Venues */}
      {hostVenues.length > 0 && (
        <div className="mt-6">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base">Заведения</h2>
          </div>
          <div className="px-4 space-y-3">
            {hostVenues.map((venue) =>
              venue ? (
                <div
                  key={venue.id}
                  className="flex gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image src={venue.coverPhoto} alt={venue.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{venue.area}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-0.5 text-xs">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {venue.rating}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {venue.eventsCount} событий
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {venue.amenities.slice(0, 3).map((a) => (
                        <Badge key={a} variant="secondary" className="text-[10px] h-5 px-1.5">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Tabs: Events & Reviews */}
      <div className="mt-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 h-11 rounded-full bg-secondary/50 p-1">
            <TabsTrigger
              value="events"
              className="rounded-full text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              События
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-full text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              Отзывы
            </TabsTrigger>
          </TabsList>

            <TabsContent value="events" className="mt-4 space-y-5">
              {/* Upcoming */}
              {upcomingEvents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Ближайшие
                  </h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <Link key={event.id} href={`/event/${event.id}`}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className="flex gap-3 p-3 rounded-xl border border-border bg-card"
                        >
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={event.coverImage}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 py-0.5">
                            <Badge className="bg-primary/10 text-primary border-0 text-[10px] mb-1.5">
                              {event.category}
                            </Badge>
                            <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                              <Calendar className="w-3 h-3" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {event.price ? (
                                <span className="text-sm font-bold">
                                  {event.currency}{event.price}
                                </span>
                              ) : (
                                <Badge className="bg-mint/20 text-emerald-700 border-0 text-[10px]">
                                  Бесплатно
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {event.interested} интересно
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {pastEvents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Прошедшие
                  </h3>
                  <div className="space-y-3">
                    {pastEvents.map((event) => (
                      <Link key={event.id} href={`/event/${event.id}`}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className="flex gap-3 p-3 rounded-xl border border-border bg-card opacity-75"
                        >
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={event.coverImage}
                              alt={event.title}
                              fill
                              className="object-cover grayscale-[30%]"
                            />
                          </div>
                          <div className="flex-1 min-w-0 py-0.5">
                            <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                              <Calendar className="w-3 h-3" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-0.5 text-xs">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                {event.host.rating}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {event.verifiedInterested} участников
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Пока нет событий</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-4 space-y-4">
              {/* Rating summary */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="text-center">
                  <div className="text-3xl font-bold">{host.stats.avgRating}</div>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(host.stats.avgRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {host.reviews.length} отзывов
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = host.reviews.filter((r) => r.rating === star).length;
                    const pct = host.reviews.length > 0 ? (count / host.reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-5 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-4">
                {host.reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={review.authorAvatar} />
                        <AvatarFallback>{review.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{review.authorName}</span>
                          <span className="text-[10px] text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{review.eventTitle}</p>
                        <p className="text-sm mt-2 leading-relaxed">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
        </Tabs>
      </div>

      {/* Spacer */}
      <div className="h-8" />
    </div>
  );
}
