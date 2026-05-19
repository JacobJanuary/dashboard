import { RoleAdminScreen } from "@/components/admin/RoleAdminScreen";
import { redirect } from "next/navigation";

const ownerLegacyRequestRoutes = new Set([
  "approvals",
  "organizer-access",
  "event-requests",
  "approvals/organizers",
  "approvals/events",
]);

const ownerLegacyCalendarRoutes = new Set([
  "calendar/month",
  "calendar/week",
  "calendar/conflicts",
]);

export default async function OwnerRoleScreenPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const ownerPath = slug.join("/");

  if (ownerLegacyRequestRoutes.has(ownerPath)) {
    redirect("/owner/requests");
  }

  if (ownerLegacyCalendarRoutes.has(ownerPath)) {
    redirect("/owner/calendar");
  }

  return <RoleAdminScreen role="venue_owner" slug={ownerPath} />;
}
