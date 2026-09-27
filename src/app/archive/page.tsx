import { ArchiveVault } from "@/components/archive/ArchiveVault";
import { loadArchiveIndex } from "@/lib/daily-drop";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ArchivePage() {
  const fixtures = await loadArchiveIndex();
  return <ArchiveVault fixtures={fixtures} />;
}
