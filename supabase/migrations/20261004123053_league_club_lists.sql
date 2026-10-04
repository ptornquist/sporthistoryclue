-- Official SHL and Allsvenskan names for the allegiance dropdowns.
-- Existing short names are renamed before the check constraints are replaced.

update public.profiles
set favorite_hockey_club = case favorite_hockey_club
  when 'Djurgården' then 'Djurgården Hockey'
  when 'Färjestad' then 'Färjestad BK'
  when 'Frölunda' then 'Frölunda HC'
  when 'Leksand' then 'Leksands IF'
  when 'Brynäs' then 'Brynäs IF'
  when 'Linköping' then 'Linköping HC'
  when 'MODO' then 'MODO Hockey'
  when 'Rögle' then 'Rögle BK'
  when 'Timrå' then 'Timrå IK'
  else favorite_hockey_club
end
where favorite_hockey_club in (
  'Djurgården',
  'Färjestad',
  'Frölunda',
  'Leksand',
  'Brynäs',
  'Linköping',
  'MODO',
  'Rögle',
  'Timrå'
);

update public.profiles
set favorite_football_club = case favorite_football_club
  when 'Djurgården' then 'Djurgårdens IF'
  when 'Hammarby' then 'Hammarby IF'
  when 'Mjällby' then 'Mjällby AIF'
  when 'Sirius' then 'IK Sirius'
  when 'Halmstad' then 'Halmstads BK'
  when 'IFK Norrköping' then null
  else favorite_football_club
end
where favorite_football_club in (
  'Djurgården',
  'Hammarby',
  'Mjällby',
  'Sirius',
  'Halmstad',
  'IFK Norrköping'
);

alter table public.profiles drop constraint if exists profiles_favorite_hockey_club_check;
alter table public.profiles
  add constraint profiles_favorite_hockey_club_check
  check (
    favorite_hockey_club is null
    or favorite_hockey_club in (
      'AIK Hockey',
      'Brynäs IF',
      'Djurgården Hockey',
      'Frölunda HC',
      'Färjestad BK',
      'HV71',
      'IF Björklöven',
      'Leksands IF',
      'Linköping HC',
      'Luleå Hockey',
      'Malmö Redhawks',
      'MODO Hockey',
      'Rögle BK',
      'Skellefteå AIK',
      'Timrå IK',
      'Växjö Lakers',
      'Örebro Hockey'
    )
  );

alter table public.profiles drop constraint if exists profiles_favorite_football_club_check;
alter table public.profiles
  add constraint profiles_favorite_football_club_check
  check (
    favorite_football_club is null
    or favorite_football_club in (
      'AIK',
      'BK Häcken',
      'Degerfors IF',
      'Djurgårdens IF',
      'Gais',
      'Halmstads BK',
      'Hammarby IF',
      'IF Brommapojkarna',
      'IF Elfsborg',
      'IFK Göteborg',
      'IK Sirius',
      'Kalmar FF',
      'Malmö FF',
      'Mjällby AIF',
      'Västerås SK',
      'Örgryte IS'
    )
  );
