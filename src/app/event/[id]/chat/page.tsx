import { PublicChatEntryPage } from "@/components/public/PublicV3Pages";

export default async function EventChatRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicChatEntryPage id={id} />;
}
