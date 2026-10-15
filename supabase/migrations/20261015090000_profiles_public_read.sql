-- The standings board lists every saved scout.
-- Until now the live project only had an owner-only select policy, so each
-- browser read of public.profiles returned the signed-in user's own row.
-- Handles, scores, streaks, cosmetics, and avatars are public game data.
-- Email stays in auth.users and is never on this table.

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles
  for select
  to anon, authenticated
  using (true);
