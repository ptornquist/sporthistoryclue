"use client";

import { useEffect, useState } from "react";
import { formatMessage } from "@/lib/i18n/format";
import { useLanguage } from "@/lib/i18n/language-context";
import { isScoutCountry, type ScoutCountry } from "@/lib/i18n/profile-preferences";
import type { Locale } from "@/lib/i18n/types";
import { saveProfilePatch } from "@/lib/ensure-profile";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  clubsForBoard,
  findClub,
  isClubOnBoard,
  storageKeyForBoard,
  supporterLabel,
  type DerbyBoard,
} from "@/lib/premier-league";

const LOCALES: Locale[] = ["sv", "en"];
const BOARDS: DerbyBoard[] = ["hockey", "football", "international"];

export interface BoardClubs {
  hockey?: string | null;
  football?: string | null;
  international?: string | null;
}

async function persistPreference(userId: string, patch: Record<string, string>) {
  await saveProfilePatch(userId, patch);
}

export function ClubAllegianceCard({
  userId,
  initialClubs,
  onSaved,
}: {
  userId: string | null;
  initialClubs?: BoardClubs | null;
  onSaved: (message: string, clubId?: string, board?: DerbyBoard) => void;
}) {
  const { locale, messages, setLocale, country, setCountry } = useLanguage();
  const [chosen, setChosen] = useState<Partial<Record<DerbyBoard, string>>>({});
  const [stored, setStored] = useState<Partial<Record<DerbyBoard, string>>>({});
  const [saving, setSaving] = useState<DerbyBoard | null>(null);

  const hockeyId = initialClubs?.hockey ?? null;
  const footballId = initialClubs?.football ?? null;
  const internationalId = initialClubs?.international ?? null;

  useEffect(() => {
    const incoming: BoardClubs = { hockey: hockeyId, football: footballId, international: internationalId };
    const next: Partial<Record<DerbyBoard, string>> = {};
    for (const board of BOARDS) {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem(storageKeyForBoard(board));
      } catch {
        saved = null;
      }
      const initial = incoming[board] ?? null;
      const known = isClubOnBoard(saved, board) ? saved : isClubOnBoard(initial, board) ? initial : null;
      if (known) next[board] = known;
    }
    const apply = window.setTimeout(() => setStored(next), 0);
    return () => window.clearTimeout(apply);
  }, [hockeyId, footballId, internationalId]);

  const chooseLanguage = (next: Locale) => {
    setLocale(next);
    if (userId) void persistPreference(userId, { locale: next });
  };

  const chooseCountry = (next: ScoutCountry) => {
    setCountry(next);
    if (userId) void persistPreference(userId, { country: next });
  };

  const valueFor = (board: DerbyBoard) => {
    const picked = chosen[board];
    if (picked !== undefined) return isClubOnBoard(picked, board) ? picked : "";
    const initial = initialClubs?.[board];
    if (isClubOnBoard(initial, board)) return initial;
    return stored[board] ?? "";
  };

  const save = async (board: DerbyBoard) => {
    const club = findClub(valueFor(board));
    if (!club || !isClubOnBoard(club.id, board)) return;
    const column = board === "hockey" ? "hockey_club" : board === "football" ? "football_club" : "international_club";
    try {
      window.localStorage.setItem(storageKeyForBoard(board), club.id);
    } catch {
      // The choice still stays in this session.
    }
    setStored((current) => ({ ...current, [board]: club.id }));
    if (!userId || !isSupabaseConfigured) {
      onSaved(formatMessage(messages.clubs.saved, { name: club.name }), club.id, board);
      return;
    }
    setSaving(board);
    await saveProfilePatch(userId, { [column]: club.id, favorite_club: club.id });
    setSaving(null);
    onSaved(formatMessage(messages.clubs.saved, { name: club.name }), club.id, board);
  };

  const labelFor = (board: DerbyBoard) =>
    board === "hockey" ? messages.clubs.hockey : board === "football" ? messages.clubs.football : messages.clubs.international;
  const hintFor = (board: DerbyBoard) =>
    board === "hockey" ? messages.clubs.hockeyHint : board === "football" ? messages.clubs.footballHint : messages.clubs.internationalHint;

  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm sm:p-8">
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
        {messages.profile.settingsTitle}
      </span>
      <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-zinc-900">
        {messages.profile.languageTitle}
      </h2>
      <p className="mt-1 text-xs font-medium text-zinc-500">{messages.profile.languageHint}</p>

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          {messages.profile.primaryLanguage}
        </p>
        <div className="mt-2 flex gap-2" role="group" aria-label={messages.nav.language}>
          {LOCALES.map((code) => {
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={active}
                onClick={() => chooseLanguage(code)}
                className={`min-h-11 rounded-full px-4 text-xs font-black uppercase tracking-wider ${
                  active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="scout-country">
          {messages.profile.country}
        </label>
        <p className="mt-1 text-xs font-medium text-zinc-500">{messages.profile.countryHint}</p>
        <select
          id="scout-country"
          value={isScoutCountry(country) ? country : "world"}
          onChange={(event) => {
            if (isScoutCountry(event.target.value)) chooseCountry(event.target.value);
          }}
          className="mt-2 min-h-[48px] w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900 focus:border-blue-600 focus:outline-none"
        >
          {(["se", "gb", "us", "ca", "world"] as const).map((code) => (
            <option key={code} value={code}>
              {messages.countries[code]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{messages.profile.favoriteClub}</p>
        <p className="mt-1 text-xs font-medium text-zinc-500">{messages.clubs.pledge}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {BOARDS.map((board) => {
          const clubs = clubsForBoard(board);
          const selectValue = valueFor(board);
          const selected = findClub(selectValue);
          return (
            <div key={board} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500" htmlFor={`club-${board}`}>
                {labelFor(board)}
              </label>
              <p className="mt-1 text-xs font-medium text-zinc-500">{hintFor(board)}</p>
              {selected && (
                <p className="mt-3 inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-black text-zinc-900">
                  <span aria-hidden className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selected.color }} />
                  {supporterLabel(selected)}
                </p>
              )}
              <select
                id={`club-${board}`}
                value={selectValue}
                onChange={(event) => setChosen((current) => ({ ...current, [board]: event.target.value }))}
                className="mt-3 min-h-[48px] w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900 focus:border-blue-600 focus:outline-none"
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
                onClick={() => { void save(board); }}
                disabled={!selectValue || saving === board}
                className="mt-3 min-h-[44px] w-full rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {saving === board ? messages.clubs.saving : messages.clubs.save}
              </button>
            </div>
          );
        })}
      </div>
      {!userId && (
        <p className="mt-3 text-[11px] font-medium text-zinc-400">{messages.profile.guestReady}</p>
      )}
    </section>
  );
}
