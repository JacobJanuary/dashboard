import { RoleAdminScreen } from "@/components/admin/RoleAdminScreen";

export default async function OwnerRoleScreenPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <RoleAdminScreen role="venue_owner" slug={slug.join("/")} />;
}
