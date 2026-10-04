-- Scout accounts already land in public.profiles. Keep the chosen username
-- from signup metadata as a display name. It is not used for authorization.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  handle text;
begin
  handle := nullif(btrim(regexp_replace(coalesce(new.raw_user_meta_data->>'username', ''), '^@+', '')), '');
  if handle is null or char_length(handle) > 40 or handle ~ '[[:cntrl:]]' then
    handle := left(split_part(coalesce(new.email, 'scout'), '@', 1), 40);
  end if;

  insert into public.profiles (id, username)
  values (new.id, handle)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  scout_name text,
  rating integer not null check (rating between 1 and 5),
  category text not null check (category in ('Bugg', 'Idé', 'Övrigt')),
  comment text not null check (char_length(btrim(comment)) between 1 and 2000),
  page_path text,
  created_at timestamptz not null default now(),
  constraint beta_feedback_scout_name_len check (scout_name is null or char_length(scout_name) <= 40),
  constraint beta_feedback_page_path_len check (page_path is null or char_length(page_path) <= 200)
);

create index if not exists beta_feedback_created_idx
  on public.beta_feedback (created_at desc);

alter table public.beta_feedback enable row level security;

drop policy if exists "beta_feedback_insert" on public.beta_feedback;
create policy "beta_feedback_insert"
  on public.beta_feedback
  for insert
  to anon, authenticated
  with check (
    rating between 1 and 5
    and category in ('Bugg', 'Idé', 'Övrigt')
    and char_length(btrim(comment)) between 1 and 2000
    and (user_id is null or auth.uid() = user_id)
  );

revoke all on public.beta_feedback from public, anon, authenticated;
grant insert on public.beta_feedback to anon, authenticated;
