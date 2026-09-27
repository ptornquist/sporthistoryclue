-- Premier League club allegiance for the Supporters Derby.
-- Scouts may set only their own row. Public reads already exist on profiles.

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
      'tottenham'
    )
  );

create index if not exists profiles_favorite_club_idx
  on public.profiles (favorite_club)
  where favorite_club is not null;
