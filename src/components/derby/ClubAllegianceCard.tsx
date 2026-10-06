"use client";

import { useEffect, useState } from "react";
import { ScopeToggle } from "@/components/ScopeToggle";
import type { BoardScope } from "@/lib/board-scope";
import { formatMessage } from "@/lib/i18n/format";
import { useI18n } from "@/lib/i18n/use-i18n";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import {
  FAVORITE_CLUB_KEY,
  clubsForScope,
  findClub,
  isKnownClub,
  isSwedishClub,
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
  const { messages } = useI18n();
  const [chosen, setChosen] = useState<string | null>(null);
  const [storedClub, setStoredClub] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scope, setScope] = useState<BoardScope>("world");

  useEffect(() => {
    const saved = window.localStorage.getItem(FAVORITE_CLUB_KEY);
    const known = isKnownClub(saved) ? saved : null;
    const apply = window.setTimeout(() => {
      if (known) setStoredClub(known);
      if (isSwedishClub(known) || isSwedishClub(initialClubId)) setScope("se");
    }, 0);
    return () => window.clearTimeout(apply);
  }, [initialClubId]);

  const clubId =
    chosen ??
    (isKnownClub(initialClubId) ? initialClubId : null) ??
    storedClub ??
    "";
  const selected = findClub(clubId);
  const clubs = clubsForScope(scope);
  const selectValue = clubs.some((club) => club.id === clubId) ? clubId : "";

  const save = async () => {
    if (!selected || !userId) return;
    if (!isSupabaseConfigured) {
      onSaved(messages.clubs.loginToSave);
      return;
    }
    setSaving(true);
    const { error } = await supabaseClient
      .from("profiles")
      .update({ favorite_club: selected.id })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      onSaved(messages.clubs.saveFailed);
      return;
    }
    window.localStorage.setItem(FAVORITE_CLUB_KEY, selected.id);
    onSaved(formatMessage(messages.clubs.saved, { name: selected.name }), selected.id);
  };

  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
        {messages.clubs.eyebrow}
      </span>
      <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-zinc-900">
        {scope === "se" ? messages.clubs.swedenHeading : messages.clubs.internationalHeading}
      </h2>
      <p className="mt-1 text-xs font-medium text-zinc-500">{messages.clubs.pledge}</p>

      <div className="mt-4">
        <ScopeToggle
          value={scope}
          onChange={setScope}
          swedenLabel={messages.scope.sweden}
          worldLabel={messages.scope.international}
          ariaLabel={messages.clubs.scopeLabel}
        />
      </div>

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
          {messages.clubs.clubLabel}
        </label>
        <select
          id="favorite-club"
          value={selectValue}
          onChange={(event) => setChosen(event.target.value)}
          className="min-h-[48px] flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900 focus:border-blue-600 focus:outline-none"
        >
          <option value="">{messages.clubs.choose}</option>
          {clubs.map((club) => (
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
          {saving ? messages.clubs.saving : messages.clubs.save}
        </button>
      </div>
      {!userId && (
        <p className="mt-3 text-[11px] font-medium text-zinc-400">{messages.clubs.loginToSave}</p>
      )}
    </section>
  );
}
