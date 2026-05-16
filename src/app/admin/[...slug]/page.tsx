import { GlobalAdminV3 } from "@/components/admin/GlobalAdminV3";
import { globalScreens } from "@/lib/global-admin-v3";

export function generateStaticParams() {
  return globalScreens.map((screen) => ({
    slug: screen.route.replace("/admin/", "").split("/"),
  }));
}

export default async function AdminGlobalPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <GlobalAdminV3 slugParts={slug} />;
}
