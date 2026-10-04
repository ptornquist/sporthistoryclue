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
    id: "shl-klassiker",
    title: "SHL-KLASSIKER & RIVALER",
    era: "SHL-ERAN",
    icon: "🏒",
    accent: "text-sky-600",
    description:
      "Avgörande ögonblick, nagelbitare och klassiska rivaliteter från den svenska hockeyscenen.",
    matchSlugs: [
      "slaget-i-sudden",
      "guldkampen-i-norr",
      "farjestad-skelleftea-2011",
      "brynas-skelleftea-2012",
      "skelleftea-farjestad-2014",
      "frolunda-skelleftea-2016",
    ],
  },
  {
    id: "allsvenska-derbyn",
    title: "ALLSVENSKA DERBYN & DRAMAT",
    era: "ALLSVENSKAN",
    icon: "⚽",
    accent: "text-emerald-600",
    description: "Känslor, läktarfest och oförglömliga guldstrider i Allsvenskan.",
    matchSlugs: [
      "sondagsmorgonen-stockholms-stad",
      "guldstriden-sista-omgangen",
      "aik-djurgarden-2017",
      "malmo-ifk-2015",
      "elfsborg-djurgarden-2006",
      "hammarby-aik-2016",
    ],
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

const CAMPAIGN_HEADLINES: Record<string, string> = {
  "shl-klassiker": "SHL-KLASSIKER & RIVALER",
  "allsvenska-derbyn": "ALLSVENSKA DERBYN & DRAMAT",
};

export function campaignHeadline(campaignId: string | null | undefined): string {
  if (!campaignId) return "Historisk match";
  return CAMPAIGN_HEADLINES[campaignId] ?? "Historisk match";
}

export function arenaHref(matchId: string, campaignId?: string): string {
  const params = new URLSearchParams();
  if (campaignId) params.set("campaign", campaignId);
  const query = params.toString();
  return query ? `/play/${matchId}?${query}` : `/play/${matchId}`;
}
