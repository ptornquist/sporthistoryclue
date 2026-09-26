export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type CosmeticKind = "title" | "frame" | "vip";

export interface CosmeticItem {
  id: string;
  kind: CosmeticKind;
  name: string;
  rarity: Rarity;
  cost: number;
  emoji: string;
  quote: string;
  grants?: { titles?: string[]; frames?: string[] };
}

export interface CosmeticWallet {
  coins: number;
  unlockedTitles: string[];
  unlockedFrames: string[];
  equippedTitle: string;
  equippedFrame: string;
  totalScore: number;
  matchesSolved: number;
  streak: number;
  bestStreak: number;
  grantedMatchIds: string[];
  duelWins: number;
}

export const COSMETIC_STORAGE_KEY = "shc_cosmetics";

export const TITLES: CosmeticItem[] = [
  {
    id: "rookie",
    kind: "title",
    name: "Archive Rookie",
    rarity: "COMMON",
    cost: 0,
    emoji: "🗂️",
    quote: "Every legend starts with one open clue.",
  },
  {
    id: "ice-analyst",
    kind: "title",
    name: "Ice Analyst",
    rarity: "RARE",
    cost: 400,
    emoji: "🏒",
    quote: "You read a rink the way others read a box score.",
  },
  {
    id: "ringside",
    kind: "title",
    name: "Ringside Judge",
    rarity: "RARE",
    cost: 450,
    emoji: "🥊",
    quote: "You call the round before the bell.",
  },
  {
    id: "record-breaker",
    kind: "title",
    name: "Record Breaker",
    rarity: "EPIC",
    cost: 900,
    emoji: "⏱️",
    quote: "The clock never looks the same after you.",
  },
  {
    id: "golden-boot",
    kind: "title",
    name: "Golden Boot",
    rarity: "EPIC",
    cost: 1100,
    emoji: "👟",
    quote: "The great strikes already have your note in the margin.",
  },
  {
    id: "hall-of-famer",
    kind: "title",
    name: "Hall of Famer",
    rarity: "LEGENDARY",
    cost: 2500,
    emoji: "✨",
    quote: "The plaque was always waiting.",
  },
];

export const FRAMES: CosmeticItem[] = [
  {
    id: "standard",
    kind: "frame",
    name: "Standard Issue",
    rarity: "COMMON",
    cost: 0,
    emoji: "⚪",
    quote: "A clean scout portrait. Nothing extra. Yet.",
  },
  {
    id: "ice-rink",
    kind: "frame",
    name: "Ice Rink",
    rarity: "RARE",
    cost: 500,
    emoji: "🧊",
    quote: "Cold light. Sharp edges.",
  },
  {
    id: "arena-lights",
    kind: "frame",
    name: "Arena Lights",
    rarity: "EPIC",
    cost: 1200,
    emoji: "💡",
    quote: "The building hums when you walk in.",
  },
  {
    id: "velvet-rope",
    kind: "frame",
    name: "Velvet Rope",
    rarity: "EPIC",
    cost: 1400,
    emoji: "🎟️",
    quote: "Courtside, always.",
  },
  {
    id: "golden-glow",
    kind: "frame",
    name: "Golden Glow",
    rarity: "LEGENDARY",
    cost: 2800,
    emoji: "🌟",
    quote: "The hall already knows your name.",
  },
];

export const VIP_ITEMS: CosmeticItem[] = [
  {
    id: "club-key",
    kind: "vip",
    name: "Club Key",
    rarity: "LEGENDARY",
    cost: 5000,
    emoji: "🗝️",
    quote: "Opens the Hall of Famer title and the Golden Glow frame.",
    grants: { titles: ["hall-of-famer"], frames: ["golden-glow"] },
  },
];

export const COSMETICS: CosmeticItem[] = [...TITLES, ...FRAMES, ...VIP_ITEMS];

