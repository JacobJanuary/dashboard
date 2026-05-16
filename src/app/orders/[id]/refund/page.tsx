import { OrderRefundPage } from "@/components/public/PublicV3Pages";

export default async function RefundRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderRefundPage id={id} />;
}
