"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, BadgeCheck, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Event } from "@/lib/data";

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

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/event/${event.id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm border border-border/50 active:scale-[0.98] transition-transform">
          {/* Cover Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-white/90 text-ink backdrop-blur-sm border-0 text-xs font-semibold">
                <Clock className="w-3 h-3 mr-1" />
                {event.date}
              </Badge>
              {event.ageMin >= 21 && (
                <Badge className="bg-ink/80 text-white backdrop-blur-sm border-0 text-xs">
                  {event.ageMin}+
                </Badge>
              )}
            </div>

            {/* Identity tag */}
            {event.identityTags && event.identityTags.length > 0 && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-plum/90 text-white backdrop-blur-sm border-0 text-xs">
                  {event.identityTags[0]}
                </Badge>
              </div>
            )}

            {/* Privacy badge */}
            {event.privacy === "approval_required" && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-amber-500/90 text-white backdrop-blur-sm border-0 text-xs gap-1">
                  <Lock className="w-3 h-3" />
                  По заявке
                </Badge>
              </div>
            )}

            {/* Bottom overlay info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Badge className="bg-primary/90 text-white border-0 mb-2 text-xs font-medium">
                {event.category}
              </Badge>
              <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
                {event.title}
              </h3>
              <div className="flex items-center text-white/90 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {event.venue} · {event.distance}
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <Avatar className="w-7 h-7 border-2 border-background">
                  <AvatarImage src={event.host.avatar} alt={event.host.name} />
                  <AvatarFallback className="text-[8px]">
                    {event.host.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {[0, 1].map((i) => (
                  <Avatar
                    key={i}
                    className="w-7 h-7 border-2 border-background"
                  >
                    <AvatarImage
                      src={avatarPool[(event.id.charCodeAt(0) + i) % avatarPool.length]}
                      alt=""
                    />
                    <AvatarFallback className="text-[8px]">??</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-3.5 h-3.5 mr-1" />
                <span className="font-medium text-foreground">+{event.interested}</span>
                <span className="mx-1">·</span>
                <BadgeCheck className="w-3.5 h-3.5 mr-1 text-mint" />
                <span>{event.verifiedInterested}</span>
              </div>
            </div>
            <div className="text-right">
              {event.price ? (
                <span className="font-bold text-foreground">{event.currency}{event.price}</span>
              ) : (
                <Badge className="bg-mint/20 text-mint-dark border-0 text-xs font-semibold">
                  Free
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
