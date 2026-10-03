-- Swedish club allegiance shares profiles.favorite_club with the Supporters Derby.
-- Premier League ids stay valid. Scouts may update only their own favorite_club.

alter table public.profiles
  add column if not exists favorite_club text;

alter table public.profiles
  drop constraint if exists profiles_favorite_club_check;

alter table public.profiles
  add constraint profiles_favorite_club_check
  check (
    favorite_club is null
    or favorite_club in (
      'arsenal',
      'aston-villa',
      'bournemouth',
      'brentford',
      'brighton',
      'chelsea',
      'coventry',
      'crystal-palace',
      'everton',
      'fulham',
      'hull',
      'ipswich',
      'leeds',
      'liverpool',
      'manchester-city',
      'manchester-united',
      'newcastle',
      'nottingham-forest',
      'sunderland',
      'tottenham',
      'AIK',
      'Djurgården',
      'Hammarby',
      'Leksand',
      'Färjestad',
      'Frölunda',
      'Brynäs',
      'Malmö FF',
      'IFK Göteborg',
      'AIK Fotboll',
      'IF Elfsborg',
      'MODO Hockey',
      'HV71',
      'Linköping HC'
    )
  );

grant update (favorite_club) on public.profiles to authenticated;
