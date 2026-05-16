import { events } from "@/lib/data";
import EventDetailClient from "./EventDetailClient";

export function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailClient id={id} />;
}
