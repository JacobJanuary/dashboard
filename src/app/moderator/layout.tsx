import { AdminShell } from "@/components/admin/AdminShell";

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell role="moderator">{children}</AdminShell>;
}

