-- Language and country live on the scout profile. Favorite club may be any
-- club the app already knows, including Swedish, American, and Canadian sides.

alter table public.profiles
  add column if not exists locale text not null default 'sv';

alter table public.profiles
  add column if not exists country text not null default 'world';

alter table public.profiles
  drop constraint if exists profiles_locale_check;

alter table public.profiles
  add constraint profiles_locale_check
  check (locale in ('sv', 'en'));

alter table public.profiles
  drop constraint if exists profiles_country_check;

alter table public.profiles
  add constraint profiles_country_check
  check (country in ('se', 'gb', 'us', 'ca', 'world'));

alter table public.profiles
  drop constraint if exists profiles_favorite_club_check;
