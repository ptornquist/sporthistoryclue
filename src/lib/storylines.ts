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
    title: "Kalla kriget på isen",
    era: "KALLA KRIGET",
    icon: "🏒",
    accent: "text-sky-600",
    description: "Geopolitisk dramatik på isen, mellan två hockeyvärldar.",
    matchSlugs: ["miracle-on-ice-1980", "summit-series-1972"],
  },
  {
    id: "olympic-miracles",
    title: "Olympiska under",
    era: "OS-ERAN",
    icon: "🥇",
    accent: "text-amber-600",
    description: "Idrottare som skrev om vad som var möjligt i det olympiska ljuset.",
    matchSlugs: ["comaneci-1976", "dream-team-1992", "bolt-beijing-2008"],
  },
  {
    id: "world-cup-epics",
    title: "VM-epos",
    era: "DEN KLASSISKA ERAN",
    icon: "⚽",
    accent: "text-emerald-600",
    description: "Protester, pojkunder och mål som formade den globala fotbollen.",
    matchSlugs: ["pele-sweden-1958", "hand-of-god-1986"],
  },
  {
    id: "rivalries-of-the-century",
    title: "Århundradets rivaler",
    era: "RIVALERNAS ERA",
    icon: "🥊",
    accent: "text-rose-600",
    description: "Motsatta personligheter, stilar och idéer under maximal press.",
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
