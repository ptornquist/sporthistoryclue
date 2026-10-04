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
    "En drömduell på huvudbanan mellan två raka motsatser: den stoiske skandinaviske baslinjespelaren mot den hetlevrade nätspelaren från andra sidan Atlanten.",
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
  "pasadena-bronze-1994": [
    "En medaljmatch i stekande sol. Gräset ligger långt hemifrån, och sången på läktaren hör inte hemma i den här delstaten.",
    "Ett lag som skulle störa på kontringen får aldrig sista avslutet. Varje anfall slutar i samma tysta bur.",
    "Målskyttet kommer från oväntade håll. En kant, en mitt, och sedan samma långa anfallare en gång till.",
    "Ett beskuret arkivfoto från en bronsmatch i en skålformad arena, utan namn i bildtexten.",
    "Bronshjältarna från Pasadena. VM 1994, bronsmatchen mot Bulgarien, slutar 4–0 och Sverige sjunger sig hem med medaljerna.",
  ],
  "turin-gold-2006": [
    "En OS-final på is. Hallen är nybyggd, och två lag som kan varandras skridskoskär möts om den tyngsta medaljen.",
    "Ett lag tar ledningen. Det andra svarar. När den sista perioden börjar är ställningen inte längre den som öppnade matchen.",
    "En back kliver upp mot blålinjen nästan innan bänken hunnit sätta sig. Skottet går högt, och ribban sjunger.",
    "Ett beskuret arkivfoto från en OS-final i ishockey, utan namn i bildtexten.",
    "Guldfeber i Turin. OS-finalen 2006, Tre Kronor mot Finland, slutar 3–2 efter Nicklas Lidströms ikoniska slagskott direkt i början av tredje perioden.",
  ],
  "slaget-i-sudden": [
    "En slutspelskväll som vägrar ta slut. Tre perioder räcker inte, och bänkarna börjar se ut som om de väntar på en ny match.",
    "Första perioden ger var sitt mål. Sedan tystnar tavlan, period efter period, medan målvakterna vägrar släppa något.",
    "En tredje förlängning. Benen är tunga, och ett skott som inte ens är rent räcker för att hallen ska brista.",
    "Ett beskuret arkivfoto från en semifinal som spelas långt in på natten, utan namn i bildtexten.",
    "Slaget i sudden. SM-semifinalen 2015 mellan Växjö och Frölunda avgörs efter 104 minuter, 2–1, när Tuomas Kiiskinen styr in pucken i sjätte perioden.",
  ],
  "guldkampen-i-norr": [
    "En finalserie mellan två lag från samma landsände. Guldmedaljen har varit borta från den här stan i en hel generation.",
    "Bortalaget leder serien redan innan sista matchen. Hemmaisen är full, men chanserna fastnar framför kassen.",
    "Ett tidigt mål sätter tonen. Sedan kommer ett till, och ett till, tills motståndet tar ut målvakten.",
    "Ett beskuret arkivfoto från en avgörande final längst upp i landet, utan namn i bildtexten.",
    "Guldkampen i norr. Den 18 april 2013 vinner Skellefteå med 4–0 borta mot Luleå i fjärde finalen och tar sitt första SM-guld sedan 1978.",
  ],
  "sondagsmorgonen-stockholms-stad": [
    "Två klubbar från samma stad. Läktarna är delade i färger redan innan avspark, och sången hörs genom betongen.",
    "Avsparken dröjer. Något på läktaren måste redas ut innan domaren släpper bollen.",
    "Ett tidigt ledningsmål. Sedan ett till efter paus, en reducering, och till sist en anfallare som sätter spiken.",
    "Ett beskuret arkivfoto från ett derby i huvudstaden, utan namn i bildtexten.",
    "Söndagsderbyt i Stockholm. Den 2 september 2018 vinner Djurgården med 3–1 borta mot Hammarby på Tele2 Arena, efter mål av Kerim Mrabti, Haris Radetinac och Aliou Badji.",
  ],
  "guldstriden-sista-omgangen": [
    "Sista omgången. Tre lag kan fortfarande ta guldet, och en full arena väntar på att det ska avgöras hemma.",
    "Ett tidigt mål lättar på trycket. Innan pausen kommer ett nickmål, och tavlan står still resten av matchen.",
    "Samtidigt, i en annan stad, måste en konkurrent vinna stort för att hinna ikapp. De hinner inte.",
    "Ett beskuret arkivfoto från en avslutningsomgång, utan namn i bildtexten.",
    "Guldstriden i sista omgången. Den 28 oktober 2007 vinner IFK Göteborg med 2–0 mot Trelleborg på Ullevi, efter mål av Thomas Olsson och Pontus Wernbloom, och tar SM-guldet före Kalmar.",
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
