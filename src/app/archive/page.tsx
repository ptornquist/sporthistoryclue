import Link from "next/link";
import { ArchiveMonth } from "@/components/game/ArchiveMonth";

export default function ArchivePage() {
  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-10 text-zinc-900">
      <div className="mx-auto mb-8 flex max-w-lg items-center justify-between">
        <Link href="/" className="text-xs font-black uppercase tracking-wider text-zinc-500">
          ← Daily Drop
        </Link>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Archive</span>
      </div>
      <ArchiveMonth />
    </main>
  );
}
