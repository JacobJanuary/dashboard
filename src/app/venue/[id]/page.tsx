import { PublicVenuePage } from "@/components/public/PublicV3Pages";
import { adminVenues } from "@/lib/admin-data";
import { venues } from "@/lib/venue-data";

export function generateStaticParams() {
  return [...venues.map((venue) => ({ id: venue.id })), ...adminVenues.map((venue) => ({ id: venue.id }))];
}

export default async function VenuePublicRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <PublicVenuePage id={id} mobile={query.preview === "mobile"} />;
}
