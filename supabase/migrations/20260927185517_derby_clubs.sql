-- Premier League Derby club table.
-- Club ids match public.profiles.favorite_club.

create table if not exists public.derby_clubs (
  id text primary key,
  name text not null,
  short_name text not null,
  badge_emoji text default '⚽',
  total_points bigint default 0,
  supporters_count int default 0
);

insert into public.derby_clubs (id, name, short_name, badge_emoji, total_points, supporters_count)
values
  ('arsenal', 'Arsenal FC', 'ARS', '🔴⚪', 124500, 18),
  ('liverpool', 'Liverpool FC', 'LIV', '🔴', 119200, 16),
  ('manchester-city', 'Manchester City', 'MCI', '🩵', 110000, 14),
  ('manchester-united', 'Manchester United', 'MUN', '👹', 105800, 15),
  ('chelsea', 'Chelsea FC', 'CHE', '🦁', 98400, 12),
  ('tottenham', 'Tottenham Hotspur', 'TOT', '⚪', 87200, 10),
  ('newcastle', 'Newcastle United', 'NEW', '⚫⚪', 76500, 8),
  ('aston-villa', 'Aston Villa', 'AVL', '🦁', 65400, 7)
on conflict (id) do nothing;

alter table public.derby_clubs enable row level security;

grant select, insert, update, delete on table public.derby_clubs to anon, authenticated;
grant select, insert, update, delete on table public.derby_clubs to service_role;

drop policy if exists "Public read and update derby_clubs" on public.derby_clubs;
create policy "Public read and update derby_clubs"
on public.derby_clubs
for all
to anon, authenticated
using (true)
with check (true);
