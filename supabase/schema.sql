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
alter table public.profiles add column if not exists career_score integer not null default 0 check (career_score >= 0);
alter table public.profiles add column if not exists fixtures_cleared integer not null default 0 check (fixtures_cleared >= 0);

-- One scored result per scout, fixture, and drop day. Blocks replaying the same card for points.
create table if not exists public.played_fixtures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  fixture_id text not null,
  played_on date not null,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now(),
  constraint played_fixtures_once unique (user_id, fixture_id, played_on)
);

create index if not exists played_fixtures_user_idx
  on public.played_fixtures (user_id, played_on desc);

alter table public.played_fixtures enable row level security;

drop policy if exists "played_fixtures_select_own" on public.played_fixtures;
create policy "played_fixtures_select_own"
  on public.played_fixtures
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "played_fixtures_insert_own" on public.played_fixtures;
create policy "played_fixtures_insert_own"
  on public.played_fixtures
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- One win per scout and fixture. Career totals move only through record_fixture_win.
create table if not exists public.user_fixture_solves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  challenge_id text not null,
  score_awarded integer not null check (score_awarded >= 0 and score_awarded <= 10000),
  created_at timestamptz not null default now(),
  constraint user_fixture_solves_once unique (user_id, challenge_id)
);

create index if not exists user_fixture_solves_challenge_idx
  on public.user_fixture_solves (challenge_id);

alter table public.user_fixture_solves enable row level security;

drop policy if exists "user_fixture_solves_select_own" on public.user_fixture_solves;
create policy "user_fixture_solves_select_own"
  on public.user_fixture_solves
  for select
  to authenticated
  using (auth.uid() = user_id);

alter table public.user_fixture_solves add column if not exists fixture_date text;

create unique index if not exists user_fixture_solves_user_day
  on public.user_fixture_solves (user_id, fixture_date);

drop policy if exists "user_fixture_solves_insert_own" on public.user_fixture_solves;
create policy "user_fixture_solves_insert_own"
  on public.user_fixture_solves
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_fixture_solves_update_own" on public.user_fixture_solves;
create policy "user_fixture_solves_update_own"
  on public.user_fixture_solves
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant update (career_score, fixtures_cleared) on public.profiles to authenticated;

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

create or replace function private.record_fixture_win(p_challenge_id text, p_score integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing_score integer;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_challenge_id is null or length(btrim(p_challenge_id)) = 0 or length(p_challenge_id) > 80 then
    raise exception 'Invalid fixture';
  end if;
  if p_score is null or p_score < 0 or p_score > 10000 then
    raise exception 'Invalid score';
  end if;

  select score_awarded into existing_score
  from public.user_fixture_solves
  where user_id = uid and challenge_id = p_challenge_id;

  if found then
    return jsonb_build_object('already_solved', true, 'score_awarded', existing_score);
  end if;

  insert into public.user_fixture_solves (user_id, challenge_id, score_awarded)
  values (uid, p_challenge_id, p_score);

  update public.profiles
  set career_score = career_score + p_score,
      fixtures_cleared = fixtures_cleared + 1,
      updated_at = now()
  where id = uid;

  return jsonb_build_object('already_solved', false, 'score_awarded', p_score);
exception
  when unique_violation then
    select score_awarded into existing_score
    from public.user_fixture_solves
    where user_id = uid and challenge_id = p_challenge_id;
    return jsonb_build_object('already_solved', true, 'score_awarded', existing_score);
end;
$$;

revoke all on function private.record_fixture_win(text, integer) from public, anon;
grant execute on function private.record_fixture_win(text, integer) to authenticated;
grant usage on schema private to authenticated;

create or replace function public.record_fixture_win(p_challenge_id text, p_score integer)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select private.record_fixture_win(p_challenge_id, p_score);
$$;

revoke all on function public.record_fixture_win(text, integer) from public, anon;
grant execute on function public.record_fixture_win(text, integer) to authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Badges are granted only by purchase_badge, which also spends career points.
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null,
  created_at timestamptz not null default now(),
  unlocked_at timestamptz not null default now(),
  constraint user_badges_once unique (user_id, badge_id)
);

alter table public.user_badges add column if not exists unlocked_at timestamptz not null default now();

create index if not exists user_badges_user_idx
  on public.user_badges (user_id);

alter table public.user_badges enable row level security;

drop policy if exists "user_badges_select_own" on public.user_badges;
create policy "user_badges_select_own"
  on public.user_badges
  for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.user_badges from anon, authenticated;
grant select on public.user_badges to authenticated;

create or replace function private.purchase_badge(p_badge_id text, p_cost integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  catalog_cost integer;
  current_score integer;
  next_score integer;
begin
  if uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  catalog_cost := case p_badge_id
    when 'rookie_pin' then 500
    when 'archive_lantern' then 1500
    when 'gold_whistle' then 3000
    when 'hof_sash' then 7500
    when 'chief_intel' then 12000
    else null
  end;

  if catalog_cost is null or p_cost is distinct from catalog_cost then
    return jsonb_build_object('success', false, 'error', 'Unknown badge');
  end if;

  select career_score into current_score
  from public.profiles
  where id = uid
  for update;

  if exists (
    select 1 from public.user_badges
    where user_id = uid and badge_id = p_badge_id
  ) then
    return jsonb_build_object('success', false, 'error', 'Already owned');
  end if;

  if current_score is null then
    return jsonb_build_object('success', false, 'error', 'Scout profile missing');
  end if;
  if current_score < catalog_cost then
    return jsonb_build_object('success', false, 'error', 'Not enough points');
  end if;

  next_score := current_score - catalog_cost;

  update public.profiles
  set career_score = next_score,
      updated_at = now()
  where id = uid;

  insert into public.user_badges (user_id, badge_id)
  values (uid, p_badge_id);

  return jsonb_build_object('success', true, 'new_score', next_score);
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'error', 'Already owned');
end;
$$;

revoke all on function private.purchase_badge(text, integer) from public, anon;
grant execute on function private.purchase_badge(text, integer) to authenticated;

create or replace function public.purchase_badge(p_badge_id text, p_cost integer)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select private.purchase_badge(p_badge_id, p_cost);
$$;

revoke all on function public.purchase_badge(text, integer) from public, anon;
grant execute on function public.purchase_badge(text, integer) to authenticated;

-- After this file, run supabase/seed.sql to load catalog answer sheets.
