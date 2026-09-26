export interface HistoricalRecap {
  story: string;
  year: number | null;
  venue: string | null;
  finalScore: string | null;
  decisivePlay: string | null;
  videoUrl: string | null;
}

const RECAPS: Record<string, HistoricalRecap> = {
  "miracle-on-ice-1980": {
    year: 1980,
    venue: "Olympic Center, Lake Placid",
    finalScore: "USA 4–3 Soviet Union",
    decisivePlay: "Mike Eruzione's third-period goal",
    videoUrl: null,
    story:
      "A medal-round hockey game in the Adirondacks became a Cold War broadcast. The Soviet side had treated the sport as a state profession for two decades; the American roster was college players who were not supposed to stay with them. Mike Eruzione scored midway through the third, and Jim Craig kept the lead intact through the final minute. The horn turned a rink into a piece of political memory.",
  },
  "summit-series-1972": {
    year: 1972,
    venue: "Luzhniki Ice Palace, Moscow",
    finalScore: "Canada 6–5 Soviet Union",
    decisivePlay: "Paul Henderson, 34 seconds left",
    videoUrl: null,
    story:
      "What was billed as an exhibition became an eight-game argument between two hockey systems. By Game 8 the series was level, the building was in Moscow, and neither country was treating the night as friendly. Paul Henderson scored with 34 seconds left to win the series, not merely the match. The goal closed the first real door between those two hockey worlds.",
  },
  "comaneci-1976": {
    year: 1976,
    venue: "Montreal Forum",
    finalScore: "10.00",
    decisivePlay: "The first Olympic perfect 10, on uneven bars",
    videoUrl: null,
    story:
      "Montreal's gymnastics arena was waiting on a score the equipment had never been built to show. Nadia Comăneci, fourteen, landed an uneven-bars routine the judges marked at the top of the scale. The board printed 1.00 because it had no room for a 10. That single mark reset what an Olympic routine was allowed to be.",
  },
  "dream-team-1992": {
    year: 1992,
    venue: "Palau Municipal d'Esports, Barcelona",
    finalScore: "USA 117–85 Croatia",
    decisivePlay: "The first NBA roster closing an Olympic final",
    videoUrl: null,
    story:
      "For most of Olympic history the United States had sent college players, and the rest of the world had started to catch them. Barcelona changed the rule and sent professionals. Croatia, with Dražen Petrović, met that roster in the gold-medal game. The 117–85 final announced that the amateur era of Olympic basketball was over.",
  },
  "bolt-beijing-2008": {
    year: 2008,
    venue: "Beijing National Stadium",
    finalScore: "9.69",
    decisivePlay: "100m world record, eased before the line",
    videoUrl: null,
    story:
      "The Bird's Nest final was supposed to be a race to the tape. Usain Bolt was clear early, looked sideways, and stopped driving before the line. He still ran 9.69, a world record, in an Olympic 100m final. The time mattered, and so did the fact that the record arrived with a celebration already underway.",
  },
  "pele-sweden-1958": {
    year: 1958,
    venue: "Råsunda Stadium, Solna",
    finalScore: "Brazil 5–2 Sweden",
    decisivePlay: "Pelé, 17, scores twice in the final",
    videoUrl: null,
    story:
      "The World Cup final was in the host's own stadium, against a Sweden side the crowd expected to keep the trophy at home. Brazil sent a seventeen-year-old into that noise. Pelé scored twice in a 5–2 win. The match is the afternoon a teenager made the world cup look like a different sport.",
  },
  "hand-of-god-1986": {
    year: 1986,
    venue: "Estadio Azteca, Mexico City",
    finalScore: "Argentina 2–1 England",
    decisivePlay: "Two Maradona goals, four minutes apart",
    videoUrl: null,
    story:
      "The quarter-final sat four years after the Falklands-Malvinas war, and the stadium in Mexico City felt the politics before the whistle. Diego Maradona scored with his hand, unpunished, then circled the England penalty area and scored again. One goal was illegal and the other is still the measure of a solo run. Argentina left with a 2–1 win and both moments attached to the same name.",
  },
  "rumble-in-the-jungle-1974": {
    year: 1974,
    venue: "Stade du 20 Mai, Kinshasa",
    finalScore: "Ali wins by knockout, round 8",
    decisivePlay: "The left-right combination after the rope-a-dope",
    videoUrl: null,
    story:
      "Kinshasa staged a heavyweight title fight as a national spectacle, with a dictator's stadium full before dawn. George Foreman was the champion and the puncher. Muhammad Ali leaned on the ropes, let the power spend itself, and then ended the night in the eighth round. The knockdown gave Ali the title back and gave the rope-a-dope its name.",
  },
  "wimbledon-epic-1980": {
    year: 1980,
    venue: "Centre Court, All England Club",
    finalScore: "1–6, 7–5, 6–3, 6–7 (16–18), 8–6",
    decisivePlay: "Borg closes the fifth set 8–6",
    videoUrl: null,
    story:
      "Centre Court had ice in Björn Borg and noise in John McEnroe, and the gentlemen's final refused to shorten either of them. The fourth-set tiebreak ran to 18–16, long enough that the set itself became the match people remember. Borg still won the fifth 8–6. It was his fifth straight Wimbledon, taken on the far side of a tiebreak that rewrote what a final could demand.",
  },
};

const ALIASES: Record<string, string> = {
  "miracle-1980": "miracle-on-ice-1980",
  "bolt-2008": "bolt-beijing-2008",
  "pele-1958": "pele-sweden-1958",
  "maradona-1986": "hand-of-god-1986",
  "ali-1974": "rumble-in-the-jungle-1974",
};

export function recapForId(id: string): HistoricalRecap | null {
  const key = ALIASES[id] ?? id;
  return RECAPS[key] ?? null;
}
