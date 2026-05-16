import { SystemStateV3 } from "@/components/public/SystemStateV3";
import { systemStates } from "@/lib/global-admin-v3";

export function generateStaticParams() {
  return systemStates.map((state) => ({ slug: state.slug }));
}

export default async function SystemStatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SystemStateV3 slug={slug} />;
}
