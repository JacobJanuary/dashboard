import { EventWaitlistPage } from "@/components/public/PublicV3Pages";

export default async function WaitlistRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventWaitlistPage id={id} />;
}
