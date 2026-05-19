import { RoleAdminScreen } from "@/components/admin/RoleAdminScreen";
import { redirect } from "next/navigation";

export default async function ModeratorRoleScreenPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const moderatorPath = slug.join("/");

  if (moderatorPath === "reports/severity") {
    redirect("/moderator/reports");
  }

  return <RoleAdminScreen role="moderator" slug={moderatorPath} />;
}
