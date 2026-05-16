import { RoleAdminScreen } from "@/components/admin/RoleAdminScreen";

export default async function ModeratorRoleScreenPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <RoleAdminScreen role="moderator" slug={slug.join("/")} />;
}

