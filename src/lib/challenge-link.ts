import { findCase } from "@/lib/case-files";

export function buildChallengeLink(input: {
  matchSlug: string;
  username?: string | null;
  userScore?: number | null;
  campaignId?: string | null;
}): string {
  const handle = encodeURIComponent(input.username?.replace(/^@/, "").trim() || "Scout");
  const slug = encodeURIComponent(input.matchSlug);
  let url = `https://sportshistoryclue.com/?match=${slug}&duel=${handle}`;
  if (input.userScore) url += `&pts=${input.userScore}`;
  if (input.campaignId) url += `&campaign=${encodeURIComponent(input.campaignId)}`;
  return url;
}

export function publicFixtureName(matchSlug: string): string | null {
  const file = findCase(matchSlug);
  return file?.title ?? null;
}

export function formatSharePoints(points: number): string {
  const safe = Number.isFinite(points) ? Math.max(0, Math.trunc(points)) : 0;
  return safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function ogChallengeHeadline(duel: string, _fixtureName: string | null = null): string {
  const handle = duel.replace(/^@/, "").trim();
  if (handle) return `UTMANING FRÅN @${handle}`;
  return "DAGENS KLURING";
}

export function ogChallengeSubtitle(points: number): string {
  const safe = Number.isFinite(points) ? Math.trunc(points) : 0;
  if (safe > 0) {
    return `Kan du slå hens ${formatSharePoints(safe)} poäng på dagens kluring?`;
  }
  return "Kan du slå hen på dagens kluring?";
}
