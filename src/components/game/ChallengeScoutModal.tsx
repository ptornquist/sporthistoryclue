"use client";

import type { ScoutProfile } from "@/lib/supabase/network";

export function ChallengeScoutModal({
  fixtureId,
  score,
  scouts,
  source,
  loading,
  signedIn,
  notice,
  onClose,
  onChallenge,
}: {
  fixtureId: string;
  score: number;
  scouts: ScoutProfile[];
  source: "following" | "active";
  loading: boolean;
  signedIn: boolean;
  notice: string | null;
  onClose: () => void;
  onChallenge: (username: string) => void;
}) {
  const copyLink = async () => {
    const challengeUrl = `${window.location.origin}?challenge=${fixtureId}&score=${score}`;
    try {
      await navigator.clipboard.writeText(challengeUrl);
      window.alert("Utmaningslänk kopierad till urklipp! Skicka den till en vän.");
    } catch {
      window.alert("Kunde inte kopiera utmaningslänken.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-scout-title"
    >
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 text-left shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="challenge-scout-title" className="text-2xl font-black uppercase tracking-tight text-zinc-900">
          ⚔️ Utmana en vän
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Skicka din poäng på {score.toLocaleString()} och låt en annan scout försöka slå den.
        </p>

        <button
          type="button"
          onClick={() => { void copyLink(); }}
          className="mt-5 w-full rounded-xl bg-zinc-900 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-black"
        >
          Kopiera utmaningslänk
        </button>
        <p className="mt-2 text-xs text-zinc-500">För SMS, WhatsApp och sociala medier.</p>

        <h3 className="mt-6 text-xs font-black uppercase tracking-wider text-zinc-400">
          Utmana en följare / scout
        </h3>
        {source === "active" && signedIn && !loading ? (
          <p className="mt-2 text-xs text-zinc-500">Du följer ingen ännu. Här är aktiva scouter.</p>
        ) : null}
        {loading ? (
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Hämtar scouter...</p>
        ) : !signedIn ? (
          <p className="mt-3 text-sm text-zinc-600">Logga in för att utmana en scout direkt i appen.</p>
        ) : scouts.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">Inga scouter att utmana ännu.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {scouts.map((scout) => {
              const handle = scout.username?.replace(/^@/, "") || "";
              if (!handle) return null;
              return (
                <li key={scout.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <span className="min-w-0 truncate text-sm font-black text-zinc-900">@{handle}</span>
                  <button
                    type="button"
                    onClick={() => onChallenge(handle)}
                    className="shrink-0 rounded-xl border-2 border-zinc-950 bg-amber-400 px-3 py-1.5 text-xs font-black uppercase text-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Utmana
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {notice ? <p className="mt-4 text-sm font-bold text-zinc-800">{notice}</p> : null}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700"
        >
          Stäng
        </button>
      </div>
    </div>
  );
}
