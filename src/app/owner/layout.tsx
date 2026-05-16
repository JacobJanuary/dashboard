import { AdminShell } from "@/components/admin/AdminShell";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell role="venue_owner">{children}</AdminShell>;
}
