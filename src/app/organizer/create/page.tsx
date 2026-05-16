import { redirect } from "next/navigation";

export default function OrganizerCreateRedirectPage() {
  redirect("/organizer/events/new");
}
