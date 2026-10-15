import type { BoardScope } from "./board-scope";
import type { ScoutCountry } from "./i18n/profile-preferences";

export const FAVORITE_CLUB_KEY = "shc_favorite_club";
export const HOCKEY_CLUB_KEY = "shc_hockey_club";
export const FOOTBALL_CLUB_KEY = "shc_football_club";
export const INTERNATIONAL_CLUB_KEY = "shc_international_club";

export type DerbyBoard = "hockey" | "football" | "international";

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

export interface DerbyScoreRow {
  hockey_club?: string | null;
  football_club?: string | null;
  international_club?: string | null;
  hockey_score?: number | null;
  football_score?: number | null;
  international_score?: number | null;
  favorite_club?: string | null;
  total_score?: number | null;
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

/** SHL clubs. Ids stay distinct from the Allsvenskan list. */
export const HOCKEY_CLUBS: readonly PremierLeagueClub[] = [
  { id: "farjestad", name: "Färjestad BK", color: "#FFD100", badge: "🟡" },
  { id: "frolunda", name: "Frölunda HC", color: "#C8102E", badge: "🔴" },
  { id: "lulea", name: "Luleå HF", color: "#000000", badge: "⚫" },
  { id: "dif-hockey", name: "Djurgården Hockey", color: "#00529F", badge: "🔵" },
  { id: "skelleftea", name: "Skellefteå AIK", color: "#FFD200", badge: "🟡" },
  { id: "vaxjo", name: "Växjö Lakers", color: "#F36F21", badge: "🟠" },
  { id: "hv71", name: "HV71", color: "#FFD100", badge: "🟡" },
  { id: "linkoping", name: "Linköping HC", color: "#0033A0", badge: "🔵" },
  { id: "rogle", name: "Rögle BK", color: "#006B3F", badge: "🟢" },
  { id: "leksand", name: "Leksands IF", color: "#003DA5", badge: "🔵" },
  { id: "malmo-redhawks", name: "Malmö Redhawks", color: "#C8102E", badge: "🔴" },
  { id: "brynas", name: "Brynäs IF", color: "#000000", badge: "⚫" },
  { id: "orebro", name: "Örebro Hockey", color: "#E30613", badge: "🔴" },
  { id: "timra", name: "Timrå IK", color: "#E30613", badge: "🔴" },
] as const;

const BY_ID = new Map(PREMIER_LEAGUE_CLUBS.map((club) => [club.id, club]));
const SWEDISH_BY_ID = new Map(SWEDISH_CLUBS.map((club) => [club.id, club]));
const US_BY_ID = new Map(US_CLUBS.map((club) => [club.id, club]));
const CANADA_BY_ID = new Map(CANADA_CLUBS.map((club) => [club.id, club]));
const HOCKEY_BY_ID = new Map(HOCKEY_CLUBS.map((club) => [club.id, club]));
const ALL_BY_ID = new Map<string, PremierLeagueClub>([
  ...BY_ID,
  ...SWEDISH_BY_ID,
  ...US_BY_ID,
  ...CANADA_BY_ID,
  ...HOCKEY_BY_ID,
]);

const BOARD_KEYS: Record<DerbyBoard, { club: "hockey_club" | "football_club" | "international_club"; score: "hockey_score" | "football_score" | "international_score"; storage: string }> = {
  hockey: { club: "hockey_club", score: "hockey_score", storage: HOCKEY_CLUB_KEY },
  football: { club: "football_club", score: "football_score", storage: FOOTBALL_CLUB_KEY },
  international: { club: "international_club", score: "international_score", storage: INTERNATIONAL_CLUB_KEY },
};

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

export function isHockeyClub(id: string | null | undefined): id is string {
  return Boolean(id && HOCKEY_BY_ID.has(id));
}

export function isFootballClub(id: string | null | undefined): id is string {
  return Boolean(id && SWEDISH_BY_ID.has(id));
}

export function isInternationalClub(id: string | null | undefined): id is string {
  return Boolean(id && (BY_ID.has(id) || US_BY_ID.has(id) || CANADA_BY_ID.has(id)));
}

export function clubsForBoard(board: DerbyBoard): readonly PremierLeagueClub[] {
  if (board === "hockey") return HOCKEY_CLUBS;
  if (board === "football") return SWEDISH_CLUBS;
  return PREMIER_LEAGUE_CLUBS;
}

export function isClubOnBoard(id: string | null | undefined, board: DerbyBoard): id is string {
  if (board === "hockey") return isHockeyClub(id);
  if (board === "football") return isFootballClub(id);
  return isInternationalClub(id);
}

export function derbyBoardForSport(sport: string | null | undefined): DerbyBoard {
  if (sport === "ice_hockey") return "hockey";
  if (sport === "football") return "football";
  return "international";
}

export function storageKeyForBoard(board: DerbyBoard): string {
  return BOARD_KEYS[board].storage;
}

export function membershipsForBoard(
  rows: readonly DerbyScoreRow[],
  board: DerbyBoard,
): { clubId: string | null; points: number | null }[] {
  const keys = BOARD_KEYS[board];
  return rows.flatMap((row) => {
    const hasSpecific = keys.club in row || keys.score in row;
    const specific = row[keys.club];
    if (typeof specific === "string" && isClubOnBoard(specific, board)) {
      const points = row[keys.score];
      return [{ clubId: specific, points: typeof points === "number" ? points : 0 }];
    }
    if (hasSpecific) return [];
    const fallback = row.favorite_club;
    if (typeof fallback === "string" && isClubOnBoard(fallback, board)) {
      return [{ clubId: fallback, points: row.total_score ?? 0 }];
    }
    return [];
  });
}

export function supporterLabel(club: PremierLeagueClub): string {
  return `${club.badge} ${club.name} Supporter`;
}

export function derbyContributionLine(score: number, clubName: string): string {
  const points = Math.max(0, Math.floor(score)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `⚽ +${points} poäng till ${clubName} i supporterderbyt!`;
}

export function rankBoard(
  memberships: readonly { clubId: string | null; points: number | null }[],
  board: DerbyBoard,
  mode: DerbyMode,
): ClubStanding[] {
  return rankListed(memberships, clubsForBoard(board), mode);
}

export function rankClubs(
  memberships: readonly ClubMembership[],
  mode: DerbyMode,
  scope: BoardScope = "world",
): ClubStanding[] {
  const clubs = clubsForScope(scope);
  return rankListed(
    memberships.map((row) => ({ clubId: row.favorite_club, points: row.total_score })),
    clubs,
    mode,
  );
}

function rankListed(
  memberships: readonly { clubId: string | null; points: number | null }[],
  clubs: readonly PremierLeagueClub[],
  mode: DerbyMode,
): ClubStanding[] {
  const known = new Map(clubs.map((club) => [club.id, club]));
  const totals = new Map<string, { scouts: number; points: number }>();
  for (const club of clubs) totals.set(club.id, { scouts: 0, points: 0 });

  for (const row of memberships) {
    const club = row.clubId ? known.get(row.clubId) : undefined;
    if (!club) continue;
    const bucket = totals.get(club.id);
    if (!bucket) continue;
    bucket.scouts += 1;
    const points = row.points ?? 0;
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
