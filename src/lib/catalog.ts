import "server-only";

import { hashString } from "@/lib/utils";
import type { AnswerSheet, Expedition, EventOption, Puzzle } from "@/lib/types";

export const expeditions: Expedition[] = [
  {
    slug: "dawn",
    title: "Spelens gryning",
    period: "1896 – 1936",
    blurb: "Arkivet öppnar med amatörlöften, ett första VM och en sprint i Berlin som skrev om en regimens manus.",
    puzzleIds: ["athens-1896", "montevideo-1930", "owens-1936"],
  },
  {
    slug: "postwar",
    title: "Efterkrigsdundret",
    period: "1954 – 1970",
    blurb: "Radiopublik, en tonåring i Sverige, förlängning på Wembley och en flop som böjde ribban.",
    puzzleIds: ["bern-1954", "pele-1958", "hurst-1966", "fosbury-1968"],
  },
  {
    slug: "satellite",
    title: "Direkt via satellit",
    period: "1973 – 1986",
    blurb: "Tennis i bästa sändningstid, en natt i Kinshasa, en perfekt tia, collegelag på is och en kvartsfinal i Mexiko.",
    puzzleIds: ["king-1973", "ali-1974", "comaneci-1976", "miracle-1980", "maradona-1986"],
  },
  {
    slug: "global",
    title: "Den globala scenen",
    period: "1992 – 2008",
    blurb: "Ett drömlag, en regnbågströja, två mål på tilläggstid, en straff i Rose Bowl och ett 9,69.",
    puzzleIds: ["dream-team-1992", "mandela-1995", "united-1999", "chastain-1999", "bolt-2008"],
  },
  {
    slug: "already-history",
    title: "Redan historia",
    period: "2012 – 2022",
    blurb: "En Super Saturday, en titel till 5000–1, en sista dans i Lusail — nyligen nog att minnas, gammalt nog att arkivera.",
    puzzleIds: ["super-saturday-2012", "leicester-2016", "messi-2022"],
  },
];

