-- Separate supporter clubs and the points each board receives.
-- Clients may choose the clubs. Only the award function may change the score columns.

alter table public.profiles
  add column if not exists hockey_club text,
  add column if not exists football_club text,
  add column if not exists international_club text,
  add column if not exists hockey_score integer not null default 0,
  add column if not exists football_score integer not null default 0,
  add column if not exists international_score integer not null default 0;

alter table public.profiles
  drop constraint if exists profiles_hockey_score_check;
alter table public.profiles
  add constraint profiles_hockey_score_check check (hockey_score >= 0);

alter table public.profiles
  drop constraint if exists profiles_football_score_check;
alter table public.profiles
  add constraint profiles_football_score_check check (football_score >= 0);

alter table public.profiles
  drop constraint if exists profiles_international_score_check;
alter table public.profiles
  add constraint profiles_international_score_check check (international_score >= 0);

-- Keep an existing single favorite on the board it belongs to.
update public.profiles
set football_club = favorite_club
where football_club is null
  and favorite_club in (
    'aik', 'djurgarden', 'hammarby', 'malmo', 'ifk-goteborg', 'elfsborg', 'hacken',
    'norrkoping', 'kalmar', 'sirius', 'halmstad', 'gais', 'mjallby', 'brommapojkarna',
    'varnamo', 'degerfors'
  );

update public.profiles
set international_club = favorite_club
where international_club is null
  and favorite_club in (
    'arsenal', 'aston-villa', 'bournemouth', 'brentford', 'brighton', 'chelsea',
    'coventry', 'crystal-palace', 'everton', 'fulham', 'hull', 'ipswich', 'leeds',
    'liverpool', 'manchester-city', 'manchester-united', 'newcastle', 'nottingham-forest',
    'sunderland', 'tottenham'
  );

update public.profiles
set football_score = total_score
where football_club is not null
  and football_score = 0
  and total_score > 0;

update public.profiles
set international_score = total_score
where international_club is not null
  and football_club is null
  and international_score = 0
  and total_score > 0;

create index if not exists profiles_hockey_club_idx
  on public.profiles (hockey_club) where hockey_club is not null;
create index if not exists profiles_football_club_idx
  on public.profiles (football_club) where football_club is not null;
create index if not exists profiles_international_club_idx
  on public.profiles (international_club) where international_club is not null;

create or replace function private.guard_cosmetic_columns()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.cosmetic_write', true) = 'on' then
    return new;
  end if;
  new.coins := old.coins;
  new.unlocked_titles := old.unlocked_titles;
  new.unlocked_frames := old.unlocked_frames;
  new.equipped_title := old.equipped_title;
  new.equipped_frame := old.equipped_frame;
  new.matches_solved := old.matches_solved;
  new.best_streak := old.best_streak;
  new.total_score := old.total_score;
  new.week_score := old.week_score;
  new.week_start := old.week_start;
  new.hockey_score := old.hockey_score;
  new.football_score := old.football_score;
  new.international_score := old.international_score;
  return new;
end;
$$;

drop function if exists public.award_solve_coins(text, integer, boolean, boolean, boolean, integer);
drop function if exists private.award_solve_coins(text, integer, boolean, boolean, boolean, integer);

