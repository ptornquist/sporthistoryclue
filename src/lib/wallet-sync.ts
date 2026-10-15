import { resolveCareerScore, resolveSolvedCount } from "./career-score";
import { walletFromProfile, type CosmeticWallet } from "./cosmetics";
import { careerOf, MATCH_ID, type ProfileValues } from "./solve-award";

/** The profile fields the wallet reads back after a save. */
export type ProfilePayload = Parameters<typeof walletFromProfile>[0] & { earned?: number };

/**
 * Combine the saved profile with the browser wallet. Cosmetics come from the
 * profile; the totals take the higher value so points that never reached the
 * database are not hidden while the sync catches up. This is the same rule the
 * profile card uses for its career score.
 */
export function mergeWallet(local: CosmeticWallet, profile: ProfilePayload): CosmeticWallet {
  const saved = walletFromProfile(profile);
  return {
    ...saved,
    totalScore: resolveCareerScore({ profile: saved.totalScore, local: local.totalScore }),
    matchesSolved: resolveSolvedCount({ profile: saved.matchesSolved, local: local.matchesSolved }),
    bestStreak: Math.max(saved.bestStreak, local.bestStreak),
    streak: Math.max(saved.streak, local.streak),
    grantedMatchIds: local.grantedMatchIds,
    duelWins: local.duelWins,
  };
}

/** True when the browser holds points the profiles row lacks. */
export function walletAhead(local: CosmeticWallet, row: ProfileValues | null): boolean {
  if (local.totalScore <= 0 && local.matchesSolved <= 0) return false;
  if (!row) return true;
  const solved = typeof row.matches_solved === "number" ? row.matches_solved : 0;
  return local.totalScore > careerOf(row) || local.matchesSolved > solved;
}

export function profileFromRow(row: ProfileValues): ProfilePayload {
  return { ...(row as ProfilePayload), total_score: careerOf(row) };
}

/**
 * Ask the server to raise the profiles row to the wallet totals.
 * Returns the saved row, or null when nothing could be saved.
 */
export async function syncWalletToProfile(
  wallet: CosmeticWallet,
  accessToken: string | null | undefined,
): Promise<ProfilePayload | null> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const response = await fetch("/api/wallet-sync", {
      method: "POST",
      headers,
      body: JSON.stringify({
        totalScore: Math.max(0, Math.floor(wallet.totalScore)),
        matchesSolved: Math.max(0, Math.floor(wallet.matchesSolved)),
        bestStreak: Math.max(0, Math.floor(wallet.bestStreak)),
        grantedMatchIds: wallet.grantedMatchIds.filter((id) => MATCH_ID.test(id)).slice(0, 5000),
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { saved?: string; profile?: ProfilePayload | null };
    return data.saved && data.saved !== "none" && data.profile ? data.profile : null;
  } catch {
    return null;
  }
}
