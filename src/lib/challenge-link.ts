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

export function ogChallengeHeadline(duel: string, fixtureName: string | null): string {
  const handle = duel.replace(/^@/, "").trim();
  if (handle && fixtureName) return `CHALLENGE FROM @${handle} ON '${fixtureName}'`;
  if (handle) return `CHALLENGE FROM @${handle}`;
  if (fixtureName) return `CRACK '${fixtureName}'`;
  return "Test Your Sports History IQ";
}
