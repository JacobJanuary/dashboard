import { redirect } from "next/navigation";

export default function ModeratorHostsRedirectPage() {
  redirect("/moderator/claims/organizations");
}
