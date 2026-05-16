"use client";

import { FilterBar } from "@/components/FilterBar";
import { EventCard } from "@/components/EventCard";
import { events } from "@/lib/data";
import { Flame } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SparkIRL</h1>
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Los Angeles
        </div>
      </header>

      <FilterBar />

      {/* Feed */}
      <div className="px-4 py-4 space-y-4">
        {events.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} />
        ))}
      </div>
    </div>
  );
}
