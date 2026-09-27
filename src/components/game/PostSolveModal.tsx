"use client";

import { useEffect, useState } from "react";
import { FREE_TILE_ID, STARTING_SCORE } from "@/lib/tactical-board";

const TILE_ORDER = ["arena", "epoch", "profiles", "archive", "decisive"] as const;

export type TileMark = "free" | "revealed" | "saved";

const MARK_EMOJI: Record<TileMark, string> = {
  free: "🟩",
  revealed: "🟨",
  saved: "⬜",
};

const MARK_CLASS: Record<TileMark, string> = {
  free: "bg-emerald-500",
  revealed: "bg-amber-400",
  saved: "bg-white",
};

const MARK_LABEL: Record<TileMark, string> = {
  free: "Free / Arena",
  revealed: "Revealed intel tile",
  saved: "Untouched / points saved",
};

export interface SolveClub {
  name: string;
  badge: string;
}

export function tileMarks(unlocked: readonly string[]): TileMark[] {
  const open = new Set(unlocked);
  return TILE_ORDER.map((id) => {
    if (!open.has(id)) return "saved";
    return id === FREE_TILE_ID ? "free" : "revealed";
  });
}

export function sportMark(sport: string): string {
  const text = sport.toLowerCase();
  if (text.includes("football") || text.includes("soccer")) return "⚽";
  if (text.includes("hockey")) return "🏒";
  if (text.includes("box")) return "🥊";
  if (text.includes("tennis")) return "🎾";
  if (text.includes("athletic") || text.includes("track")) return "🏃";
  if (text.includes("basket")) return "🏀";
  if (text.includes("gymnast")) return "🤸";
  return "🏆";
}

export function matchSubtitle(sport: string, year: number | null, venue: string | null): string {
  return [sport.trim(), year ? String(year) : "", venue?.trim() ?? ""].filter(Boolean).join(" · ");
}

export function buildSolveShare(input: {
  puzzleNumber: number;
  sport: string;
  score: number;
  unlocked: readonly string[];
  club?: SolveClub | null;
}): string {
  const marks = tileMarks(input.unlocked);
  const spent = marks.filter((mark) => mark !== "saved").length;
  const lines = [
    `SportsHistoryClue #${input.puzzleNumber} ${sportMark(input.sport)}`,
    `Score: ${input.score.toLocaleString("en-US")} / ${STARTING_SCORE.toLocaleString("en-US")} PTS 🏆`,
    `Intel Spent: ${spent} / 5 Tiles`,
    marks.map((mark) => MARK_EMOJI[mark]).join(""),
  ];
  if (input.club) lines.push(`Backed: ${input.club.name} ${input.club.badge}`);
  lines.push("https://sportshistoryclue.com");
  return lines.join("\n");
}

/** Bursts confetti after a correct guess. Skips quietly when the browser canvas is unavailable. */
export async function celebrateSolve(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { default: confetti } = await import("canvas-confetti");
    await confetti({ particleCount: 140, spread: 78, origin: { y: 0.6 } });
  } catch {
    return;
  }
}

export function PostSolveModal({
  open,
  onClose,
  score,
  unlockedTiles,
  matchTitle,
  sport,
  year,
  puzzleNumber,
  challengeId,
  club,
}: {
  open: boolean;
  onClose: () => void;
  score: number;
  unlockedTiles: readonly string[];
  matchTitle: string;
  sport: string;
  year: number | null;
  puzzleNumber: number;
  challengeId: string;
  club: SolveClub | null;
}) {
  const [copied, setCopied] = useState(false);
  const [venue, setVenue] = useState<string | null>(null);
  const marks = tileMarks(unlockedTiles);
  const shareText = buildSolveShare({
    puzzleNumber,
    sport,
    score,
    unlocked: unlockedTiles,
    club,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !challengeId) return;
    let cancelled = false;
    fetch(`/api/recap?challengeId=${encodeURIComponent(challengeId)}`)
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: { venue?: string | null } | null) => {
        if (!cancelled) setVenue(payload?.venue?.trim() || null);
      })
      .catch(() => {
        if (!cancelled) setVenue(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, challengeId]);

  if (!open) return null;

  const copyShare = () => {
    const finish = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    };
    if (!navigator.clipboard) {
      finish();
      return;
    }
    void navigator.clipboard.writeText(shareText).then(finish).catch(() => setCopied(false));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-solve-title"
        className="bg-white border-[3px] border-zinc-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] relative z-50 text-center animate-in fade-in zoom-in-95 duration-200"
      >
        <span className="bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
          FIXTURE SOLVED · BULLSEYE
        </span>
        <h2 id="post-solve-title" className="text-2xl font-black text-zinc-900 tracking-tight mb-1">
          {matchTitle}
        </h2>
        <p className="text-sm font-semibold text-zinc-500">{matchSubtitle(sport, year, venue)}</p>
        <p className="text-4xl sm:text-5xl font-black text-blue-600 tracking-tight my-2">
          +{score.toLocaleString("en-US")} PTS
        </p>
        {club && (
          <div className="bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-3 my-4 flex items-center justify-center gap-2">
            <span>
              ⚽ Points banked for <strong>{club.name}</strong> in Supporters Derby!
            </span>
          </div>
        )}
        <div
          className="my-4 flex items-center justify-center gap-2"
          aria-label={`Tactical board ${marks.map((mark) => MARK_EMOJI[mark]).join("")}`}
        >
          {marks.map((mark, index) => (
            <span
              key={TILE_ORDER[index]}
              title={MARK_LABEL[mark]}
              className={`h-8 w-8 rounded-md border-2 border-zinc-900 ${MARK_CLASS[mark]}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={copyShare}
          className="w-full bg-zinc-900 hover:bg-black text-white font-black py-3.5 rounded-2xl text-sm tracking-wider uppercase shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] hover:shadow-none active:translate-y-[2px] transition-all"
        >
          {copied ? "COPIED TO CLIPBOARD! ✓" : "SHARE RESULT 📋"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full border-2 border-zinc-900 bg-white text-zinc-900 font-black py-3.5 rounded-2xl text-sm tracking-wider uppercase"
        >
          VIEW FULL MATCH DOSSIER
        </button>
      </div>
    </div>
  );
}
