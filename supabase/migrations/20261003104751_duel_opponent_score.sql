-- Pending direct duels start the opponent at 0 so a NOT NULL opponent_score
-- column accepts the insert. Null remains allowed for older pending rows.

create schema if not exists private;

alter table public.duels alter column opponent_score drop not null;
alter table public.duels alter column opponent_score set default 0;
alter table public.duels alter column winner_username drop not null;

create or replace function private.create_user_duel(
  p_opponent_username text,
  p_challenge_id text,
  p_challenger_score integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_me_username text;
  v_me_score integer;
  v_opponent_id uuid;
  v_opponent_username text;
  v_handle text;
  v_day text;
  v_duel_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  v_handle := regexp_replace(coalesce(trim(p_opponent_username), ''), '^@', '');
  if v_handle = '' then
    return jsonb_build_object('success', false, 'error', 'Scout not found');
  end if;

  select username, career_score
    into v_me_username, v_me_score
  from public.profiles
  where id = v_user_id;

  select id, username
    into v_opponent_id, v_opponent_username
  from public.profiles
  where username ilike v_handle
  limit 1;

  if v_opponent_id is null then
    return jsonb_build_object('success', false, 'error', 'Scout not found');
  end if;

  if v_opponent_id = v_user_id or lower(coalesce(v_me_username, '')) = lower(v_handle) then
    return jsonb_build_object('success', false, 'error', 'Cannot challenge yourself');
  end if;

  v_day := coalesce(nullif(trim(p_challenge_id), ''), to_char(current_date, 'YYYY-MM-DD'));

  insert into public.duels (
    challenger_id,
    challenged_id,
    challenger_username,
    opponent_username,
    challenge_id,
    fixture_date,
    challenger_score,
    opponent_score,
    status
  ) values (
    v_user_id,
    v_opponent_id,
    regexp_replace(coalesce(v_me_username, ''), '^@', ''),
    regexp_replace(coalesce(v_opponent_username, v_handle), '^@', ''),
    v_day,
    case when v_day ~ '^\d{4}-\d{2}-\d{2}$' then v_day::date else current_date end,
    greatest(coalesce(p_challenger_score, v_me_score, 0), 0),
    0,
    'pending'
  ) returning id into v_duel_id;

  return jsonb_build_object('success', true, 'duel_id', v_duel_id);
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'error', 'Challenge already sent');
end;
$$;

revoke all on function private.create_user_duel(text, text, integer) from public, anon;
grant execute on function private.create_user_duel(text, text, integer) to authenticated;
