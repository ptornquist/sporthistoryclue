import { sportForFixture, type DailySportId } from "@/lib/daily-sport";
import { localizeDailyClue } from "@/lib/swedish-clues";

type Ladder = readonly [string, string, string, string, string];

const ALIASES: Record<string, string> = {
  "miracle-on-ice-1980": "miracle-1980",
  "rumble-in-the-jungle-1974": "ali-1974",
  "pele-sweden-1958": "pele-1958",
  "bolt-beijing-2008": "bolt-2008",
  "hand-of-god-1986": "maradona-1986",
};

const LADDERS: Record<string, Ladder> = {
  "miracle-1980": [
    "Pucken studsar i sargen i en olympisk ishall. Favoriten har tränat året runt, och flaggan på läktaren vill inte ligga still.",
    "Det är semifinal på isen, men stämningen är redan som i en final. Ett universitetslag möter en maskin som rullar i långa perioder.",
    "Blålinjen håller. Utvisningsbåset står tomt. Kaptenen får det sista bytet när klockan i perioden sinar.",
    "Radion skriker rakt in i en mikrofon. Målvakten vägrar titta bort när pucken ligger fri framför kassen.",
    "Miraklet på isen, 1980. USA:s universitetslag slår Sovjetunionen med 4–3 och tar sedan OS-guld mot Finland.",
  ],
  "summit-series-1972": [
    "Bortalagets hall är full. Pucken slår i sargen, och klockan i tredje perioden är nästan slut.",
    "Två hockeysystem som länge levt åtskilda möts när proffsen äntligen släpps in på isen.",
    "Ett lag är byggt för en klubbliga. Det andra samlas året runt. Blålinjen är den gräns de inte får ge bort.",
    "Ett skott från slottet. Målvakten är sen. Utvisningsbåset är tomt, och hallen exploderar med sekunder kvar.",
    "Toppmötesserien 1972. Kanadas proffs möter det sovjetiska landslaget i åtta matcher, och sista minuten i Moskva avgör.",
  ],
  "turin-gold-2006": [
    "En nybyggd OS-hall. Skridskorna skär isen, och pucken letar sig längs sargen innan första bytet.",
    "Ledningen byter ägare. När sista perioden börjar är ställningen inte längre den som öppnade matchen.",
    "En back kliver upp mot blålinjen nästan innan bänken hunnit sätta sig. Skottet går högt.",
    "Ribban sjunger. Utvisningsbåset är tomt, det är fem mot fem, och hallen hör träffen innan ögonen hinner med.",
    "OS-finalen 2006 i Turin. Tre Kronor slår Finland med 3–2 efter Nicklas Lidströms slagskott i tredje perioden.",
  ],
  "slaget-i-sudden": [
    "En slutspelskväll som vägrar ta slut. Tre perioder räcker inte, sargen är märkt av slag, och bänkarna väntar.",
    "Första perioden ger var sitt mål. Sedan tystnar tavlan, period efter period, medan målvakterna täcker pucken.",
    "En tredje förlängning. Utvisningsbåset är tomt, benen är tunga, och ett skott som tar i ett benskydd räcker för att hallen ska brista.",
    "Klockan har passerat midnatt. Pucken kommer över blålinjen, en styrning vid kassen, och semifinalen är över.",
    "SM-semifinalen 2015. Växjö slår Frölunda med 2–1 efter 104 minuter, när Tuomas Kiiskinen styr in pucken i sjätte perioden.",
  ],
  "guldkampen-i-norr": [
    "En finalserie mellan två lag från samma landsände. Isen är nyspolad, sargen darrar av sång, och guldet har varit borta i en generation.",
    "Bortalaget leder serien redan innan sista matchen. Hemmaisen är full, men chanserna fastnar framför kassen.",
    "Ett tidigt mål i första perioden sätter tonen. Sedan kommer ett till, tills motståndet tar ut målvakten.",
    "Utvisningsbåset är tomt. Pucken får fritt över blålinjen mot den tomma kassen, och en generation får äntligen sjunga.",
    "Den 18 april 2013 vinner Skellefteå med 4–0 borta mot Luleå i fjärde finalen och tar sitt första SM-guld sedan 1978.",
  ],
  "montevideo-1930": [
    "En ny stadion vid en flodmynning, byggd för en turnering som världen knappt hunnit lära sig namnet på.",
    "Bara tretton lag tar båten. Flera europeiska stormakter stannar hemma, och värdarna tänker inte släppa chansen.",
    "Finalen är ett grannlagsmöte. Fyra mål mot två, och en pokal som ännu inte har någon historia att luta sig mot.",
    "Läktaren är ett hav av ljus skjorta. Kaptenen lyfter en statyett som snart får ett eget namn.",
    "Det första VM-guldet, 1930 i Montevideo. Uruguay slår Argentina med 4–2 och blir de första världsmästarna.",
  ],
  "bern-1954": [
    "Ett radiomöte mer än en tv-final. Regnet ligger kvar på gräset, och favoriten har redan krossat samma motståndare i gruppspelet.",
    "Underskattade gäster i vita tröjor jagar en ledning som tabellen säger att de inte får ta.",
    "Ställningen vänder mer än en gång. Ett sent avgörande, och en referent som tappar andan i mikrofonen.",
    "Hemma i ett sönderbombat land sitter folk kvar vid apparaterna långt efter slutsignalen.",
    "Undret i Bern, VM-finalen 1954. Västtyskland vänder 2–0 till 3–2 mot Ungerns guldlag.",
  ],
  "pele-1958": [
    "VM-final på värdarnas egen nationalarena. Nummer 10 i det ena laget är fortfarande tonåring.",
    "En sommar då ett ungt lag från andra sidan havet gör turneringen till en annan sport.",
    "Värdarna möter gästerna hemma. Protokollet fylls, och en pojke gråter i kaptens tröja när det är över.",
    "Fem mål mot två. En kant som går rakt på, och en rygg med ett nummer som arkivet aldrig glömmer.",
    "VM-finalen 1958 i Solna. Sjuttonårige Pelé och Brasilien slår Sverige med 5–2 och tar sitt första VM-guld.",
  ],
  "hurst-1966": [
    "En final som publiken tror är över. Sedan kommer förlängning, och ett skott som träffar undersidan av ribban.",
    "Hemmaplan, en pokal på sidlinjen, och en anfallare som redan har ett mål när extratiden börjar.",
    "Domaren pekar mot mittcirkeln. Läktaren är inte enig. Linjedomaren nickar.",
    "Ett tredje mål i förlängningen, och ett lag som springer mot en kunglig läktare.",
    "VM-finalen 1966 på Wembley. Geoff Hurst gör hattrick när England slår Västtyskland med 4–2 efter förlängning.",
  ],
  "maradona-1986": [
    "Hettan ligger kvar på hög höjd. Ett nummer 10 tar bollen på egen planhalva och bestämmer sig för att ingen ska få stoppa honom.",
    "Samma kvartsfinal har redan ett mål som reglerna knappt rymmer. Fyra minuter senare kommer ett annat.",
    "Fem spelare passeras. Målvakten kommer ut. Avslutningen är nästan stillsam.",
    "Kommentatorn frågar vilken planet spelaren kommer från. Kameran följer en löptur som aldrig klipps kort.",
    "VM-kvartsfinalen 1986 på Azteca. Maradona gör först Guds hand och sedan århundradets mål mot England.",
  ],
  "pasadena-bronze-1994": [
    "En medaljmatch i stekande sol. Gräset ligger långt hemifrån, och sången på läktaren hör inte hemma i den här delstaten.",
    "Ett lag som skulle störa på kontringen får aldrig sista avslutet. Varje anfall slutar i samma tysta bur.",
    "Målskyttet kommer från oväntade håll. En kant, en mitt, och sedan samma långa anfallare en gång till.",
    "Fyra bollar i nätet, inget i retur, och en gul tröja som redan vet att bronset är säkrat.",
    "VM 1994, bronsmatchen i Pasadena. Sverige slår Bulgarien med 4–0 och sjunger sig hem med medaljerna.",
  ],
  "united-1999": [
    "En europeisk final där klockan redan visar tilläggstid. Favoriten leder, och bänken har nästan gett upp hoppet.",
    "Två inhoppare väntar vid sidlinjen. Det första anfallet efter deras entré ändrar inte tavlan. Det andra gör det.",
    "Ett nickmål, och nästan direkt ett till. Motståndaren hinner inte ens ta avspark.",
    "En trippel ligger på spel: ligan, cupen hemma, och nu den största kvällen i Barcelona.",
    "Finalen i Europas klubbturnering 1999. Manchester United vänder 0–1 till 2–1 mot Bayern München i tilläggstid.",
  ],
  "chastain-1999": [
    "En straffläggning under kalifornisk kvällssol. Ett helt land har stannat vid tv:n för en final som inte ville avgöras i spel.",
    "Den sista straffen är vänsterfotad. Skytten springer redan innan bollen landat i nätet.",
    "Tröjan åker av. En svart sport-bh blir bilden som tidningarna inte kan lägga undan.",
    "Skålformad arena, fulla läktare, och ett lag som just tagit sitt andra raka stora guld.",
    "VM-finalen 1999 i Pasadena. Brandi Chastains straff ger USA guldet mot Kina.",
  ],
  "guldstriden-sista-omgangen": [
    "Sista omgången. Tre lag kan fortfarande ta guldet, och en full arena väntar på att det ska avgöras hemma.",
    "Ett tidigt mål lättar på trycket. Innan pausen kommer ett nickmål, och tavlan står still resten av matchen.",
    "Samtidigt, i en annan stad, måste en konkurrent vinna stort för att hinna ikapp. De hinner inte.",
    "Två mål, noll i retur, och en tabell som låser sig när slutsignalen går på båda arenorna.",
    "Den 28 oktober 2007 vinner IFK Göteborg med 2–0 mot Trelleborg på Ullevi och tar SM-guldet före Kalmar.",
  ],
  "sondagsmorgonen-stockholms-stad": [
    "Två klubbar från samma stad. Läktarna är delade i färger redan innan avspark, och sången hörs genom betongen.",
    "Avsparken dröjer. Något på läktaren måste redas ut innan domaren släpper bollen.",
    "Ett tidigt ledningsmål. Sedan ett till efter paus, en reducering, och till sist en anfallare som sätter spiken.",
    "En söndag förmiddag som blev eftermiddag. Bortalaget lämnar derbyt med tre mål och segern.",
    "Den 2 september 2018 vinner Djurgården med 3–1 borta mot Hammarby på Tele2 Arena.",
  ],
  "leicester-2016": [
    "På våren skrattar spelbolagen fortfarande. En nyuppflyttad klubb med en räv på märket ska inte vara med i titelstriden.",
    "En anfallare långt hemifrån jagar försvarare. Ett mittfält av brytningar. En tränare som redan var avskriven.",
    "Oddset vid säsongsstarten var femtusen mot ett. Varje kryss i huvudstaden får en hel landsända att stanna upp.",
    "En italiensk röst i omklädningsrummet, en enkel melodi, och en tabell som ingen modell hade ritat.",
    "Den engelska ligasäsongen 2015/16. Leicester City, med Claudio Ranieri och Jamie Vardy, vinner ligan på 81 poäng.",
  ],
  "messi-2022": [
    "En final som vägrar bli en vanlig kväll. Ledningen ser avgjord ut, tills ett hattrick vänder allting.",
    "Förlängning. Lika igen. En skål som glänser ovanför straffpunkten.",
    "Två nummer 10. Den ena har väntat ett helt liv på den här straffen. Den andra har redan gjort tre mål.",
    "Straffläggningen slutar 4–2. Kaptenen gråter i en mantel, och en första stjärna sys på tröjan.",
    "VM-finalen 2022 i Lusail. Argentina slår Frankrike på straffar efter 3–3, och Lionel Messi tar sitt första VM.",
  ],
  "ali-1974": [
    "Titelmatch i tungvikt före gryningen. Ringen är full, och den yngre mästaren ska vara omöjlig att träffa.",
    "Den äldre mannen väntar mot repen, rond efter rond, och låter kraften i den obesegrade ta slut.",
    "En hel stad vid floden har varit vaken sedan natten. Publiken ropar ett namn i takt.",
    "I åttonde ronden kommer högern. Den obesegrade mästaren går i däck, och promotorn får sitt oväsen.",
    "Djungelns dån, 30 oktober 1974 i Kinshasa. Muhammad Ali golvar George Foreman och tar tillbaka tungviktstiteln.",
  ],
  "king-1973": [
    "En inomhusbana under en kupol, större än någon tennishall brukar vara. En hel kontinent har satt sig vid tv:n.",
    "Utmanaren är betydligt äldre och har redan slagit den som rankas högst. I kväll bärs han in på en bår.",
    "Det spelas bäst av fem, men det är inte seten folk kom för. En symbolisk gris får följa med den som förlorar.",
    "Raka set under taket. Vinnaren lämnar banan med ett leende som tidningarna sparar.",
    "Könsduellen 1973 under kupolen i Houston. Billie Jean King slår Bobby Riggs med 6–4, 6–3, 6–3.",
  ],
  "wimbledon-epic-1980": [
    "Gräs, en herrfinal som kan kräva fem set, och två spelare som vägrar likna varandra.",
    "Den ena håller bollen i spel från baslinjen, tyst och jämn. Den andra attackerar nätet och bråkar med linjen.",
    "Ett särspel vägrar ta slut. Siffrorna klättrar långt förbi det som brukar räcka för ett set.",
    "Publiken byter sida med ljudet: först en applåd, sedan ett bu. Gräset blir grönare ju längre de håller på.",
    "Wimbledonfinalen 1980. Björn Borg slår John McEnroe i fem set, efter ett särspel i fjärde set som slutar 18–16.",
  ],
  "owens-1936": [
    "En kolstybbana och en längdhoppsgrop. Propagandaspelen har redan skrivit manus, och en sprinter från andra sidan havet håller inte med.",
    "Fyra grenar på en vecka. Varje final börjar med samma tysta koncentration och slutar med ett nytt guld.",
    "Längdhoppet avgörs med ett råd från en oväntad konkurrent. Spiken i hundra meter är redan legendarisk.",
    "En regim ville äga bilderna. Kamerorna följer i stället en löpare som tar fyra guld.",
    "OS i Berlin 1936. Jesse Owens vinner 100 meter, 200 meter, längd och stafett.",
  ],
  "fosbury-1968": [
    "En höjdhoppare vänder ryggen mot ribban. Tränarna grimaserar. Fotograferna har aldrig sett någon titta mot himlen i luften.",
    "Han är sist i hoppordningen, mer ingenjör än akrobat. Höjden han klarar ritar om vad som är möjligt.",
    "Varje försök ser ut som ett misstag tills ribban ligger kvar. Landningen är en mjuk kudde, inte en sandgrop.",
    "Segerhöjden är 2,24. Tekniken får snart hans namn, och hela fältet börjar hoppa baklänges.",
    "OS i Mexiko City 1968. Dick Fosbury tar guld i höjd med rygghoppet, ryggen före över ribban.",
  ],
  "bolt-2008": [
    "OS-final på den korta banan. Vinden är stilla, och en lång löpare är fri långt före bandet.",
    "Han skulle vara specialist på den längre sprintdistansen. I slutet av veckan har silhuetten ritats om.",
    "Ett skosnöre är oknutet. Armarna är redan utbredda. Klockan sjunker ändå.",
    "9,69 sekunder, ingen medvind att skylla på, och en bana 4 som kameran inte hinner lämna.",
    "OS-finalen på 100 meter i Peking 2008. Usain Bolt springer 9,69 och firar före mållinjen.",
  ],
  "super-saturday-2012": [
    "En lördagskväll på hemmaplan. Tre finaler ska avgöras inom en timme, och stadion har redan tappat rösten en gång.",
    "Först en mångkampare som stänger sjukampen. Sedan en längdhoppare som landar i guldgropen.",
    "Den tredje finalen är den långa löpningen. Ett hemmastöd som ljuder om, och en löpare som drar ifrån på sista varvet.",
    "Tre guld, samma kväll, samma arena. Tidningarna hinner knappt byta rubrik.",
    "Superlördagen den 4 augusti 2012. Jessica Ennis-Hill, Greg Rutherford och Mo Farah tar OS-guld inom en timme i London.",
  ],
};

