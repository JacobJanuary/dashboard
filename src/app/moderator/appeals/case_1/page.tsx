import { redirect } from "next/navigation";

export default function ModeratorAppealsCaseRedirectPage() {
  redirect("/moderator/audit");
}
