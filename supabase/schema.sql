-- Sport History Clue
-- Run in the Supabase SQL editor. RLS is on from the start.

-- Hidden answer sheet. The Next.js validation route reads this with the
-- service_role key (bypasses RLS). Anon and authenticated have no SELECT.
create table if not exists public.puzzles (
  id text primary key,
  target_year integer not null check (target_year between 1800 and 2035),
  target_subject text not null,
  accepted_aliases text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

alter table public.puzzles enable row level security;

revoke all on table public.puzzles from anon, authenticated;
grant select, insert, update, delete on table public.puzzles to service_role;

create table if not exists public.score_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  puzzle_id text not null,
  mode text not null check (mode in ('daily', 'expedition')),
  date_key date,
  expedition_slug text,
  clues_revealed integer not null check (clues_revealed between 0 and 6),
  wrong_event_guesses integer not null default 0 check (wrong_event_guesses >= 0),
  year_delta integer not null default 0 check (year_delta >= 0),
  score integer not null check (score >= 0 and score <= 10000),
  solved boolean not null,
  perfect boolean not null default false,
  client_fingerprint text
);

create index if not exists score_submissions_daily_idx
  on public.score_submissions (date_key, score desc)
  where mode = 'daily' and solved = true;

alter table public.score_submissions enable row level security;

-- Anyone may insert a validated row posted by the Next.js score route using the anon key.
-- Reads are public so a simple daily board can be shown without auth.
drop policy if exists "public can insert scores" on public.score_submissions;
create policy "public can insert scores"
  on public.score_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "public can read scores" on public.score_submissions;
create policy "public can read scores"
  on public.score_submissions
  for select
  to anon, authenticated
  using (true);

-- Player profiles. Created on signup; users may only read/update their own row.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  total_score integer not null default 0 check (total_score >= 0),
  expeditions_completed integer not null default 0 check (expeditions_completed >= 0),
  player_level integer not null default 1 check (player_level >= 1),
  title text not null default 'Archive Rookie',
  avatar_url text,
  streak integer not null default 0 check (streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists streak integer not null default 0;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Scout search and duel banners need other players' handles. Scores stay on the same row.
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

-- Directed scout connections. A row means user_id follows connected_user_id.
create table if not exists public.scout_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  connected_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint scout_connections_not_self check (user_id <> connected_user_id),
  constraint scout_connections_unique unique (user_id, connected_user_id)
);

create index if not exists scout_connections_user_idx
  on public.scout_connections (user_id);

create index if not exists scout_connections_connected_idx
  on public.scout_connections (connected_user_id);

alter table public.scout_connections enable row level security;

drop policy if exists "scout_connections_select_own" on public.scout_connections;
create policy "scout_connections_select_own"
  on public.scout_connections
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "scout_connections_insert_own" on public.scout_connections;
create policy "scout_connections_insert_own"
  on public.scout_connections
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "scout_connections_delete_own" on public.scout_connections;
create policy "scout_connections_delete_own"
  on public.scout_connections
  for delete
  to authenticated
  using (auth.uid() = user_id);

create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- After this file, run supabase/seed.sql to load catalog answer sheets.
-- Pro Shop columns, coin grants, and RPCs: supabase/migrations/20260926120000_pro_shop.sql