const SPORT_BANKS: Record<DailySportId, Ladder> = {
  ice_hockey: [
    "En ishall där andetagen syns. Pucken slår i sargen, och publiken följer den, inte klockan.",
    "Första perioden är ett sökande. Det ena laget jagar avslutet, det andra väntar bakom blålinjen.",
    "Utvisningsbåset står tomt. Ett byte dröjer en sekund för länge, och målvakten ser pucken sent.",
    "En back kliver upp mot blålinjen. Skottet tar på ett benskydd, och returen dör vid sargen.",
    "Sista perioden fäller avgörandet: ett mål, en siren, och en is som inte får vila.",
  ],
  football: [
    "Ett gräs som redan är upprivet vid mittcirkeln. Läktaren sjunger innan domaren ens blåst igång.",
    "En matchbild med mycket boll i sidled, tills en kant plötsligt får yta att springa i.",
    "Ett inlägg som inte ska vara farligt. En anfallare kommer före backen och möter bollen i luften.",
    "Tavlan ändras en gång, sedan en gång till. Bänken står upp innan avsparken hunnit tas.",
    "Slutsignalen fryser ett resultat som tabellen får leva med: ett mål mer, och kvällen byter ägare.",
  ],
  boxing: [
    "Rep, harts och en ring som luktar tidig morgon. Den ena boxaren dansar, den andra sparar.",
    "Stöten räknar avståndet. Den andra handen väntar tills motståndaren andas ut.",
    "En rond där gardet sjunker. Publiken hör träffen innan de ser den.",
    "Domaren stegar in. Den ene räknas där han ligger, den andre vägrar lämna duken.",
    "En titelmatch som avgörs innan full tid: en träff, en räkning, och ett bälte som byter midja.",
  ],
  tennis: [
    "Ett underlag som låter olika under två par skor. Den ena stannar långt bak, den andra söker nätet.",
    "Serven är ett vapen i ett gem och en svaghet i nästa. Publiken vänder huvudet med bollen.",
    "Ett gem som borde varit slut för länge sedan. Varje boll träffar linjen och börjar om.",
    "Ett särspel där siffrorna slutar se ut som tennis. Bänken torkar händerna mellan servarna.",
    "Finalen kräver ett sista set. Den som håller nerverna vinner, och gräset eller hårdbanan minns längst.",
  ],
  athletics: [
    "Startblock, en stilla vindmätare och en stadion som håller andan innan skottet.",
    "En final där favoriten redan syns i kroppshållningen. De andra jagar en lucka som kanske inte finns.",
    "Ett mellanvarv som är för snabbt, eller ett upphopp som ser fel ut tills ribban ligger kvar.",
    "Klockan, målfoton eller måttbandet. Någon av dem hinner före firandet.",
    "Ett mästerskapsavgörande på banan: ett rekord, ett guld, och en silhuett som arkivet sparar.",
  ],
};

