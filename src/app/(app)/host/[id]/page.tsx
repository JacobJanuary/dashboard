import { hostProfiles } from "@/lib/host-profile-data";
import HostProfileClient from "./HostProfileClient";

export function generateStaticParams() {
  return hostProfiles.map((host) => ({
    id: host.id,
  }));
}

export default async function HostProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HostProfileClient id={id} />;
}
