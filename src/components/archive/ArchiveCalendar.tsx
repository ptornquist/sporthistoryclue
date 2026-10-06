"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import {
  WEEKDAY_HEADERS,
  buildMonthArchive,
  canAdvanceMonth,
  formatArchiveDate,
  formatScoreBadge,
  shiftMonth,
  type CalendarCell,
  type DailyCompletion,
} from "@/lib/archive-calendar";
import { loadRemoteCompletions, readLocalCompletions } from "@/lib/daily-completions";
import { loadSolvedHistory } from "@/lib/utc-streak";

export function ArchiveCalendar({ todayKey }: { todayKey: string }) {
  const [todayYear, todayMonth] = todayKey.split("-").map(Number);
  const [cursor, setCursor] = useState({ year: todayYear, monthIndex: todayMonth - 1 });
  const [completions, setCompletions] = useState<DailyCompletion[]>([]);
  const [recap, setRecap] = useState<{ dateKey: string; challengeId: string | null; score: number | null } | null>(null);
  const [story, setStory] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const local = readLocalCompletions();
      const known = new Set(local.map((item) => item.dropDate));
      for (const dropDate of loadSolvedHistory()) {
        if (known.has(dropDate)) continue;
        local.push({ dropDate, solved: true, score: 0, challengeId: null });
      }
      setCompletions(local);
      if (!isSupabaseConfigured) return;
      const { data } = await supabaseClient.auth.getUser();
      if (!data.user) return;
      const remote = await loadRemoteCompletions(data.user.id);
      const merged = new Map(local.map((item) => [item.dropDate, item]));
      for (const item of remote) merged.set(item.dropDate, item);
      setCompletions([...merged.values()]);
    };
    const apply = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(apply);
  }, []);

  useEffect(() => {
    const challengeId = recap?.challengeId;
    if (!challengeId) return;
    let cancelled = false;
    void fetch(`/api/recap?challengeId=${encodeURIComponent(challengeId)}`)
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: { story?: string } | null) => {
        if (!cancelled) {
          setStory({ id: challengeId, text: payload?.story ?? "The solved dossier is filed in the archive." });
        }
      })
      .catch(() => {
        if (!cancelled) setStory({ id: challengeId, text: "The solved dossier is filed in the archive." });
      });
    return () => {
      cancelled = true;
    };
  }, [recap]);

  const month = buildMonthArchive(cursor.year, cursor.monthIndex, todayKey, completions);
  const nextAllowed = canAdvanceMonth(cursor.year, cursor.monthIndex, todayKey);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Dagens kluring</p>
            <h1 className="text-3xl font-black uppercase tracking-tight">{month.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCursor((current) => shiftMonth(current.year, current.monthIndex, -1))}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:border-blue-600"
            >
              &lt; Föregående månad
            </button>
            <button
              type="button"
              onClick={() => setCursor((current) => shiftMonth(current.year, current.monthIndex, 1))}
              disabled={!nextAllowed}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:border-blue-600 disabled:cursor-not-allowed disabled:text-zinc-300"
            >
              Nästa månad &gt;
            </button>
          </div>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat text={`Spelade: ${month.played}/${month.elapsed} dagar`} />
          <Stat text={`Träffsäkerhet: ${month.accuracy}%`} />
          <Stat text={`Arkivpoäng: ${month.totalScore.toLocaleString("sv-SE")} poäng`} />
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAY_HEADERS.map((label) => (
              <div key={label} className="pb-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                {label}
              </div>
            ))}
            {month.cells.map((cell, index) => (
              <DayTile
                key={cell.dateKey ?? `pad-${index}`}
                cell={cell}
                onRecap={(dateKey, challengeId, score) => setRecap({ dateKey, challengeId, score })}
              />
            ))}
          </div>
        </section>
      </div>
      <Footer />

      {recap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">Löst kluring</p>
            <h2 className="mt-1 text-xl font-black uppercase tracking-tight">{formatArchiveDate(recap.dateKey)}</h2>
            {recap.score != null && (
              <p className="mt-2 font-mono text-sm font-black text-blue-600">{recap.score.toLocaleString("sv-SE")} poäng</p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              {recap.challengeId
                ? story?.id === recap.challengeId
                  ? story.text
                  : "Öppnar sammanfattningen…"
                : "Den lösta kluringen ligger i arkivet."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Link
                href={`/?date=${recap.dateKey}`}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700"
              >
                Öppna kluringen
              </Link>
              <button
                type="button"
                onClick={() => setRecap(null)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700"
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <p className="font-mono text-sm font-black text-zinc-900">{text}</p>
    </div>
  );
}

function DayTile({
  cell,
  onRecap,
}: {
  cell: CalendarCell;
  onRecap: (dateKey: string, challengeId: string | null, score: number | null) => void;
}) {
  if (!cell.dateKey || cell.status === "pad") {
    return <div className="min-h-[88px] rounded-2xl" />;
  }
  const day = Number(cell.dateKey.slice(-2));
  const body = (
    <>
      <span className="text-sm font-black">{day}</span>
      {cell.status === "future" && <span className="text-base">🔒</span>}
      {cell.status === "today" && (
        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
          Idag
        </span>
      )}
      {cell.status === "solved" && (
        <>
          <span className="text-sm font-black text-emerald-700">✓</span>
          {cell.score != null && cell.score > 0 && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
              {formatScoreBadge(cell.score)}
            </span>
          )}
        </>
      )}
      {cell.status === "failed" && <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Missad</span>}
      {cell.status === "missed" && <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />}
      {cell.status === "unplayed" && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
    </>
  );

  const className = tileClass(cell.status);
  if (cell.status === "future") {
    return (
      <button type="button" disabled className={className}>
        {body}
      </button>
    );
  }
  if (cell.status === "solved") {
    return (
      <button type="button" onClick={() => onRecap(cell.dateKey!, cell.challengeId, cell.score)} className={className}>
        {body}
      </button>
    );
  }
  const href =
    cell.status === "today"
      ? "/"
      : cell.status === "unplayed"
        ? `/play?date=${cell.dateKey}`
        : `/play?date=${cell.dateKey}&training=1`;
  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

function tileClass(status: CalendarCell["status"]): string {
  const base = "flex min-h-[88px] flex-col items-start justify-between rounded-2xl border p-2 text-left transition";
  if (status === "future") return `${base} cursor-not-allowed border-zinc-100 text-zinc-300 bg-zinc-50/50`;
  if (status === "today") return `${base} ring-2 ring-blue-600 bg-white shadow-md border-blue-200`;
  if (status === "solved") return `${base} bg-emerald-50/80 border-emerald-200 text-zinc-900 hover:border-emerald-300`;
  if (status === "failed") return `${base} border-rose-200 bg-rose-50/70 text-zinc-700 hover:border-rose-300`;
  if (status === "missed") return `${base} border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300`;
  return `${base} border-zinc-200 bg-white text-zinc-900 hover:scale-[1.03] hover:border-blue-300`;
}
