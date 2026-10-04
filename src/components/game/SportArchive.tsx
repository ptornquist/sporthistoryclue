"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSolvedFixtures } from "@/components/game/useSolvedFixtures";
import { mysteryFixtureLabel } from "@/lib/case-files";
import {
  ARCHIVE_SPORTS,
  deduceHref,
  type ArchiveSportFixture,
  type ArchiveSportId,
} from "@/lib/sport-archive";

export function SportArchive({
  selected,
  fixtures,
  embedded = false,
}: {
  selected: ArchiveSportId;
  fixtures: ArchiveSportFixture[];
  embedded?: boolean;
}) {
  const solved = useSolvedFixtures(
    fixtures.map((fixture) => ({ key: fixture.id, lookupIds: [fixture.id] })),
  );

  useEffect(() => {
    if (embedded) return;
    document.getElementById(`bibliotek-${selected}`)?.scrollIntoView({ block: "nearest" });
  }, [embedded, selected]);

  const groups = ARCHIVE_SPORTS.map((item) => ({
    ...item,
    rows: fixtures.filter((fixture) => fixture.sport === item.id),
  }));

  return (
    <section className="mx-auto w-full max-w-3xl">
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
        {embedded ? "Hela biblioteket" : "Biblioteket"}
      </span>
      {embedded ? (
        <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-900">Alla matcher</h2>
      ) : (
        <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-900">Historik</h1>
      )}
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Sju sporter i ett bibliotek att bläddra i: ishockey, fotboll, boxning, tennis, friidrott, ridsport och handboll.
      </p>

      <div className="sticky top-16 z-20 mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-[#fafafa]/95 py-2 backdrop-blur" role="tablist" aria-label="Sport categories">
        {ARCHIVE_SPORTS.map((item) => {
          const active = item.id === selected;
          const className = `px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 border-2 transition-all ${
            active
              ? "bg-blue-600 border-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-900"
          }`;
          const label = (
            <>
              <span aria-hidden>{item.icon}</span>
              <span>{item.name}</span>
            </>
          );
          if (embedded) {
            return (
              <a key={item.id} href={`#bibliotek-${item.id}`} className={className}>
                {label}
              </a>
            );
          }
          return (
            <Link
              key={item.id}
              href={`/archive?sport=${item.id}`}
              role="tab"
              aria-selected={active}
              className={className}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 space-y-8">
        {groups.map((sport) => (
          <section
            key={sport.id}
            id={`bibliotek-${sport.id}`}
            className="scroll-mt-28 rounded-3xl border-2 border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-zinc-900">
                  <span aria-hidden>{sport.icon}</span>
                  <span>{sport.name}</span>
                </h2>
                <p className="mt-1 text-xs text-zinc-500">{sport.blurb}</p>
              </div>
              <span className="shrink-0 rounded-full bg-zinc-900 px-3 py-1 text-xs font-mono font-black text-white">
                {sport.rows.length} {sport.rows.length === 1 ? "match" : "matcher"}
              </span>
            </div>

            {sport.rows.length === 0 ? (
              <p className="py-8 text-center text-xs font-medium text-zinc-400">
                Inga matcher är registrerade för den här sporten ännu.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sport.rows.map((fixture) => {
                  const record = solved[fixture.id];
                  const open = record == null;
                  return (
                    <li
                      key={fixture.id}
                      className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-zinc-200 border-l-4 border-l-blue-600 bg-zinc-50 p-4 shadow-sm"
                    >
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-zinc-900">{fixture.title}</h3>
                        {open ? (
                          <p className="mt-0.5 text-[11px] italic text-zinc-400">
                            {mysteryFixtureLabel(fixture.sport)}
                          </p>
                        ) : (
                          <>
                            <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                              {fixture.year} · {fixture.context}
                            </p>
                            {record.matchup ? (
                              <p className="mt-1 text-[11px] font-semibold text-zinc-700">{record.matchup}</p>
                            ) : null}
                          </>
                        )}
                        <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                          Svårighet {fixture.difficulty} · {fixture.clueCount} ledtrådar
                        </p>
                      </div>
                      <Link
                        href={deduceHref(fixture.id)}
                        className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-center text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700"
                      >
                        DEDUCERA →
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
