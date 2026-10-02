-- Follow graph for profile network, scout search, and public scout pages.
create table if not exists public.scout_follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint scout_follows_not_self check (follower_id <> following_id)
);

create index if not exists scout_follows_following_idx
  on public.scout_follows (following_id);

alter table public.scout_follows enable row level security;

drop policy if exists "scout_follows_select_own" on public.scout_follows;
create policy "scout_follows_select_own"
  on public.scout_follows
  for select
  to authenticated
  using (auth.uid() = follower_id);

drop policy if exists "scout_follows_insert_own" on public.scout_follows;
create policy "scout_follows_insert_own"
  on public.scout_follows
  for insert
  to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "scout_follows_delete_own" on public.scout_follows;
create policy "scout_follows_delete_own"
  on public.scout_follows
  for delete
  to authenticated
  using (auth.uid() = follower_id);

grant select, insert, delete on public.scout_follows to authenticated;

do $$
begin
  if to_regclass('public.scout_connections') is not null then
    insert into public.scout_follows (follower_id, following_id, created_at)
    select user_id, connected_user_id, created_at
    from public.scout_connections
    where user_id <> connected_user_id
    on conflict (follower_id, following_id) do nothing;
  end if;
end $$;
