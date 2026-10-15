import type { BoardScope } from "./board-scope";
import type { ScoutCountry } from "./i18n/profile-preferences";

export const FAVORITE_CLUB_KEY = "shc_favorite_club";

export interface PremierLeagueClub {
  id: string;
  name: string;
  color: string;
  badge: string;
}

export interface ClubMembership {
  favorite_club: string | null;
  total_score: number | null;
}

export interface ClubStanding {
  id: string;
  name: string;
  color: string;
  badge: string;
  scouts: number;
  totalPoints: number;
  average: number;
  rank: number;
}

export type DerbyMode = "total" | "average";

/** 2026–27 Premier League. */
export const PREMIER_LEAGUE_CLUBS: readonly PremierLeagueClub[] = [
  { id: "arsenal", name: "Arsenal FC", color: "#EF0107", badge: "🔴" },
  { id: "aston-villa", name: "Aston Villa", color: "#670E36", badge: "🟣" },
  { id: "bournemouth", name: "AFC Bournemouth", color: "#DA291C", badge: "🍒" },
  { id: "brentford", name: "Brentford", color: "#E30613", badge: "🐝" },
  { id: "brighton", name: "Brighton & Hove Albion", color: "#0057B8", badge: "🔵" },
  { id: "chelsea", name: "Chelsea", color: "#034694", badge: "💙" },
  { id: "coventry", name: "Coventry City", color: "#64C8C8", badge: "🩵" },
  { id: "crystal-palace", name: "Crystal Palace", color: "#1B458F", badge: "🦅" },
  { id: "everton", name: "Everton", color: "#003399", badge: "🔷" },
  { id: "fulham", name: "Fulham", color: "#000000", badge: "⚪" },
  { id: "hull", name: "Hull City", color: "#F5A001", badge: "🐯" },
  { id: "ipswich", name: "Ipswich Town", color: "#0044AA", badge: "🚜" },
  { id: "leeds", name: "Leeds United", color: "#FFCD00", badge: "🟡" },
  { id: "liverpool", name: "Liverpool", color: "#C8102E", badge: "🔴" },
  { id: "manchester-city", name: "Manchester City", color: "#6CABDD", badge: "🩵" },
  { id: "manchester-united", name: "Manchester United", color: "#DA291C", badge: "🔴" },
  { id: "newcastle", name: "Newcastle United", color: "#241F20", badge: "⚫" },
  { id: "nottingham-forest", name: "Nottingham Forest", color: "#DD0000", badge: "🌲" },
  { id: "sunderland", name: "Sunderland", color: "#EB172B", badge: "🔴" },
  { id: "tottenham", name: "Tottenham Hotspur", color: "#132257", badge: "⚪" },
] as const;

/** Allsvenskan clubs used for the national Sweden board. */
export const SWEDISH_CLUBS: readonly PremierLeagueClub[] = [
  { id: "aik", name: "AIK", color: "#000000", badge: "⚫" },
  { id: "djurgarden", name: "Djurgårdens IF", color: "#00529F", badge: "🔵" },
  { id: "hammarby", name: "Hammarby IF", color: "#00A651", badge: "🟢" },
  { id: "malmo", name: "Malmö FF", color: "#6CB4EE", badge: "🩵" },
  { id: "ifk-goteborg", name: "IFK Göteborg", color: "#1C4E9D", badge: "🔵" },
  { id: "elfsborg", name: "IF Elfsborg", color: "#F7D117", badge: "🟡" },
  { id: "hacken", name: "BK Häcken", color: "#F6D100", badge: "🟡" },
  { id: "norrkoping", name: "IFK Norrköping", color: "#0057A8", badge: "🔵" },
  { id: "kalmar", name: "Kalmar FF", color: "#E30613", badge: "🔴" },
  { id: "sirius", name: "IK Sirius", color: "#1A2B5C", badge: "🔵" },
  { id: "halmstad", name: "Halmstads BK", color: "#003DA5", badge: "🔵" },
  { id: "gais", name: "GAIS", color: "#006B3F", badge: "🟢" },
  { id: "mjallby", name: "Mjällby AIF", color: "#FFD200", badge: "🟡" },
  { id: "brommapojkarna", name: "IF Brommapojkarna", color: "#D4001A", badge: "🔴" },
  { id: "varnamo", name: "IFK Värnamo", color: "#1B3A6B", badge: "🔵" },
  { id: "degerfors", name: "Degerfors IF", color: "#E30613", badge: "🔴" },
] as const;

