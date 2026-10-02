-- Community clue distribution. Clients may read the totals.
-- Increments go through record_clue_solve, one per client key.

create table if not exists public.challenge_stats (
  challenge_id text primary key,
  clue_1 integer not null default 0 check (clue_1 >= 0),
  clue_2 integer not null default 0 check (clue_2 >= 0),
  clue_3 integer not null default 0 check (clue_3 >= 0),
  clue_4 integer not null default 0 check (clue_4 >= 0),
  clue_5 integer not null default 0 check (clue_5 >= 0),
  clue_6 integer not null default 0 check (clue_6 >= 0),
  missed integer not null default 0 check (missed >= 0),
  total_solves integer not null default 0 check (total_solves >= 0),
  updated_at timestamptz not null default now()
);

alter table public.challenge_stats enable row level security;

drop policy if exists "challenge_stats_select_public" on public.challenge_stats;
create policy "challenge_stats_select_public"
  on public.challenge_stats
  for select
  to anon, authenticated
  using (true);

create table if not exists public.challenge_stat_events (
  challenge_id text not null,
  client_key text not null,
  created_at timestamptz not null default now(),
  primary key (challenge_id, client_key)
);

alter table public.challenge_stat_events enable row level security;

revoke all on table public.challenge_stat_events from anon, authenticated;

create schema if not exists private;

create or replace function private.record_clue_solve(
  challenge_id text,
  clue_index integer,
  won boolean,
  client_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted text;
begin
  if challenge_id is null or challenge_id !~ '^[A-Za-z0-9-]{1,80}$' then
    raise exception 'invalid challenge';
  end if;
  if client_key is null or client_key !~ '^[A-Za-z0-9]{8,80}$' then
    raise exception 'invalid client';
  end if;
  if coalesce(won, false) and (clue_index < 1 or clue_index > 6) then
    raise exception 'invalid clue';
  end if;

  insert into public.challenge_stat_events (challenge_id, client_key)
  values (challenge_id, client_key)
  on conflict (challenge_id, client_key) do nothing
  returning client_key into inserted;

  if inserted is null then
    return;
  end if;

  insert into public.challenge_stats (challenge_id)
  values (challenge_id)
  on conflict (challenge_id) do nothing;

  if coalesce(won, false) then
    update public.challenge_stats
    set clue_1 = clue_1 + case when clue_index = 1 then 1 else 0 end,
        clue_2 = clue_2 + case when clue_index = 2 then 1 else 0 end,
        clue_3 = clue_3 + case when clue_index = 3 then 1 else 0 end,
        clue_4 = clue_4 + case when clue_index = 4 then 1 else 0 end,
        clue_5 = clue_5 + case when clue_index = 5 then 1 else 0 end,
        clue_6 = clue_6 + case when clue_index = 6 then 1 else 0 end,
        total_solves = total_solves + 1,
        updated_at = now()
    where challenge_stats.challenge_id = record_clue_solve.challenge_id;
  else
    update public.challenge_stats
    set missed = missed + 1,
        total_solves = total_solves + 1,
        updated_at = now()
    where challenge_stats.challenge_id = record_clue_solve.challenge_id;
  end if;
end;
$$;

revoke all on function private.record_clue_solve(text, integer, boolean, text) from public, anon, authenticated;

create or replace function public.record_clue_solve(
  challenge_id text,
  clue_index integer,
  won boolean,
  client_key text
)
returns void
language sql
security invoker
set search_path = public, private
as $$
  select private.record_clue_solve(challenge_id, clue_index, won, client_key);
$$;

revoke all on function public.record_clue_solve(text, integer, boolean, text) from public;
grant execute on function private.record_clue_solve(text, integer, boolean, text) to anon, authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function public.record_clue_solve(text, integer, boolean, text) to anon, authenticated;
