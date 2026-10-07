"use client";

import { useEffect, useState } from "react";
import { formatMessage } from "@/lib/i18n/format";
import { useLanguage } from "@/lib/i18n/language-context";
import { isScoutCountry, type ScoutCountry } from "@/lib/i18n/profile-preferences";
import type { Locale } from "@/lib/i18n/types";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import {
  FAVORITE_CLUB_KEY,
  clubsForCountry,
  findClub,
  isKnownClub,
  supporterLabel,
} from "@/lib/premier-league";

const LOCALES: Locale[] = ["sv", "en"];

async function persistPreference(userId: string, patch: Record<string, string>) {
  if (!isSupabaseConfigured) return;
  await supabaseClient.from("profiles").update(patch).eq("id", userId);
}

export function ClubAllegianceCard({
  userId,
  initialClubId,
  onSaved,
}: {
  userId: string | null;
  initialClubId: string | null;
  onSaved: (message: string, clubId?: string) => void;
}) {
  const { locale, messages, setLocale, country, setCountry } = useLanguage();
  const [chosen, setChosen] = useState<string | null>(null);
  const [storedClub, setStoredClub] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(FAVORITE_CLUB_KEY);
    const known = isKnownClub(saved) ? saved : isKnownClub(initialClubId) ? initialClubId : null;
    const apply = window.setTimeout(() => {
      if (known) setStoredClub(known);
    }, 0);
    return () => window.clearTimeout(apply);
  }, [initialClubId]);

  const clubs = clubsForCountry(country);
  const clubId =
    chosen ??
    (isKnownClub(initialClubId) ? initialClubId : null) ??
    storedClub ??
    "";
  const selected = findClub(clubId);
  const selectValue = clubs.some((club) => club.id === clubId) ? clubId : "";

  const chooseLanguage = (next: Locale) => {
    setLocale(next);
    if (userId) void persistPreference(userId, { locale: next });
  };

  const chooseCountry = (next: ScoutCountry) => {
    setCountry(next);
    setChosen("");
    if (userId) void persistPreference(userId, { country: next });
  };

  const save = async () => {
    const club = findClub(selectValue);
    if (!club) return;
    if (!userId || !isSupabaseConfigured) {
      window.localStorage.setItem(FAVORITE_CLUB_KEY, club.id);
      setStoredClub(club.id);
      onSaved(formatMessage(messages.clubs.saved, { name: club.name }), club.id);
      return;
    }
    setSaving(true);
    const { error } = await supabaseClient
      .from("profiles")
      .update({ favorite_club: club.id })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      onSaved(messages.clubs.saveFailed);
      return;
    }
    window.localStorage.setItem(FAVORITE_CLUB_KEY, club.id);
    onSaved(formatMessage(messages.clubs.saved, { name: club.name }), club.id);
  };

  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
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

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          {messages.profile.favoriteClub}
        </p>
        <p className="mt-1 text-xs font-medium text-zinc-500">{messages.clubs.pledge}</p>
        {selected && clubs.some((club) => club.id === selected.id) && (
          <p className="mt-4 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-black text-zinc-900">
            <span
              aria-hidden
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: selected.color }}
            />
            {supporterLabel(selected)}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
            disabled={!selectValue || saving}
            className="min-h-[48px] rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {saving ? messages.clubs.saving : messages.clubs.save}
          </button>
        </div>
        {!userId && (
          <p className="mt-3 text-[11px] font-medium text-zinc-400">{messages.profile.guestReady}</p>
        )}
      </div>
    </section>
  );
}
