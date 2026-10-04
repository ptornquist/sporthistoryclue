import Header from "@/components/Header";
import { SportArchive } from "@/components/game/SportArchive";
import { ARCHIVE_SPORTS, archiveSportFromParam, loadArchiveIndex } from "@/lib/sport-archive";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ArchiveSearchParams = {
  sport?: string | string[];
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<ArchiveSearchParams>;
}) {
  const params = await searchParams;
  const sport = archiveSportFromParam(firstParam(params.sport));
  const fixtures = ARCHIVE_SPORTS.flatMap((item) => loadArchiveIndex(item.id));

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden bg-[#fafafa] px-4 py-8 text-zinc-900 sm:px-6 sm:py-10">
        <SportArchive selected={sport} fixtures={fixtures} />
      </main>
    </>
  );
}
