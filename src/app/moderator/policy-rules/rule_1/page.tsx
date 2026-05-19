import { redirect } from "next/navigation";

export default function ModeratorPolicyRulesCaseRedirectPage() {
  redirect("/moderator/audit");
}
