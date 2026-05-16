import { RoleAdminScreen } from "@/components/admin/RoleAdminScreen";

export default async function OrganizerEventsAIStepPage({
  params,
}: {
  params: Promise<{ step: string[] }>;
}) {
  const { step } = await params;
  return <RoleAdminScreen role="organizer" slug={`events/ai/${step.join("/")}`} />;
}
