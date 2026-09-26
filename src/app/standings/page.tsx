"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScoutAvatar } from "@/components/game/ScoutAvatar";
import { findCosmetic, titleClassName } from "@/lib/cosmetics";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import {
  DIVISION_TIERS,
  divisionFor,
  formatPositionLine,
  placeScout,
  pointsToNextTier,
  scoreFor,
  type StandingMode,
  type StandingRow,
} from "@/lib/standings";
import { loadSolvedHistory, mondayOfUtcWeek, utcDateKey } from "@/lib/utc-streak";

const PROFILE_COLUMNS =
  "id, username, total_score, streak, equipped_title, equipped_frame, matches_solved, avatar_url";
const PROFILE_COLUMNS_WITH_WEEK = `${PROFILE_COLUMNS}, week_score, week_start`;

interface ProfileRow {
  id: string;
  username: string | null;
  total_score: number | null;
  streak: number | null;
  equipped_title: string | null;
  equipped_frame: string | null;
  matches_solved: number | null;
  avatar_url: string | null;
  week_score?: number | null;
  week_start?: string | null;
}

function mapProfile(row: ProfileRow): StandingRow {
  return {
    id: row.id,
    username: (row.username || "scout").replace(/^@/, ""),
    total_score: row.total_score ?? 0,
    week_score: row.week_score ?? 0,
    week_start: row.week_start ?? null,
    streak: row.streak ?? 0,
    equipped_title: row.equipped_title,
    equipped_frame: row.equipped_frame,
    matches_solved: row.matches_solved ?? 0,
    avatar_url: row.avatar_url,
  };
}

