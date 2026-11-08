-- Daily completion points land on profiles.total_score, which the cosmetic
-- guard freezes against direct client writes. This RPC is the only path, and
-- scouts can only move their own score.

-- An older variant may exist with another return type; replace cannot change it.
drop function if exists public.increment_user_score(uuid, integer);
drop function if exists private.increment_user_score(uuid, integer);

create or replace function private.increment_user_score(user_id_input uuid, score_to_add integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if user_id_input is null or user_id_input <> uid then
    raise exception 'Scouts can only increment their own score';
  end if;
  if score_to_add is null or score_to_add < 0 or score_to_add > 10000 then
    raise exception 'Invalid score';
  end if;

  perform set_config('app.cosmetic_write', 'on', true);
  update public.profiles
  set total_score = total_score + score_to_add,
      updated_at = now()
  where id = uid;
  if not found then
    raise exception 'Profile missing';
  end if;

  return jsonb_build_object('score_added', score_to_add);
end;
$$;

revoke all on function private.increment_user_score(uuid, integer) from public, anon;
grant execute on function private.increment_user_score(uuid, integer) to authenticated;
grant usage on schema private to authenticated;

create or replace function public.increment_user_score(user_id_input uuid, score_to_add integer)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select private.increment_user_score(user_id_input, score_to_add);
$$;

revoke all on function public.increment_user_score(uuid, integer) from public, anon;
grant execute on function public.increment_user_score(uuid, integer) to authenticated;
