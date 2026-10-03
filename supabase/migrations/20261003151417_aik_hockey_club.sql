-- Let scouts pick AIK Hockey in the SHL allegiance dropdown.
-- Football AIK is already allowed on favorite_football_club.

alter table public.profiles
  drop constraint if exists profiles_favorite_hockey_club_check;

alter table public.profiles
  add constraint profiles_favorite_hockey_club_check
  check (
    favorite_hockey_club is null
    or favorite_hockey_club in (
      'AIK Hockey',
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
