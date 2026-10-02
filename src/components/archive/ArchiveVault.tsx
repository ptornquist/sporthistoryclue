"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readLocalCompletions } from "@/lib/daily-completions";
import {
  applyCompletionScores,
  dropNumber,
  parseSolvedHistory,
  solvedBadge,
  solvedScore,
  sportPresentation,
  type ArchiveFixture,
  type SolvedIndex,
} from "@/lib/archive-vault";
import { SOLVED_HISTORY_KEY } from "@/lib/utc-streak";

const CARD =
  "border-[2.5px] border-zinc-900 rounded-2xl p-4 bg-white shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] mb-3";

export function ArchiveVault({ fixtures }: { fixtures: ArchiveFixture[] }) {
  const [history, setHistory] = useState<SolvedIndex>({ ids: {}, dates: {} });

  useEffect(() => {
    Promise.resolve().then(() => {
      const stored = parseSolvedHistory(window.localStorage.getItem(SOLVED_HISTORY_KEY));
      setHistory(applyCompletionScores(stored, readLocalCompletions()));
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">DAILY DROP ARCHIVE</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Play previous daily matches and catch up on your streak.
          </p>
        </header>

        {fixtures.length === 0 ? (
          <p className="rounded-2xl border-2 border-zinc-900 bg-white px-4 py-8 text-center text-sm font-bold text-zinc-600">
            No past drops yet.
          </p>
        ) : (
          <ol>
            {fixtures.map((fixture) => {
              const sport = sportPresentation(fixture.sport);
              const score = solvedScore(fixture, history);
              const solved = score !== undefined;
              return (
                <li key={fixture.id} className={CARD}>
                  <p className="font-mono text-xs font-black uppercase tracking-wide text-zinc-900">
                    DROP #{dropNumber(fixture.fixtureDate)} · {fixture.fixtureDate}
                  </p>
                  <p className="mt-3 inline-flex rounded-full border border-zinc-900 bg-zinc-50 px-2.5 py-1 text-xs font-black">
                    {sport.icon} {sport.label}
                  </p>
                  <div className="mt-4">
                    {solved ? (
                      <span className="inline-flex rounded-full border border-emerald-700 bg-emerald-100 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-emerald-950">
                        {solvedBadge(score)}
                      </span>
                    ) : (
                      <Link
                        href={`/?date=${fixture.fixtureDate}`}
                        className="inline-flex rounded-xl bg-blue-600 px-3 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
                      >
                        PLAY DROP →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <Footer />
    </main>
  );
}
