import { EventCheckoutPage } from "@/components/public/PublicV3Pages";

export default async function CheckoutRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventCheckoutPage id={id} />;
}
