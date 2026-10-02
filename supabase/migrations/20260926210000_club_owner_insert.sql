-- Direct club creation inserts owner_id. created_by stays in sync so existing
-- member checks keep working. A failed profiles.club_id write must not roll back
-- the club, so that column is optional and the API ignores update errors.

alter table public.clubs
  add column if not exists owner_id uuid references public.profiles (id) on delete cascade;

update public.clubs
set owner_id = created_by
where owner_id is null;

create index if not exists clubs_owner_idx
  on public.clubs (owner_id);

alter table public.profiles
  add column if not exists club_id uuid references public.clubs (id) on delete set null;

create or replace function private.sync_club_owner()
returns trigger
language plpgsql
as $$
begin
  if new.owner_id is null then
    new.owner_id := new.created_by;
  end if;
  if new.created_by is null then
    new.created_by := new.owner_id;
  end if;
  return new;
end;
$$;

drop trigger if exists clubs_sync_owner on public.clubs;
create trigger clubs_sync_owner
  before insert or update on public.clubs
  for each row execute function private.sync_club_owner();

revoke all on function private.sync_club_owner() from public, anon;
grant execute on function private.sync_club_owner() to authenticated;

drop policy if exists "clubs_select_member" on public.clubs;
create policy "clubs_select_member"
  on public.clubs
  for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or created_by = (select auth.uid())
    or private.is_club_member(id)
  );

grant insert on table public.clubs to authenticated;
grant insert on table public.club_members to authenticated;

drop policy if exists "clubs_insert_owner" on public.clubs;
create policy "clubs_insert_owner"
  on public.clubs
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    or created_by = (select auth.uid())
  );

drop policy if exists "club_members_insert_owner" on public.club_members;
create policy "club_members_insert_owner"
  on public.club_members
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1
      from public.clubs
      where id = club_id
        and (owner_id = (select auth.uid()) or created_by = (select auth.uid()))
    )
  );
