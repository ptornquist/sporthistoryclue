-- Seed 30 daily challenges for 2026-11
-- Paste into the Supabase SQL editor. Existing ids are skipped.

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'athens-1896-2026-11-01',
  '2026-11-01',
  '2026-11-01',
  'Spyridon Louis vinner det första olympiska maratonloppet',
  'Spyridon Louis vinner det första olympiska maratonloppet',
  1896,
  'Olympics',
  'olympics',
  '["En lokal amatör, mer van vid att bära vatten än att tävla, anmäls nästan i efterhand. Distansen är ny. Stadion är av marmor.","En herde som burit vatten springer in i en hästsko av marmor. En kronprins sluter upp. En nation bestämmer sig för att spelen är tillbaka.","Distans: cirka 40 km · Vinnarens yrke: Vattenbärare / herde","Beskuren bild: en marmorstadion i dammet.","En grek har vunnit! En grek har vunnit! · Värdstad: Aten · Publik: 80 000 på stadion"]'::jsonb,
  '["Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin","Västtysklands mirakel i Bern"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'montevideo-1930-2026-11-02',
  '2026-11-02',
  '2026-11-02',
  'Uruguay vinner det första VM-guldet',
  'Uruguay vinner det första VM-guldet',
  1930,
  'Fotboll',
  'football',
  '["Bara tretton förbund gör resan. Europa stannar mest hemma. Finalen är ett grannbråk på en stadion byggd för ett hundraårsjubileum.","En ny pokal får sitt första namn vid en flodmynning. Himmelblått firar som om staden aldrig ska sova.","Slutresultat: 4–2 · Antal lag: 13","Beskuren bild: en nattlig plan och en ny stadion.","Himlen är en karneval. Montevideo kommer inte att sova. · Värd: Uruguay · Motståndare: Argentina"]'::jsonb,
  '["Uruguay vinner det första VM-guldet","Spyridon Louis vinner det första olympiska maratonloppet","Jesse Owens tar fyra guld i Berlin","Västtysklands mirakel i Bern"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'owens-1936-2026-11-03',
  '2026-11-03',
  '2026-11-03',
  'Jesse Owens tar fyra guld i Berlin',
  'Jesse Owens tar fyra guld i Berlin',
  1936,
  'Friidrott',
  'athletics',
  '["Fyra finaler, en vecka, en aktiv. Värden ville ha en annan historia ur kolstybben.","En sprinter från en annan kontinent samlar guld under strålkastare som var tänkta för någon annan. Längden avgörs mot en hoppare från värdnationen som ger råd i gropen.","Guld: 4 · Tid 100 m: 10,3","Beskuren bild: kolstybb och en längdhoppsgrop.","Jag lät fötterna tala för mig. · Grenar: 100, 200, längd, stafett · Värdstad: Berlin"]'::jsonb,
  '["Jesse Owens tar fyra guld i Berlin","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Västtysklands mirakel i Bern"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'bern-1954-2026-11-04',
  '2026-11-04',
  '2026-11-04',
  'Västtysklands mirakel i Bern',
  'Västtysklands mirakel i Bern',
  1954,
  'Fotboll',
  'football',
  '["Gästerna hade redan satt åtta på den här motståndaren i gruppen. I finalen är regnet bibliskt och favoriten leder med 2–0 efter åtta minuter.","Ett andra mål i regnet avslutar en obesegrad svit och blir en ursprungshistoria för en delad nation.","Slutresultat: 3–2 · Upphämtning från: 0–2","Beskuren bild: regn på en VM-plan.","Aus! Aus! Aus! Das Spiel ist aus! · Vinnare: Västtyskland · Förlorande favorit: Ungern (det gyllene laget)"]'::jsonb,
  '["Västtysklands mirakel i Bern","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'pele-1958-2026-11-05',
  '2026-11-05',
  '2026-11-05',
  'En 17-årig Pelé vinner VM i Sverige',
  'En 17-årig Pelé vinner VM i Sverige',
  1958,
  'Fotboll',
  'football',
  '["En tonåring i nummer 10 gråter i en kaptens tröja när det är över. Värdarna har förlorat på egen hemmaplan.","En kantspelare som går rakt på, ett protokoll som fylls, och en pojke från inlandet som utropar en dynasti på värdarnas nationalarena.","Ålder: 17 · Slutresultat: 5–2","Beskuren bild: en tonårings rygg i en VM-final.","Han spelar som om bollen är en vän han har känt hela livet. · Vinnare: Brasilien · Värd / motståndare: Sverige"]'::jsonb,
  '["En 17-årig Pelé vinner VM i Sverige","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'hurst-1966-2026-11-06',
  '2026-11-06',
  '2026-11-06',
  'Geoff Hursts hattrick på Wembley',
  'Geoff Hursts hattrick på Wembley',
  1966,
  'Fotboll',
  'football',
  '["En hemmafinal. Förlängning. Ett skott som tar i ribban och kommer ner — på linjen, över den, eller i diskussionen för alltid.","Kaptenen lyfter pokalen. En anfallare har tre. En nation daterar sin kalender från en grå julieftermiddag.","Slutresultat: 4–2 efter förlängning · Arena: Wembley","Beskuren bild: en ribba och en boll som kommer ner.","De tror att det är över... det är det nu! · Hattrick: Ja, det enda i en herr-VM-final · Motståndare: Västtyskland"]'::jsonb,
  '["Geoff Hursts hattrick på Wembley","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'fosbury-1968-2026-11-07',
  '2026-11-07',
  '2026-11-07',
  'Dick Fosbury floppar sig till OS-guld',
  'Dick Fosbury floppar sig till OS-guld',
  1968,
  'Friidrott',
  'athletics',
  '["Han vänder ryggen mot ribban. Tränarna grimaserar. Fotograferna har aldrig sett en höjdhoppare titta mot himlen i luften.","En sorts ingenjör, sist i hoppordningen, klarar en höjd som ger varje framtida hoppare en ny form.","Gren: Höjdhopp · Segerhöjd: 2,24 m","Beskuren bild: en rygg mot ribban.","Jag tror att jag har uppfunnit ett nytt sätt att hoppa. · Teknik: Ryggläggning (flop) · Spel: Mexico City"]'::jsonb,
  '["Dick Fosbury floppar sig till OS-guld","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'king-1973-2026-11-08',
  '2026-11-08',
  '2026-11-08',
  'Billie Jean King vinner Kampen mellan könen',
  'Billie Jean King vinner Kampen mellan könen',
  1973,
  'Tennis',
  'tennis',
  '["En betydligt äldre spelare har redan slagit den som rankas högst. I kväll bärs utmanaren in på en bår. En hel kontinent tittar.","Raka set under ett tak. En symbolisk gris stannar hos förloraren. En lagparagraf får sitt mest berömda klipp.","Resultat: 6–4, 6–3, 6–3 · Format: Bäst av fem, uppvisning med allt på spel","Beskuren bild: en inomhusbana under en kupol.","Det här handlar inte om en tennismatch. Det handlar om samhällsförändring. · Arena: Houston Astrodome · Vinnare: Billie Jean King"]'::jsonb,
  '["Billie Jean King vinner Kampen mellan könen","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'ali-1974-2026-11-09',
  '2026-11-09',
  '2026-11-09',
  'Ali besegrar Foreman i Djungelns dån',
  'Ali besegrar Foreman i Djungelns dån',
  1974,
  'Boxning',
  'boxing',
  '["Den yngre mästaren ska vara omöjlig att träffa. Den äldre mannen skyddar sig mot repen rond efter rond i en start klockan fyra på morgonen.","En natt i en stad vid floden. En promotor som älskar buller. En höger som fäller den obesegrade mästaren när kraften tar slut.","Resultat: KO, rond 8","Beskuren bild: rep och en morgonröd ring.","Ali bomaye! · Stad: Kinshasa · Vinnare: Muhammad Ali · Förlorare: George Foreman"]'::jsonb,
  '["Ali besegrar Foreman i Djungelns dån","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'comaneci-1976-2026-11-10',
  '2026-11-10',
  '2026-11-10',
  'Nadia Comăneci sätter den första perfekta tian',
  'Nadia Comăneci sätter den första perfekta tian',
  1976,
  'Gymnastik',
  'gymnastics',
  '["Den elektroniska tavlan var inte byggd för siffran den visar. Arenan behöver en sekund för att förstå.","En tonåring kopplar om en sport med en fattning domarna knappt har sett. Flera tior innan spelen är över.","Redskap: Barr (första tian)","Beskuren bild: en resultattavla som stannar på 1,00.","En tia. En perfekt tia. Tavlan vet inte hur den ska säga det. · Poäng: 10,00 · Ålder: 14 · Spel: Montréal"]'::jsonb,
  '["Nadia Comăneci sätter den första perfekta tian","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'miracle-1980-2026-11-11',
  '2026-11-11',
  '2026-11-11',
  'Miraklet på isen',
  'Miraklet på isen',
  1980,
  'ice-hockey',
  'ice-hockey',
  '["Amatörer mot en maskin som tränar året runt. En bergsby. En flagga som inte vill ligga still.","Ett collegelag. Ett avgörande från en kapten. En semifinal som ett helt land minns som en final.","Resultat: 4–3","Beskuren bild: en isrink och en flagga i rörelse.","Tror du på mirakel? JA! · Vinnare: USA · Motståndare: Sovjetunionen · Arena: Lake Placid"]'::jsonb,
  '["Miraklet på isen","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'maradona-1986-2026-11-12',
  '2026-11-12',
  '2026-11-12',
  'Maradonas århundradets mål',
  'Maradonas århundradets mål',
  1986,
  'Fotboll',
  'football',
  '["Hettan ligger kvar på hög höjd. En nummer 10 tar bollen på egen planhalva och bestämmer sig för att ingen ska få stoppa honom.","En solskenshistoria på hög höjd där teologin mötte fysiken i en ikonisk kvartsfinal. Först ett mål som reglerna inte riktigt rymmer, sedan en löpning som arkivet vägrar glömma.","Minut: 54'' · Omgång: VM-kvartsfinal","Beskuren bild: en nummer 10 som redan är förbi den förste.","Barrilete cósmico... ¿de qué planeta viniste? · Dribblingar: Beardsley, Reid, Butcher, Fenwick, Shilton · Arena: Estadio Azteca"]'::jsonb,
  '["Maradonas århundradets mål","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'dream-team-1992-2026-11-13',
  '2026-11-13',
  '2026-11-13',
  'Dream Team tar OS-guld i Barcelona',
  'Dream Team tar OS-guld i Barcelona',
  1992,
  'Basket',
  'basketball',
  '["Proffs släpps in för första gången. Uppvärmningen är en större föreställning än de flesta finaler. Motståndarna ber om fotografier.","Tre generationers största namn på samma bänk. Ett guld som ser oundvikligt ut från den första dunkningen.","Facit: 8–0 · Snittmarginal: 43,8 poäng","Beskuren bild: ett parkettgolv och en uppvärmning som redan är final.","De var ett gäng som var bäst i världen, och de spelade som om de var det. · Final: USA 117–85 Kroatien · Stad: Barcelona"]'::jsonb,
  '["Dream Team tar OS-guld i Barcelona","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'mandela-1995-2026-11-14',
  '2026-11-14',
  '2026-11-14',
  'Sydafrika vinner rugby-VM i springboktröja',
  'Sydafrika vinner rugby-VM i springboktröja',
  1995,
  'rugby',
  'rugby',
  '["Förlängning. Ett drop goal från höger. En man i landslagströja som inte står i startelvan går ut på gräset.","Kaptenen lyfter pokalen. Mannen som räcker över den bär ett lågt nummer. En regnbåge, för en stund, i rugbyfärger.","Slutresultat: 15–12 efter förlängning","Beskuren bild: en nummer 6-tröja på gräset.","Idrotten har kraften att förändra världen. · Drop goal: Joel Stransky · Arena: Ellis Park, Johannesburg · Motståndare: Nya Zeeland"]'::jsonb,
  '["Sydafrika vinner rugby-VM i springboktröja","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'united-1999-2026-11-15',
  '2026-11-15',
  '2026-11-15',
  'Manchester Uniteds trippel på tilläggstid',
  'Manchester Uniteds trippel på tilläggstid',
  1999,
  'Fotboll',
  'football',
  '["De ligger under efter en nick på frispark. Klockan är på rött. Två hörnor. Två olika inhoppare.","En trippel på tio dagar. Två inhoppare, båda med ett mål, på bortaplanens tilläggstid.","Slutresultat: 2–1 · Arena: Camp Nou","Beskuren bild: en hörna när klockan redan är ute.","Och Solskjær har avgjort det! · Vinnarmål: Sheringham 91'', Solskjær 93'' · Motståndare: Bayern München"]'::jsonb,
  '["Manchester Uniteds trippel på tilläggstid","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'chastain-1999-2026-11-16',
  '2026-11-16',
  '2026-11-16',
  'Brandi Chastains straff vinner damernas VM',
  'Brandi Chastains straff vinner damernas VM',
  1999,
  'Fotboll',
  'football',
  '["90 000 i en skål i Kalifornien. 0–0 efter förlängning. Den femte straffen i straffläggningen slås med vänster.","En generation som burit landslaget. Motståndarna i den andra tröjan. Ett fotografi som sätter damfotbollen på omslag.","Ordinarie tid: 0–0 (förlängning) · Avgörande: Straffar, 5–4","Beskuren bild: en vänsterfot och en straffpunkt.","Ett ögonblicks vansinne. · Arena: Rose Bowl · Vinnare: USA"]'::jsonb,
  '["Brandi Chastains straff vinner damernas VM","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'bolt-2008-2026-11-17',
  '2026-11-17',
  '2026-11-17',
  'Usain Bolt springer 9,69 i Peking',
  'Usain Bolt springer 9,69 i Peking',
  2008,
  'Friidrott',
  'athletics',
  '["Han är fri långt före bandet. Han breder ut armarna. Klockan sjunker ändå.","En lång sprinter som skulle vara specialist på den längre banan. I slutet av veckan har silhuetten ritats om.","Gren: 100 meter","Beskuren bild: utbredda armar före mållinjen.","Jag är nummer 1. · Tid: 9,69 · Vind: 0,0 m/s · Stad: Peking"]'::jsonb,
  '["Usain Bolt springer 9,69 i Peking","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'super-saturday-2012-2026-11-18',
  '2026-11-18',
  '2026-11-18',
  'Super Saturday i London 2012',
  'Super Saturday i London 2012',
  2012,
  'Friidrott',
  'athletics',
  '["En sista gren i sjukamp, ett längdhopp som ser ut som ett tryckfel, en avslutning på 10 000 meter. Samma stadion, samma timme, samma flagga.","Tre grenar, tre guld, en hemmapublik som hittar ett namn på natten.","Hemmaguld på ~60 min: 3 · Stad: London","Beskuren bild: ett sista varv under ett tak som dånar.","Kom igen, Mo! Kom igen! · Grenar: Sjukamp, längd, 10 000 m · Aktiva: Ennis-Hill, Rutherford, Farah"]'::jsonb,
  '["Super Saturday i London 2012","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'leicester-2016-2026-11-19',
  '2026-11-19',
  '2026-11-19',
  'Leicester City vinner Premier League till 5000–1',
  'Leicester City vinner Premier League till 5000–1',
  2016,
  'Fotboll',
  'football',
  '["Spelbolagens tavla ser fortfarande ut som ett skämt på våren. En anfallare långt hemifrån, ett mittfält av brytningar, en tränare som redan var avskriven.","Ett kryss i huvudstaden och en landsända exploderar. En klubb utan pokaler skriver om tabellen.","Serie: Premier League","Beskuren bild: en räv på ett klubbmärke.","Dilly ding, dilly dong. · Odds före säsongen: 5000–1 · Poäng: 81 · Skyttekung: Jamie Vardy (24)"]'::jsonb,
  '["Leicester City vinner Premier League till 5000–1","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'messi-2022-2026-11-20',
  '2026-11-20',
  '2026-11-20',
  'Messi vinner VM i Lusail',
  'Messi vinner VM i Lusail',
  2022,
  'Fotboll',
  'football',
  '["En ledning som ser avgjord ut vänds av ett hattrick. Förlängning. Lika igen. En straffläggning under en skål som glänser.","Två nummer 10. En första stjärna till kaptenen. Arkivet lägger redan finalen under stort.","Ordinarie + förlängning: 3–3 · Straffar: 4–2","Beskuren bild: en förgylld skål och en straffpunkt.","Jag har drömt det här så många gånger. · Vinnande kapten: Lionel Messi · Arena: Lusail Stadium"]'::jsonb,
  '["Messi vinner VM i Lusail","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'athens-1896-2026-11-21',
  '2026-11-21',
  '2026-11-21',
  'Spyridon Louis vinner det första olympiska maratonloppet',
  'Spyridon Louis vinner det första olympiska maratonloppet',
  1896,
  'Olympics',
  'olympics',
  '["En lokal amatör, mer van vid att bära vatten än att tävla, anmäls nästan i efterhand. Distansen är ny. Stadion är av marmor.","En herde som burit vatten springer in i en hästsko av marmor. En kronprins sluter upp. En nation bestämmer sig för att spelen är tillbaka.","Distans: cirka 40 km · Vinnarens yrke: Vattenbärare / herde","Beskuren bild: en marmorstadion i dammet.","En grek har vunnit! En grek har vunnit! · Värdstad: Aten · Publik: 80 000 på stadion"]'::jsonb,
  '["Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin","Västtysklands mirakel i Bern"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'montevideo-1930-2026-11-22',
  '2026-11-22',
  '2026-11-22',
  'Uruguay vinner det första VM-guldet',
  'Uruguay vinner det första VM-guldet',
  1930,
  'Fotboll',
  'football',
  '["Bara tretton förbund gör resan. Europa stannar mest hemma. Finalen är ett grannbråk på en stadion byggd för ett hundraårsjubileum.","En ny pokal får sitt första namn vid en flodmynning. Himmelblått firar som om staden aldrig ska sova.","Slutresultat: 4–2 · Antal lag: 13","Beskuren bild: en nattlig plan och en ny stadion.","Himlen är en karneval. Montevideo kommer inte att sova. · Värd: Uruguay · Motståndare: Argentina"]'::jsonb,
  '["Uruguay vinner det första VM-guldet","Spyridon Louis vinner det första olympiska maratonloppet","Jesse Owens tar fyra guld i Berlin","Västtysklands mirakel i Bern"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'owens-1936-2026-11-23',
  '2026-11-23',
  '2026-11-23',
  'Jesse Owens tar fyra guld i Berlin',
  'Jesse Owens tar fyra guld i Berlin',
  1936,
  'Friidrott',
  'athletics',
  '["Fyra finaler, en vecka, en aktiv. Värden ville ha en annan historia ur kolstybben.","En sprinter från en annan kontinent samlar guld under strålkastare som var tänkta för någon annan. Längden avgörs mot en hoppare från värdnationen som ger råd i gropen.","Guld: 4 · Tid 100 m: 10,3","Beskuren bild: kolstybb och en längdhoppsgrop.","Jag lät fötterna tala för mig. · Grenar: 100, 200, längd, stafett · Värdstad: Berlin"]'::jsonb,
  '["Jesse Owens tar fyra guld i Berlin","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Västtysklands mirakel i Bern"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'bern-1954-2026-11-24',
  '2026-11-24',
  '2026-11-24',
  'Västtysklands mirakel i Bern',
  'Västtysklands mirakel i Bern',
  1954,
  'Fotboll',
  'football',
  '["Gästerna hade redan satt åtta på den här motståndaren i gruppen. I finalen är regnet bibliskt och favoriten leder med 2–0 efter åtta minuter.","Ett andra mål i regnet avslutar en obesegrad svit och blir en ursprungshistoria för en delad nation.","Slutresultat: 3–2 · Upphämtning från: 0–2","Beskuren bild: regn på en VM-plan.","Aus! Aus! Aus! Das Spiel ist aus! · Vinnare: Västtyskland · Förlorande favorit: Ungern (det gyllene laget)"]'::jsonb,
  '["Västtysklands mirakel i Bern","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'pele-1958-2026-11-25',
  '2026-11-25',
  '2026-11-25',
  'En 17-årig Pelé vinner VM i Sverige',
  'En 17-årig Pelé vinner VM i Sverige',
  1958,
  'Fotboll',
  'football',
  '["En tonåring i nummer 10 gråter i en kaptens tröja när det är över. Värdarna har förlorat på egen hemmaplan.","En kantspelare som går rakt på, ett protokoll som fylls, och en pojke från inlandet som utropar en dynasti på värdarnas nationalarena.","Ålder: 17 · Slutresultat: 5–2","Beskuren bild: en tonårings rygg i en VM-final.","Han spelar som om bollen är en vän han har känt hela livet. · Vinnare: Brasilien · Värd / motståndare: Sverige"]'::jsonb,
  '["En 17-årig Pelé vinner VM i Sverige","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'hurst-1966-2026-11-26',
  '2026-11-26',
  '2026-11-26',
  'Geoff Hursts hattrick på Wembley',
  'Geoff Hursts hattrick på Wembley',
  1966,
  'Fotboll',
  'football',
  '["En hemmafinal. Förlängning. Ett skott som tar i ribban och kommer ner — på linjen, över den, eller i diskussionen för alltid.","Kaptenen lyfter pokalen. En anfallare har tre. En nation daterar sin kalender från en grå julieftermiddag.","Slutresultat: 4–2 efter förlängning · Arena: Wembley","Beskuren bild: en ribba och en boll som kommer ner.","De tror att det är över... det är det nu! · Hattrick: Ja, det enda i en herr-VM-final · Motståndare: Västtyskland"]'::jsonb,
  '["Geoff Hursts hattrick på Wembley","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'fosbury-1968-2026-11-27',
  '2026-11-27',
  '2026-11-27',
  'Dick Fosbury floppar sig till OS-guld',
  'Dick Fosbury floppar sig till OS-guld',
  1968,
  'Friidrott',
  'athletics',
  '["Han vänder ryggen mot ribban. Tränarna grimaserar. Fotograferna har aldrig sett en höjdhoppare titta mot himlen i luften.","En sorts ingenjör, sist i hoppordningen, klarar en höjd som ger varje framtida hoppare en ny form.","Gren: Höjdhopp · Segerhöjd: 2,24 m","Beskuren bild: en rygg mot ribban.","Jag tror att jag har uppfunnit ett nytt sätt att hoppa. · Teknik: Ryggläggning (flop) · Spel: Mexico City"]'::jsonb,
  '["Dick Fosbury floppar sig till OS-guld","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'king-1973-2026-11-28',
  '2026-11-28',
  '2026-11-28',
  'Billie Jean King vinner Kampen mellan könen',
  'Billie Jean King vinner Kampen mellan könen',
  1973,
  'Tennis',
  'tennis',
  '["En betydligt äldre spelare har redan slagit den som rankas högst. I kväll bärs utmanaren in på en bår. En hel kontinent tittar.","Raka set under ett tak. En symbolisk gris stannar hos förloraren. En lagparagraf får sitt mest berömda klipp.","Resultat: 6–4, 6–3, 6–3 · Format: Bäst av fem, uppvisning med allt på spel","Beskuren bild: en inomhusbana under en kupol.","Det här handlar inte om en tennismatch. Det handlar om samhällsförändring. · Arena: Houston Astrodome · Vinnare: Billie Jean King"]'::jsonb,
  '["Billie Jean King vinner Kampen mellan könen","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'ali-1974-2026-11-29',
  '2026-11-29',
  '2026-11-29',
  'Ali besegrar Foreman i Djungelns dån',
  'Ali besegrar Foreman i Djungelns dån',
  1974,
  'Boxning',
  'boxing',
  '["Den yngre mästaren ska vara omöjlig att träffa. Den äldre mannen skyddar sig mot repen rond efter rond i en start klockan fyra på morgonen.","En natt i en stad vid floden. En promotor som älskar buller. En höger som fäller den obesegrade mästaren när kraften tar slut.","Resultat: KO, rond 8","Beskuren bild: rep och en morgonröd ring.","Ali bomaye! · Stad: Kinshasa · Vinnare: Muhammad Ali · Förlorare: George Foreman"]'::jsonb,
  '["Ali besegrar Foreman i Djungelns dån","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.challenges (id, fixture_date, date_key, title, subject, year, category, sport, clues, options, created_at)
values (
  'comaneci-1976-2026-11-30',
  '2026-11-30',
  '2026-11-30',
  'Nadia Comăneci sätter den första perfekta tian',
  'Nadia Comăneci sätter den första perfekta tian',
  1976,
  'Gymnastik',
  'gymnastics',
  '["Den elektroniska tavlan var inte byggd för siffran den visar. Arenan behöver en sekund för att förstå.","En tonåring kopplar om en sport med en fattning domarna knappt har sett. Flera tior innan spelen är över.","Redskap: Barr (första tian)","Beskuren bild: en resultattavla som stannar på 1,00.","En tia. En perfekt tia. Tavlan vet inte hur den ska säga det. · Poäng: 10,00 · Ålder: 14 · Spel: Montréal"]'::jsonb,
  '["Nadia Comăneci sätter den första perfekta tian","Spyridon Louis vinner det första olympiska maratonloppet","Uruguay vinner det första VM-guldet","Jesse Owens tar fyra guld i Berlin"]'::jsonb,
  now()
)
on conflict (id) do nothing;
