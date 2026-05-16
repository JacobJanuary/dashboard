import { NextResponse } from "next/server";
import { events } from "@/lib/data";

export const dynamic = "error";

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = params as unknown as { id: string };
  const event = events.find((e) => e.id === id);

  if (!event) {
    return NextResponse.json(
      { success: false, error: "Event not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: event.id,
      slug: event.slug,
      title: event.title,
      venue: event.venue,
      address: event.address,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      price: event.price,
      currency: event.currency,
      ageMin: event.ageMin,
      category: event.category,
      tags: event.tags,
      interested: event.interested,
      verifiedInterested: event.verifiedInterested,
      coverImage: event.coverImage,
      gallery: event.gallery,
      description: event.description,
      host: {
        name: event.host.name,
        verified: event.host.verified,
        rating: event.host.rating,
        eventsCount: event.host.eventsCount,
      },
      privacy: event.privacy,
      status: event.status,
    },
  });
}
