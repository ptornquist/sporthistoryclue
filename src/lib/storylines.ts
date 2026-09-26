import { findCase, previewFromCase, type FixturePreviewModel } from "@/lib/case-files";

export interface Storyline {
  id: string;
  title: string;
  era: string;
  description: string;
  icon: string;
  accent: string;
  matches: FixturePreviewModel[];
}

const DEFINITIONS: Array<Omit<Storyline, "matches"> & { matchSlugs: string[] }> = [
  {
    id: "cold-war-on-ice",
    title: "The Cold War on Ice",
    era: "COLD WAR ERA",
    icon: "🏒",
    accent: "text-sky-600",
    description: "High-stakes geopolitical drama played out across the rinks of two hockey worlds.",
    matchSlugs: ["miracle-on-ice-1980", "summit-series-1972"],
  },
  {
    id: "olympic-miracles",
    title: "Olympic Miracles",
    era: "OLYMPIC ERA",
    icon: "🥇",
    accent: "text-amber-600",
    description: "Generational athletes redefining greatness under the global Olympic spotlight.",
    matchSlugs: ["comaneci-1976", "dream-team-1992", "bolt-beijing-2008"],
  },
  {
    id: "world-cup-epics",
    title: "World Cup Epics",
    era: "CLASSIC ERA",
    icon: "⚽",
    accent: "text-emerald-600",
    description: "Controversy, boy prodigies, and legendary goals that defined global football.",
    matchSlugs: ["pele-sweden-1958", "hand-of-god-1986"],
  },
  {
    id: "rivalries-of-the-century",
    title: "Rivalries of the Century",
    era: "RIVALRY ERA",
    icon: "🥊",
    accent: "text-rose-600",
    description: "Clashes of opposite personalities, styles, and philosophies under immense pressure.",
    matchSlugs: ["rumble-in-the-jungle-1974", "wimbledon-epic-1980"],
  },
];

export const STORYLINES: Storyline[] = DEFINITIONS.map((campaign) => ({
  id: campaign.id,
  title: campaign.title,
  era: campaign.era,
  description: campaign.description,
  icon: campaign.icon,
  accent: campaign.accent,
  matches: campaign.matchSlugs.flatMap((slug) => {
    const file = findCase(slug);
    return file ? [previewFromCase(file)] : [];
  }),
}));

export function storylineById(id: string | null | undefined): Storyline | undefined {
  if (!id) return undefined;
  return STORYLINES.find((storyline) => storyline.id === id);
}

export function nextStorylineMatch(
  campaignId: string | null | undefined,
  currentId: string | null | undefined,
): FixturePreviewModel | null {
  const storyline = storylineById(campaignId);
  if (!storyline || !currentId) return null;
  const index = storyline.matches.findIndex(
    (match) => match.key === currentId || match.lookupIds.includes(currentId),
  );
  if (index < 0 || index >= storyline.matches.length - 1) return null;
  return storyline.matches[index + 1] ?? null;
}

export function firstOpenMatch(
  matches: FixturePreviewModel[],
  solved: Record<string, unknown>,
): FixturePreviewModel | undefined {
  return matches.find((match) => solved[match.key] == null) ?? matches[0];
}

export function arenaHref(matchId: string, campaignId?: string): string {
  const params = new URLSearchParams({ match: matchId });
  if (campaignId) params.set("campaign", campaignId);
  return `/?${params.toString()}`;
}
