import { AdminShell } from "@/components/admin/AdminShell";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell role="organizer">{children}</AdminShell>;
}

