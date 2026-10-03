-- Seed public.puzzles from the local catalog.
-- Swedish subjects are canonical. English titles and aliases stay so older guesses still score.

insert into public.puzzles (id, target_year, target_subject, accepted_aliases)
values
  ('athens-1896', 1896, 'Spyridon Louis maraton', ARRAY['Spyridon Louis vinner det första olympiska maratonloppet', 'Spyridon Louis marathon', 'Spyridon Louis wins the first Olympic marathon', 'spyridon louis', 'spyros louis', 'first olympic marathon', '1896 marathon', 'athens marathon', 'louis marathon']),
  ('montevideo-1930', 1930, 'Första VM', ARRAY['Uruguay vinner det första VM-guldet', 'First World Cup', 'Uruguay win the first FIFA World Cup', 'uruguay world cup', '1930 world cup', 'montevideo world cup', 'uruguay argentina 1930', 'estadio centenario']),
  ('owens-1936', 1936, 'Jesse Owens', ARRAY['Jesse Owens tar fyra guld i Berlin', 'Jesse Owens wins four golds in Berlin', 'owens berlin', 'owens four golds', 'berlin 100m', 'jesse owens long jump']),
  ('bern-1954', 1954, 'Miraklet i Bern', ARRAY['Västtysklands mirakel i Bern', 'Miracle of Bern', 'West Germany''s Miracle of Bern', 'wunder von bern', 'west germany hungary 1954', '1954 world cup final', 'helmut rahn']),
  ('pele-1958', 1958, 'Pelé i Sverige', ARRAY['En 17-årig Pelé vinner VM i Sverige', 'Pelé in Sweden', 'A 17-year-old Pelé wins the World Cup in Sweden', 'pele 1958', 'pele sweden', 'brazil 1958', 'pele world cup debut', 'brazil sweden 1958']),
  ('hurst-1966', 1966, 'Geoff Hursts hattrick', ARRAY['Geoff Hursts hattrick på Wembley', 'Geoff Hurst hat-trick', 'Geoff Hurst''s hat-trick at Wembley', 'geoff hurst', '1966 world cup', 'england 1966', 'they think its all over', 'hurst hat trick', 'wembley 1966']),
  ('fosbury-1968', 1968, 'Fosbury-flopen', ARRAY['Dick Fosbury floppar sig till OS-guld', 'Fosbury Flop', 'Dick Fosbury flops to Olympic gold', 'dick fosbury', 'fosbury mexico', '1968 high jump']),
  ('king-1973', 1973, 'Kampen mellan könen', ARRAY['Billie Jean King vinner Kampen mellan könen', 'Battle of the Sexes', 'Billie Jean King wins the Battle of the Sexes', 'billie jean king', 'king riggs', 'billie jean king bobby riggs']),
  ('ali-1974', 1974, 'Djungelns dån', ARRAY['Ali besegrar Foreman i Djungelns dån', 'Rumble in the Jungle', 'Ali defeats Foreman in the Rumble in the Jungle', 'ali foreman', 'muhammad ali kinshasa', 'rope a dope', 'ali vs foreman']),
  ('comaneci-1976', 1976, 'Nadia Comănecis perfekta tia', ARRAY['Nadia Comăneci sätter den första perfekta tian', 'Nadia Comăneci perfect 10', 'Nadia Comăneci scores the first perfect 10', 'nadia comaneci', 'perfect 10', 'comaneci montreal', 'first perfect 10', 'nadia 1976']),
  ('miracle-1980', 1980, 'Miraklet på isen', ARRAY['The Miracle on Ice', 'usa ussr hockey', 'lake placid hockey', 'miracle on ice 1980', 'united states soviet hockey']),
  ('maradona-1986', 1986, 'Maradonas århundradets mål', ARRAY['Maradona''s Goal of the Century', 'Maradona Goal of the Century', 'goal of the century', 'maradona 1986', 'maradona england', 'diego maradona mexico', 'hand of god', 'argentina england 1986']),
  ('dream-team-1992', 1992, 'Dream Team', ARRAY['Dream Team tar OS-guld i Barcelona', 'The Dream Team wins Olympic gold in Barcelona', 'dream team barcelona', 'usa basketball 1992', '1992 olympics basketball']),
  ('mandela-1995', 1995, 'Springboks 1995', ARRAY['Sydafrika vinner rugby-VM i springboktröja', 'South Africa win the Rugby World Cup in a Springbok jersey', '1995 rugby world cup', 'mandela springbok', 'south africa 1995', 'joel stransky', 'invictus']),
  ('united-1999', 1999, 'Manchester Uniteds trippel', ARRAY['Manchester Uniteds trippel på tilläggstid', 'Manchester United Treble', 'Manchester United''s stoppage-time Treble', 'manchester united 1999', 'united treble', 'sheringham solskjaer', 'bayern united 1999', 'camp nou 1999', 'solskjaer 1999']),
  ('chastain-1999', 1999, 'Brandi Chastains straff', ARRAY['Brandi Chastains straff vinner damernas VM', 'Brandi Chastain penalty', 'Brandi Chastain''s penalty wins the Women''s World Cup', 'brandi chastain', '1999 women''s world cup', 'usa china 1999', 'chastain penalty', 'rose bowl 1999']),
  ('bolt-2008', 2008, 'Usain Bolt 100 meter i Peking', ARRAY['Usain Bolt springer 9,69 i Peking', 'Usain Bolt Beijing 100m', 'Usain Bolt runs 9.69 in Beijing', 'usain bolt', 'bolt beijing', 'bolt 9.69', '2008 100m', 'bolt 100m beijing']),
  ('super-saturday-2012', 2012, 'Super Saturday', ARRAY['Super Saturday i London 2012', 'London 2012 Super Saturday', 'ennis farah rutherford', 'mo farah 2012', 'jessica ennis 2012']),
  ('leicester-2016', 2016, 'Leicester Citys titel', ARRAY['Leicester City vinner Premier League till 5000–1', 'Leicester City title', 'Leicester City win the Premier League at 5000-1', 'leicester city', 'leicester 2016', 'leicester premier league', '5000 to 1', 'claudio ranieri leicester', 'leicester title']),
  ('messi-2022', 2022, 'Messis VM', ARRAY['Messi vinner VM i Lusail', 'Messi World Cup', 'Messi wins the World Cup in Lusail', 'argentina 2022', 'lusail', 'messi 2022', 'argentina france 2022', 'qatar world cup final'])

on conflict (id) do update set
  target_year = excluded.target_year,
  target_subject = excluded.target_subject,
  accepted_aliases = excluded.accepted_aliases;
