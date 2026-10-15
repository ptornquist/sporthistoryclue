-- Let the server (service role) save solve points directly to profiles.
--
-- The guard trigger resets the score columns on every update that does not
-- come through the award RPC. /api/solve runs the same update with the
-- service-role key when the RPC is unavailable, so the trigger now also lets
-- the service role through. Browser clients are still blocked.

create or replace function private.guard_cosmetic_columns()
returns trigger
language plpgsql
as $$
declare
  claims jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
begin
  if current_setting('app.cosmetic_write', true) = 'on'
     or current_user = 'service_role'
     or coalesce(claims ->> 'role', '') = 'service_role' then
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
