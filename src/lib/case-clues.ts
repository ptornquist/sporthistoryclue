export interface CaseClueSource {
  slug?: string;
  context: string;
  year: number;
}

const CASE_CLUES: Record<string, readonly string[]> = {
  "wimbledon-epic-1980": [
    "Gräs, en herrfinal som kan kräva fem set, och två spelare som vägrar likna varandra.",
    "Den ena håller bollen i spel från baslinjen. Den andra attackerar nätet. Publiken väljer sida med ljudet.",
    "Ett tiebreak som inte vill ta slut. Siffrorna klättrar förbi det som brukar räcka för ett set.",
    "Ett beskuret arkivfoto från en herrfinal på gräs, utan namn i bildtexten.",
    "En drömduell på Centre Court mellan två raka motsatser: den stoiske skandinaviske baslinjemästaren mot den eldige serve-och-volley-spelaren från New York.",
  ],
  "summit-series-1972": [
    "En serie som vägrar dö. Bortalagets hall är full, och klockan är nästan slut.",
    "Två hockeysystem som länge spelat var sitt spel möts när proffsen äntligen släpps in.",
    "Ett lag är byggt för en klubbliga. Det andra för landslaget året runt. Serien står lika.",
    "Ett beskuret arkivfoto från en avgörande landskamp, utan namn i bildtexten.",
    "En enastående 8-matchers interkontinental drabbning som ställde NHL-superstjärnor mot den hemlighetsfulla Röd Maskinen.",
  ],
  "miracle-on-ice-1980": [
    "Amatörer mot en maskin som tränar året runt. En bergsby. En flagga som inte vill ligga still.",
    "Ett collegelag mot ett lag som samlas året om. Semifinalen känns större än finalen.",
    "Namn och siffror stannar utanför det här kortet. En kapten får sista bytet.",
    "Ett beskuret arkivfoto från en rink i en bergsby.",
    "Det avgörande ögonblicket är det sista kortet i akten. Sirenen fryser fast i minnet.",
  ],
  "rumble-in-the-jungle-1974": [
    "Titelmatch i tungvikt. Ringen är full före gryningen, och den yngre mästaren ska vara omöjlig att träffa.",
    "En natt då en titelmatch blev ett helt lands skådespel. Den äldre mannen väntar mot repen.",
    "Namn och siffror stannar utanför det här kortet. Den ena slår. Den andra sparar.",
    "Ett beskuret arkivfoto från en titelmatch i tungvikt.",
    "Det avgörande ögonblicket kommer sent, när kraften i den obesegrade mästaren har tagit slut.",
  ],
  "bolt-beijing-2008": [
    "OS-final på den korta banan. Vinden är stilla, och en löpare är fri långt före bandet.",
    "En vecka då ett sprinterlopp ritades om före mållinjen. Armarna är redan utbredda.",
    "Namn och siffror stannar utanför det här kortet. Ett skosnöre är oknutet.",
    "Ett beskuret arkivfoto från en sprintfinal.",
    "Det avgörande ögonblicket är klockan som sjunker även när segern redan ser klar ut.",
  ],
  "pele-sweden-1958": [
    "VM-final. Arenakortet är värdens egen stadion, och nummer 10 är fortfarande tonåring.",
    "En sommar då ett ungt lag gjorde turneringen till en annan sport.",
    "Namn och siffror stannar utanför det här kortet. Värdarna möter gästerna på hemmaplan.",
    "Ett beskuret arkivfoto från en VM-final.",
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
