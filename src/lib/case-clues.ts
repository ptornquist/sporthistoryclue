export interface CaseClueSource {
  slug?: string;
  context: string;
  year: number;
}

const CASE_CLUES: Record<string, readonly string[]> = {
  "wimbledon-epic-1980": [
    "Gräs, en herrfinal som kan kräva fem set, och två spelare som vägrar likna varandra.",
    "Den ena håller bollen i spel från baslinjen. Den andra attackerar nätet. Publiken väljer sida med ljudet.",
    "Ett särspel som inte vill ta slut. Siffrorna klättrar förbi det som brukar räcka för ett set.",
    "Ett beskuret arkivfoto från en herrfinal på gräs, utan namn i bildtexten.",
    "En drömduell på huvudbanan mellan två raka motsatser: den stoiske skandinaviske baslinjespelaren mot den hetlevrade nätspelaren från andra sidan Atlanten.",
  ],
  "summit-series-1972": [
    "Bortalagets hall är full. Pucken slår i sargen, och klockan i tredje perioden är nästan slut.",
    "Två hockeysystem som länge levt åtskilda möts när proffsen äntligen släpps in på isen.",
    "Ett lag är byggt för en klubbliga. Det andra samlas året runt. Blålinjen är den gräns de inte får ge bort.",
    "Ett skott från slottet. Målvakten är sen. Utvisningsbåset är tomt, och hallen exploderar med sekunder kvar.",
    "Toppmötesserien 1972. Kanadas proffs möter det sovjetiska landslaget i åtta matcher, och sista minuten i Moskva avgör.",
  ],
  "miracle-on-ice-1980": [
    "Pucken studsar i sargen i en olympisk ishall. Favoriten har tränat året runt, och flaggan på läktaren vill inte ligga still.",
    "Det är semifinal på isen, men stämningen är redan som i en final. Ett universitetslag möter en maskin som rullar i långa perioder.",
    "Blålinjen håller. Utvisningsbåset står tomt. Kaptenen får det sista bytet när klockan i perioden sinar.",
    "Radion skriker rakt in i en mikrofon. Målvakten vägrar titta bort när pucken ligger fri framför kassen.",
    "Miraklet på isen, 1980. USA:s universitetslag slår Sovjetunionen med 4–3 och tar sedan OS-guld mot Finland.",
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
    "En nybyggd hall. Skridskorna skär isen, och pucken letar sig längs sargen innan första bytet.",
    "Ett lag tar ledningen. Det andra svarar. När den sista perioden börjar är ställningen inte längre den som öppnade matchen.",
    "En back kliver upp mot blålinjen nästan innan bänken hunnit sätta sig. Skottet går högt.",
    "Ribban sjunger. Utvisningsbåset är tomt, det är fem mot fem, och hallen hör träffen innan ögonen hinner med.",
    "Guldfeber i Turin. OS-finalen 2006, Tre Kronor mot Finland, slutar 3–2 efter Nicklas Lidströms ikoniska slagskott direkt i början av tredje perioden.",
  ],
  "slaget-i-sudden": [
    "En slutspelskväll som vägrar ta slut. Tre perioder räcker inte, sargen är märkt av slag, och bänkarna väntar.",
    "Första perioden ger var sitt mål. Sedan tystnar tavlan, period efter period, medan målvakterna täcker pucken.",
    "En tredje förlängning. Utvisningsbåset är tomt, benen är tunga, och ett skott som tar i ett benskydd räcker för att hallen ska brista.",
    "Klockan har passerat midnatt. Pucken kommer över blålinjen, en styrning vid kassen, och semifinalen är över.",
    "Slaget i sudden. SM-semifinalen 2015 mellan Växjö och Frölunda avgörs efter 104 minuter, 2–1, när Tuomas Kiiskinen styr in pucken i sjätte perioden.",
  ],
  "guldkampen-i-norr": [
    "En finalserie mellan två lag från samma landsände. Isen är nyspolad, sargen darrar av sång, och guldet har varit borta i en generation.",
    "Bortalaget leder serien redan innan sista matchen. Hemmaisen är full, men chanserna fastnar framför kassen.",
    "Ett tidigt mål i första perioden sätter tonen. Sedan kommer ett till, tills motståndet tar ut målvakten.",
    "Utvisningsbåset är tomt. Pucken får fritt över blålinjen mot den tomma kassen, och en generation får äntligen sjunga.",
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