const GENERIC =
  /avgörandet sparas till det sista kortet|ett beskuret arkivfoto|en detalj ur arkivet|uppställningen bär favoritens börda|en arena som redan är full innan startskottet/i;

const ENGLISH_FRAGMENT =
  /\b(the|and|with|winner|amateurs|against|scoreboard|versus|defeats|summit series|nhl|special teams|champions league|battle of the sexes|super saturday|tiebreak|hardcourt|premier league|centre court|lake placid|field house|collegelag|college|knockar|knockout|floppen|cape|game|jab|volley|momentum|roaring|spectators?|crowd|packed|cheers|cheering|rink|face-?off|8-matchers)\b/i;

/** Words that belong to another sport and must not survive on this fixture. */
const FOREIGN: Record<DailySportId, RegExp> = {
  ice_hockey:
    /\b(mittcirkeln?|avspark(?:en)?|volley|nickmål|inlägg(?:et)?|boll(?:en|ar|arna)?|gräset|gräsplan(?:en)?|offside|hörnan|planhalva(?:n)?|straffläggning|straffspark(?:en)?|särspel|hårdbanan|högstaligan|ronden|startblock|längdhopp|sprinter)\b/i,
  football:
    /\b(pucken|puck|ishallen|ishall|blålinjen|skridsk\w*|plexit|slagskott|kassen|sarg(?:en)?|utvisningsbås(?:et)?|ronden|särspel|startblock|längdhopp|serven|perioden|perioder)\b/i,
  boxing:
    /\b(pucken|puck|mittcirkeln|avspark(?:en)?|volley|blålinjen|ishallen|särspel|startblock|längdhopp|nickmål|högstaligan|perioden)\b/i,
  tennis:
    /\b(pucken|puck|mittcirkeln|avspark(?:en)?|volley|nickmål|blålinjen|ishallen|ronden|slagskott|startblock|längdhopp|perioden|högstaligan)\b/i,
  athletics:
    /\b(pucken|puck|mittcirkeln|avspark(?:en)?|volley|nickmål|blålinjen|ishallen|ronden|slagskott|särspel|perioden|högstaligan)\b/i,
};

