import { NextResponse } from "next/server";
import { events } from "@/lib/data";

export const dynamic = "error";

export function GET() {
  const publicEvents = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    venue: e.venue,
    address: e.address,
    date: e.date,
    time: e.time,
    endTime: e.endTime,
    price: e.price,
    currency: e.currency,
    category: e.category,
    tags: e.tags,
    interested: e.interested,
    coverImage: e.coverImage,
    host: {
      name: e.host.name,
      verified: e.host.verified,
      rating: e.host.rating,
      eventsCount: e.host.eventsCount,
    },
    privacy: e.privacy,
    status: e.status,
  }));

  return NextResponse.json({
    success: true,
    data: publicEvents,
    meta: {
      total: publicEvents.length,
      version: "v1",
    },
  });
}