export const FEATURED_BADGES = [
  {
    id: "summit-stanley",
    name: "Summit Series & Stanley Lore",
    emoji: "🏒",
    detail: "Solve a Summit Series or Olympic ice hockey case.",
  },
  {
    id: "five-rings",
    name: "Five Rings Luminary",
    emoji: "🥇",
    detail: "Solve an Olympic fixture.",
  },
  {
    id: "jules-rimet",
    name: "Jules Rimet Guardian",
    emoji: "⚽",
    detail: "Solve a World Cup fixture.",
  },
  {
    id: "rumble-centre",
    name: "Rumble & Centre Court",
    emoji: "🥊",
    detail: "Solve a heavyweight or Wimbledon rivalry.",
  },
  {
    id: "showdown-victor",
    name: "Showdown Victor",
    emoji: "⚔️",
    detail: "Win a head-to-head duel.",
  },
  {
    id: "iron-scout",
    name: "Iron Scout (7-Day Streak)",
    emoji: "🔥",
    detail: "Hold a seven-day streak.",
  },
  {
    id: "first-clue-sniper",
    name: "First-Clue Sniper",
    emoji: "🎯",
    detail: "Solve a fixture on the first clue.",
  },
] as const;

const HOCKEY_IDS = ["miracle-on-ice-1980", "miracle-1980", "summit-series-1972"];
const OLYMPIC_IDS = ["comaneci-1976", "dream-team-1992", "bolt-beijing-2008", "bolt-2008", "miracle-on-ice-1980", "miracle-1980"];
const WORLD_CUP_IDS = ["pele-sweden-1958", "pele-1958", "hand-of-god-1986", "maradona-1986"];
const RIVALRY_IDS = ["rumble-in-the-jungle-1974", "ali-1974", "wimbledon-epic-1980"];
const FIRST_CLUE_SCORE = 10000;
export const BADGE_TIME_KEY = "shc_badge_times";

export function defaultWallet(): CosmeticWallet {
  return {
    coins: 0,
    unlockedTitles: ["rookie"],
    unlockedFrames: ["standard"],
    equippedTitle: "rookie",
    equippedFrame: "standard",
    totalScore: 0,
    matchesSolved: 0,
    streak: 0,
    bestStreak: 0,
    grantedMatchIds: [],
    duelWins: 0,
  };
}

export function findCosmetic(id: string): CosmeticItem | undefined {
  return COSMETICS.find((item) => item.id === id);
}

export function cosmeticName(id: string | null | undefined): string {
  if (!id) return "";
  return findCosmetic(id)?.name ?? "";
}

export function scoutLevel(totalScore: number): { level: number; progress: number; nextScore: number } {
  const safe = Math.max(0, totalScore);
  const raw = Math.floor(Math.sqrt(safe / 200));
  const level = Math.max(1, raw);
  const floorScore = raw <= 0 ? 0 : raw * raw * 200;
  const nextScore = (level + (raw <= 0 ? 0 : 1)) * (level + (raw <= 0 ? 0 : 1)) * 200 || 200;
  const span = Math.max(1, nextScore - floorScore);
  const progress = Math.min(1, Math.max(0, (safe - floorScore) / span));
  return { level, progress, nextScore };
}

export function frameClassName(frameId: string | null | undefined): string {
  switch (frameId) {
    case "golden-glow":
      return "ring-4 ring-amber-400 shadow-md";
    case "arena-lights":
      return "ring-4 ring-blue-500 shadow-md";
    case "ice-rink":
      return "ring-4 ring-cyan-400 shadow-md";
    case "velvet-rope":
      return "ring-4 ring-purple-400 shadow-md";
    default:
      return "ring-4 ring-zinc-200";
  }
}

export function titleClassName(titleId: string | null | undefined): string {
  const item = titleId ? findCosmetic(titleId) : undefined;
  if (titleId === "hall-of-famer" || item?.rarity === "LEGENDARY") return "text-amber-800";
  if (item?.rarity === "EPIC") return "text-purple-700";
  if (item?.rarity === "RARE") return "text-blue-700";
  return "text-zinc-600";
}

