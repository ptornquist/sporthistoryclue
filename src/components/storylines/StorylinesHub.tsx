"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { parseSolvedHistory, sportPresentation } from "@/lib/archive-vault";
import {
  ERA_STORYLINES,
  chapterHref,
  chapterSolved,
  storylineProgress,
  type EraStoryline,
} from "@/lib/era-storylines";
import { SOLVED_HISTORY_KEY } from "@/lib/utc-streak";

const CARD =
  "bg-white border-[3px] border-zinc-900 rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] mb-5 hover:translate-y-[-2px] transition-all";

const ERA_PILL =
  "bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase px-2.5 py-0.5 rounded-full";

const PROGRESS_TRACK = "w-full h-3 bg-zinc-100 rounded-full border border-zinc-300 overflow-hidden my-3";

const PROGRESS_FILL = "h-full bg-blue-600 rounded-full transition-all";

const PROGRESS_TEXT = "text-xs font-bold text-zinc-600 flex justify-between";

export function StorylinesHub({ solvedIds }: { solvedIds?: ReadonlySet<string> }) {
  const [storedIds, setStoredIds] = useState<ReadonlySet<string>>(solvedIds ?? new Set());

  useEffect(() => {
    if (solvedIds) return;
    Promise.resolve().then(() => {
      const history = parseSolvedHistory(window.localStorage.getItem(SOLVED_HISTORY_KEY));
      setStoredIds(new Set(Object.keys(history.ids)));
    });
  }, [solvedIds]);

  const marks = solvedIds ?? storedIds;

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">STORYLINES & ERAS</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Curated historical campaigns. Follow legendary rivalries and pivotal eras through tactical dossiers.
          </p>
        </header>
        {ERA_STORYLINES.map((storyline) => (
          <StorylineCard key={storyline.id} storyline={storyline} solvedIds={marks} />
        ))}
      </div>
      <Footer />
    </main>
  );
}

function StorylineCard({
  storyline,
  solvedIds,
}: {
  storyline: EraStoryline;
  solvedIds: ReadonlySet<string>;
}) {
  const progress = storylineProgress(storyline, solvedIds);
  return (
    <article className={CARD}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={ERA_PILL}>{storyline.era}</span>
      </div>
      <h2 className="mt-3 text-xl font-black text-zinc-900 tracking-tight">{storyline.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{storyline.briefing}</p>
      <div className={PROGRESS_TRACK} aria-hidden="true">
        <div className={PROGRESS_FILL} style={{ width: `${progress.percent}%` }} />
      </div>
      <p className={PROGRESS_TEXT}>
        <span>
          {progress.done} / {progress.total} chapters
        </span>
        <span>{progress.percent}%</span>
      </p>
      <ul className="mt-4 space-y-3">
        {storyline.chapters.map((chapter) => {
          const sport = sportPresentation(chapter.sport);
          const solved = chapterSolved(chapter, solvedIds);
          return (
            <li key={chapter.id} className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-3">
              <p className="min-w-0 font-bold text-zinc-900">
                <span aria-hidden="true">{sport.icon}</span> {chapter.title}
              </p>
              {solved ? (
                <span className="shrink-0 rounded-full border border-emerald-700 bg-emerald-100 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-emerald-950">
                  COMPLETED ✓
                </span>
              ) : (
                <Link
                  href={chapterHref(chapter)}
                  className="shrink-0 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-black"
                >
                  PLAY CHAPTER →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
