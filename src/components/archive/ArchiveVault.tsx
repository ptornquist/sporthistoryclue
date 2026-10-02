"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readLocalCompletions } from "@/lib/daily-completions";
import {
  VAULT_FILTERS,
  applyCompletionScores,
  formatVaultDate,
  parseSolvedHistory,
  solvedBadge,
  solvedScore,
  sportMatchesFilter,
  sportPresentation,
  type ArchiveFixture,
  type SolvedIndex,
  type VaultFilter,
} from "@/lib/archive-vault";
import { SOLVED_HISTORY_KEY } from "@/lib/utc-streak";

const CARD =
  "border-[2.5px] border-zinc-900 rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-y-[-2px] transition-all";

export function ArchiveVault({ fixtures }: { fixtures: ArchiveFixture[] }) {
  const [filter, setFilter] = useState<VaultFilter>("All Sports");
  const [history, setHistory] = useState<SolvedIndex>({ ids: {}, dates: {} });

  useEffect(() => {
    Promise.resolve().then(() => {
      const stored = parseSolvedHistory(window.localStorage.getItem(SOLVED_HISTORY_KEY));
      setHistory(applyCompletionScores(stored, readLocalCompletions()));
    });
  }, []);

  const visible = fixtures.filter((fixture) => sportMatchesFilter(fixture.sport, filter));

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">HISTORICAL VAULT</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Missed a match? Revisit and deduce classified sporting moments from the vault.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Sport filter">
          {VAULT_FILTERS.map((item) => {
            const selected = item === filter;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(item)}
                className={`rounded-full border-2 border-zinc-900 px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
                  selected ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl border-2 border-zinc-900 bg-white px-4 py-8 text-center text-sm font-bold text-zinc-600">
            No fixtures in this vault yet.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {visible.map((fixture) => {
              const sport = sportPresentation(fixture.sport);
              const score = solvedScore(fixture, history);
              const solved = score !== undefined;
              return (
                <li key={fixture.id} className={CARD}>
                  <p className="text-sm font-black text-zinc-900">
                    {sport.icon} {sport.label}
                    {fixture.year ? ` · ${fixture.year}` : ""}
                  </p>
                  <p className="mt-2 font-mono text-xs font-bold uppercase tracking-wide text-zinc-500">
                    {formatVaultDate(fixture.fixtureDate)}
                  </p>
                  <div className="mt-4">
                    {solved ? (
                      <span className="inline-flex rounded-md border border-emerald-700 bg-emerald-100 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-emerald-950">
                        {solvedBadge(score)}
                      </span>
                    ) : (
                      <Link
                        href={`/?date=${fixture.fixtureDate}`}
                        className="inline-flex rounded-xl bg-blue-600 px-3 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
                      >
                        PLAY DOSSIER →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Footer />
    </main>
  );
}