/** Clubs offered when the profile country is the United States. */
export const US_CLUBS: readonly PremierLeagueClub[] = [
  { id: "inter-miami", name: "Inter Miami CF", color: "#F7B5CD", badge: "🩷" },
  { id: "lafc", name: "Los Angeles FC", color: "#C39E6D", badge: "⚫" },
  { id: "la-galaxy", name: "LA Galaxy", color: "#00245D", badge: "🔵" },
  { id: "nycfc", name: "New York City FC", color: "#6CACE4", badge: "🩵" },
  { id: "atlanta-united", name: "Atlanta United", color: "#80000A", badge: "🔴" },
  { id: "seattle-sounders", name: "Seattle Sounders", color: "#5D9741", badge: "🟢" },
  { id: "portland-timbers", name: "Portland Timbers", color: "#00482B", badge: "🟢" },
  { id: "chicago-fire", name: "Chicago Fire", color: "#AF2626", badge: "🔴" },
] as const;

/** Clubs offered when the profile country is Canada. */
export const CANADA_CLUBS: readonly PremierLeagueClub[] = [
  { id: "toronto-fc", name: "Toronto FC", color: "#B81137", badge: "🔴" },
  { id: "cf-montreal", name: "CF Montréal", color: "#0033A0", badge: "🔵" },
  { id: "vancouver-whitecaps", name: "Vancouver Whitecaps", color: "#00245D", badge: "🔵" },
] as const;

const BY_ID = new Map(PREMIER_LEAGUE_CLUBS.map((club) => [club.id, club]));
const SWEDISH_BY_ID = new Map(SWEDISH_CLUBS.map((club) => [club.id, club]));
const US_BY_ID = new Map(US_CLUBS.map((club) => [club.id, club]));
const CANADA_BY_ID = new Map(CANADA_CLUBS.map((club) => [club.id, club]));
const ALL_BY_ID = new Map<string, PremierLeagueClub>([...BY_ID, ...SWEDISH_BY_ID, ...US_BY_ID, ...CANADA_BY_ID]);

export function clubsForScope(scope: BoardScope = "world"): readonly PremierLeagueClub[] {
  return scope === "se" ? SWEDISH_CLUBS : PREMIER_LEAGUE_CLUBS;
}

export function clubsForCountry(country: ScoutCountry): readonly PremierLeagueClub[] {
  if (country === "se") return SWEDISH_CLUBS;
  if (country === "us") return US_CLUBS;
  if (country === "ca") return CANADA_CLUBS;
  return PREMIER_LEAGUE_CLUBS;
}

export function findPremierLeagueClub(id: string | null | undefined): PremierLeagueClub | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}

export function findClub(id: string | null | undefined): PremierLeagueClub | null {
  if (!id) return null;
  return ALL_BY_ID.get(id) ?? null;
}

export function isPremierLeagueClub(id: string | null | undefined): id is string {
  return Boolean(id && BY_ID.has(id));
}

export function isSwedishClub(id: string | null | undefined): id is string {
  return Boolean(id && SWEDISH_BY_ID.has(id));
}

export function isKnownClub(id: string | null | undefined): id is string {
  return Boolean(id && ALL_BY_ID.has(id));
}

export function supporterLabel(club: PremierLeagueClub): string {
  return `${club.badge} ${club.name} Supporter`;
}

export function derbyContributionLine(score: number, clubName: string): string {
  const points = Math.max(0, Math.floor(score)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `⚽ +${points} poäng till ${clubName} i supporterderbyt!`;
}

export function rankClubs(
  memberships: readonly ClubMembership[],
  mode: DerbyMode,
  scope: BoardScope = "world",
): ClubStanding[] {
  const clubs = clubsForScope(scope);
  const known = new Map(clubs.map((club) => [club.id, club]));
  const totals = new Map<string, { scouts: number; points: number }>();
  for (const club of clubs) totals.set(club.id, { scouts: 0, points: 0 });

  for (const row of memberships) {
    const club = row.favorite_club ? known.get(row.favorite_club) : undefined;
    if (!club) continue;
    const bucket = totals.get(club.id);
    if (!bucket) continue;
    bucket.scouts += 1;
    const points = row.total_score ?? 0;
    if (Number.isFinite(points) && points > 0) bucket.points += points;
  }

  const ranked = clubs.map((club) => {
    const bucket = totals.get(club.id) ?? { scouts: 0, points: 0 };
    const average = bucket.scouts > 0 ? Math.round(bucket.points / bucket.scouts) : 0;
    return {
      id: club.id,
      name: club.name,
      color: club.color,
      badge: club.badge,
      scouts: bucket.scouts,
      totalPoints: bucket.points,
      average,
      rank: 0,
    };
  }).sort((left, right) => {
    const primary = mode === "total" ? right.totalPoints - left.totalPoints : right.average - left.average;
    if (primary !== 0) return primary;
    const secondary = mode === "total" ? right.average - left.average : right.totalPoints - left.totalPoints;
    if (secondary !== 0) return secondary;
    return left.name.localeCompare(right.name);
  });

  return ranked.map((row, index) => ({ ...row, rank: index + 1 }));
}
