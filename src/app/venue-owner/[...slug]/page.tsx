import { redirect } from "next/navigation";

export default async function VenueOwnerRedirectPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  redirect(`/owner/${slug.join("/")}`);
}
