import Link from "next/link";
import {
  ARCHIVE_SPORTS,
  deduceHref,
  type ArchiveSportFixture,
  type ArchiveSportId,
} from "@/lib/sport-archive";

export function SportArchive({
  selected,
  fixtures,
}: {
  selected: ArchiveSportId;
  fixtures: ArchiveSportFixture[];
}) {
  const sport = ARCHIVE_SPORTS.find((item) => item.id === selected) ?? ARCHIVE_SPORTS[0];

  return (
    <section className="mx-auto w-full max-w-3xl">
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Browse by sport</span>
      <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-900">Sports Archive</h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Choose a discipline and open a historical fixture in the solver.
      </p>

      <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Sport categories">
        {ARCHIVE_SPORTS.map((item) => {
          const active = item.id === selected;
          return (
            <Link
              key={item.id}
              href={`/archive?sport=${item.id}`}
              role="tab"
              aria-selected={active}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 border-2 shrink-0 transition-all ${
                active
                  ? "bg-blue-600 border-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-900"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border-2 border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">{sport.name} Fixtures</h2>
          <span className="shrink-0 rounded-full bg-zinc-900 px-3 py-1 text-xs font-mono font-black text-white">
            {fixtures.length} matches
          </span>
        </div>

        {fixtures.length === 0 ? (
          <p className="py-8 text-center text-xs font-medium text-zinc-400">No fixtures are filed for this sport yet.</p>
        ) : (
          <ul className="space-y-3">
            {fixtures.map((fixture) => (
              <li
                key={fixture.id}
                className="flex w-full max-w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-zinc-900">{fixture.title}</h3>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                    {fixture.year} · {fixture.context}
                  </p>
                  <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                    Difficulty {fixture.difficulty} · {fixture.clueCount} Clues
                  </p>
                </div>
                <Link
                  href={deduceHref(fixture.id)}
                  className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-center text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700"
                >
                  DEDUCE →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
