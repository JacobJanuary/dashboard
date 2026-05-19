import { redirect } from "next/navigation";

export default function ModeratorEnforcementCaseRedirectPage() {
  redirect("/moderator/audit");
}
