export const ACCOLADE_BADGES = {
  rookie_pin: {
    name: "ROOKIE PIN",
    icon: "📌",
    bg: "bg-amber-100 border-amber-300 text-amber-900",
    desc: "Cleared opening fixtures",
  },
  archive_lantern: {
    name: "ARCHIVE LANTERN",
    icon: "🏮",
    bg: "bg-orange-100 border-orange-300 text-orange-900",
    desc: "Archive illumination",
  },
  gold_whistle: {
    name: "GOLD WHISTLE",
    icon: "🪙",
    bg: "bg-yellow-100 border-yellow-300 text-yellow-900",
    desc: "Reads the climax",
  },
  hof_sash: {
    name: "HALL OF FAME SASH",
    icon: "🎖️",
    bg: "bg-purple-100 border-purple-300 text-purple-900",
    desc: "Standings veteran",
  },
  chief_intel: {
    name: "CHIEF OF INTEL CREST",
    icon: "👑",
    bg: "bg-emerald-100 border-emerald-300 text-emerald-950",
    desc: "Top tier scout",
  },
} as const;

export type AccoladeId = keyof typeof ACCOLADE_BADGES;

export interface UnlockedAccolade {
  id: AccoladeId;
  name: string;
  icon: string;
  bg: string;
  desc: string;
  unlocked_at: string | null;
}

const ACCOLADE_ORDER = Object.keys(ACCOLADE_BADGES);

export function resolveUnlockedBadges(
  rows: { badge_id: string; unlocked_at?: string | null }[] | null | undefined,
): UnlockedAccolade[] {
  const badges = (rows || []).flatMap((row) => {
    if (!(row.badge_id in ACCOLADE_BADGES)) return [];
    const id = row.badge_id as AccoladeId;
    const def = ACCOLADE_BADGES[id];
    return [{ id, unlocked_at: row.unlocked_at ?? null, ...def }];
  });
  return badges.sort((a, b) => ACCOLADE_ORDER.indexOf(a.id) - ACCOLADE_ORDER.indexOf(b.id));
}
