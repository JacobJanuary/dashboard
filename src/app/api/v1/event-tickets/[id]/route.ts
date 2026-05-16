import { NextResponse } from "next/server";
import { events } from "@/lib/data";
import { organizerEvents } from "@/lib/organizer-data";

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

  const orgEvent = organizerEvents.find((e) => e.id === id);
  const tickets = orgEvent?.tickets.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    price: t.price,
    currency: orgEvent.currency,
    quantity: t.quantity,
    sold: t.sold,
    available: t.quantity - t.sold,
    salesStart: t.salesStart,
    salesEnd: t.salesEnd,
    visibility: t.visibility,
    minPerOrder: t.minPerOrder,
    maxPerOrder: t.maxPerOrder,
    description: t.description,
  })) || [];

  return NextResponse.json({
    success: true,
    data: tickets,
    meta: {
      eventId: id,
      eventTitle: event.title,
      total: tickets.length,
    },
  });
}
