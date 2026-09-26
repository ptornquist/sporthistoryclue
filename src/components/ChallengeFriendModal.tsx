"use client";

import { useEffect, useState } from "react";
import { buildChallengeLink } from "@/lib/challenge-link";

export function ChallengeFriendModal({
  isOpen,
  onClose,
  matchSlug,
  matchTitle,
  userScore = null,
  category,
  username: usernameProp,
  campaignId,
}: {
  isOpen: boolean;
  onClose: () => void;
  matchSlug: string;
  matchTitle: string;
  userScore?: number | null;
  category?: string;
  username?: string | null;
  campaignId?: string | null;
}) {
  const [username, setUsername] = useState("Scout");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("shc_handle");
      const fromProp = usernameProp?.replace(/^@/, "").trim();
      const fromStore = saved?.replace(/^@/, "").trim();
      if (fromProp) setUsername(fromProp);
      else if (fromStore) setUsername(fromStore);
    }, 0);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [isOpen, onClose, usernameProp]);

  if (!isOpen) return null;

  const link = buildChallengeLink({ matchSlug, username, userScore, campaignId });
  const shareText = userScore
    ? `⚔️ Can you beat my ${userScore.toLocaleString()} PTS and crack "${matchTitle}"?`
    : `⚔️ Dare you to crack "${matchTitle}".`;
  const whatsApp = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${link}`)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${link}`)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setToast("📋 Challenge link copied to clipboard!");
      window.setTimeout(() => setToast(null), 2200);
    } catch {
      setToast("Could not copy the challenge link.");
      window.setTimeout(() => setToast(null), 2200);
    }
  };

  const shareWithClub = async () => {
    try {
      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share", matchTitle, matchSlug, userScore: userScore ?? 0 }),
      });
      if (response.status === 401) {
        setToast("Sign in to share with your club.");
      } else if (response.status === 404) {
        setToast("Join a club before sharing this match.");
      } else if (!response.ok) {
        setToast("Could not share with your club.");
      } else {
        setToast("⚔️ Shared with your club.");
      }
    } catch {
      setToast("Could not share with your club.");
    }
    window.setTimeout(() => setToast(null), 2200);
  };

  const nativeShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `Challenge: ${matchTitle}`, text: shareText, url: link });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    await copyLink();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-friend-title"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 text-left shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">{category || "Sports History"}</p>
        <h2 id="challenge-friend-title" className="mt-1 text-2xl font-black uppercase tracking-tight text-zinc-900">
          ⚔️ Challenge a Scout
        </h2>
        <p className="mt-2 text-sm text-zinc-500">Dare a rival or teammate to crack &quot;{matchTitle}&quot;.</p>

        {userScore ? (
          <div className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
            Your score to beat: {userScore.toLocaleString()} PTS
          </div>
        ) : null}

        <label className="mt-5 block text-[10px] font-bold uppercase tracking-wider text-zinc-400" htmlFor="challenge-link">
          Ready-to-share link
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="challenge-link"
            readOnly
            value={link}
            onFocus={(event) => event.currentTarget.select()}
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 font-mono text-[11px] text-zinc-800"
          />
          <button
            type="button"
            onClick={() => { void copyLink(); }}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black"
          >
            Copy Link
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <a
            href={whatsApp}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center text-xs font-bold text-emerald-800 hover:border-emerald-400"
          >
            🟢 Share on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => { void nativeShare(); }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-xs font-bold text-zinc-800 hover:border-blue-400 hover:text-blue-700"
          >
            📱 Native Share / Messages
          </button>
          <a
            href={twitter}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-center text-xs font-bold text-zinc-800 hover:border-zinc-400"
          >
            ✖️ Post on X / Twitter
          </a>
        </div>

        <button
          type="button"
          onClick={() => { void shareWithClub(); }}
          className="mt-3 w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-xs font-bold text-blue-700 hover:border-blue-400"
        >
          ⚔️ Share with your Club
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700"
        >
          Close
        </button>
      </div>
      {toast && (
        <div className="fixed top-20 left-1/2 z-[80] -translate-x-1/2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
