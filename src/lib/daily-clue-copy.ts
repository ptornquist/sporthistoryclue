import { SUMMIT_SERIES_1972_CARDS, SVERIGE_SOVJET_1984_CARDS } from "@/lib/case-clues";
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

/** Kort 1 arena, 2 epok, 3 taktik, 4 avgörande skede, 5 klimax. */
const LADDERS: Record<string, Ladder> = {
  "miracle-1980": [
    "Pucken tar i sargen i en trång olympisk ishall. Isen är nyspolad, och läktaren är full redan vid första tekningen.",
    "Semifinal under kalla kriget. Ett universitetslag med korta byten möter ett landslag vant vid långa perioder.",
    "Blålinjen hålls kort. Utvisningarna är få, utvisningsbåset märks knappt, och det spelas fem mot fem.",
    "Kaptenens skott från slottet går in med tio minuter kvar av perioden. Resten handlar om att hålla ledningen.",
    "Miraklet på isen, den 22 februari 1980. USA:s universitetslag slår Sovjetunionen med 4–3 och tar två dagar senare OS-guld mot Finland, 4–2.",
  ],
  "summit-series-1972": SUMMIT_SERIES_1972_CARDS,
  "sverige-sovjet-1984": SVERIGE_SOVJET_1984_CARDS,
  "turin-gold-2006": [
    "En ny OS-hall med omkring 12 000 platser. Pucken glider längs sargen före första tekningen.",
    "Final mellan två nordiska grannar. Ledningen har växlat, och tredje perioden inleds oavgjort.",
    "Båda lagen har en man i utvisningsbåset. Det är fyra mot fyra, och en back får tid vid blålinjen.",
    "Tio sekunder in i perioden. Tekningen vinns, en klubba går av, och slagskottet tar i ribban innan det ramlar in.",
    "OS-finalen den 26 februari 2006 i Turin. Tre Kronor slår Finland med 3–2 sedan Nicklas Lidström gjort mål tio sekunder in i tredje perioden.",
  ],
  "slaget-i-sudden": [
    "En slutspelshall där isen spolas om mellan perioderna. Sargen är redan märkt, och ordinarie tid räcker inte.",
    "SM-semifinal. Första perioden ger var sitt mål. Sedan står tavlan still genom flera förlängningar.",
    "Målvakterna täcker returerna. Kedjorna kortas, bytena blir sega, och i sista förlängningen är utvisningsbåset inte med.",
    "Efter 104 minuter kommer pucken över blålinjen. En styrning vid kassen i sjätte perioden räcker.",
    "SM-semifinalen 2015. Växjö slår Frölunda med 2–1 när Tuomas Kiiskinen styr in pucken i sjätte perioden.",
  ],
  "guldkampen-i-norr": [
    "En finalhall i norr. Isen är nyspolad, sargen tar emot sången, och pucken släpps till seriens sista match.",
    "Gästerna leder matchserien med 3–0. Guldet har varit borta ur klubben sedan 1978, och hemmapubliken behöver en vändning.",
    "Drygt tre minuter in i första perioden är det mål. Sedan ett till från slottet, och blålinjen hålls kort.",
    "Hemmalaget tar ut målvakten. Utvisningsbåset fäller inte avgörandet: pucken går in i tom kasse sent i tredje perioden.",
    "Den 18 april 2013 vinner Skellefteå med 4–0 borta mot Luleå i fjärde finalen. Matchserien slutar 4–0, klubbens första SM-guld sedan 1978.",
  ],
  "montevideo-1930": [
    "En ny stadion vid en flodmynning, byggd för turneringen. Läktaren är ett hav av ljusa skjortor.",
    "Det första världsmästerskapet. Tretton lag är på plats, och flera europeiska lag har stannat hemma.",
    "Finalen är ett grannlagsmöte. Värdarna pressar högt, gästerna söker ytor på kontring.",
    "Värdarna drar ifrån i andra halvlek. Ett sent mål sätter punkt, och pokalen väntar vid sidlinjen.",
    "Den 30 juli 1930 i Montevideo. Uruguay slår Argentina med 4–2 och blir de första världsmästarna.",
  ],
  "bern-1954": [
    "Regn på en tung gräsplan. Finalen följs mer i radio än på tv, och sidlinjen är en lervälling.",
    "Samma lag möttes i gruppspelet, där favoriten vann med 8–3. Gästerna i vitt är avskrivna inför finalen.",
    "Favoriten leder med 2–0. Gästerna söker djupled bakom ett högt backled.",
    "Från 0–2 hämtas ställningen upp. Segermålet kommer sent från högerkanten, och radioreferenten tappar andan.",
    "Undret i Bern, den 4 juli 1954. Västtyskland vänder 2–0 till 3–2 mot Ungern, och Helmut Rahn gör segermålet.",
  ],
  "pele-1958": [
    "Värdarnas nationalarena en junikväll. Gräset är kort, och finalen spelas inför hemmapublik.",
    "Ett ungt lag från Sydamerika har tagit över turneringen. Nummer 10 är fortfarande tonåring.",
    "Gästerna slår djupt och byter sida fort. Kanterna går rakt på, och värdarnas backlinje får springa bakåt.",
    "Tavlan rusar i andra halvlek. Tonåringen gör två mål och gråter när slutsignalen går.",
    "VM-finalen den 29 juni 1958 på Råsunda i Solna. Sjuttonårige Pelé och Brasilien slår Sverige med 5–2 och tar sitt första VM-guld.",
  ],
  "hurst-1966": [
    "Hemmaplan och en pokal vid sidlinjen. Finalarenan är fullsatt redan före avspark.",
    "Ordinarie tid slutar lika. Förlängning väntar, och en anfallare har redan ett mål.",
    "Inlägg från kanten och löpningar mot bortre stolpen. Ribban är med i spelet mer än en gång.",
    "I förlängningen träffar ett skott undersidan av ribban och studsar ner. Linjedomaren ger mål, och domaren pekar mot mittcirkeln.",
    "VM-finalen den 30 juli 1966 på Wembley. Geoff Hurst gör hattrick när England slår Västtyskland med 4–2 efter förlängning.",
  ],
  "maradona-1986": [
    "Hög höjd och het eftermiddag. En fullsatt kvartsfinalarena, och bollen rullar trögt i den tunna luften.",
    "Fyra år efter ett krig mellan länderna. Ett nummer 10 bär sitt lag genom turneringen.",
    "Han tar bollen på egen planhalva. Fem motståndare ska passeras, och målvakten kommer ut.",
    "Först en hand i straffområdet som domaren godkänner. Fyra minuter senare en löptur från egen planhalva som ingen hinner ifatt.",
    "VM-kvartsfinalen den 22 juni 1986 på Azteca. Diego Maradona gör Guds hand och århundradets mål när Argentina slår England med 2–1.",
  ],
  "pasadena-bronze-1994": [
    "Stekande sol på en skålformad arena långt hemifrån. Gräset är torrt, och sången på läktaren tillhör inte värdlandet.",
    "Bronsmatch. Ett europeiskt lag som levt på anfall möter ett lag som ska störa på kontring.",
    "Motståndarna får aldrig sista avslutet. Målen kommer från kant, mittfält och anfall, och buren i andra änden står orörd.",
    "Fyra mål, inget i retur. Medaljen är säkrad långt före slutsignalen.",
    "Bronsmatchen i VM den 16 juli 1994 i Pasadena. Sverige slår Bulgarien med 4–0.",
  ],
  "united-1999": [
    "Europeisk final, redan tilläggstid. Sidlinjen är full av inhoppare, och klockan går mot slutsignal.",
    "Ligan och cupen hemma är vunna. Den tredje titeln kräver en vändning när motståndaren leder.",
    "Två anfallare kommer in sent. Det första anfallet efter bytet ändrar inte tavlan.",
    "Ett mål i tilläggstid, och nästan genast ett till i målområdet. Motståndaren hinner inte ta avspark.",
    "Finalen i Europas klubbturnering den 26 maj 1999. Manchester United vänder 0–1 till 2–1 mot Bayern München genom Teddy Sheringham och Ole Gunnar Solskjær.",
  ],
  "chastain-1999": [
    "Kvällssol över en skålformad arena. Ordinarie tid och förlängning har gått utan mål.",
    "Ett VM som fyllt arenorna. Finalen ska avgöras från straffpunkten.",
    "Straffläggning. Den sista skytten är vänsterfotad och tar kort ansats.",
    "Straffen går i nät. Tröjan är av innan bollen landat, och bilden blir finalens.",
    "VM-finalen den 10 juli 1999 i Pasadena. Brandi Chastains vänsterfotade straff ger USA guldet mot Kina efter 0–0, med 5–4 i straffläggningen.",
  ],
  "guldstriden-sista-omgangen": [
    "Sista omgången på en full hemmaarena. Tre lag kan fortfarande ta guldet när domaren blåser igång.",
    "En parallell match i en annan stad kan ändra tabellen. Hemma krävs seger oavsett den andra resultatraden.",
    "Ett tidigt mål lättar trycket. Innan paus kommer ett nickmål, och mittfältet släpper inte in något.",
    "Två mål, inget i retur. Slutsignalerna går nästan samtidigt, och konkurrenten hinner inte ikapp.",
    "Den 28 oktober 2007 vinner IFK Göteborg med 2–0 mot Trelleborg på Ullevi. Thomas Olsson och Pontus Wernbloom gör målen, och SM-guldet går före Kalmar.",
  ],
  "sondagsmorgonen-stockholms-stad": [
    "Derby på en betongarena. Läktarna är delade i färger före avspark, och sången går genom taket.",
    "Söndag förmiddag, två klubbar från samma stad. Avsparken dröjer tills läktaren lugnat sig.",
    "Bortalaget tar ledningen tidigt, utökar efter paus och släpper in en reducering.",
    "Ett tredje mål sätter spiken. Derbyt är färdigspelat före slutsignalen.",
    "Den 2 september 2018 vinner Djurgården med 3–1 borta mot Hammarby på Tele2 Arena. Målen görs av Kerim Mrabti, Haris Radetinac och Aliou Badji.",
  ],
  "leicester-2016": [
    "En ligamatch på en liten hemmaarena. Våren är sen, och tabellen ser inte ut som den ritades i augusti.",
    "Spelbolagen har slutat skratta. En nyuppflyttad klubb ligger i topp i den engelska högstaligan.",
    "En anfallare jagar backlinjen, mittfältet bryter, och märket på tröjan är en räv. Tränaren var avskriven redan i höstas.",
    "Konkurrenterna tappar poäng med matcher kvar. Titeln kan inte längre tas ifrån dem.",
    "Den engelska ligasäsongen 2015/16. Leicester City vinner på 81 poäng med Claudio Ranieri och Jamie Vardy. Oddset i augusti var 5 000 mot 1.",
  ],
  "messi-2022": [
    "Finalarena med taket stängt och nylagt gräs. Kvällen är byggd för en match som kan dra över tiden.",
    "Två anfall som redan mötts i turneringen. Kaptenen på ena sidan jagar sitt första stora guld.",
    "Två nummer 10. Den ena styr från egen planhalva, den andra attackerar ytan bakom backlinjen.",
    "Ett hattrick vänder en ledning som såg klar ut. Förlängningen slutar lika, och straffpunkten får avgöra.",
    "VM-finalen den 18 december 2022 i Lusail. Argentina slår Frankrike med 4–2 på straffar efter 3–3, och Lionel Messi tar sitt första VM i en mantel.",
  ],
  "ali-1974": [
    "Ringen är uppe före gryningen. Harts på duken, repen är spända, och starttiden är lagd för tv-tittare på andra sidan Atlanten.",
    "Tungviktstiteln står på spel vid en flod. Den yngre mästaren är obesegrad, den äldre har väntat på revanschen.",
    "Den äldre boxaren lutar mot repen, tar stötarna på armarna och låter kraften ta slut, rond för rond.",
    "I åttonde ronden landar högern. Den obesegrade går i däck, och domaren räknar ut matchen.",
    "Den 30 oktober 1974 i Kinshasa. Muhammad Ali golvar George Foreman i åttonde ronden och tar tillbaka tungviktstiteln.",
  ],
  "king-1973": [
    "En inomhusbana under en kupol, större än en vanlig tennishall. Underlaget är hårt, och banan är byggd för en tv-kväll.",
    "Bäst av fem set. Utmanaren är äldre, har redan slagit den högst rankade, och bärs in på en bärstol.",
    "Den ena servar och söker nätet. Den andra tar bollen tidigt och styr gemen från baslinjen. En symbolisk gris står på spel.",
    "Raka set under taket. Varje gem stängs utan att ställningen vänder, och publiken har sett vem som styr.",
    "Könsduellen den 20 september 1973 under kupolen i Houston. Billie Jean King slår Bobby Riggs med 6–4, 6–3, 6–3.",
  ],
  "wimbledon-epic-1980": [
    "Herrfinal på gräs. Huvudbanan är klippt kort, och matchen kan gå till fem set.",
    "Två spelare med olika spel. Den ena är tyst vid baslinjen, den andra attackerar nätet och diskuterar linjerna.",
    "Serven möts tidigt. Den ene håller bollen i spel, den andre söker avslut vid nät.",
    "Fjärde set kräver ett särspel. Siffrorna går till 18–16, långt förbi det som brukar räcka.",
    "Wimbledonfinalen 1980. Björn Borg slår John McEnroe med 1–6, 7–5, 6–3, 6–7, 8–6.",
  ],
  "owens-1936": [
    "En kolstybbana och en längdhoppsgrop. Startblocken står redo, och vinden mäts före varje lopp.",
    "Propagandaspel i huvudstaden. Fyra grenar på en vecka, och värdarnas manus är redan skrivet.",
    "I längdhoppet kommer ett råd från en konkurrent i värdnationens tröja: flytta ansatsen. På 100 meter syns luckan redan i spurten.",
    "Fyra finaler, fyra segrar. Målfotot behövs inte när avståndet syns från läktaren.",
    "OS i Berlin 1936. Jesse Owens vinner 100 meter, 200 meter, längd och stafett. I gropen fick han rådet av Luz Long.",
  ],
  "fosbury-1968": [
    "Höjdhoppsställning på hög höjd. Landningen är en mjuk matta, inte en sandgrop.",
    "Ett OS där luften är tunn. Hopparen som ingen sett stilen på är sist i ordningen.",
    "Han vänder ryggen mot ribban och tittar upp i luften. De andra tränarna antecknar.",
    "Ribban ligger kvar på 2,24. Varje försök ser fel ut tills den inte faller.",
    "OS i Mexiko City 1968. Dick Fosbury tar guld i höjd med rygghoppet, ryggen före över ribban, på 2,24 meter.",
  ],
  "bolt-2008": [
    "OS-final på 100 meter. Vindmätaren står stilla, och startblocken sitter i bana 4.",
    "Favoriten är känd för den längre sprintdistansen. Den korta banan ska inte vara hans.",
    "Ett skosnöre är oknutet redan i starten. Steglängden är annorlunda än de andras.",
    "Han är fri långt före bandet och slår ut armarna innan linjen. Klockan hinner ändå före firandet.",
    "OS-finalen på 100 meter i Peking 2008. Usain Bolt springer 9,69 i bana 4, utan medvind, och firar före mållinjen.",
  ],
  "super-saturday-2012": [
    "Hemmastadion en lördagskväll. Tre finaler ska avgöras inom samma timme.",
    "Först en sjukamp som stängs med 800 meter. Sedan en längdhoppsgrop som väntar på ett guldhopp.",
    "Den tredje finalen är 10 000 meter. Tempot ska knäcka fältet, och hemmastödet har redan varit uppe en gång.",
    "Sista varvet på den långa distansen. Hemmalöparen drar ifrån, och klockan räcker till guld.",
    "Superlördagen den 4 augusti 2012 i London. Jessica Ennis-Hill, Greg Rutherford och Mo Farah tar OS-guld inom en timme.",
  ],
};

