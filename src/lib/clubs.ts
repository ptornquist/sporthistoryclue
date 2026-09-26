import { publicFixtureName } from "@/lib/challenge-link";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CLUB_CODE = /^[A-Z0-9]{6}$/;
const CLUB_NAME = /^[A-Za-z0-9][A-Za-z0-9 .'!&-]{0,47}$/;

export type ClubRole = "owner" | "member";

export interface ClubSummary {
  id: string;
  name: string;
  code: string;
  role: ClubRole;
  memberCount: number;
}

export interface ClubMember {
  id: string;
  username: string;
  totalScore: number;
  streak: number;
  matchesSolved: number;
  equippedTitle: string | null;
  equippedFrame: string | null;
  avatarUrl: string | null;
  role: ClubRole;
}

export interface ClubActivity {
  id: string;
  line: string;
}

export function generateClubCode(bytes: Uint8Array): string {
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += ALPHABET[(bytes[index] ?? 0) % ALPHABET.length];
  }
  return code;
}

export function normalizeClubCode(value: string): string | null {
  const code = value.trim().toUpperCase();
  return CLUB_CODE.test(code) ? code : null;
}

export function normalizeClubName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, " ");
  if (!CLUB_NAME.test(name)) return null;
  return name;
}

export function normalizeShareLabel(value: string): string | null {
  const label = value.trim().replace(/\s+/g, " ");
  if (label.length < 1 || label.length > 80) return null;
  if (/[\u0000-\u001f]/.test(label)) return null;
  return label;
}

export function inviteClubLink(code: string): string {
  return `https://sportshistoryclue.com/clubs?join=${encodeURIComponent(code)}`;
}

export function whatsAppClubInvite(name: string, code: string): string {
  const text = `Join my scout club "${name}" on SportsHistoryClue.\n${inviteClubLink(code)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return null;
  }
  if (!/^\/[A-Za-z0-9/?=&_.%-]*$/.test(value)) return null;
  return value;
}

export function activityLine(input: {
  username: string;
  kind: "solve" | "challenge";
  label: string;
  score: number;
}): string {
  const name = input.username.replace(/^@/, "").trim() || "Scout";
  const points = Math.max(0, Math.floor(input.score)).toLocaleString("en-US");
  if (input.kind === "challenge") {
    const title = input.label.trim() || "a fixture";
    return input.score
      ? `@${name} challenged the club to crack "${title}" (${points} PTS)`
      : `@${name} challenged the club to crack "${title}"`;
  }
  const fixture = input.label === "today's Daily Drop" ? input.label : publicFixtureName(input.label) ?? input.label;
  return `@${name} solved ${fixture} (${points} PTS)`;
}

export function rankClubMembers(members: ClubMember[]): ClubMember[] {
  return [...members].sort(
    (a, b) => b.totalScore - a.totalScore || a.username.localeCompare(b.username),
  );
}

const CLUB_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isClubId(value: string): boolean {
  return CLUB_ID.test(value);
}
