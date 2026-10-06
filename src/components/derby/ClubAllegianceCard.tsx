"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import {
  FAVORITE_CLUB_KEY,
  PREMIER_LEAGUE_CLUBS,
  findPremierLeagueClub,
  isPremierLeagueClub,
  supporterLabel,
} from "@/lib/premier-league";

export function ClubAllegianceCard({
  userId,
  initialClubId,
  onSaved,
}: {
  userId: string | null;
  initialClubId: string | null;
  onSaved: (message: string, clubId?: string) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [storedClub, setStoredClub] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(FAVORITE_CLUB_KEY);
    if (!saved || !isPremierLeagueClub(saved)) return;
    const apply = window.setTimeout(() => setStoredClub(saved), 0);
    return () => window.clearTimeout(apply);
  }, []);

  const clubId =
    chosen ??
    (isPremierLeagueClub(initialClubId) ? initialClubId : null) ??
    storedClub ??
    "";
  const selected = findPremierLeagueClub(clubId);

  const save = async () => {
    if (!selected || !userId) return;
    if (!isSupabaseConfigured) {
      onSaved("Logga in för att spara klubben.");
      return;
    }
    setSaving(true);
    const { error } = await supabaseClient
      .from("profiles")
      .update({ favorite_club: selected.id })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      onSaved("Kunde inte spara klubben. Försök igen.");
      return;
    }
    window.localStorage.setItem(FAVORITE_CLUB_KEY, selected.id);
    onSaved(`${selected.name} is now your club.`, selected.id);
  };

  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
        Klubbval
      </span>
      <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-zinc-900">
        Premier League
      </h2>
      <p className="mt-1 text-xs font-medium text-zinc-500">
        Välj en klubb. Varje löst kluring lägger dina poäng i supporterderbyt.
      </p>

      {selected && (
        <p className="mt-4 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-black text-zinc-900">
          <span
            aria-hidden
            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: selected.color }}
          />
          {supporterLabel(selected)}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="favorite-club">
          Premier League club
        </label>
        <select
          id="favorite-club"
          value={clubId}
          onChange={(event) => setChosen(event.target.value)}
          className="min-h-[48px] flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900 focus:border-blue-600 focus:outline-none"
        >
          <option value="">Choose your Premier League club</option>
          {PREMIER_LEAGUE_CLUBS.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            void save();
          }}
          disabled={!selected || !userId || saving}
          className="min-h-[48px] rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {saving ? "Sparar..." : "Spara klubb"}
        </button>
      </div>
      {!userId && (
        <p className="mt-3 text-[11px] font-medium text-zinc-400">Logga in för att spara klubben.</p>
      )}
    </section>
  );
}
