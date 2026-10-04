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
    finalScore: "USA 4–3 Sovjetunionen",
    decisivePlay: "Mike Eruziones mål i tredje perioden",
    videoUrl: null,
    story:
      "En hockeymatch i medaljomgången i Adirondackbergen blev en sändning från kalla kriget. Sovjet hade behandlat sporten som ett statligt yrke i två decennier. Det amerikanska laget var collegespelare som inte skulle hålla jämna steg. Mike Eruzione gjorde mål mitt i tredje perioden, och Jim Craig höll ledningen den sista minuten. Sirenen gjorde en rink till ett politiskt minne.",
  },
  "summit-series-1972": {
    year: 1972,
    venue: "Luzjnikis ispalats, Moskva",
    finalScore: "Kanada 6–5 Sovjetunionen",
    decisivePlay: "Paul Henderson, 34 sekunder kvar",
    videoUrl: null,
    story:
      "Det som kallades en uppvisning blev en åttamatchersstrid mellan två hockeysystem. Inför den åttonde matchen stod serien lika, hallen låg i Moskva och inget av länderna behandlade kvällen som en vänskapsmatch. Paul Henderson gjorde mål med 34 sekunder kvar och vann serien, inte bara matchen. Målet stängde den första riktiga dörren mellan de två hockeyvärldarna.",
  },
  "comaneci-1976": {
    year: 1976,
    venue: "Montréal Forum",
    finalScore: "10,00",
    decisivePlay: "Den första olympiska perfekta tian, i barr",
    videoUrl: null,
    story:
      "Gymnastikarenan i Montréal väntade på en poäng som tavlan aldrig hade byggts för att visa. Nadia Comăneci, fjorton år, landade ett barrprogram som domarna satte högst på skalan. Tavlan skrev 1,00 för att den inte hade plats för en tia. Det enda märket ritade om vad en olympisk serie fick vara.",
  },
  "dream-team-1992": {
    year: 1992,
    venue: "Palau Municipal d'Esports, Barcelona",
    finalScore: "USA 117–85 Kroatien",
    decisivePlay: "Den första NBA-truppen som stänger en OS-final",
    videoUrl: null,
    story:
      "Under större delen av OS-historien hade USA skickat collegespelare, och resten av världen hade börjat hinna ikapp. Barcelona ändrade regeln och släppte in proffs. Kroatien, med Dražen Petrović, mötte den truppen i guldmatchen. Slutresultatet 117–85 meddelade att amatörernas tid i olympisk basket var över.",
  },
  "bolt-beijing-2008": {
    year: 2008,
    venue: "Nationella stadion, Peking",
    finalScore: "9,69",
    decisivePlay: "Världsrekord på 100 meter, avsaktat före mållinjen",
    videoUrl: null,
    story:
      "Finalen i Fågelboet skulle vara ett lopp hela vägen in i bandet. Usain Bolt var fri tidigt, tittade åt sidan och slutade driva före linjen. Han sprang ändå 9,69, ett världsrekord, i ett OS-final på 100 meter. Tiden betydde något, och det gjorde också att rekordet kom mitt i ett firande som redan hade börjat.",
  },
  "pele-sweden-1958": {
    year: 1958,
    venue: "Råsunda, Solna",
    finalScore: "Brasilien 5–2 Sverige",
    decisivePlay: "Pelé, 17 år, gör två mål i finalen",
    videoUrl: null,
    story:
      "VM-finalen spelades på värdens egen arena, mot ett Sverige som publiken väntade sig skulle behålla pokalen hemma. Brasilien skickade in en sjuttonåring i det larmet. Pelé gjorde två mål i en 5–2-seger. Matchen är eftermiddagen då en tonåring fick VM att se ut som en annan sport.",
  },
  "hand-of-god-1986": {
    year: 1986,
    venue: "Estadio Azteca, Mexico City",
    finalScore: "Argentina 2–1 England",
    decisivePlay: "Två Maradona-mål, med fyra minuters mellanrum",
    videoUrl: null,
    story:
      "Kvartsfinalen kom fyra år efter Falklandskriget, och stadion i Mexico City kände politiken före avspark. Diego Maradona gjorde mål med handen, utan att bli bestraffad, och sprang sedan igenom Englands straffområde och gjorde mål igen. Det ena målet var otillåtet och det andra är fortfarande måttet på en soloraid. Argentina lämnade med 2–1 och båda ögonblicken knutna till samma namn.",
  },
  "rumble-in-the-jungle-1974": {
    year: 1974,
    venue: "Stade du 20 Mai, Kinshasa",
    finalScore: "Ali vinner på knockout, rond 8",
    decisivePlay: "Vänster-höger-kombinationen efter rope-a-dope",
    videoUrl: null,
    story:
      "Kinshasa satte upp en titelmatch i tungvikt som ett nationellt skådespel, med en diktators stadion full före gryningen. George Foreman var mästaren och slagskytten. Muhammad Ali lutade sig mot repen, lät kraften ta slut och avslutade natten i åttonde ronden. Nedslagningen gav Ali titeln tillbaka och gav rope-a-dope dess namn.",
  },
  "pasadena-bronze-1994": {
    year: 1994,
    venue: "Rose Bowl, Pasadena",
    finalScore: "Sverige 4–0 Bulgarien",
    decisivePlay: "Kennet Andersson gör två mål i bronsmatchen",
    videoUrl: null,
    story:
      "VM-bronsmatchen i Pasadena spelades i stekande sol, långt från det svenska sommargräset. Bulgarien hade skrällt sig fram till medaljmatch. Sverige svarade med 4–0. Tomas Brolin, Håkan Mild och Kennet Andersson, två gånger, gjorde målen. Bronshjältarna sjöng sig hem med medaljerna.",
  },
  "turin-gold-2006": {
    year: 2006,
    venue: "Palasport Olimpico, Turin",
    finalScore: "Sverige 3–2 Finland",
    decisivePlay: "Nicklas Lidströms slagskott, nio sekunder in på tredje perioden",
    videoUrl: null,
    story:
      "OS-finalen i Turin stod 2–2 när den sista perioden började. Mats Sundin vann tekningen, Peter Forsberg drog in pucken och lade tillbaka, och Nicklas Lidström sköt ett slagskott från blålinjen högt upp i krysset. 3–2 efter nio sekunder. Tre Kronor höll ledningen mot Finland och tog guldet.",
  },
  "slaget-i-sudden": {
    year: 2015,
    venue: "Vida Arena, Växjö",
    finalScore: "Växjö 2–1 Frölunda",
    decisivePlay: "Tuomas Kiiskinen, fyra minuter in i sjätte perioden",
    videoUrl: null,
    story:
      "SM-semifinalen mellan Växjö och Frölunda den 31 mars 2015 vägrade dö. Nicholas Johnson gav hemmalaget ledningen, Anton Blidh kvitterade, och sedan stod tavlan still genom två hela förlängningar. Efter 104 minuter styrde Tuomas Kiiskinen in 2–1. Det var den fjärde längsta slutspelsmatchen i svensk hockey.",
  },
  "guldkampen-i-norr": {
    year: 2013,
    venue: "Coop Arena, Luleå",
    finalScore: "Luleå 0–4 Skellefteå",
    decisivePlay: "Oscar Möller öppnar, och Skellefteå gör rent hus i finalserien",
    videoUrl: null,
    story:
      "Den 18 april 2013 möttes två norrlandsrivaler i fjärde SM-finalen. Skellefteå ledde redan serien och vann med 4–0 borta mot Luleå. Oscar Möller satte 1–0 efter drygt tre minuter, Erik Forssell gjorde två mål, och Johan Forsberg satte 3–0. Fyra raka finalsegrar gav Skellefteå det första SM-guldet sedan 1978.",
  },
  "sondagsmorgonen-stockholms-stad": {
    year: 2018,
    venue: "Tele2 Arena, Stockholm",
    finalScore: "Hammarby 1–3 Djurgården",
    decisivePlay: "Kerim Mrabti gör 0–1, Aliou Badji sätter 3–1",
    videoUrl: null,
    story:
      "Söndagen den 2 september 2018 försenades Stockholmsderbyt en halvtimme innan Hammarby och Djurgården kunde sparka igång på Tele2 Arena. Djurgården vann med 3–1 efter mål av Kerim Mrabti, Haris Radetinac och Aliou Badji, med Vladimir Rodićs reducering däremellan. Det var Djurgårdens första allsvenska derbyseger mot Hammarby på sju år.",
  },
  "farjestad-skelleftea-2011": {
    year: 2011,
    venue: "Löfbergs Lila Arena, Karlstad",
    finalScore: "Färjestad 4–1 Skellefteå",
    decisivePlay: "Femte finalen stängs hemma, serien slutar 4–1",
    videoUrl: null,
    story:
      "Den 14 april 2011 avgjordes SM-finalserien i femte matchen. Färjestad tog emot Skellefteå på Löfbergs Lila Arena och vann med 4–1. Serien slutade 4–1, och klubben tog sitt nionde SM-guld inför egen publik.",
  },
  "brynas-skelleftea-2012": {
    year: 2012,
    venue: "Läkerol Arena, Gävle",
    finalScore: "Brynäs 2–0 Skellefteå",
    decisivePlay: "Jakob Silfverberg och Ryan Gunderson i sjätte finalen",
    videoUrl: null,
    story:
      "Brynäs hundraårsår slutade i en sjätte SM-final den 20 april 2012. Skellefteå hölls nollade på Läkerol Arena. Jakob Silfverberg gjorde 1–0 och Ryan Gunderson 2–0. Det blev klubbens trettonde SM-guld, det första sedan 1999.",
  },
  "skelleftea-farjestad-2014": {
    year: 2014,
    venue: "Skellefteå Kraft Arena",
    finalScore: "Skellefteå 4–0 Färjestad i matcher",
    decisivePlay: "Fyra raka finalsegrar",
    videoUrl: null,
    story:
      "SM-finalen 2014 blev ett svep. Skellefteå slog Färjestad i fyra raka matcher och stängde guldet hemma. Serien slutade 4–0.",
  },
  "frolunda-skelleftea-2016": {
    year: 2016,
    venue: "Skellefteå Kraft Arena",
    finalScore: "Skellefteå 3–5 Frölunda",
    decisivePlay: "Artturi Lehkonen gör två tidiga mål",
    videoUrl: null,
    story:
      "Den 24 april 2016 avgjordes SM-finalserien i femte matchen, borta för Frölunda. De vann med 5–3 mot Skellefteå. Artturi Lehkonen gjorde två tidiga mål, och klubben tog sitt första SM-guld sedan 2005.",
  },
  "aik-djurgarden-2017": {
    year: 2017,
    venue: "Friends Arena",
    finalScore: "AIK 1–1 Djurgården",
    decisivePlay: "Chinedu Obasis straff och Aliou Badjis kvittering",
    videoUrl: null,
    story:
      "Den 27 augusti 2017 möttes AIK och Djurgården i tvillingderbyt. Chinedu Obasi satte en straff, och Aliou Badji kvitterade med en nick. Matchen slutade 1–1.",
  },
  "malmo-ifk-2015": {
    year: 2015,
    venue: "Swedbank Stadion, Malmö",
    finalScore: "Malmö FF 2–1 IFK Göteborg",
    decisivePlay: "Kári Árnason öppnar, två straffar avgör",
    videoUrl: null,
    story:
      "Den 9 augusti 2015 tog Malmö FF emot IFK Göteborg i toppstriden och vann med 2–1. Kári Árnason öppnade, Markus Rosenberg utökade på straff och Emil Salomonsson reducerade på straff.",
  },
  "elfsborg-djurgarden-2006": {
    year: 2006,
    venue: "Borås Arena",
    finalScore: "Elfsborg 1–0 Djurgården",
    decisivePlay: "Joakim Sjöhage avgör sista omgången",
    videoUrl: null,
    story:
      "Allsvenskans sista omgång 2006 gav Elfsborg guldet hemma mot Djurgården. Joakim Sjöhage gjorde 1–0. Det var klubbens första SM-guld på 45 år.",
  },
  "hammarby-aik-2016": {
    year: 2016,
    venue: "Tele2 Arena",
    finalScore: "Hammarby 0–3 AIK",
    decisivePlay: "Tre mål före paus",
    videoUrl: null,
    story:
      "Den 24 juli 2016 var derbyt avgjort före paus. AIK vann med 3–0 borta mot Hammarby efter mål av Haukur Hauksson, Eero Markkanen och Ebenezer Ofori.",
  },
  "guldstriden-sista-omgangen": {
    year: 2007,
    venue: "Ullevi, Göteborg",
    finalScore: "IFK Göteborg 2–0 Trelleborg",
    decisivePlay: "Thomas Olsson och Pontus Wernbloom före paus",
    videoUrl: null,
    story:
      "Allsvenskans sista omgång 2007 avgjordes den 28 oktober. IFK Göteborg tog emot Trelleborg inför 41 471 på Ullevi och vann med 2–0, efter mål av Thomas Olsson och Pontus Wernbloom redan före paus. Kalmar och Djurgården kunde inte gå förbi. Blåvitt tog SM-guldet med 49 poäng, en poäng före Kalmar.",
  },
  "duplantis-2026": {
    year: 2026,
    venue: "IFU Arena, Uppsala",
    finalScore: "6,31 meter",
    decisivePlay: "Ett försök på 6,31 efter tre tidigare höjder",
    videoUrl: null,
    story:
      "Den 12 mars 2026 höjde Armand Duplantis ribban till 6,31 meter på Mondo Classic i Uppsala. Han hade redan klarat tre höjder i första försöket. Ett hopp till räckte, och stavrekordet blev hans femtonde.",
  },
  "wimbledon-epic-1980": {
    year: 1980,
    venue: "Centre Court, All England Club",
    finalScore: "1–6, 7–5, 6–3, 6–7 (16–18), 8–6",
    decisivePlay: "Borg stänger femte set med 8–6",
    videoUrl: null,
    story:
      "Centre Court hade is i Björn Borg och oväsen i John McEnroe, och herrfinalen vägrade korta någon av dem. Tiebreaket i fjärde set gick till 18–16, så långt att setet själv blev matchen folk minns. Borg vann ändå femte set med 8–6. Det var hans femte raka Wimbledon, taget på andra sidan ett tiebreak som ritade om vad en final fick kräva.",
  },
  "handboll-em-2022": {
    year: 2022,
    venue: "Budapest Handball Arena",
    finalScore: "Sverige 27–26 Spanien",
    decisivePlay: "Niclas Ekbergs straff efter slutsignalen",
    videoUrl: null,
    story:
      "EM-finalen 30 januari 2022 stod och vägde tills klockan var noll. Niclas Ekberg fick en straff efter signalen och satte den. Sverige vann med 27–26 mot Spanien och tog sitt första EM-guld sedan 2002.",
  },
  "saint-cyr-1956": {
    year: 1956,
    venue: "Stockholms olympiastadion",
    finalScore: "860 poäng",
    decisivePlay: "Henri Saint Cyr och Juli i dressyr",
    videoUrl: null,
    story:
      "Ridsporten vid OS 1956 fick stanna i Stockholm, eftersom hästarna inte släpptes in i Australien. Henri Saint Cyr tog individuellt guld på Juli med 860 poäng och ledde även Sverige till lagguld.",
  },
  "tokyo-hopp-2021": {
    year: 2021,
    venue: "Baji Koen, Tokyo",
    finalScore: "Sverige före USA på tid",
    decisivePlay: "Peder Fredricsons ankarritt i omhoppningen",
    videoUrl: null,
    story:
      "Den 7 augusti 2021 stod laghoppningen lika på fel. Omhoppningen blev felfri, och tiden avgjorde. Peder Fredricson, Henrik von Eckermann och Malin Baryard-Johnsson tog Sveriges första OS-guld i laghoppning sedan 1924.",
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