export const puzzles: Puzzle[] = [
  {
    id: "athens-1896",
    year: 1896,
    sport: "olympics",
    era: "dawn",
    expedition: "dawn",
    difficulty: 3,
    title: "Spyridon Louis vinner det första olympiska maratonloppet",
    teaser: "Damm, en vattenstation och en stad som uppfann distansen.",
    summary:
      "Den grekiske herden Spyridon Louis sprang först in på Panathenaiko-stadion i det första olympiska maratonloppet och gjorde de återupplivade spelen till en nationell legend.",
    answers: [
      "spyridon louis wins the first olympic marathon",
      "spyridon louis marathon",
      "spyridon louis",
      "spyros louis",
      "first olympic marathon",
      "1896 marathon",
      "athens marathon",
      "louis marathon",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en marmorstadion i dammet.",
        image: { plateId: "olympic-track", scale: 3.1, x: 78, y: 22 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "En lokal amatör, mer van vid att bära vatten än att tävla, anmäls nästan i efterhand. Distansen är ny. Stadion är av marmor.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Värdstad", value: "Aten", revealedAtClue: 5 },
          { label: "Distans", value: "cirka 40 km", revealedAtClue: 3 },
          { label: "Vinnarens yrke", value: "Vattenbärare / herde", revealedAtClue: 4 },
          { label: "Publik", value: "80 000 på stadion", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Depesch",
        quote: "En grek har vunnit! En grek har vunnit!",
        attribution: "Rop från stadion, återgivet från samtida rapporter",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: hela marmorns hästsko.",
        image: { plateId: "olympic-track", scale: 1.45, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En herde som burit vatten springer in i en hästsko av marmor. En kronprins sluter upp. En nation bestämmer sig för att spelen är tillbaka.",
      },
    ],
  },
  {
    id: "montevideo-1930",
    year: 1930,
    sport: "football",
    era: "dawn",
    expedition: "dawn",
    difficulty: 2,
    title: "Uruguay vinner det första VM-guldet",
    teaser: "En ny stadion vid Río de la Plata, och bara tretton lag.",
    summary:
      "Värdarna Uruguay slog Argentina med 4–2 i Montevideo och blev de första världsmästarna, fyra år efter OS-guldet på samma jord.",
    answers: [
      "uruguay win the first fifa world cup",
      "first world cup",
      "uruguay world cup",
      "1930 world cup",
      "montevideo world cup",
      "uruguay argentina 1930",
      "estadio centenario",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en nattlig plan och en ny stadion.",
        image: { plateId: "pitch-night", scale: 2.9, x: 18, y: 70 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Bara tretton förbund gör resan. Europa stannar mest hemma. Finalen är ett grannbråk på en stadion byggd för ett hundraårsjubileum.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Slutresultat", value: "4–2", revealedAtClue: 4 },
          { label: "Värd", value: "Uruguay", revealedAtClue: 5 },
          { label: "Motståndare", value: "Argentina", revealedAtClue: 5 },
          { label: "Antal lag", value: "13", revealedAtClue: 3 },
        ],
      },
      {
        kind: "quote",
        kicker: "Depesch",
        quote: "Himlen är en karneval. Montevideo kommer inte att sova.",
        attribution: "Uruguayansk matchrapport, juli",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: hela Centenario under karnevalshimlen.",
        image: { plateId: "pitch-night", scale: 1.35, x: 48, y: 52 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En ny pokal får sitt första namn vid en flodmynning. Himmelblått firar som om staden aldrig ska sova.",
      },
    ],
  },
  {
    id: "owens-1936",
    year: 1936,
    sport: "athletics",
    era: "dawn",
    expedition: "dawn",
    difficulty: 1,
    title: "Jesse Owens tar fyra guld i Berlin",
    teaser: "En kolstybbana, en längdhoppsgrop och ett propagandaspel som spikarna skrev om.",
    summary:
      "Jesse Owens vann 100 meter, 200 meter, längd och 4×100 meter vid OS i Berlin, friidrottens tydligaste svar på nazisternas uppvisning.",
    answers: [
      "jesse owens wins four golds in berlin",
      "jesse owens",
      "owens berlin",
      "owens four golds",
      "berlin 100m",
      "jesse owens long jump",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: kolstybb och en längdhoppsgrop.",
        image: { plateId: "olympic-track", scale: 3.2, x: 22, y: 80 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Fyra finaler, en vecka, en aktiv. Värden ville ha en annan historia ur kolstybben.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Guld", value: "4", revealedAtClue: 3 },
          { label: "Grenar", value: "100, 200, längd, stafett", revealedAtClue: 5 },
          { label: "Tid 100 m", value: "10,3", revealedAtClue: 4 },
          { label: "Värdstad", value: "Berlin", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Depesch",
        quote: "Jag lät fötterna tala för mig.",
        attribution: "Tillskrivet mästaren i senare intervjuer",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: banorna under propagandans ljus.",
        image: { plateId: "olympic-track", scale: 1.4, x: 50, y: 55 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En sprinter från en annan kontinent samlar guld under strålkastare som var tänkta för någon annan. Längden avgörs mot en hoppare från värdnationen som ger råd i gropen.",
      },
    ],
  },
  {
    id: "bern-1954",
    year: 1954,
    sport: "football",
    era: "postwar",
    expedition: "postwar",
    difficulty: 2,
    title: "Västtysklands mirakel i Bern",
    teaser: "Ett 3–2 som en nation fortfarande behandlar som en skapelsemyt.",
    summary:
      "Västtyskland hämtade upp ett 2–0-underläge och slog Ferenc Puskás Ungern med 3–2 i VM-finalen i Bern — miraklet i Bern.",
    answers: [
      "west germany's miracle of bern",
      "miracle of bern",
      "wunder von bern",
      "west germany hungary 1954",
      "1954 world cup final",
      "helmut rahn",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: regn på en VM-plan.",
        image: { plateId: "pitch-night", scale: 2.8, x: 82, y: 30 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Gästerna hade redan satt åtta på den här motståndaren i gruppen. I finalen är regnet bibliskt och favoriten leder med 2–0 efter åtta minuter.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Slutresultat", value: "3–2", revealedAtClue: 3 },
          { label: "Upphämtning från", value: "0–2", revealedAtClue: 4 },
          { label: "Vinnare", value: "Västtyskland", revealedAtClue: 5 },
          { label: "Förlorande favorit", value: "Ungern (det gyllene laget)", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Radio",
        quote: "Aus! Aus! Aus! Das Spiel ist aus!",
        attribution: "Herbert Zimmermann, radioreferat",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Wankdorf i ösregnet.",
        image: { plateId: "pitch-night", scale: 1.3, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Ett andra mål i regnet avslutar en obesegrad svit och blir en ursprungshistoria för en delad nation.",
      },
    ],
  },
  {
    id: "pele-1958",
    year: 1958,
    sport: "football",
    era: "postwar",
    expedition: "postwar",
    difficulty: 1,
    title: "En 17-årig Pelé vinner VM i Sverige",
    teaser: "En tonåring, ett 5–2 och den första av fem brasilianska stjärnor.",
    summary:
      "Pelé, 17 år, gjorde mål i semifinalen och två i finalen när Brasilien slog Sverige med 5–2 och tog sitt första VM.",
    answers: [
      "a 17-year-old pelé wins the world cup in sweden",
      "pelé in sweden",
      "pele 1958",
      "pele sweden",
      "brazil 1958",
      "pele world cup debut",
      "brazil sweden 1958",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en tonårings rygg i en VM-final.",
        image: { plateId: "pitch-night", scale: 3, x: 60, y: 18 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "En tonåring i nummer 10 gråter i en kaptens tröja när det är över. Värdarna har förlorat på egen hemmaplan.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Ålder", value: "17", revealedAtClue: 2 },
          { label: "Slutresultat", value: "5–2", revealedAtClue: 4 },
          { label: "Vinnare", value: "Brasilien", revealedAtClue: 5 },
          { label: "Värd / motståndare", value: "Sverige", revealedAtClue: 5 },
        ],
      },
      {
        kind: "quote",
        kicker: "Depesch",
        quote: "Han spelar som om bollen är en vän han har känt hela livet.",
        attribution: "Svensk press, efter finalen",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Råsunda och en 5–2-plan.",
        image: { plateId: "pitch-night", scale: 1.35, x: 52, y: 48 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En kantspelare som går rakt på, ett protokoll som fylls, och en pojke från inlandet som utropar en dynasti på värdarnas nationalarena.",
      },
    ],
  },
  {
    id: "hurst-1966",
    year: 1966,
    sport: "football",
    era: "postwar",
    expedition: "postwar",
    difficulty: 1,
    title: "Geoff Hursts hattrick på Wembley",
    teaser: "De tror att det är över — förlängning, ett skott i ribban och ett tredje.",
    summary:
      "England slog Västtyskland med 4–2 efter förlängning i VM-finalen. Geoff Hurst gjorde hattrick, inklusive sportens mest omdiskuterade mål.",
    answers: [
      "geoff hurst's hat-trick at wembley",
      "geoff hurst hat-trick",
      "geoff hurst",
      "1966 world cup",
      "england 1966",
      "they think its all over",
      "hurst hat trick",
      "wembley 1966",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en ribba och en boll som kommer ner.",
        image: { plateId: "pitch-night", scale: 3.05, x: 40, y: 85 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "En hemmafinal. Förlängning. Ett skott som tar i ribban och kommer ner — på linjen, över den, eller i diskussionen för alltid.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Slutresultat", value: "4–2 efter förlängning", revealedAtClue: 4 },
          { label: "Hattrick", value: "Ja, det enda i en herr-VM-final", revealedAtClue: 5 },
          { label: "Arena", value: "Wembley", revealedAtClue: 3 },
          { label: "Motståndare", value: "Västtyskland", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Radio",
        quote: "De tror att det är över... det är det nu!",
        attribution: "Kenneth Wolstenholme, BBC",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Wembley i förlängning.",
        image: { plateId: "pitch-night", scale: 1.25, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Kaptenen lyfter pokalen. En anfallare har tre. En nation daterar sin kalender från en grå julieftermiddag.",
      },
    ],
  },
  {
    id: "fosbury-1968",
    year: 1968,
    sport: "athletics",
    era: "postwar",
    expedition: "postwar",
    difficulty: 2,
    title: "Dick Fosbury floppar sig till OS-guld",
    teaser: "En kurva med ryggen före över ribban, som tränarna kallade en fluga.",
    summary:
      "Dick Fosbury vann höjden i Mexico City med ryggläggningen som blev Fosbury-flopen och pensionerade dykningen nästan över en natt.",
    answers: [
      "dick fosbury flops to olympic gold",
      "fosbury flop",
      "dick fosbury",
      "fosbury mexico",
      "1968 high jump",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en rygg mot ribban.",
        image: { plateId: "olympic-track", scale: 3.3, x: 70, y: 12 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Han vänder ryggen mot ribban. Tränarna grimaserar. Fotograferna har aldrig sett en höjdhoppare titta mot himlen i luften.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Gren", value: "Höjdhopp", revealedAtClue: 3 },
          { label: "Segerhöjd", value: "2,24 m", revealedAtClue: 4 },
          { label: "Teknik", value: "Ryggläggning (flop)", revealedAtClue: 5 },
          { label: "Spel", value: "Mexico City", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Depesch",
        quote: "Jag tror att jag har uppfunnit ett nytt sätt att hoppa.",
        attribution: "Mästaren, till reportrarna",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: höjdhoppsgropen i Mexico City.",
        image: { plateId: "olympic-track", scale: 1.5, x: 58, y: 40 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En sorts ingenjör, sist i hoppordningen, klarar en höjd som ger varje framtida hoppare en ny form.",
      },
    ],
  },
  {
    id: "king-1973",
    year: 1973,
    sport: "tennis",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Billie Jean King vinner Kampen mellan könen",
    teaser: "En Astrodome i Houston, en griskulting och en match som aldrig bara handlade om tennis.",
    summary:
      "Billie Jean King slog Bobby Riggs i raka set i Houston Astrodome, ett kvällsspektakel som blev ett landmärke för damidrotten.",
    answers: [
      "billie jean king wins the battle of the sexes",
      "battle of the sexes",
      "billie jean king",
      "king riggs",
      "billie jean king bobby riggs",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en inomhusbana under en kupol.",
        image: { plateId: "lawn-tennis", scale: 3, x: 25, y: 20 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "En betydligt äldre spelare har redan slagit den som rankas högst. I kväll bärs utmanaren in på en bår. En hel kontinent tittar.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Resultat", value: "6–4, 6–3, 6–3", revealedAtClue: 4 },
          { label: "Arena", value: "Inomhusarenan i Houston", revealedAtClue: 5 },
          { label: "Vinnare", value: "Billie Jean King", revealedAtClue: 6 },
          { label: "Format", value: "Bäst av fem, uppvisning med allt på spel", revealedAtClue: 3 },
        ],
      },
      {
        kind: "quote",
        kicker: "Depesch",
        quote: "Det här handlar inte om en tennismatch. Det handlar om samhällsförändring.",
        attribution: "King, innan hon går in på banan",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: inomhusarenan i Houston, fullsatt.",
        image: { plateId: "lawn-tennis", scale: 1.35, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Raka set under ett tak. En symbolisk gris stannar hos förloraren. En lagparagraf får sitt mest berömda klipp.",
      },
    ],
  },
  {
    id: "ali-1974",
    year: 1974,
    sport: "boxing",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Ali besegrar Foreman i Djungelns dån",
    teaser: "Kinshasa, klockan fyra på morgonen, rope-a-dope, åskan i åttonde ronden.",
    summary:
      "Muhammad Ali knockade George Foreman i åttonde ronden i Kinshasa och tog tillbaka tungviktstiteln med rope-a-dope.",
    answers: [
      "ali defeats foreman in the rumble in the jungle",
      "rumble in the jungle",
      "ali foreman",
      "muhammad ali kinshasa",
      "rope a dope",
      "ali vs foreman",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: rep och en morgonröd ring.",
        image: { plateId: "boxing-ring", scale: 3.2, x: 80, y: 18 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Den yngre mästaren ska vara omöjlig att träffa. Den äldre mannen skyddar sig mot repen rond efter rond i en start klockan fyra på morgonen.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Resultat", value: "KO, rond 8", revealedAtClue: 4 },
          { label: "Stad", value: "Kinshasa", revealedAtClue: 5 },
          { label: "Vinnare", value: "Muhammad Ali", revealedAtClue: 6 },
          { label: "Förlorare", value: "George Foreman", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Ringen",
        quote: "Ali bomaye!",
        attribution: "Publiken, hela natten",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: ringen i Kinshasa före gryningen.",
        image: { plateId: "boxing-ring", scale: 1.3, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En natt i en stad vid floden. En promotor som älskar buller. En höger som fäller den obesegrade mästaren när kraften tar slut.",
      },
    ],
  },
  {
    id: "comaneci-1976",
    year: 1976,
    sport: "gymnastics",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Nadia Comăneci sätter den första perfekta tian",
    teaser: "En resultattavla som bara kan skriva 1,00.",
    summary:
      "Fjortonåriga Nadia Comăneci satte den första perfekta tian i olympisk gymnastik i barr i Montréal och lade sedan till sex till.",
    answers: [
      "nadia comăneci scores the first perfect 10",
      "nadia comăneci perfect 10",
      "nadia comaneci",
      "perfect 10",
      "comaneci montreal",
      "first perfect 10",
      "nadia 1976",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en resultattavla som stannar på 1,00.",
        image: { plateId: "olympic-track", scale: 2.7, x: 12, y: 40 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Den elektroniska tavlan var inte byggd för siffran den visar. Arenan behöver en sekund för att förstå.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Poäng", value: "10,00", revealedAtClue: 5 },
          { label: "Redskap", value: "Barr (första tian)", revealedAtClue: 4 },
          { label: "Ålder", value: "14", revealedAtClue: 5 },
          { label: "Spel", value: "Montréal", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Depesch",
        quote: "En tia. En perfekt tia. Tavlan vet inte hur den ska säga det.",
        attribution: "Tv-kommentar, Montréal",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: barr och en arena som tystnar.",
        image: { plateId: "olympic-track", scale: 1.4, x: 48, y: 52 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En tonåring kopplar om en sport med en fattning domarna knappt har sett. Flera tior innan spelen är över.",
      },
    ],
  },
  {
    id: "miracle-1980",
    year: 1980,
    sport: "ice-hockey",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Miraklet på isen",
    teaser: "Collegestudenter, en supermakt och en fråga rakt in i en mikrofon.",
    summary:
      "USA:s olympiska hockeylag av collegespelare slog Sovjetunionen med 4–3 i den olympiska bergsbyn och tog sedan guld mot Finland.",
    answers: [
      "the miracle on ice",
      "miracle on ice",
      "usa ussr hockey",
      "lake placid hockey",
      "miracle on ice 1980",
      "united states soviet hockey",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en is och en flagga i rörelse.",
        image: { plateId: "ice-rink", scale: 3.15, x: 70, y: 75 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Amatörer mot en maskin som tränar året runt. En bergsby. En flagga som inte vill ligga still.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Resultat", value: "4–3", revealedAtClue: 4 },
          { label: "Vinnare", value: "USA", revealedAtClue: 5 },
          { label: "Motståndare", value: "Sovjetunionen", revealedAtClue: 5 },
          { label: "Arena", value: "Bergsbyn", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Radio",
        quote: "Tror du på mirakel? JA!",
        attribution: "Al Michaels, ABC",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: olympiahallen i bergsbyn.",
        image: { plateId: "ice-rink", scale: 1.28, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Ett universitetslag. Ett avgörande från en kapten. En semifinal som ett helt land minns som en final.",
      },
    ],
  },
  {
    id: "maradona-1986",
    year: 1986,
    sport: "football",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Maradonas århundradets mål",
    teaser: "Sextio meter, fem spelare, en vänsterfot, hettan i Mexico City.",
    summary:
      "Diego Maradona gjorde århundradets mål i VM-kvartsfinalen mot England, fyra minuter efter Guds hand.",
    answers: [
      "maradona's goal of the century",
      "maradona goal of the century",
      "goal of the century",
      "maradona 1986",
      "maradona england",
      "diego maradona mexico",
      "hand of god",
      "argentina england 1986",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en nummer 10 som redan är förbi den förste.",
        image: { plateId: "pitch-night", scale: 3.1, x: 15, y: 40 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Hettan ligger kvar på hög höjd. En nummer 10 tar bollen på egen planhalva och bestämmer sig för att ingen ska få stoppa honom.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Minut", value: "54'", revealedAtClue: 4 },
          { label: "Omgång", value: "VM-kvartsfinal", revealedAtClue: 3 },
          { label: "Dribblingar", value: "Beardsley, Reid, Butcher, Fenwick, Shilton", revealedAtClue: 6 },
          { label: "Arena", value: "Estadio Azteca", revealedAtClue: 5 },
        ],
      },
      {
        kind: "quote",
        kicker: "Radio",
        quote: "Barrilete cósmico... ¿de qué planeta viniste?",
        attribution: "Víctor Hugo Morales, radioreferat",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Azteca och en lång soloraid.",
        image: { plateId: "pitch-night", scale: 1.32, x: 50, y: 52 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En solskenshistoria på hög höjd där teologin mötte fysiken i en ikonisk kvartsfinal. Först ett mål som reglerna inte riktigt rymmer, sedan en löpning som arkivet vägrar glömma.",
      },
    ],
  },
  {
    id: "dream-team-1992",
    year: 1992,
    sport: "basketball",
    era: "global",
    expedition: "global",
    difficulty: 1,
    title: "Dream Team tar OS-guld i Barcelona",
    teaser: "NBA-namn på OS-linne, och ingen är i närheten.",
    summary:
      "USA:s herrbasket 1992 — Jordan, Magic, Bird, Barkley och de andra — vann varje match i Barcelona med tvåsiffrig marginal.",
    answers: [
      "the dream team wins olympic gold in barcelona",
      "dream team",
      "dream team barcelona",
      "usa basketball 1992",
      "1992 olympics basketball",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: ett parkettgolv och en uppvärmning som redan är final.",
        image: { plateId: "hardwood", scale: 3, x: 80, y: 70 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Proffs släpps in för första gången. Uppvärmningen är en större föreställning än de flesta finaler. Motståndarna ber om fotografier.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Facit", value: "8–0", revealedAtClue: 3 },
          { label: "Snittmarginal", value: "43,8 poäng", revealedAtClue: 4 },
          { label: "Final", value: "USA 117–85 Kroatien", revealedAtClue: 6 },
          { label: "Stad", value: "Barcelona", revealedAtClue: 5 },
        ],
      },
      {
        kind: "quote",
        kicker: "Depesch",
        quote: "De var ett gäng som var bäst i världen, och de spelade som om de var det.",
        attribution: "Chuck Daly",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Barcelona och en bänk full av proffs.",
        image: { plateId: "hardwood", scale: 1.35, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Tre generationers största namn på samma bänk. Ett guld som ser oundvikligt ut från den första dunkningen.",
      },
    ],
  },
  {
    id: "mandela-1995",
    year: 1995,
    sport: "rugby",
    era: "global",
    expedition: "global",
    difficulty: 2,
    title: "Sydafrika vinner rugby-VM i springboktröja",
    teaser: "En tröja med nummer 6, förlängning och en stadion som var tvungen att bli ett land.",
    summary:
      "Sydafrika slog Nya Zeeland med 15–12 efter förlängning i Johannesburg. Nelson Mandela delade ut pokalen i en springboktröja.",
    answers: [
      "south africa win the rugby world cup in a springbok jersey",
      "springboks 1995",
      "1995 rugby world cup",
      "mandela springbok",
      "south africa 1995",
      "joel stransky",
      "invictus",
      "springboks 1995",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en nummer 6-tröja på gräset.",
        image: { plateId: "rugby-turf", scale: 3.05, x: 20, y: 80 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Förlängning. Ett drop goal från höger. En man i landslagströja som inte står i startelvan går ut på gräset.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Slutresultat", value: "15–12 efter förlängning", revealedAtClue: 4 },
          { label: "Drop goal", value: "Joel Stransky", revealedAtClue: 5 },
          { label: "Arena", value: "Ellis Park, Johannesburg", revealedAtClue: 5 },
          { label: "Motståndare", value: "Nya Zeeland", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Planen",
        quote: "Idrotten har kraften att förändra världen.",
        attribution: "Nelson Mandela",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Ellis Park efter ett drop goal.",
        image: { plateId: "rugby-turf", scale: 1.3, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Kaptenen lyfter pokalen. Mannen som räcker över den bär ett lågt nummer. En regnbåge, för en stund, i rugbyfärger.",
      },
    ],
  },
  {
    id: "united-1999",
    year: 1999,
    sport: "football",
    era: "global",
    expedition: "global",
    difficulty: 1,
    title: "Manchester Uniteds trippel på tilläggstid",
    teaser: "Tilläggstid, två gånger, i Barcelona, med en trippel på spel.",
    summary:
      "Manchester United gjorde två mål på tilläggstid, slog Bayern München med 2–1 i Champions League-finalen och fullbordade trippeln.",
    answers: [
      "manchester united's stoppage-time treble",
      "manchester united treble",
      "manchester united 1999",
      "united treble",
      "sheringham solskjaer",
      "bayern united 1999",
      "camp nou 1999",
      "solskjaer 1999",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en hörna när klockan redan är ute.",
        image: { plateId: "pitch-night", scale: 2.95, x: 88, y: 55 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "De ligger under efter en nick på frispark. Klockan är på rött. Två hörnor. Två olika inhoppare.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Slutresultat", value: "2–1", revealedAtClue: 3 },
          { label: "Vinnarmål", value: "Sheringham 91', Solskjær 93'", revealedAtClue: 5 },
          { label: "Arena", value: "Camp Nou", revealedAtClue: 4 },
          { label: "Motståndare", value: "Bayern München", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Radio",
        quote: "Och Solskjær har avgjort det!",
        attribution: "Clive Tyldesley, ITV",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Camp Nou i tilläggstid.",
        image: { plateId: "pitch-night", scale: 1.28, x: 52, y: 50 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En trippel på tio dagar. Två inhoppare, båda med ett mål, på bortaplanens tilläggstid.",
      },
    ],
  },
  {
    id: "chastain-1999",
    year: 1999,
    sport: "football",
    era: "global",
    expedition: "global",
    difficulty: 2,
    title: "Brandi Chastains straff vinner damernas VM",
    teaser: "En svart sport-bh, Rose Bowl och en straffläggning som rörde ett land.",
    summary:
      "Brandi Chastain satte den avgörande straffen när USA slog Kina i damernas VM-final på Rose Bowl.",
    answers: [
      "brandi chastain's penalty wins the women's world cup",
      "brandi chastain penalty",
      "brandi chastain",
      "1999 women's world cup",
      "usa china 1999",
      "chastain penalty",
      "rose bowl 1999",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en vänsterfot och en straffpunkt.",
        image: { plateId: "pitch-night", scale: 3.2, x: 30, y: 15 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "90 000 i en skål i Kalifornien. 0–0 efter förlängning. Den femte straffen i straffläggningen slås med vänster.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Ordinarie tid", value: "0–0 (förlängning)", revealedAtClue: 3 },
          { label: "Avgörande", value: "Straffar, 5–4", revealedAtClue: 4 },
          { label: "Arena", value: "Rose Bowl", revealedAtClue: 5 },
          { label: "Vinnare", value: "USA", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Planen",
        quote: "Ett ögonblicks vansinne.",
        attribution: "Straffläggaren, om firandet",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Rose Bowl efter den femte straffen.",
        image: { plateId: "pitch-night", scale: 1.35, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En generation som burit landslaget. Motståndarna i den andra tröjan. Ett fotografi som sätter damfotbollen på omslag.",
      },
    ],
  },
  {
    id: "bolt-2008",
    year: 2008,
    sport: "athletics",
    era: "global",
    expedition: "global",
    difficulty: 1,
    title: "Usain Bolt springer 9,69 i Peking",
    teaser: "Bana 4, en blick åt vänster och ett världsrekord med oknutna skor.",
    summary:
      "Usain Bolt vann OS-finalen på 100 meter i Peking på världsrekordet 9,69, saktade in för att fira före linjen och lade sedan till 200-metersrekordet och stafetten.",
    answers: [
      "usain bolt runs 9.69 in beijing",
      "usain bolt beijing 100m",
      "usain bolt",
      "bolt beijing",
      "bolt 9.69",
      "2008 100m",
      "bolt 100m beijing",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: utbredda armar före mållinjen.",
        image: { plateId: "olympic-track", scale: 3.25, x: 85, y: 60 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Han är fri långt före bandet. Han breder ut armarna. Klockan sjunker ändå.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Tid", value: "9,69", revealedAtClue: 5 },
          { label: "Gren", value: "100 meter", revealedAtClue: 4 },
          { label: "Vind", value: "0,0 m/s", revealedAtClue: 5 },
          { label: "Stad", value: "Peking", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Banan",
        quote: "Jag är nummer 1.",
        attribution: "Sprintern, till Fågelboet",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Fågelboets banor och ett 9,69.",
        image: { plateId: "olympic-track", scale: 1.4, x: 55, y: 50 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "En lång sprinter som skulle vara specialist på den längre banan. I slutet av veckan har silhuetten ritats om.",
      },
    ],
  },
  {
    id: "super-saturday-2012",
    year: 2012,
    sport: "athletics",
    era: "already-history",
    expedition: "already-history",
    difficulty: 2,
    title: "Super Saturday i London 2012",
    teaser: "Sextio minuter, tre hemmaguld, en stadion som tappade rösten och fann den igen.",
    summary:
      "Den 4 augusti 2012 vann Jessica Ennis-Hill, Greg Rutherford och Mo Farah OS-guld för Storbritannien inom en timme på London Stadium.",
    answers: [
      "london 2012 super saturday",
      "super saturday",
      "london 2012 super saturday",
      "ennis farah rutherford",
      "mo farah 2012",
      "jessica ennis 2012",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: ett sista varv under ett tak som dånar.",
        image: { plateId: "olympic-track", scale: 2.9, x: 40, y: 18 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "En sista gren i sjukamp, ett längdhopp som ser ut som ett tryckfel, en avslutning på 10 000 meter. Samma stadion, samma timme, samma flagga.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Hemmaguld på ~60 min", value: "3", revealedAtClue: 3 },
          { label: "Grenar", value: "Sjukamp, längd, 10 000 m", revealedAtClue: 5 },
          { label: "Stad", value: "London", revealedAtClue: 4 },
          { label: "Aktiva", value: "Ennis-Hill, Rutherford, Farah", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Radio",
        quote: "Kom igen, Mo! Kom igen!",
        attribution: "Stadion, sista varvet",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: London Stadium en lördagskväll.",
        image: { plateId: "olympic-track", scale: 1.35, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Tre grenar, tre guld, en hemmapublik som hittar ett namn på natten.",
      },
    ],
  },
  {
    id: "leicester-2016",
    year: 2016,
    sport: "football",
    era: "already-history",
    expedition: "already-history",
    difficulty: 1,
    title: "Leicester City vinner Premier League till 5000–1",
    teaser: "En nyuppflyttad räv, en kupong på 5000–1 och en titel ingen modell förutsåg.",
    summary:
      "Leicester City vann Premier League 2015–16 till oddset 5000–1 före säsongen, den mest osannolika titeln i seriens historia.",
    answers: [
      "leicester city win the premier league at 5000-1",
      "leicester city title",
      "leicester city",
      "leicester 2016",
      "leicester premier league",
      "5000 to 1",
      "claudio ranieri leicester",
      "leicester title",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en räv på ett klubbmärke.",
        image: { plateId: "pitch-night", scale: 3, x: 65, y: 25 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "Spelbolagens tavla ser fortfarande ut som ett skämt på våren. En anfallare långt hemifrån, ett mittfält av brytningar, en tränare som redan var avskriven.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Odds före säsongen", value: "5000–1", revealedAtClue: 5 },
          { label: "Poäng", value: "81", revealedAtClue: 5 },
          { label: "Skyttekung", value: "Jamie Vardy (24)", revealedAtClue: 6 },
          { label: "Serie", value: "Premier League", revealedAtClue: 4 },
        ],
      },
      {
        kind: "quote",
        kicker: "Omklädningsrum",
        quote: "Dilly ding, dilly dong.",
        attribution: "Claudio Ranieri, omklädningsrummet",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: en ligakväll som oddsen inte såg.",
        image: { plateId: "pitch-night", scale: 1.3, x: 50, y: 52 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Ett kryss i huvudstaden och en landsända exploderar. En klubb utan pokaler skriver om tabellen.",
      },
    ],
  },
  {
    id: "messi-2022",
    year: 2022,
    sport: "football",
    era: "already-history",
    expedition: "already-history",
    difficulty: 1,
    title: "Messi vinner VM i Lusail",
    teaser: "En final som behövde förlängning, straffar och en krona till.",
    summary:
      "Lionel Messi gjorde två mål när Argentina slog Frankrike med 4–2 på straffar efter en 3–3-final i Lusail och tog sitt första VM.",
    answers: [
      "messi wins the world cup in lusail",
      "messi world cup",
      "argentina 2022",
      "lusail",
      "messi 2022",
      "argentina france 2022",
      "qatar world cup final",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Beskuren bild: en förgylld skål och en straffpunkt.",
        image: { plateId: "pitch-night", scale: 3.1, x: 10, y: 60 },
      },
      {
        kind: "text",
        kicker: "Fältnotis",
        body: "En ledning som ser avgjord ut vänds av ett hattrick. Förlängning. Lika igen. En straffläggning under en skål som glänser.",
      },
      {
        kind: "stats",
        kicker: "Resultatkort",
        stats: [
          { label: "Ordinarie + förlängning", value: "3–3", revealedAtClue: 3 },
          { label: "Straffar", value: "4–2", revealedAtClue: 4 },
          { label: "Vinnande kapten", value: "Lionel Messi", revealedAtClue: 6 },
          { label: "Arena", value: "Lusail Stadium", revealedAtClue: 5 },
        ],
      },
      {
        kind: "quote",
        kicker: "Planen",
        quote: "Jag har drömt det här så många gånger.",
        attribution: "Kaptenen, med pokalen",
      },
      {
        kind: "image",
        kicker: "Arkivbilden dras ut: Lusail efter en 3–3-final.",
        image: { plateId: "pitch-night", scale: 1.25, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Slutbrief",
        body: "Två nummer 10. En första stjärna till kaptenen. Arkivet lägger redan finalen under stort.",
      },
    ],
  },
];

const puzzleById = new Map(puzzles.map((puzzle) => [puzzle.id, puzzle]));

const extraEvents: EventOption[] = [
  { id: "extra-istanbul", label: "Istanbul 2005" },
  { id: "extra-wimbledon-2008", label: "Federer mot Nadal, Wimbledon" },
  { id: "extra-botham", label: "Bothams Ashes" },
  { id: "extra-freeman", label: "Cathy Freeman 400 meter" },
  { id: "extra-nadal-rg", label: "Nadal i Franska öppna" },
  { id: "extra-tiger-1997", label: "Tiger Woods Masters 1997" },
  { id: "extra-italy-1982", label: "Italiens VM 1982" },
  { id: "extra-spain-2010", label: "Iniestas VM-avgörande" },
  { id: "extra-greece-2004", label: "Greklands EM 2004" },
  { id: "extra-jordan-1998", label: "Jordans sista skott" },
  { id: "extra-senna-brazil", label: "Sennas Brasiliens GP" },
  { id: "extra-borg-mcenroe", label: "Borg mot McEnroe" },
  { id: "extra-ali-frazier", label: "Thrillern i Manila" },
  { id: "extra-uswnt-2019", label: "USAs dam-VM 2019" },
  { id: "extra-phelps-2008", label: "Phelps åtta guld" },
  { id: "extra-kerri-strug", label: "Kerri Strugs volt" },
  { id: "extra-beckham-2001", label: "Beckhams frispark mot Grekland" },
];

const SEARCH_LABELS: Record<string, string> = {
  "athens-1896": "Spyridon Louis maraton",
  "montevideo-1930": "Första VM",
  "owens-1936": "Jesse Owens",
  "bern-1954": "Miraklet i Bern",
  "pele-1958": "Pelé i Sverige",
  "hurst-1966": "Geoff Hursts hattrick",
  "fosbury-1968": "Fosbury-flopen",
  "king-1973": "Kampen mellan könen",
  "ali-1974": "Djungelns dån",
  "comaneci-1976": "Nadia Comănecis perfekta tia",
  "miracle-1980": "Miraklet på isen",
  "maradona-1986": "Maradonas århundradets mål",
  "dream-team-1992": "Dream Team",
  "mandela-1995": "Springboks 1995",
  "united-1999": "Manchester Uniteds trippel",
  "chastain-1999": "Brandi Chastains straff",
  "bolt-2008": "Usain Bolt 100 meter i Peking",
  "super-saturday-2012": "Super Saturday",
  "leicester-2016": "Leicester Citys titel",
  "messi-2022": "Messis VM",
};

export const eventDictionary: EventOption[] = [
  ...puzzles.map((puzzle) => ({
    id: puzzle.id,
    label: SEARCH_LABELS[puzzle.id] ?? puzzle.answers[0],
  })),
  ...extraEvents,
];

export function getPuzzle(id: string): Puzzle | undefined {
  return puzzleById.get(id);
}

function uniqueAliases(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/**
 * Canonical year + subject + aliases for server-side scoring.
 * Autocomplete labels are included so a dictionary pick always matches.
 */
export function getAnswerSheet(id: string): AnswerSheet | undefined {
  const puzzle = getPuzzle(id);
  if (!puzzle) return undefined;
  const target_subject = SEARCH_LABELS[puzzle.id] ?? puzzle.title;
  const accepted_aliases = uniqueAliases([
    puzzle.title,
    SEARCH_LABELS[puzzle.id],
    ...puzzle.answers,
  ]).filter((alias) => alias.toLowerCase() !== target_subject.toLowerCase());
  return {
    target_year: puzzle.year,
    target_subject,
    accepted_aliases,
  };
}

export function getExpedition(slug: string): Expedition | undefined {
  return expeditions.find((item) => item.slug === slug);
}

export function getExpeditionPuzzles(slug: string): Puzzle[] {
  const expedition = getExpedition(slug);
  if (!expedition) return [];
  return expedition.puzzleIds
    .map((id) => puzzleById.get(id))
    .filter((puzzle): puzzle is Puzzle => Boolean(puzzle));
}

export function getDailyPuzzle(dateKey: string): Puzzle {
  const index = hashString(`sport-history-clue:${dateKey}`) % puzzles.length;
  return puzzles[index];
}

export function getRandomPuzzle(excludeId?: string): Puzzle {
  const pool = excludeId ? puzzles.filter((puzzle) => puzzle.id !== excludeId) : puzzles;
  const list = pool.length > 0 ? pool : puzzles;
  return list[Math.floor(Math.random() * list.length)];
}
