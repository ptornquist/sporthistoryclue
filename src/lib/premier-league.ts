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

const BY_ID = new Map(PREMIER_LEAGUE_CLUBS.map((club) => [club.id, club]));

export function findPremierLeagueClub(id: string | null | undefined): PremierLeagueClub | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}

export function isPremierLeagueClub(id: string | null | undefined): id is string {
  return Boolean(id && BY_ID.has(id));
}

export function supporterLabel(club: PremierLeagueClub): string {
  return `${club.badge} ${club.name} Supporter`;
}

export function derbyContributionLine(score: number, clubName: string): string {
  return `⚽ +${score.toLocaleString()} PTS bagged for ${clubName} in the Supporters Derby!`;
}

export function rankClubs(memberships: readonly ClubMembership[], mode: DerbyMode): ClubStanding[] {
  const totals = new Map<string, { scouts: number; points: number }>();
  for (const club of PREMIER_LEAGUE_CLUBS) totals.set(club.id, { scouts: 0, points: 0 });

  for (const row of memberships) {
    const club = findPremierLeagueClub(row.favorite_club);
    if (!club) continue;
    const bucket = totals.get(club.id);
    if (!bucket) continue;
    bucket.scouts += 1;
    const points = row.total_score ?? 0;
    if (Number.isFinite(points) && points > 0) bucket.points += points;
  }

  const ranked = PREMIER_LEAGUE_CLUBS.map((club) => {
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