function titleLabel(titleId: string | null): string {
  const item = titleId ? findCosmetic(titleId) : undefined;
  if (!item) return "";
  return `${item.emoji} ${item.name}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="font-mono text-sm font-black text-amber-700">#1 🥇</span>;
  if (rank === 2) return <span className="font-mono text-sm font-black text-zinc-500">#2 🥈</span>;
  if (rank === 3) return <span className="font-mono text-sm font-black text-amber-800">#3 🥉</span>;
  return <span className="font-mono text-sm font-bold text-zinc-400">#{rank}</span>;
}

function ScoutModal({ scout, onClose }: { scout: StandingRow; onClose: () => void }) {
  const division = divisionFor(scout.total_score);
  const title = titleLabel(scout.equipped_title);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scout-standing-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center">
          <ScoutAvatar frameId={scout.equipped_frame} avatarUrl={scout.avatar_url} label={scout.username} size="lg" />
        </div>
        <h2 id="scout-standing-title" className="mt-4 text-xl font-black text-zinc-900">
          @{scout.username}
        </h2>
        {title && <p className={`mt-1 text-sm font-bold ${titleClassName(scout.equipped_title)}`}>{title}</p>}
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
          {division.emoji} {division.name}
        </p>
        <p className="mt-4 font-mono text-2xl font-black text-blue-600">{scout.total_score.toLocaleString()} PTS</p>
        <p className="mt-2 text-xs font-bold text-zinc-500">
          🔥 {scout.streak}-day · {scout.matches_solved} solved
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function StandingsPage() {
  const [mode, setMode] = useState<StandingMode>("week");
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [viewer, setViewer] = useState<StandingRow | null>(null);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [playedToday, setPlayedToday] = useState<boolean | null>(null);
  const [openScout, setOpenScout] = useState<StandingRow | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPlayedToday(loadSolvedHistory().includes(utcDateKey(new Date())));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const monday = mondayOfUtcWeek(utcDateKey(new Date()));
      if (!isSupabaseConfigured) {
        if (!cancelled) setWeekStart(monday);
        return;
      }

      const { data: auth } = await supabaseClient.auth.getUser();
      const user = auth.user;
      const wide = await supabaseClient
        .from("profiles")
        .select(PROFILE_COLUMNS_WITH_WEEK)
        .order("total_score", { ascending: false })
        .limit(50);

      const weekly = !wide.error;
      let listed = (wide.data ?? []) as unknown as ProfileRow[];
      if (wide.error) {
        const narrow = await supabaseClient
          .from("profiles")
          .select(PROFILE_COLUMNS)
          .order("total_score", { ascending: false })
          .limit(50);
        listed = (narrow.data ?? []) as unknown as ProfileRow[];
      }

      const pool = new Map<string, StandingRow>();
      for (const row of listed) pool.set(row.id, mapProfile(row));

      if (weekly) {
        const weekBoard = await supabaseClient
          .from("profiles")
          .select(PROFILE_COLUMNS_WITH_WEEK)
          .eq("week_start", monday)
          .order("week_score", { ascending: false })
          .limit(50);
        if (!weekBoard.error) {
          for (const row of (weekBoard.data ?? []) as unknown as ProfileRow[]) {
            pool.set(row.id, mapProfile(row));
          }
        }
      }

      let viewerRow: StandingRow | null = null;
      if (user) {
        const own = weekly
          ? await supabaseClient.from("profiles").select(PROFILE_COLUMNS_WITH_WEEK).eq("id", user.id).maybeSingle()
          : await supabaseClient.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).maybeSingle();
        if (own.data) viewerRow = mapProfile(own.data as unknown as ProfileRow);
      }

      if (!cancelled) {
        setWeekStart(monday);
        setRows([...pool.values()]);
        setViewer(viewerRow);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const placed = placeScout(rows, viewer, mode, weekStart);
  const viewerScore = viewer ? scoreFor(viewer, mode, weekStart) : 0;
  const viewerTitle = viewer ? titleLabel(viewer.equipped_title) : "";
  const nextPoints = viewer ? pointsToNextTier(viewer.total_score) : null;
  const viewerDivision = viewer ? divisionFor(viewer.total_score) : null;

  return (
    <main className={`min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col justify-between ${viewer ? "pb-28" : ""}`}>
      <div>
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">Scout Standings</h1>
              <p className="mt-1 text-sm text-zinc-500">Global rankings, active streaks, and division status.</p>
            </div>
            <div className="flex self-start rounded-2xl bg-zinc-100 p-1">
              <button
                type="button"
                aria-pressed={mode === "week"}
                onClick={() => setMode("week")}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  mode === "week" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                aria-pressed={mode === "all"}
                onClick={() => setMode("all")}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  mode === "all" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                All-Time Legends
              </button>
            </div>
          </div>
          {mode === "week" && (
            <p className="mt-2 text-[11px] font-medium text-zinc-400">Resets Monday at 00:00 UTC.</p>
          )}

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {DIVISION_TIERS.map((tier) => {
              const mine = viewerDivision?.id === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`shrink-0 rounded-2xl border px-3 py-2 ${
                    mine ? "border-blue-300 bg-blue-50 ring-2 ring-blue-500/40" : "border-zinc-200 bg-white"
                  }`}
                >
                  <p className="text-xs font-black text-zinc-900">
                    {tier.emoji} {tier.name}
                  </p>
                  <p className="text-[10px] font-medium text-zinc-500">{tier.range}</p>
                </div>
              );
            })}
          </div>

          <section className="mt-6 bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="space-y-2">
              {placed.board.map((row, index) => {
                const rank = index + 1;
                const isMe = viewer?.id === row.id;
                const title = titleLabel(row.equipped_title);
                const points = scoreFor(row, mode, weekStart);
                return (
                  <article
                    key={row.id}
                    className={`flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between ${
                      isMe ? "ring-2 ring-blue-500/30 bg-blue-50/40" : "hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="w-14 shrink-0">
                        <RankBadge rank={rank} />
                      </div>
                      <ScoutAvatar
                        frameId={row.equipped_frame}
                        avatarUrl={row.avatar_url}
                        label={row.username}
                        size="md"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setOpenScout(row)}
                          className="block truncate text-left text-sm font-black text-zinc-900 hover:text-blue-700"
                        >
                          @{row.username}
                        </button>
                        {title && (
                          <p className={`truncate text-[11px] font-bold ${titleClassName(row.equipped_title)}`}>{title}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 pl-[4.25rem] sm:justify-end sm:pl-0">
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                        🔥 {row.streak}-day
                      </span>
                      <div className="text-center">
                        <p className="font-mono text-sm font-black text-zinc-900">{row.matches_solved}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Solved</p>
                      </div>
                      <p className="min-w-[6.5rem] text-right font-mono text-sm font-black text-zinc-900">
                        {points.toLocaleString()} PTS
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <Footer />
      {viewer && placed.rank && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold leading-relaxed text-zinc-800">
              {formatPositionLine({
                rank: placed.rank,
                username: viewer.username,
                title: viewerTitle,
                score: viewerScore,
                pointsToNext: nextPoints,
              })}
            </p>
            {playedToday === false && (
              <Link
                href="/"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-blue-700"
              >
                Play Today&apos;s Drop
              </Link>
            )}
          </div>
        </div>
      )}
      {openScout && <ScoutModal scout={openScout} onClose={() => setOpenScout(null)} />}
    </main>
  );
}
