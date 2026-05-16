import { EventConfirmationPage } from "@/components/public/PublicV3Pages";

export default async function ConfirmationRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventConfirmationPage id={id} />;
}