create or replace function private.award_solve_coins(
  match_id text,
  point_score integer,
  is_daily boolean,
  streak_continued boolean,
  duel_won boolean,
  new_streak integer,
  sport text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  uid uuid := auth.uid();
  prof public.profiles%rowtype;
  earned integer := 0;
  safe_streak integer;
  inserted integer;
  points integer;
  current_monday date;
  week_points integer;
  board text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if match_id is null or match_id !~ '^[A-Za-z0-9_-]{1,80}$' then
    raise exception 'invalid match';
  end if;

  select * into prof from public.profiles where id = uid for update;
  if not found then
    raise exception 'profile missing';
  end if;

  safe_streak := least(greatest(coalesce(new_streak, 0), 0), prof.streak + 1);
  if safe_streak < 2 then
    streak_continued := false;
  end if;

  if coalesce(is_daily, false) then
    earned := earned + 100;
  end if;
  if coalesce(streak_continued, false) then
    earned := earned + 50;
  end if;
  if coalesce(duel_won, false) then
    earned := earned + 150;
  end if;

  insert into public.coin_grants (user_id, match_id, coins)
  values (uid, match_id, earned)
  on conflict (user_id, match_id) do nothing
  returning coins into inserted;

  if inserted is null then
    return private.cosmetic_payload(uid, 0);
  end if;

  points := greatest(coalesce(point_score, 0), 0);
  current_monday := (timezone('utc', now()))::date
    - (extract(isodow from timezone('utc', now()))::integer - 1);
  week_points := case
    when prof.week_start = current_monday then prof.week_score + points
    else points
  end;
  board := case
    when sport = 'ice_hockey' then 'hockey'
    when sport = 'football' then 'football'
    else 'international'
  end;

  perform set_config('app.cosmetic_write', 'on', true);
  update public.profiles
  set coins = coins + earned,
      total_score = total_score + points,
      week_score = week_points,
      week_start = current_monday,
      matches_solved = matches_solved + 1,
      streak = safe_streak,
      best_streak = greatest(best_streak, safe_streak),
      player_level = greatest(1, floor(sqrt((total_score + points) / 200.0))::integer),
      hockey_score = hockey_score + case when board = 'hockey' then points else 0 end,
      football_score = football_score + case when board = 'football' then points else 0 end,
      international_score = international_score + case when board = 'international' then points else 0 end,
      updated_at = now()
  where id = uid;

  insert into public.club_activity (club_id, user_id, kind, label, score)
  select m.club_id,
         uid,
         'solve',
         case when coalesce(is_daily, false) then 'today''s Daily Drop' else left(match_id, 80) end,
         points
  from public.club_members m
  where m.user_id = uid;

  return private.cosmetic_payload(uid, earned);
end;
$$;

create or replace function public.award_solve_coins(
  match_id text,
  point_score integer,
  is_daily boolean,
  streak_continued boolean,
  duel_won boolean,
  new_streak integer,
  sport text default null
)
returns jsonb
language sql
security invoker
set search_path = public, private
as $$
  select private.award_solve_coins(match_id, point_score, is_daily, streak_continued, duel_won, new_streak, sport);
$$;

revoke all on function private.award_solve_coins(text, integer, boolean, boolean, boolean, integer, text) from public, anon;
revoke all on function public.award_solve_coins(text, integer, boolean, boolean, boolean, integer, text) from public, anon;
grant execute on function private.award_solve_coins(text, integer, boolean, boolean, boolean, integer, text) to authenticated;
grant execute on function public.award_solve_coins(text, integer, boolean, boolean, boolean, integer, text) to authenticated;

-- Follow a legend card (Pele, Serena, Jordan) without a fake auth user.
create table if not exists public.legend_follows (
  user_id uuid not null references public.profiles (id) on delete cascade,
  legend_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, legend_id),
  constraint legend_follows_id_check check (legend_id ~ '^legend-[a-z0-9-]{1,40}$')
);

alter table public.legend_follows enable row level security;

drop policy if exists "legend_follows_select_own" on public.legend_follows;
create policy "legend_follows_select_own"
  on public.legend_follows
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "legend_follows_insert_own" on public.legend_follows;
create policy "legend_follows_insert_own"
  on public.legend_follows
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "legend_follows_delete_own" on public.legend_follows;
create policy "legend_follows_delete_own"
  on public.legend_follows
  for delete
  to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "avatars_own_insert" on storage.objects;
create policy "avatars_own_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_own_update" on storage.objects;
create policy "avatars_own_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_own_delete" on storage.objects;
create policy "avatars_own_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
