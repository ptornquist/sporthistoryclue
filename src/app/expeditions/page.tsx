import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { expeditions } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Expeditions",
};

export default function ExpeditionsPage() {
  return (
    <>
      <Header />
      <div className="space-y-8 px-6 py-10">
      <div>
        <Badge variant="gold">Time travel</Badge>
        <h1 className="mt-3 font-serif text-4xl text-paper sm:text-5xl">Expeditions</h1>
        <p className="mt-3 max-w-2xl text-paper/70">
          Five eras. Each one a chain of plates. Start at dawn or jump to a decade you think you
          remember.
        </p>
      </div>
      <div className="grid gap-4">
        {expeditions.map((expedition, index) => (
          <Link
            key={expedition.slug}
            href={`/expeditions/${expedition.slug}`}
            className="grid gap-4 rounded-xl border border-gold/20 bg-card p-5 transition hover:border-gold sm:grid-cols-[7rem_1fr_auto] sm:items-center"
          >
            <p className="font-mono text-sm text-gold">
              {String(index + 1).padStart(2, "0")}
            </p>
            <div>
              <h2 className="font-serif text-2xl text-paper">{expedition.title}</h2>
              <p className="mt-1 text-sm text-paper/65">{expedition.blurb}</p>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">
              {expedition.period} · {expedition.puzzleIds.length} plates
            </p>
          </Link>
        ))}
      </div>
      </div>
    </>
  );
}