function sportKey(sport: string | null | undefined): DailySportId | null {
  const text = (sport ?? "").toLowerCase();
  if (text.includes("hockey") || text.includes("ishockey")) return "ice_hockey";
  if (text.includes("football") || text.includes("fotboll") || text.includes("soccer")) return "football";
  if (text.includes("box")) return "boxing";
  if (text.includes("tennis")) return "tennis";
  if (text.includes("athletic") || text.includes("friidrott") || text.includes("track")) return "athletics";
  return null;
}

function ladderFor(fixtureId: string): Ladder | null {
  const key = ALIASES[fixtureId] ?? fixtureId;
  return LADDERS[key] ?? null;
}

export function dailyClueFitsSport(line: string, sport: DailySportId): boolean {
  return lineFitsSport(line, sport);
}

function lineFitsSport(line: string, sport: DailySportId | null): boolean {
  if (ENGLISH_FRAGMENT.test(line)) return false;
  if (sport && FOREIGN[sport].test(line)) return false;
  return true;
}

function uniqueLines(lines: readonly string[]): string[] {
  const kept: string[] = [];
  for (const line of lines) {
    const text = line.trim();
    if (!text || GENERIC.test(text)) continue;
    if (kept.includes(text)) continue;
    kept.push(text);
  }
  return kept;
}

function fillToFive(lines: string[], sportId: DailySportId | null): string[] {
  if (lines.length >= 5) return lines.slice(0, 5);
  const bank = SPORT_BANKS[sportId ?? "football"];
  const filled = [...lines];
  for (const line of bank) {
    if (filled.length >= 5) break;
    if (!filled.includes(line)) filled.push(line);
  }
  return filled.slice(0, 5);
}

/** Five distinct Swedish cards for one daily fixture. Known matches use their own ladder. */
export function publishDailyClues(
  fixtureId: string,
  clues: readonly string[] | null | undefined,
  sport?: string | null,
): string[] {
  const sportId = sportForFixture(fixtureId) ?? sportKey(sport);
  const written = ladderFor(fixtureId);
  if (written) {
    return fillToFive(
      written.filter((line) => lineFitsSport(line, sportId)),
      sportId,
    );
  }
  const cleaned = uniqueLines((clues ?? []).map((clue) => localizeDailyClue(clue))).filter((line) =>
    lineFitsSport(line, sportId),
  );
  return fillToFive(cleaned, sportId);
}
