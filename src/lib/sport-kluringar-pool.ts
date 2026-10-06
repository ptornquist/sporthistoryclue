/**
 * Balanserad pool. Varje rad har fem svenska kort: arena, epok, taktik,
 * avgörande skede och klimax. De fyra första håller namnet, de sista löser.
 * 2026-10-04 är dagsindex 20730, och längden 30 gör den dagen till första raden.
 */
export const SPORT_KLURING_POOL = [
  {
    id: "sverige-sovjet-1984",
    sport: "ice_hockey",
    clues: [
      "En nordamerikansk hall under en höstturnering. Pucken släpps till ett gruppmöte, inte en final.",
      "Det blågula laget har redan en tung förlust i turneringen. Motståndaren har inte tappat en poäng.",
      "Första perioden går utan blågult mål. Sedan kommer ett, och ett till, men tavlan hinner aldrig ikapp.",
      "Sista perioden börjar oavgjort i mål. Ett enda mål avgör, och det görs inte av gästerna i gult.",
      "Den 3 september 1984 i Calgary, Kanada Cup. Sovjetunionen vinner med 3–2 mot Sverige.",
    ],
  },
  {
    id: "miracle-1980",
    sport: "ice_hockey",
    clues: [
      "En trång olympisk ishall. Favoriten har tränat året runt, och läktarens flagga ligger inte still.",
      "Semifinal. Ett universitetslag med korta byten möter ett landslag vant vid långa perioder.",
      "Blålinjen hålls kort. Utvisningsbåset står nästan tomt, och det spelas fem mot fem.",
      "Kaptenens skott från slottet går in med minuter kvar. Resten handlar om att hålla ledningen.",
      "Miraklet på isen, den 22 februari 1980 i Lake Placid. USA:s universitetslag slår Sovjetunionen med 4–3.",
    ],
  },
  {
    id: "summit-series-1972",
    sport: "ice_hockey",
    clues: [
      "Åttonde och sista matchen i en serie som skulle vara en uppvisning. Hallen är inte hemmaplan.",
      "Serien står 3–3 i segrar, med en oavgjord emellan. Förloraren åker hem utan serien.",
      "Gästerna hämtar in ett underläge. Målvakten får ta det sista bytet med klockan under minuten.",
      "En lös puck vid bortre stolpen. Skottet går in med en halv minut kvar av tredje perioden.",
      "Den 28 september 1972 i Moskva. Paul Henderson gör 6–5 till Kanada mot Sovjetunionen med 34 sekunder kvar.",
    ],
  },
  {
    id: "turin-gold-2006",
    sport: "ice_hockey",
    clues: [
      "En ny OS-hall. Pucken glider längs sargen före första tekningen, och finalen är redan såld slut.",
      "Två nordiska grannar. Ledningen har växlat, och tredje perioden inleds oavgjort.",
      "Båda lagen har en man i utvisningsbåset. Det är fyra mot fyra, och en back får tid vid blålinjen.",
      "Tio sekunder in i perioden. Tekningen vinns, och slagskottet tar i ribban innan det ramlar in.",
      "OS-finalen den 26 februari 2006 i Turin. Tre Kronor slår Finland med 3–2 sedan Nicklas Lidström gjort mål.",
    ],
  },
  {
    id: "lillehammer-1994",
    sport: "ice_hockey",
    clues: [
      "En finalhall i en fjälldal. Ordinarie tid och förlängning räcker inte, så straffpunkten får ta vid.",
      "OS-final mellan ett nordiskt lag och värdarnas stora granne i väster. Tavlan står 2–2.",
      "Målvakterna gissar. Skytten i det avgörande försöket tar pucken på en hand och glider in mot kassen.",
      "Pucken förs mellan benskydden. Bilden hamnar senare på ett frimärke.",
      "OS-finalen den 27 februari 1994. Sverige slår Kanada efter straffläggning, och Peter Forsberg gör dragningen.",
    ],
  },
  {
    id: "skelleftea-guld-2013",
    sport: "ice_hockey",
    clues: [
      "En finalhall i norr. Isen är nyspolad, och pucken släpps till seriens sista match.",
      "Gästerna leder matchserien med 3–0. Guldet har varit borta ur klubben sedan slutet av sjuttiotalet.",
      "Tidigt i första perioden är det mål. Sedan ett till från slottet, och blålinjen hålls kort.",
      "Hemmalaget tar ut målvakten. Pucken går in i tom kasse, och nollan i andra änden står kvar.",
      "Den 18 april 2013 vinner Skellefteå med 4–0 borta mot Luleå. Matchserien slutar 4–0, klubbens första SM-guld sedan 1978.",
    ],
  },
  {
    id: "pele-1958",
    sport: "football",
    clues: [
      "Värdarnas nationalarena en junikväll. Gräset är kort, och finalen spelas inför hemmapublik.",
      "Ett ungt lag från Sydamerika har tagit över turneringen. Nummer 10 är fortfarande tonåring.",
      "Gästerna slår djupt och byter sida fort. Kanterna går rakt på, och värdarnas backlinje får springa bakåt.",
      "Tavlan rusar i andra halvlek. Tonåringen gör två mål och gråter när slutsignalen går.",
      "VM-finalen den 29 juni 1958 på Råsunda. Sjuttonårige Pelé och Brasilien slår Sverige med 5–2.",
    ],
  },
  {
    id: "maradona-1986",
    sport: "football",
    clues: [
      "Hög höjd och het eftermiddag. Bollen rullar trögt i den tunna luften, och kvartsfinalen är fullsatt.",
      "Fyra år efter ett krig mellan länderna. Ett nummer 10 bär sitt lag genom turneringen.",
      "Han tar bollen på egen planhalva. Fem motståndare ska passeras, och målvakten kommer ut.",
      "Först en hand i straffområdet som domaren godkänner. Minuterna senare en löptur som ingen hinner ifatt.",
      "VM-kvartsfinalen den 22 juni 1986 på Azteca. Diego Maradona gör båda målen när Argentina slår England med 2–1.",
    ],
  },
  {
    id: "hurst-1966",
    sport: "football",
    clues: [
      "Hemmaplan och en pokal vid sidlinjen. Finalarenan är fullsatt redan före avspark.",
      "Ordinarie tid slutar lika. Förlängning väntar, och en anfallare har redan ett mål.",
      "Inlägg från kanten och löpningar mot bortre stolpen. Ribban är med mer än en gång.",
      "Ett skott träffar undersidan av ribban och studsar ner. Linjedomaren ger mål, och domaren pekar mot mittcirkeln.",
      "VM-finalen den 30 juli 1966 på Wembley. Geoff Hurst gör hattrick när England slår Västtyskland med 4–2 efter förlängning.",
    ],
  },
  {
    id: "bern-1954",
    sport: "football",
    clues: [
      "Regn på en tung gräsplan. Finalen följs mer i radio än på tv, och sidlinjen är en lervälling.",
      "Samma lag möttes i gruppspelet, där favoriten vann stort. Gästerna i vitt är avskrivna.",
      "Favoriten leder med 2–0. Gästerna söker djupled bakom ett högt backled.",
      "Från 0–2 hämtas ställningen upp. Segermålet kommer sent från högerkanten, och radioreferenten tappar andan.",
      "Undret i Bern, den 4 juli 1954. Västtyskland vänder 2–0 till 3–2 mot Ungern, och Helmut Rahn gör segermålet.",
    ],
  },
  {
    id: "messi-2022",
    sport: "football",
    clues: [
      "Finalarena med taket stängt. Kvällen är byggd för en match som kan dra över tiden.",
      "Två anfall som redan mötts i turneringen. Kaptenen på ena sidan jagar sitt första stora guld.",
      "Två nummer 10. Den ena styr från egen planhalva, den andra attackerar ytan bakom backlinjen.",
      "Ett hattrick vänder en ledning som såg klar ut. Förlängningen slutar lika, och straffpunkten får avgöra.",
      "VM-finalen den 18 december 2022 i Lusail. Argentina slår Frankrike med 4–2 på straffar efter 3–3, och Lionel Messi tar sitt första VM.",
    ],
  },
  {
    id: "ali-1974",
    sport: "boxing",
    clues: [
      "Ringen är uppe före gryningen. Starttiden är lagd för tv-tittare på andra sidan havet.",
      "Tungviktstiteln står på spel vid en flod. Den yngre mästaren är obesegrad, den äldre har väntat på revanschen.",
      "Den äldre lutar mot repen, tar stötarna på armarna och låter kraften ta slut, rond för rond.",
      "I åttonde ronden landar högern. Den obesegrade går i däck, och domaren räknar ut matchen.",
      "Den 30 oktober 1974 i Kinshasa. Muhammad Ali golvar George Foreman i åttonde ronden och tar tillbaka tungviktstiteln.",
    ],
  },
  {
    id: "tyson-holyfield-1996",
    sport: "boxing",
    clues: [
      "En arena i öknen, byggd för en enda kväll. Tungviktstiteln är vakant i praktiken: den ene har suttit av tiden.",
      "Den återvändande mästaren är favorit. Utmanaren är äldre, och få ger honom elva ronder.",
      "Den yngre jagar ett avslut. Den äldre tar slagen, flyttar sig och svarar när gardet faller.",
      "I elfte ronden tar domaren ut den yngre. Handduken behövs inte.",
      "Den 9 november 1996 i Las Vegas. Evander Holyfield vinner när domaren bryter i elfte ronden mot Mike Tyson.",
    ],
  },
  {
    id: "thrilla-manila-1975",
    sport: "boxing",
    clues: [
      "Hetta redan före första ronden. Ringen står i en huvudstad, och matchen är den tredje mellan samma män.",
      "Tungvikt, och ingen av dem tänker ta ett steg tillbaka. Båda har redan vunnit en av de två tidigare.",
      "Tempot sjunker inte. Armarna blir tunga, och hörnorna ser mer än boxarna själva.",
      "Efter fjorton ronder reser sig den ena inte till den femtonde. Hörnan bryter.",
      "Den 1 oktober 1975 i Quezon City. Muhammad Ali vinner när Joe Fraziers hörna bryter efter fjorton ronder.",
    ],
  },
  {
    id: "clay-liston-1964",
    sport: "boxing",
    clues: [
      "En strandstad och en titelmatch som få tror håller sju ronder. Utmanaren är tjugotvå.",
      "Den obesegrade mästaren är storfavorit. Utmanaren har skrikit sig fram till ringen.",
      "Utmanaren rör sig, pratar och träffar. Mästaren jagar ett avslut som inte kommer.",
      "När klockan ringer till sjunde ronden stannar mästaren på pallen. Han kommer inte ut.",
      "Den 25 februari 1964 i Miami Beach. Sonny Liston går inte upp till sjunde ronden, och Cassius Clay tar tungviktstiteln.",
    ],
  },
  {
    id: "hagler-leonard-1987",
    sport: "boxing",
    clues: [
      "Utomhusring vid ett kasino. Mellanvikt, och matchen är satt till tolv ronder.",
      "Mästaren har hållit bältet i åratal. Utmanaren har varit borta och kommer tillbaka en viktklass upp.",
      "Domarkorten går isär redan under matchen. Den ena pressar, den andra väljer sina ronder.",
      "Slutsignalen löser ingenting. Korten delas, och två av tre ger segern åt utmanaren.",
      "Den 6 april 1987 i Las Vegas. Sugar Ray Leonard vinner på delat domslut över Marvin Hagler efter tolv ronder.",
    ],
  },
  {
    id: "wimbledon-epic-1980",
    sport: "tennis",
    clues: [
      "Herrfinal på gräs. Huvudbanan är klippt kort, och matchen kan gå till fem set.",
      "Två spelare med olika spel. Den ena är tyst vid baslinjen, den andra attackerar nätet och diskuterar linjerna.",
      "Serven möts tidigt. Den ene håller bollen i spel, den andre söker avslut vid nät.",
      "Fjärde set kräver ett särspel. Siffrorna går till 18–16, långt förbi det som brukar räcka.",
      "Wimbledonfinalen den 5 juli 1980. Björn Borg slår John McEnroe med 1–6, 7–5, 6–3, 6–7, 8–6.",
    ],
  },
  {
    id: "federer-nadal-2008",
    sport: "tennis",
    clues: [
      "Skymning på gräs. Herrfinalen har redan gått över i ett femte set när ljuset börjar sina.",
      "Den ene jagar ett sjätte rakt guld på samma bana. Den andre jagar sitt första där.",
      "Två set åt den yngre, sedan två särspel åt den äldre. Allt står och väger i det femte.",
      "Bollen hålls i spel tills ett break sent i setet räcker. Klockan har gått mot fem timmar.",
      "Wimbledonfinalen den 6 juli 2008. Rafael Nadal slår Roger Federer med 6–4, 6–4, 6–7, 6–7, 9–7.",
    ],
  },
  {
    id: "borg-mcenroe-1981",
    sport: "tennis",
    clues: [
      "Samma gräsfinal som året innan, samma två namn på programmet. Den ene jagar ett sjätte rakt.",
      "Första setet går till baslinjen. Sedan kommer två särspel, och nätspelaren tar båda.",
      "Publiken känner igen bråket om linjerna. Den tyste svarar med längd, inte med ljud.",
      "Fjärde setet stängs utan ett femte. Sviten på huvudbanan tar slut.",
      "Wimbledonfinalen den 4 juli 1981. John McEnroe slår Björn Borg med 4–6, 7–6, 7–6, 6–4.",
    ],
  },
  {
    id: "edberg-becker-1988",
    sport: "tennis",
    clues: [
      "Regnet äter upp söndagen. Herrfinalen på gräs får vänta till måndagen.",
      "Två spelare som mötts ofta. Den ene vid nätet, den andre med en tung serve från baslinjen.",
      "Första setet går till serven. Sedan ett särspel, och därefter två set som glider åt samma håll.",
      "Måndagens ljus räcker. Matchen behöver inget femte set.",
      "Wimbledonfinalen avgjord den 4 juli 1988. Stefan Edberg slår Boris Becker med 4–6, 7–6, 6–4, 6–2.",
    ],
  },
  {
    id: "king-1973",
    sport: "tennis",
    clues: [
      "En inomhusbana under en kupol, större än en vanlig hall. Underlaget är hårt, och kvällen är byggd för tv.",
      "Bäst av fem set. Utmanaren är äldre och bärs in. En symbolisk gris står på spel.",
      "Den ena servar och söker nätet. Den andra tar bollen tidigt och styr från baslinjen.",
      "Raka set under taket. Varje set stängs utan att ställningen vänder.",
      "Den 20 september 1973 i Houston. Billie Jean King slår Bobby Riggs med 6–4, 6–3, 6–3.",
    ],
  },
  {
    id: "duplantis-2026",
    sport: "athletics",
    clues: [
      "En inomhustävling med en enda gren. Mattan ligger redo, ribban väntar högt, och vinden är borta.",
      "Tre höjder klaras i första försöket. Sedan ber hopparen om ett lyft långt större än en centimeter.",
      "Ribban flyttas tjugotre centimeter upp. Det finns bara ett försök, och staven är redan vald.",
      "Staven böjs under taket. Kroppen går över utan att ribban rör sig, och hallen reser sig.",
      "Den 12 mars 2026 i Uppsala. Armand Duplantis klarar 6,31 meter och sätter sitt femtonde världsrekord i stav.",
    ],
  },
  {
    id: "owens-1936",
    sport: "athletics",
    clues: [
      "En kolstybbana och en längdhoppsgrop. Startblocken står redo, och vinden mäts före varje lopp.",
      "Fyra grenar på en vecka. Värdarnas manus är redan skrivet, och gästernas löpare ska inte passa in.",
      "I gropen kommer ett råd från en konkurrent i värdlandets tröja: flytta ansatsen. På den korta sprintdistansen syns luckan redan i spurten.",
      "Fyra finaler, fyra segrar. Avståndet syns från läktaren utan målfoto.",
      "OS i Berlin 1936. Jesse Owens vinner 100 meter, 200 meter, längd och stafett. I gropen fick han rådet av Luz Long.",
    ],
  },
  {
    id: "fosbury-1968",
    sport: "athletics",
    clues: [
      "Höjdhoppsställning på hög höjd. Landningen är en mjuk matta, inte en sandgrop.",
      "Luften är tunn. Hopparen som ingen sett stilen på är sist i ordningen.",
      "Han vänder ryggen mot ribban och tittar upp. De andra tränarna antecknar.",
      "Ribban ligger kvar. Varje försök ser fel ut tills den inte faller.",
      "OS i Mexiko City 1968. Dick Fosbury tar guld i höjd på 2,24 meter, med ryggen före över ribban.",
    ],
  },
  {
    id: "saint-cyr-1956",
    sport: "equestrian",
    clues: [
      "Dressyren rids i en stad som redan har en olympisk arena. De andra grenarna får vänta till andra sidan jorden.",
      "Ett lands karantän flyttar hästarna. Programmet döms i en sommar som egentligen hör till ett annat spel.",
      "En häst och en ryttare som redan vunnit laget. Det individuella programmet är det som återstår.",
      "Poängen stannar över den som tar silver. Skillnaden syns i domarprotokollet, inte i ett fall.",
      "Den 16 juni 1956 i Stockholm. Henri Saint Cyr och Juli tar individuellt dressyrguld med 860 poäng.",
    ],
  },
  {
    id: "tokyo-hopp-2021",
    sport: "equestrian",
    clues: [
      "En bana utomhus, dömd mot klockan. Laget har tre ryttare, och den sista får den svåraste tiden.",
      "Första omgången räcker inte. Ett annat lag är lika felfritt, så omhoppningen får avgöra.",
      "Ankaren rider sist. Bommarna står kvar, och klockan är det enda som skiljer lagen åt.",
      "Tiden räcker. Guldet i laghoppning har varit borta ur landet sedan tjugotalet.",
      "Den 7 augusti 2021 i Tokyo. Sveriges hopplandslag tar OS-guld i omhoppning mot USA, första lagetguldet i grenen sedan 1924.",
    ],
  },
  {
    id: "dujardin-2012",
    sport: "equestrian",
    clues: [
      "Fristil i en park. Musiken är vald, och hästen ska följa den utan att domarna tappar linjen.",
      "Individuell dressyr. Silvret är redan starkt, och guldet kräver ett program över det som setts tidigare.",
      "Steg och galopp hålls i musikens takt. Inget fel syns från läktaren.",
      "Procenten går över nittio. Silvret stannar under.",
      "Den 9 augusti 2012 i Greenwich. Charlotte Dujardin och Valegro tar individuellt dressyrguld med 90,089 procent.",
    ],
  },
  {
    id: "handboll-vm-1999",
    sport: "handball",
    clues: [
      "En finalhall i hetta. Bollen väger mer i andra halvlek, och läktaren hör varje träff i stolpen.",
      "VM-final. Det blågula laget jagar ett fjärde guld, och motståndaren leder i paus.",
      "Ett rött kort efter pausen tar bort en nyckelspelare. Bänken får lösa resten.",
      "Ett mål vänder underläget. Siffrorna skiljer med ett enda när signalen går.",
      "VM-finalen den 15 juni 1999 i Kairo. Sverige slår Ryssland med 25–24. Stefan Lövgren gör sju mål.",
    ],
  },
  {
    id: "handboll-em-1994",
    sport: "handball",
    clues: [
      "Första finalen i en ny europaturnering. Hallen ligger vid en kust, och bollen är i spel en junikväll.",
      "Det blågula laget möter samma motståndare som senare blir ett återkommande finalnamn. Ingen har ett guld att försvara.",
      "Pausen visar arton mot nio. Andra halvlek handlar om att hålla undan, inte om att jaga.",
      "Målvakten står, och avståndet krymper inte. Målskillnaden är tvåsiffrig när signalen går.",
      "EM-finalen den 12 juni 1994 i Porto. Sverige slår Ryssland med 34–21 och tar det första europaguldet.",
    ],
  },
  {
    id: "handboll-em-2022",
    sport: "handball",
    clues: [
      "En finalhall i Centraleuropa. Två lag som mötts nyligen, och det ena har tagit de senaste finalerna.",
      "EM-final en söndag. Pausen slutar med ett måls underläge för det blågula.",
      "Andra halvlek är en målväxling. Ingen drar ifrån med mer än ett par bollar.",
      "Signalen går, och en straff blir kvar. Skytten från kanten sätter den.",
      "EM-finalen den 30 januari 2022 i Budapest. Sverige slår Spanien med 27–26 sedan Niclas Ekberg satt straffen efter signalen.",
    ],
  },
] as const;

export type PoolKluring = (typeof SPORT_KLURING_POOL)[number];
export type PoolSport = PoolKluring["sport"];

/** Same number the arena prints as KLURING #n. 2026-10-04 is 20730. */
export function dayIndexFromKey(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return 0;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function kluringIdsForSport(sport: PoolSport): string[] {
  return SPORT_KLURING_POOL.filter((item) => item.sport === sport).map((item) => item.id);
}

/** The kluring for a UTC date. A sport argument stays inside that sport's rows. */
export function kluringForDay(dateKey: string, sport?: PoolSport): PoolKluring {
  const pool = sport ? SPORT_KLURING_POOL.filter((item) => item.sport === sport) : SPORT_KLURING_POOL;
  const rows = pool.length > 0 ? pool : SPORT_KLURING_POOL;
  return rows[dayIndexFromKey(dateKey) % rows.length];
}

export function cluesForKluring(id: string): readonly string[] | null {
  const row = SPORT_KLURING_POOL.find((item) => item.id === id);
  return row ? row.clues : null;
}