export function rarityClassName(rarity: Rarity): string {
  switch (rarity) {
    case "LEGENDARY":
      return "border-amber-300 bg-amber-50/60 text-amber-800 ring-1 ring-amber-400/20";
    case "EPIC":
      return "border-purple-200 bg-purple-50/50 text-purple-700";
    case "RARE":
      return "border-blue-200 bg-blue-50/50 text-blue-700";
    default:
      return "border-zinc-200 bg-zinc-50/50 text-zinc-600";
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function isUnlocked(wallet: CosmeticWallet, item: CosmeticItem): boolean {
  if (item.kind === "title") return wallet.unlockedTitles.includes(item.id);
  if (item.kind === "frame") return wallet.unlockedFrames.includes(item.id);
  const titles = item.grants?.titles ?? [];
  const frames = item.grants?.frames ?? [];
  return titles.every((id) => wallet.unlockedTitles.includes(id)) && frames.every((id) => wallet.unlockedFrames.includes(id));
}

export function isEquipped(wallet: CosmeticWallet, item: CosmeticItem): boolean {
  if (item.kind === "title") return wallet.equippedTitle === item.id;
  if (item.kind === "frame") return wallet.equippedFrame === item.id;
  return false;
}

export function applyPurchase(
  wallet: CosmeticWallet,
  itemId: string,
): { wallet: CosmeticWallet; ok: boolean; reason?: "coins" | "missing" } {
  const item = findCosmetic(itemId);
  if (!item) return { wallet, ok: false, reason: "missing" };
  if (isUnlocked(wallet, item)) return { wallet, ok: true };
  if (wallet.coins < item.cost) return { wallet, ok: false, reason: "coins" };

  const titles = unique([
    ...wallet.unlockedTitles,
    ...(item.kind === "title" ? [item.id] : []),
    ...(item.grants?.titles ?? []),
  ]);
  const frames = unique([
    ...wallet.unlockedFrames,
    ...(item.kind === "frame" ? [item.id] : []),
    ...(item.grants?.frames ?? []),
  ]);

  return {
    ok: true,
    wallet: {
      ...wallet,
      coins: wallet.coins - item.cost,
      unlockedTitles: titles,
      unlockedFrames: frames,
      equippedTitle: item.kind === "title" ? item.id : item.grants?.titles?.[0] ?? wallet.equippedTitle,
      equippedFrame: item.kind === "frame" ? item.id : item.grants?.frames?.[0] ?? wallet.equippedFrame,
    },
  };
}

export function applyEquip(wallet: CosmeticWallet, itemId: string): CosmeticWallet {
  const item = findCosmetic(itemId);
  if (!item || item.kind === "vip" || !isUnlocked(wallet, item)) return wallet;
  if (item.kind === "title") return { ...wallet, equippedTitle: item.id };
  return { ...wallet, equippedFrame: item.id };
}

export function solveCoinReward(input: {
  isDaily: boolean;
  streakContinued: boolean;
  duelWon: boolean;
}): number {
  let earned = 0;
  if (input.isDaily) earned += 100;
  if (input.streakContinued) earned += 50;
  if (input.duelWon) earned += 150;
  return earned;
}

export function applySolveReward(
  wallet: CosmeticWallet,
  input: {
    matchId: string;
    pointScore: number;
    isDaily: boolean;
    streakContinued: boolean;
    duelWon: boolean;
    newStreak: number;
  },
): { wallet: CosmeticWallet; earned: number } {
  const already = wallet.grantedMatchIds.includes(input.matchId);
  const earned = already ? 0 : solveCoinReward(input);
  const matchesSolved = already ? wallet.matchesSolved : wallet.matchesSolved + 1;
  const totalScore = already ? wallet.totalScore : wallet.totalScore + Math.max(0, input.pointScore);
  const bestStreak = Math.max(wallet.bestStreak, input.newStreak);
  return {
    earned,
    wallet: {
      ...wallet,
      coins: wallet.coins + earned,
      matchesSolved,
      totalScore,
      streak: input.newStreak,
      bestStreak,
      duelWins: already ? wallet.duelWins : wallet.duelWins + (input.duelWon ? 1 : 0),
      grantedMatchIds: already ? wallet.grantedMatchIds : [...wallet.grantedMatchIds, input.matchId],
    },
  };
}

function solvedAny(solvedSlugs: string[], ids: string[]): boolean {
  return solvedSlugs.some((slug) => ids.includes(slug));
}

export function badgeUnlocked(
  badgeId: string,
  wallet: CosmeticWallet,
  solvedSlugs: string[],
  scores: number[] = [],
): boolean {
  if (badgeId === "summit-stanley") return solvedAny(solvedSlugs, HOCKEY_IDS);
  if (badgeId === "five-rings") return solvedAny(solvedSlugs, OLYMPIC_IDS);
  if (badgeId === "jules-rimet") return solvedAny(solvedSlugs, WORLD_CUP_IDS);
  if (badgeId === "rumble-centre") return solvedAny(solvedSlugs, RIVALRY_IDS);
  if (badgeId === "showdown-victor") return wallet.duelWins >= 1;
  if (badgeId === "iron-scout") return wallet.bestStreak >= 7 || wallet.streak >= 7;
  if (badgeId === "first-clue-sniper") return scores.some((score) => score >= FIRST_CLUE_SCORE);
  return false;
}

export function loadBadgeTimes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BADGE_TIME_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function rememberBadgeTimes(ids: string[], existing: Record<string, string>): Record<string, string> {
  const next = { ...existing };
  let changed = false;
  const now = new Date().toISOString();
  for (const id of ids) {
    if (!next[id]) {
      next[id] = now;
      changed = true;
    }
  }
  if (changed && typeof window !== "undefined") {
    window.localStorage.setItem(BADGE_TIME_KEY, JSON.stringify(next));
  }
  return next;
}

export function loadWallet(): CosmeticWallet {
  if (typeof window === "undefined") return defaultWallet();
  try {
    const raw = window.localStorage.getItem(COSMETIC_STORAGE_KEY);
    if (!raw) return defaultWallet();
    const parsed = JSON.parse(raw) as Partial<CosmeticWallet>;
    return {
      ...defaultWallet(),
      ...parsed,
      unlockedTitles: unique([...(parsed.unlockedTitles ?? []), "rookie"]),
      unlockedFrames: unique([...(parsed.unlockedFrames ?? []), "standard"]),
      grantedMatchIds: parsed.grantedMatchIds ?? [],
      duelWins: parsed.duelWins ?? 0,
    };
  } catch {
    return defaultWallet();
  }
}

export function saveWallet(wallet: CosmeticWallet): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COSMETIC_STORAGE_KEY, JSON.stringify(wallet));
  window.dispatchEvent(new Event("shc-cosmetics"));
}

export function walletFromProfile(row: {
  coins?: number | null;
  unlocked_titles?: string[] | null;
  unlocked_frames?: string[] | null;
  equipped_title?: string | null;
  equipped_frame?: string | null;
  total_score?: number | null;
  matches_solved?: number | null;
  streak?: number | null;
  best_streak?: number | null;
}): CosmeticWallet {
  const base = defaultWallet();
  return {
    ...base,
    coins: row.coins ?? base.coins,
    unlockedTitles: unique([...(row.unlocked_titles ?? base.unlockedTitles), "rookie"]),
    unlockedFrames: unique([...(row.unlocked_frames ?? base.unlockedFrames), "standard"]),
    equippedTitle: row.equipped_title || base.equippedTitle,
    equippedFrame: row.equipped_frame || base.equippedFrame,
    totalScore: row.total_score ?? base.totalScore,
    matchesSolved: row.matches_solved ?? base.matchesSolved,
    streak: row.streak ?? base.streak,
    bestStreak: row.best_streak ?? base.bestStreak,
    grantedMatchIds: [],
  };
}
