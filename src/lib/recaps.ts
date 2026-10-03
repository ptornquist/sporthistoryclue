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
  "wimbledon-epic-1980": {
    year: 1980,
    venue: "Centre Court, All England Club",
    finalScore: "1–6, 7–5, 6–3, 6–7 (16–18), 8–6",
    decisivePlay: "Borg stänger femte set med 8–6",
    videoUrl: null,
    story:
      "Centre Court hade is i Björn Borg och oväsen i John McEnroe, och herrfinalen vägrade korta någon av dem. Tiebreaket i fjärde set gick till 18–16, så långt att setet själv blev matchen folk minns. Borg vann ändå femte set med 8–6. Det var hans femte raka Wimbledon, taget på andra sidan ett tiebreak som ritade om vad en final fick kräva.",
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
