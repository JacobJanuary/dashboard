import { RoleAdminScreen } from "@/components/admin/RoleAdminScreen";

export default async function OrganizerEventWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoleAdminScreen role="organizer" slug={`events/${id}`} />;
}
