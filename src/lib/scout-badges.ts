export const ACCOLADE_BADGES = {
  rookie_pin: {
    name: "BRONSMEDALJ",
    icon: "🥉",
    bg: "bg-amber-100 border-amber-300 text-amber-900",
    desc: "För de första avklarade matcherna.",
  },
  archive_lantern: {
    name: "SILVERMEDALJ",
    icon: "🥈",
    bg: "bg-slate-100 border-slate-300 text-slate-900",
    desc: "En hel säsong av spaning.",
  },
  gold_whistle: {
    name: "GULDMEDALJ",
    icon: "🥇",
    bg: "bg-yellow-100 border-yellow-300 text-yellow-900",
    desc: "Läser matchen före det sista kortet.",
  },
  hof_sash: {
    name: "MÄSTARSKAPSPOKAL",
    icon: "🏆",
    bg: "bg-purple-100 border-purple-300 text-purple-900",
    desc: "För veteraner högt i tabellen.",
  },
  chief_intel: {
    name: "HALL OF FAME-TROFÉN",
    icon: "🏅",
    bg: "bg-emerald-100 border-emerald-300 text-emerald-950",
    desc: "Den högsta medaljen i shopen.",
  },
} as const;

export type AccoladeId = keyof typeof ACCOLADE_BADGES;

const MEDAL_COSTS = {
  rookie_pin: 10000,
  archive_lantern: 35000,
  gold_whistle: 75000,
  hof_sash: 150000,
  chief_intel: 300000,
} as const;

export const SHOP_MEDALS = (Object.keys(ACCOLADE_BADGES) as AccoladeId[]).map((id) => ({
  id,
  cost: MEDAL_COSTS[id],
  ...ACCOLADE_BADGES[id],
}));

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
