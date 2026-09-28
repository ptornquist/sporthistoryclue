export interface EraChapter {
  id: string;
  title: string;
  sport: string;
  /** Ids that count as a solve in shc_solved_history. */
  lookupIds: string[];
}

export interface EraStoryline {
  id: string;
  era: string;
  title: string;
  briefing: string;
  chapters: EraChapter[];
}

export const ERA_STORYLINES: EraStoryline[] = [
  {
    id: "cold-war-on-ice",
    era: "Cold War",
    title: "Cold War on Ice",
    briefing:
      "Two nights when hockey carried a border. College amateurs and a nation's best met the red machine with a series, and a medal, on the line.",
    chapters: [
      {
        id: "miracle-1980",
        title: "1980 Miracle on Ice",
        sport: "ice hockey",
        lookupIds: ["miracle-1980", "miracle-on-ice-1980"],
      },
      {
        id: "summit-series-1972",
        title: "1972 Summit Series",
        sport: "ice hockey",
        lookupIds: ["summit-series-1972"],
      },
    ],
  },
  {
    id: "heavyweight-golden-era",
    era: "Heavyweight Era",
    title: "Heavyweight Golden Era",
    briefing:
      "The heavyweight title left the familiar halls for Kinshasa and Manila. One night was rope-a-dope. The next was a third fight that would not cool off.",
    chapters: [
      {
        id: "ali-1974",
        title: "1974 Rumble in the Jungle",
        sport: "boxing",
        lookupIds: ["ali-1974", "rumble-in-the-jungle-1974"],
      },
      {
        id: "thrilla-in-manila-1975",
        title: "1975 Thrilla in Manila",
        sport: "boxing",
        lookupIds: ["thrilla-in-manila-1975"],
      },
    ],
  },
  {
    id: "the-great-finals",
    era: "Grand Finals",
    title: "The Great Finals",
    briefing:
      "A world championship that refused to end in open play, and a grass-court final that kept the crowd in their seats until the light failed.",
    chapters: [
      {
        id: "world-cup-final-1994",
        title: "1994 World Cup Final",
        sport: "football",
        lookupIds: ["world-cup-final-1994"],
      },
      {
        id: "wimbledon-final-2008",
        title: "2008 Wimbledon Final",
        sport: "tennis",
        lookupIds: ["wimbledon-final-2008"],
      },
    ],
  },
  {
    id: "sprint-and-scandal",
    era: "Sprint",
    title: "Sprint & Scandal",
    briefing:
      "One hundred metres, a time that did not survive the sample, and a rival who walked through the noise into the gold that was left behind.",
    chapters: [
      {
        id: "seoul-100m-1988",
        title: "1988 Olympic 100m Final",
        sport: "athletics",
        lookupIds: ["seoul-100m-1988"],
      },
    ],
  },
];

export function chapterHref(chapter: EraChapter): string {
  return `/?id=${chapter.id}`;
}

export function chapterSolved(chapter: EraChapter, solvedIds: ReadonlySet<string>): boolean {
  return chapter.lookupIds.some((id) => solvedIds.has(id));
}

export function storylineProgress(storyline: EraStoryline, solvedIds: ReadonlySet<string>) {
  const total = storyline.chapters.length;
  const done = storyline.chapters.filter((chapter) => chapterSolved(chapter, solvedIds)).length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}
