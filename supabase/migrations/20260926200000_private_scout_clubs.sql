-- Private scout clubs. Invite codes stay hidden from anyone who is not a member.
-- Creates, joins, and challenge shares go through definer functions. Solves are
-- copied onto each of the player's clubs when coins are awarded.

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 48),
  code text not null check (code ~ '^[A-Z0-9]{6}$'),
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint clubs_code_unique unique (code)
);

create table if not exists public.club_members (
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create index if not exists club_members_user_idx
  on public.club_members (user_id);

create table if not exists public.club_activity (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'solve' check (kind in ('solve', 'challenge')),
  label text not null check (char_length(label) between 1 and 80),
  score integer not null default 0 check (score >= 0 and score <= 100000),
  created_at timestamptz not null default now()
);

create index if not exists club_activity_club_idx
  on public.club_activity (club_id, created_at desc);

alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.club_activity enable row level security;

revoke all on table public.clubs from public, anon, authenticated;
revoke all on table public.club_members from public, anon, authenticated;
revoke all on table public.club_activity from public, anon, authenticated;
grant select on table public.clubs to authenticated;
grant select on table public.club_members to authenticated;
grant select on table public.club_activity to authenticated;

create schema if not exists private;

create or replace function private.is_club_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.club_members
    where club_id = target
      and user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_club_member(uuid) from public, anon, authenticated;
grant execute on function private.is_club_member(uuid) to authenticated;

drop policy if exists "clubs_select_member" on public.clubs;
create policy "clubs_select_member"
  on public.clubs
  for select
  to authenticated
  using (
    created_by = (select auth.uid())
    or private.is_club_member(id)
  );

drop policy if exists "club_members_select_member" on public.club_members;
create policy "club_members_select_member"
  on public.club_members
  for select
  to authenticated
  using (private.is_club_member(club_id));

drop policy if exists "club_activity_select_member" on public.club_activity;
create policy "club_activity_select_member"
  on public.club_activity
  for select
  to authenticated
  using (private.is_club_member(club_id));

create or replace function private.create_scout_club(club_name text, club_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := (select auth.uid());
  clean_name text := btrim(coalesce(club_name, ''));
  clean_code text := upper(btrim(coalesce(club_code, '')));
  created public.clubs%rowtype;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if clean_name !~ '^[A-Za-z0-9][A-Za-z0-9 .''!&-]{0,47}$' then
    raise exception 'invalid name';
  end if;
  if clean_code !~ '^[A-Z0-9]{6}$' then
    raise exception 'invalid code';
  end if;
  if not exists (select 1 from public.profiles where id = uid) then
    raise exception 'profile missing';
  end if;
  if (select count(*) from public.club_members where user_id = uid) >= 12 then
    raise exception 'club limit';
  end if;

  insert into public.clubs (name, code, created_by)
  values (clean_name, clean_code, uid)
  returning * into created;

  insert into public.club_members (club_id, user_id, role)
  values (created.id, uid, 'owner');

  return jsonb_build_object(
    'id', created.id,
    'name', created.name,
    'code', created.code,
    'role', 'owner'
  );
exception
  when unique_violation then
    raise exception 'code taken';
end;
$$;

create or replace function private.join_club_by_code(join_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := (select auth.uid());
  clean_code text := upper(btrim(coalesce(join_code, '')));
  club public.clubs%rowtype;
  member_role text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if clean_code !~ '^[A-Z0-9]{6}$' then
    raise exception 'invalid code';
  end if;
  if not exists (select 1 from public.profiles where id = uid) then
    raise exception 'profile missing';
  end if;

  select * into club from public.clubs where code = clean_code;
  if not found then
    raise exception 'club not found';
  end if;

  select role into member_role
  from public.club_members
  where club_id = club.id and user_id = uid;

  if member_role is null then
    if (select count(*) from public.club_members where user_id = uid) >= 12 then
      raise exception 'club limit';
    end if;
    insert into public.club_members (club_id, user_id, role)
    values (club.id, uid, 'member');
    member_role := 'member';
  end if;

  return jsonb_build_object(
    'id', club.id,
    'name', club.name,
    'code', club.code,
    'role', member_role
  );
end;
$$;

create or replace function private.share_club_challenge(label text, score integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := (select auth.uid());
  clean_label text := btrim(coalesce(label, ''));
  clean_score integer := least(greatest(coalesce(score, 0), 0), 100000);
  inserted integer := 0;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if char_length(clean_label) < 1 or char_length(clean_label) > 80 then
    raise exception 'invalid label';
  end if;

  insert into public.club_activity (club_id, user_id, kind, label, score)
  select club_id, uid, 'challenge', clean_label, clean_score
  from public.club_members
  where user_id = uid;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function private.create_scout_club(text, text) from public, anon, authenticated;
revoke all on function private.join_club_by_code(text) from public, anon, authenticated;
revoke all on function private.share_club_challenge(text, integer) from public, anon, authenticated;
grant execute on function private.create_scout_club(text, text) to authenticated;
grant execute on function private.join_club_by_code(text) to authenticated;
grant execute on function private.share_club_challenge(text, integer) to authenticated;

create or replace function public.create_scout_club(club_name text, club_code text)
returns jsonb
language sql
security invoker
set search_path = public, private
as $$
  select private.create_scout_club(club_name, club_code);
$$;

create or replace function public.join_club_by_code(join_code text)
returns jsonb
language sql
security invoker
set search_path = public, private
as $$
  select private.join_club_by_code(join_code);
$$;

create or replace function public.share_club_challenge(label text, score integer)
returns integer
language sql
security invoker
set search_path = public, private
as $$
  select private.share_club_challenge(label, score);
$$;

revoke all on function public.create_scout_club(text, text) from public, anon;
revoke all on function public.join_club_by_code(text) from public, anon;
revoke all on function public.share_club_challenge(text, integer) from public, anon;
grant execute on function public.create_scout_club(text, text) to authenticated;
grant execute on function public.join_club_by_code(text) to authenticated;
grant execute on function public.share_club_challenge(text, integer) to authenticated;

-- Keep the weekly award path and fan a solve out to every club the scout is in.
create or replace function private.award_solve_coins(
  match_id text,
  point_score integer,
  is_daily boolean,
  streak_continued boolean,
  duel_won boolean,
  new_streak integer
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
