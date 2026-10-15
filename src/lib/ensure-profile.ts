import { getLocaleSnapshot } from "@/lib/i18n/locale-store";
import { getCountrySnapshot, isScoutCountry, type ScoutCountry } from "@/lib/i18n/profile-preferences";
import type { Locale } from "@/lib/i18n/types";
import { FAVORITE_CLUB_KEY, isKnownClub } from "@/lib/premier-league";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";

export interface ScoutProfileRow {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  streak: number;
  total_score: number;
  favorite_club: string | null;
  locale: Locale | null;
  country: ScoutCountry | null;
}

export function handleFromEmail(email?: string | null): string {
  const local = (email ?? "").split("@")[0] ?? "";
  const clean = local.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
  return clean || "scout";
}

export function localScoutProfile(user: { id: string; email?: string | null }): ScoutProfileRow {
  const username = handleFromEmail(user.email);
  let favorite: string | null = null;
  try {
    const stored = window.localStorage.getItem(FAVORITE_CLUB_KEY);
    favorite = isKnownClub(stored) ? stored : null;
  } catch {
    favorite = null;
  }
  return {
    id: user.id,
    username,
    display_name: username,
    avatar_url: null,
    streak: 0,
    total_score: 0,
    favorite_club: favorite,
    locale: getLocaleSnapshot(),
    country: getCountrySnapshot(),
  };
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function profileFromRow(raw: Record<string, unknown>, fallback: ScoutProfileRow): ScoutProfileRow {
  const username = typeof raw.username === "string" && raw.username.trim() ? raw.username.trim() : fallback.username;
  const locale = raw.locale === "sv" || raw.locale === "en" ? raw.locale : fallback.locale;
  const countryValue = typeof raw.country === "string" ? raw.country : null;
  const country = isScoutCountry(countryValue) ? countryValue : fallback.country;
  const club = typeof raw.favorite_club === "string" && isKnownClub(raw.favorite_club) ? raw.favorite_club : fallback.favorite_club;
  const display = typeof raw.display_name === "string" && raw.display_name.trim() ? raw.display_name.trim() : username;
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : fallback.id,
    username,
    display_name: display,
    avatar_url: typeof raw.avatar_url === "string" ? raw.avatar_url : null,
    streak: asNumber(raw.streak),
    total_score: asNumber(raw.total_score),
    favorite_club: club,
    locale,
    country,
  };
}

/** Base row only. Optional columns are written afterwards so a missing column cannot block creation. */
export function profileInsertPayload(profile: Pick<ScoutProfileRow, "id" | "username">): { id: string; username: string } {
  return { id: profile.id, username: profile.username || "scout" };
}

export function alternateUsername(username: string, userId: string): string {
  const suffix = userId.replace(/[^a-z0-9]/gi, "").slice(0, 6).toLowerCase() || "scout";
  const base = (username || "scout").replace(/[^a-z0-9_]/gi, "").slice(0, 16) || "scout";
  return `${base}_${suffix}`.slice(0, 24);
}

async function insertDefaultRow(profile: ScoutProfileRow): Promise<void> {
  const attempts = [
    profileInsertPayload(profile),
    profileInsertPayload({ id: profile.id, username: alternateUsername(profile.username, profile.id) }),
  ];
  for (const payload of attempts) {
    let created = await supabaseClient.from("profiles").insert(payload);
    const text = `${created.error?.message ?? ""} ${created.error?.details ?? ""}`.toLowerCase();
    if (text.includes("display_name")) {
      created = await supabaseClient.from("profiles").insert({ ...payload, display_name: payload.username });
    }
    if (!created.error) return;
    const failure = `${created.error.message ?? ""} ${created.error.details ?? ""}`.toLowerCase();
    if (created.error.code === "23505" && !failure.includes("username")) return;
    if (created.error.code === "23505") continue;
    console.error("Profile create error:", created.error);
    return;
  }
}

async function writeOptionalFields(profile: ScoutProfileRow): Promise<void> {
  const fields: Array<Record<string, string>> = [];
  if (profile.locale) fields.push({ locale: profile.locale });
  if (profile.country) fields.push({ country: profile.country });
  if (profile.favorite_club) fields.push({ favorite_club: profile.favorite_club });
  for (const patch of fields) {
    const { error } = await supabaseClient.from("profiles").update(patch).eq("id", profile.id);
    if (error) console.error("Profile preference error:", error);
  }
}

/** Load the signed-in scout's row, creating a default one when Auth has no profile yet. */
export async function ensureScoutProfile(user: { id: string; email?: string | null }): Promise<ScoutProfileRow> {
  const fallback = localScoutProfile(user);
  if (!isSupabaseConfigured) return fallback;
  try {
    const existing = await supabaseClient.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (existing.error) console.error("Profile load error:", existing.error);
    if (!existing.data) {
      await insertDefaultRow(fallback);
      await writeOptionalFields(fallback);
    }
    const loaded = existing.data
      ? existing
      : await supabaseClient.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (loaded.error) console.error("Profile read error:", loaded.error);
    if (!loaded.data || typeof loaded.data !== "object") return fallback;
    return profileFromRow(loaded.data as Record<string, unknown>, fallback);
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

export async function saveProfilePatch(userId: string, patch: Record<string, string>): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;
  try {
    const updated = await supabaseClient.from("profiles").update(patch).eq("id", userId).select("id");
    if (!updated.error && Array.isArray(updated.data) && updated.data.length > 0) return true;
    if (updated.error) console.error("Profile update error:", updated.error);
    const fallback = localScoutProfile({ id: userId });
    await insertDefaultRow({
      ...fallback,
      username: typeof patch.username === "string" && patch.username ? patch.username : fallback.username,
    });
    const retry = await supabaseClient.from("profiles").update(patch).eq("id", userId);
    if (!retry.error) return true;
    console.error("Profile retry error:", retry.error);
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}
