-- Separate SHL and Allsvenskan allegiance from the Premier League favorite_club column.
-- Scouts may update only their own sport clubs. Existing unambiguous picks are copied across.

alter table public.profiles
  add column if not exists favorite_hockey_club text;

alter table public.profiles
  add column if not exists favorite_football_club text;

alter table public.profiles
  drop constraint if exists profiles_favorite_hockey_club_check;

alter table public.profiles
  add constraint profiles_favorite_hockey_club_check
  check (
    favorite_hockey_club is null
    or favorite_hockey_club in (
      'Djurgården',
      'Färjestad',
      'Frölunda',
      'Leksand',
      'Brynäs',
      'HV71',
      'Linköping',
      'MODO',
      'Rögle',
      'Skellefteå AIK',
      'Timrå',
      'Växjö Lakers'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_favorite_football_club_check;

alter table public.profiles
  add constraint profiles_favorite_football_club_check
  check (
    favorite_football_club is null
    or favorite_football_club in (
      'AIK',
      'Djurgården',
      'Hammarby',
      'Malmö FF',
      'IFK Göteborg',
      'IF Elfsborg',
      'BK Häcken',
      'Mjällby',
      'IFK Norrköping',
      'Sirius',
      'Kalmar FF',
      'Halmstad'
    )
  );

update public.profiles
set favorite_hockey_club = case favorite_club
  when 'MODO Hockey' then 'MODO'
  when 'Linköping HC' then 'Linköping'
  else favorite_club
end
where favorite_hockey_club is null
  and favorite_club in (
    'Färjestad',
    'Frölunda',
    'Leksand',
    'Brynäs',
    'HV71',
    'MODO Hockey',
    'Linköping HC'
  );

update public.profiles
set favorite_football_club = case favorite_club
  when 'AIK Fotboll' then 'AIK'
  else favorite_club
end
where favorite_football_club is null
  and favorite_club in (
    'AIK',
    'Djurgården',
    'AIK Fotboll',
    'Hammarby',
    'Malmö FF',
    'IFK Göteborg',
    'IF Elfsborg'
  );

grant update (favorite_hockey_club, favorite_football_club) on public.profiles to authenticated;

create index if not exists profiles_favorite_hockey_club_idx
  on public.profiles (favorite_hockey_club)
  where favorite_hockey_club is not null;

create index if not exists profiles_favorite_football_club_idx
  on public.profiles (favorite_football_club)
  where favorite_football_club is not null;
