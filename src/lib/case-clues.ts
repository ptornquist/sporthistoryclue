export interface CaseClueSource {
  slug?: string;
  context: string;
  year: number;
}

const CASE_CLUES: Record<string, readonly string[]> = {
  "wimbledon-epic-1980": [
    "En drömduell på Centre Court mellan två raka motsatser: den stoiske skandinaviske baslinjemästaren mot den eldige serve-och-volley-spelaren från New York.",
    "1980 hör till gräsets storhetstid, när en herrfinal fortfarande kunde kräva fem hela set.",
    "Namn och siffror stannar utanför det här kortet. Den ena håller bollen i spel från baslinjen. Den andra attackerar nätet.",
    "Ett beskuret arkivfoto från Wimbledonfinalen, herrar.",
    "Det avgörande ögonblicket är ett tiebreak som inte vill ta slut, och ett femte set som fortfarande står och väger.",
  ],
  "summit-series-1972": [
    "En enastående 8-matchers interkontinental drabbning som ställde NHL-superstjärnor mot den hemlighetsfulla Röd Maskinen.",
    "1972 hör till mötet mellan två hockeysystem som länge hade spelat var sitt spel.",
    "Namn och siffror stannar utanför det här kortet. Ett lag är byggt för proffsligan. Det andra för landslaget året runt.",
    "Ett beskuret arkivfoto från Summit Series-avgörandet.",
    "Det avgörande ögonblicket kommer med sekunder kvar. Det är den åttonde sirenen.",
  ],
  "miracle-on-ice-1980": [
    "OS-medaljomgång. Arenakortet är en rink i en bergsby, full redan före nedsläpp.",
    "1980 hör till en vinter då amatörer ställdes mot en maskin som tränade året runt.",
    "Namn och siffror stannar utanför det här kortet. Ett collegelag mot ett statligt lag.",
    "Ett beskuret arkivfoto från OS-medaljomgången.",
    "Det avgörande ögonblicket är det sista kortet i akten. Sirenen fryser fast i minnet.",
  ],
  "rumble-in-the-jungle-1974": [
    "Titelmatch i tungvikt. Ringen är full före gryningen, och den yngre mästaren ska vara omöjlig att träffa.",
    "1974 hör till en natt då en titelmatch blev ett helt lands skådespel.",
    "Namn och siffror stannar utanför det här kortet. Den ena slår. Den andra väntar mot repen.",
    "Ett beskuret arkivfoto från titelmatchen i tungvikt.",
    "Det avgörande ögonblicket kommer sent, när kraften i den obesegrade mästaren har tagit slut.",
  ],
  "bolt-beijing-2008": [
    "OS-final 100 meter. Banan är rak, vinden stilla, och en löpare är fri långt före bandet.",
    "2008 hör till en vecka då ett sprinterlopp ritades om före mållinjen.",
    "Namn och siffror stannar utanför det här kortet. Ett skosnöre är oknutet.",
    "Ett beskuret arkivfoto från OS-finalen på 100 meter.",
    "Det avgörande ögonblicket är klockan som sjunker även när armarna redan är utbredda.",
  ],
  "pele-sweden-1958": [
    "VM-final. Arenakortet är värdens egen stadion, och nummer 10 är fortfarande tonåring.",
    "1958 hör till en sommar då ett ungt lag gjorde VM till en annan sport.",
    "Namn och siffror stannar utanför det här kortet. Värdarna möter gästerna i sin egen huvudstad.",
    "Ett beskuret arkivfoto från VM-finalen.",
    "Det avgörande ögonblicket är det sista kortet i akten, när en pojke gråter i kaptens tröja.",
  ],
};

export function caseClues(file: CaseClueSource): string[] {
  const specific = file.slug ? CASE_CLUES[file.slug] : undefined;
  if (specific) return [...specific];
  return [
    `${file.context}. Arenakortet är det första i den här akten.`,
    `${file.year} hör till en längre epok i sporten.`,
    "Namn och siffror stannar utanför det här kortet.",
    `Ett beskuret arkivfoto från ${file.context.toLowerCase()}.`,
    "Det avgörande ögonblicket är det sista kortet i akten.",
  ];
}
