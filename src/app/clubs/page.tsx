import Header from "@/components/Header";
import { ClubsExperience } from "@/components/clubs/ClubsExperience";
import { clubSession } from "@/lib/club-api";
import { normalizeClubCode } from "@/lib/clubs";

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ join?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.join) ? params.join[0] : params.join;
  const session = await clubSession();
  return (
    <>
      <Header />
      <ClubsExperience viewerId={session?.user?.id ?? null} initialJoinCode={normalizeClubCode(raw ?? "")} />
    </>
  );
}
