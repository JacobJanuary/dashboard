"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Sparkles,
  X,
  MessageCircle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { connectionPools, Attendee } from "@/lib/data";

export default function ConnectionsPage() {
  const [pools, setPools] = useState(connectionPools);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [mutualMatch, setMutualMatch] = useState<Attendee | null>(null);

  const activePool = pools.find((p) => p.eventId === selectedPool);

  const handleConnect = (attendee: Attendee) => {
    // Simulate mutual match for demo (50% chance)
    const isMutual = Math.random() > 0.5;
    setConnectedIds((prev) => new Set(prev).add(attendee.id));

    if (isMutual) {
      setTimeout(() => {
        setMutualMatch(attendee);
      }, 400);
    }
  };

  const handleSkip = (attendeeId: string) => {
    setSkippedIds((prev) => new Set(prev).add(attendeeId));
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">Связи</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Люди, которых вы встретили на событиях
        </p>
      </header>

      {!selectedPool ? (
        /* Pool List */
        <div className="px-4 py-4 space-y-4">
          {pools.map((pool) => (
            <motion.div
              key={pool.eventId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => setSelectedPool(pool.eventId)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{pool.eventTitle}</h3>
                  <p className="text-xs text-muted-foreground">{pool.eventDate}</p>
                </div>
                <Badge
                  variant={pool.expiresInDays <= 2 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  <Timer className="w-3 h-3 mr-1" />
                  {pool.expiresInDays} дней осталось
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {pool.attendees.slice(0, 5).map((a) => (
                    <Avatar key={a.id} className="w-8 h-8 border-2 border-background">
                      <AvatarImage src={a.avatar} />
                      <AvatarFallback className="text-[10px]">{a.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {pool.attendees.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-medium">
                      +{pool.attendees.length - 5}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {pool.myConnections > 0 ? (
                      <span className="text-primary flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {pool.myConnections} связей
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Нажмите, чтобы связаться
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty state hint */}
          {pools.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Пока нет событий</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Посетите событие, чтобы разблокировать связи
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Attendee Grid */
        <div className="px-4 py-4">
          <button
            onClick={() => setSelectedPool(null)}
            className="text-sm text-primary font-medium mb-4 flex items-center"
          >
            ← Назад к событиям
          </button>

          {activePool && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg">{activePool.eventTitle}</h2>
                  <p className="text-xs text-muted-foreground">
                    {activePool.attendees.length - skippedIds.size} человек ·{" "}
                    <span
                      className={
                        activePool.expiresInDays <= 2
                          ? "text-destructive font-medium"
                          : ""
                      }
                    >
                      {activePool.expiresInDays} дней осталось
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {activePool.attendees
                    .filter((a) => !skippedIds.has(a.id))
                    .map((attendee) => {
                      const isConnected = connectedIds.has(attendee.id);
                      return (
                        <motion.div
                          key={attendee.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-card border border-border rounded-2xl overflow-hidden"
                        >
                          <div className="relative aspect-square">
                            <Image
                              src={attendee.avatar}
                              alt={attendee.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <div className="flex items-center gap-1">
                                <span className="text-white font-semibold text-sm">
                                  {attendee.name}
                                </span>
                                <span className="text-white/70 text-xs">
                                  {attendee.age}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {attendee.interests.slice(0, 2).map((i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] text-white/90 bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full"
                                  >
                                    {i}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="p-2 flex gap-2">
                            {isConnected ? (
                              <div className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full bg-mint/20 text-emerald-700 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Связались
                              </div>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 rounded-full h-9"
                                  onClick={() => handleSkip(attendee.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 rounded-full bg-primary hover:bg-primary/90 h-9"
                                  onClick={() => handleConnect(attendee)}
                                >
                                  <Sparkles className="w-4 h-4 mr-1" />
                                  Связаться
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mutual Match Modal */}
      <AnimatePresence>
        {mutualMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            onClick={() => setMutualMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-card rounded-3xl p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-primary/20">
                <Image
                  src={mutualMatch.avatar}
                  alt={mutualMatch.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">
                Взаимный интерес!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Вы с {mutualMatch.name} выбрали друг друга 💫
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setMutualMatch(null)}
                >
                  Позже
                </Button>
                <Button className="flex-1 rounded-full bg-primary hover:bg-primary/90">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Поздороваться
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
