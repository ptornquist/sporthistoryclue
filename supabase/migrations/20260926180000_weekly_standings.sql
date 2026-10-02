-- Weekly division points. The award RPC adds the solve onto the current
-- Monday–Sunday UTC week and resets the counter when that week changes.
-- Clients cannot write the columns; the cosmetic guard freezes them.

alter table public.profiles
  add column if not exists week_score integer not null default 0 check (week_score >= 0);

alter table public.profiles
  add column if not exists week_start date;

create index if not exists profiles_total_score_idx
  on public.profiles (total_score desc);

create index if not exists profiles_week_score_idx
  on public.profiles (week_start, week_score desc);

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
  return new;
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

  return private.cosmetic_payload(uid, earned);
end;
$$;
