"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readLocalCompletions } from "@/lib/daily-completions";
import { applyCompletionScores, parseSolvedHistory, type ArchiveFixture } from "@/lib/archive-vault";
import { shiftMonth } from "@/lib/archive-calendar";
import {
  ARCHIVE_WEEKDAYS,
  MONTH_ARROW_CLASS,
  STATS_CLASS,
  WEEKDAY_CLASS,
  archiveStats,
  buildArchiveMonth,
  tileClass,
  type SolvedMarks,
} from "@/lib/archive-month";
import { SOLVED_HISTORY_KEY } from "@/lib/utc-streak";

const EMPTY_MARKS: SolvedMarks = { dates: new Set(), ids: new Set() };

export function ArchiveVault({ fixtures, todayKey }: { fixtures: ArchiveFixture[]; todayKey: string }) {
  const [marks, setMarks] = useState<SolvedMarks>(EMPTY_MARKS);
  const [yearText, monthText] = todayKey.split("-");
  const [cursor, setCursor] = useState({ year: Number(yearText), monthIndex: Number(monthText) - 1 });

  useEffect(() => {
    Promise.resolve().then(() => {
      const stored = parseSolvedHistory(window.localStorage.getItem(SOLVED_HISTORY_KEY));
      const history = applyCompletionScores(stored, readLocalCompletions());
      setMarks({
        dates: new Set(Object.keys(history.dates)),
        ids: new Set(Object.keys(history.ids)),
      });
    });
  }, []);

  const month = buildArchiveMonth(cursor.year, cursor.monthIndex, todayKey, fixtures, marks);
  const stats = archiveStats(cursor.year, cursor.monthIndex, todayKey, fixtures, marks);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">DAILY DROP ARCHIVE</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              className={MONTH_ARROW_CLASS}
              onClick={() => setCursor((current) => shiftMonth(current.year, current.monthIndex, -1))}
            >
              ←
            </button>
            <p className="min-w-40 text-center text-sm font-black sm:text-base">{month.label}</p>
            <button
              type="button"
              aria-label="Next month"
              className={MONTH_ARROW_CLASS}
              onClick={() => setCursor((current) => shiftMonth(current.year, current.monthIndex, 1))}
            >
              →
            </button>
          </div>
        </header>

        <section className={STATS_CLASS} aria-label="Archive stats">
          <div>
            <p className="text-xs font-black uppercase tracking-wide">📅 Total Drops Available</p>
            <p className="mt-1 text-2xl font-black">{stats.total}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide">✅ Solved Count</p>
            <p className="mt-1 text-2xl font-black">{stats.solved}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide">🔥 Active Streak</p>
            <p className="mt-1 text-2xl font-black">{stats.streak}</p>
          </div>
        </section>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {ARCHIVE_WEEKDAYS.map((weekday) => (
            <div key={weekday} className={WEEKDAY_CLASS}>
              {weekday}
            </div>
          ))}
          {month.cells.map((cell, index) => {
            if (cell.kind === "pad") return <div key={`pad-${index}`} aria-hidden="true" />;
            const className = tileClass(cell.state);
            const body = (
              <>
                {cell.state === "today" ? (
                  <span className="text-[10px] font-black leading-none tracking-wide">TODAY</span>
                ) : (
                  <span className="text-sm leading-none">{cell.day}</span>
                )}
                <span className="text-sm leading-none">
                  {cell.state === "solved" ? "✓ " : ""}
                  {cell.state === "future" ? "🔒" : cell.icon}
                </span>
              </>
            );
            if (cell.href) {
              return (
                <Link key={cell.dateKey} href={cell.href} className={className}>
                  <span className="sr-only">PLAY DROP →</span>
                  {body}
                </Link>
              );
            }
            if (cell.state === "future") {
              return (
                <button key={cell.dateKey} type="button" disabled className={className}>
                  {body}
                </button>
              );
            }
            return (
              <div key={cell.dateKey} className={className}>
                {body}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
