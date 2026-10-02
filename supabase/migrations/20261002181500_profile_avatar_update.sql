-- Let a scout save their own profile photo URL.
grant update (avatar_url, updated_at) on public.profiles to authenticated;