const SPORT_BANKS: Record<DailySportId, Ladder> = {
  ice_hockey: [
    "En ishall där andetagen syns. Pucken slår i sargen före första tekningen.",
    "Första perioden är ett sökande. Det ena laget jagar avslutet, det andra väntar bakom blålinjen.",
    "Bytena är korta. Utvisningsbåset lämnas oanvänt, och spelet stannar fem mot fem.",
    "En back kliver upp mot blålinjen. Skottet tar på ett benskydd, och returen dör vid sargen.",
    "Sista perioden fäller avgörandet: ett mål, en siren, och en is som spolas om.",
  ],
  football: [
    "Gräset är nyslaget och mittcirkeln redan sliten. Läktaren sjunger före avspark.",
    "Bollen går i sidled tills en kant får yta. Matchbilden tillhör det lag som orkar längst.",
    "Ett inlägg som ser ofarligt ut. Anfallaren kommer före backen och nickar.",
    "Tavlan ändras två gånger. Bänken står upp innan avsparken hunnit tas.",
    "Slutsignalen låser ett mål mer än motståndaren. Kvällen byter ägare.",
  ],
  boxing: [
    "Rep, harts och en ring som luktar tidig morgon. Den ena boxaren rör sig, den andra sparar.",
    "Titelmatch. Stöten mäter avståndet, och den andra handen väntar.",
    "Gardet sjunker en rond. Träffarna landar på armarna tills en öppning kommer.",
    "Domaren stegar in. Den ene räknas där han ligger, den andre står kvar i mitten.",
    "Matchen avgörs före full tid: en träff, en räkning, och ett bälte som byter midja.",
  ],
  tennis: [
    "Ett underlag som låter olika under två par skor. Den ena stannar vid baslinjen, den andra söker nätet.",
    "Serven är ett vapen i ett gem och en svaghet i nästa. Publiken följer bollen.",
    "Ett gem som borde varit slut. Varje boll träffar linjen och ger nytt liv.",
    "Ett särspel där siffrorna slutar se vanliga ut. Handduken kommer fram mellan servarna.",
    "Finalen kräver ett sista set. Den som håller nerverna tar segern.",
  ],
  athletics: [
    "Startblock, en stilla vindmätare och en stadion som väntar på skottet.",
    "Final. Favoriten syns i hållningen, de andra jagar en lucka.",
    "Ett mellanvarv som är för snabbt, eller ett upphopp som ser fel ut tills ribban ligger kvar.",
    "Klockan, målfotot eller måttbandet hinner före firandet.",
    "Ett mästerskapsavgörande: ett rekord, ett guld, och en tid som står sig.",
  ],
};

const GENERIC =
  /avgörandet sparas till det sista kortet|ett beskuret arkivfoto|en detalj ur arkivet|uppställningen bär favoritens börda|en arena som redan är full innan startskottet/i;

const ENGLISH_FRAGMENT =
  /\b(the|and|with|winner|amateurs|against|scoreboard|versus|defeats|summit series|special teams|champions league|battle of the sexes|super saturday|tiebreak|hardcourt|premier league|centre court|lake placid|field house|collegelag|college|knockar|knockout|floppen|cape|game|jab|volley|momentum|roaring|spectators?|crowd|packed|cheers|cheering|rink|face-?off|8-matchers)\b/i;

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
