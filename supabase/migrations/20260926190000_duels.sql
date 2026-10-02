-- Asynchronous duel inbox. Anyone may log a finished head-to-head
-- and read the latest clashes for a handle. Updates and deletes stay closed.

create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  challenge_id text not null,
  challenger_username text not null,
  challenger_score integer not null check (challenger_score >= 0 and challenger_score <= 100000),
  opponent_username text not null,
  opponent_score integer not null check (opponent_score >= 0 and opponent_score <= 100000),
  winner_username text not null
);

create index if not exists duels_challenger_idx
  on public.duels (challenger_username, created_at desc);

create index if not exists duels_opponent_idx
  on public.duels (opponent_username, created_at desc);

alter table public.duels enable row level security;

drop policy if exists "duels_select_public" on public.duels;
create policy "duels_select_public"
  on public.duels
  for select
  to anon, authenticated
  using (true);

drop policy if exists "duels_insert_public" on public.duels;
create policy "duels_insert_public"
  on public.duels
  for insert
  to anon, authenticated
  with check (
    char_length(challenge_id) between 1 and 80
    and char_length(challenger_username) between 1 and 40
    and char_length(opponent_username) between 1 and 40
    and char_length(winner_username) between 1 and 40
  );

revoke all on table public.duels from anon, authenticated;
grant select, insert on table public.duels to anon, authenticated;
