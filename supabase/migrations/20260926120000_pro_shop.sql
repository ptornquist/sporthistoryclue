-- Pro Shop cosmetics, scout frames, and idempotent solve coin grants.
-- Clients cannot set coins or unlocks directly. Writes go through the RPCs,
-- which flip a transaction-local flag the guard trigger accepts.

alter table public.profiles add column if not exists coins integer not null default 0 check (coins >= 0);
alter table public.profiles add column if not exists unlocked_titles text[] not null default array['rookie'];
alter table public.profiles add column if not exists unlocked_frames text[] not null default array['standard'];
alter table public.profiles add column if not exists equipped_title text not null default 'rookie';
alter table public.profiles add column if not exists equipped_frame text not null default 'standard';
alter table public.profiles add column if not exists matches_solved integer not null default 0 check (matches_solved >= 0);
alter table public.profiles add column if not exists best_streak integer not null default 0 check (best_streak >= 0);

create table if not exists public.coin_grants (
  user_id uuid not null references public.profiles (id) on delete cascade,
  match_id text not null,
  coins integer not null check (coins >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

alter table public.coin_grants enable row level security;

drop policy if exists "coin_grants_select_own" on public.coin_grants;
create policy "coin_grants_select_own"
  on public.coin_grants
  for select
  to authenticated
  using (auth.uid() = user_id);

create schema if not exists private;

create table if not exists private.cosmetic_catalog (
  id text primary key,
  kind text not null check (kind in ('title', 'frame', 'vip')),
  cost integer not null check (cost >= 0),
  grants_titles text[] not null default '{}',
  grants_frames text[] not null default '{}'
);

insert into private.cosmetic_catalog (id, kind, cost, grants_titles, grants_frames) values
  ('rookie', 'title', 0, '{}', '{}'),
  ('ice-analyst', 'title', 400, '{}', '{}'),
  ('ringside', 'title', 450, '{}', '{}'),
  ('record-breaker', 'title', 900, '{}', '{}'),
  ('golden-boot', 'title', 1100, '{}', '{}'),
  ('hall-of-famer', 'title', 2500, '{}', '{}'),
  ('standard', 'frame', 0, '{}', '{}'),
  ('ice-rink', 'frame', 500, '{}', '{}'),
  ('arena-lights', 'frame', 1200, '{}', '{}'),
  ('velvet-rope', 'frame', 1400, '{}', '{}'),
  ('golden-glow', 'frame', 2800, '{}', '{}'),
  ('club-key', 'vip', 5000, array['hall-of-famer'], array['golden-glow'])
on conflict (id) do update
  set kind = excluded.kind,
      cost = excluded.cost,
      grants_titles = excluded.grants_titles,
      grants_frames = excluded.grants_frames;

revoke all on table private.cosmetic_catalog from public, anon, authenticated;

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
  return new;
end;
$$;

drop trigger if exists profiles_guard_cosmetics on public.profiles;
create trigger profiles_guard_cosmetics
  before update on public.profiles
  for each row execute function private.guard_cosmetic_columns();

create or replace function private.cosmetic_payload(uid uuid, earned integer default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'earned', earned,
    'coins', coins,
    'unlocked_titles', unlocked_titles,
    'unlocked_frames', unlocked_frames,
    'equipped_title', equipped_title,
    'equipped_frame', equipped_frame,
    'total_score', total_score,
    'matches_solved', matches_solved,
    'streak', streak,
    'best_streak', best_streak
  )
  from public.profiles
  where id = uid;
$$;

create or replace function private.purchase_cosmetic(item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  uid uuid := auth.uid();
  item private.cosmetic_catalog%rowtype;
  prof public.profiles%rowtype;
  next_titles text[];
  next_frames text[];
  already boolean;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select * into item from private.cosmetic_catalog where id = item_id;
  if not found then
    raise exception 'unknown item';
  end if;

  select * into prof from public.profiles where id = uid for update;
  if not found then
    raise exception 'profile missing';
  end if;

  already := case
    when item.kind = 'title' then item.id = any(prof.unlocked_titles)
    when item.kind = 'frame' then item.id = any(prof.unlocked_frames)
    else item.grants_titles <@ prof.unlocked_titles and item.grants_frames <@ prof.unlocked_frames
  end;

  if already then
    return private.cosmetic_payload(uid, 0);
  end if;

  if prof.coins < item.cost then
    raise exception 'insufficient coins';
  end if;

  select coalesce(array_agg(distinct title_id), '{}')
    into next_titles
  from unnest(prof.unlocked_titles || case when item.kind = 'title' then array[item.id] else '{}' end || item.grants_titles) as title_id;

  select coalesce(array_agg(distinct frame_id), '{}')
    into next_frames
  from unnest(prof.unlocked_frames || case when item.kind = 'frame' then array[item.id] else '{}' end || item.grants_frames) as frame_id;

  perform set_config('app.cosmetic_write', 'on', true);
  update public.profiles
  set coins = prof.coins - item.cost,
      unlocked_titles = next_titles,
      unlocked_frames = next_frames,
      equipped_title = case
        when item.kind = 'title' then item.id
        when cardinality(item.grants_titles) > 0 then item.grants_titles[1]
        else prof.equipped_title
      end,
      equipped_frame = case
        when item.kind = 'frame' then item.id
        when cardinality(item.grants_frames) > 0 then item.grants_frames[1]
        else prof.equipped_frame
      end,
      updated_at = now()
  where id = uid;

  return private.cosmetic_payload(uid, 0);
end;
$$;

create or replace function private.equip_cosmetic(item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  uid uuid := auth.uid();
  item private.cosmetic_catalog%rowtype;
  prof public.profiles%rowtype;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select * into item from private.cosmetic_catalog where id = item_id;
  if not found or item.kind = 'vip' then
    raise exception 'not equippable';
  end if;

  select * into prof from public.profiles where id = uid for update;
  if not found then
    raise exception 'profile missing';
  end if;

  if item.kind = 'title' and not (item.id = any(prof.unlocked_titles)) then
    raise exception 'locked';
  end if;
  if item.kind = 'frame' and not (item.id = any(prof.unlocked_frames)) then
    raise exception 'locked';
  end if;

  perform set_config('app.cosmetic_write', 'on', true);
  update public.profiles
  set equipped_title = case when item.kind = 'title' then item.id else equipped_title end,
      equipped_frame = case when item.kind = 'frame' then item.id else equipped_frame end,
      updated_at = now()
  where id = uid;

  return private.cosmetic_payload(uid, 0);
end;
$$;

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

  perform set_config('app.cosmetic_write', 'on', true);
  update public.profiles
  set coins = coins + earned,
      total_score = total_score + greatest(coalesce(point_score, 0), 0),
      matches_solved = matches_solved + 1,
      streak = safe_streak,
      best_streak = greatest(best_streak, safe_streak),
      player_level = greatest(1, floor(sqrt((total_score + greatest(coalesce(point_score, 0), 0)) / 200.0))::integer),
      updated_at = now()
  where id = uid;

  return private.cosmetic_payload(uid, earned);
end;
$$;

revoke all on function private.guard_cosmetic_columns() from public, anon, authenticated;
revoke all on function private.cosmetic_payload(uuid, integer) from public, anon, authenticated;
revoke all on function private.purchase_cosmetic(text) from public, anon, authenticated;
revoke all on function private.equip_cosmetic(text) from public, anon, authenticated;
revoke all on function private.award_solve_coins(text, integer, boolean, boolean, boolean, integer) from public, anon, authenticated;

create or replace function public.purchase_cosmetic(item_id text)
returns jsonb
language sql
security invoker
set search_path = public, private
as $$
  select private.purchase_cosmetic(item_id);
$$;

create or replace function public.equip_cosmetic(item_id text)
returns jsonb
language sql
security invoker
set search_path = public, private
as $$
  select private.equip_cosmetic(item_id);
$$;

create or replace function public.award_solve_coins(
  match_id text,
  point_score integer,
  is_daily boolean,
  streak_continued boolean,
  duel_won boolean,
  new_streak integer
)
returns jsonb
language sql
security invoker
set search_path = public, private
as $$
  select private.award_solve_coins(match_id, point_score, is_daily, streak_continued, duel_won, new_streak);
$$;

revoke all on function public.purchase_cosmetic(text) from public, anon;
revoke all on function public.equip_cosmetic(text) from public, anon;
revoke all on function public.award_solve_coins(text, integer, boolean, boolean, boolean, integer) from public, anon;

grant execute on function private.purchase_cosmetic(text) to authenticated;
grant execute on function private.equip_cosmetic(text) to authenticated;
grant execute on function private.award_solve_coins(text, integer, boolean, boolean, boolean, integer) to authenticated;
grant usage on schema private to authenticated;

grant execute on function public.purchase_cosmetic(text) to authenticated;
grant execute on function public.equip_cosmetic(text) to authenticated;
grant execute on function public.award_solve_coins(text, integer, boolean, boolean, boolean, integer) to authenticated;
