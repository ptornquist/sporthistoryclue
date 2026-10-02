-- One row per scout per daily drop. The archive calendar reads these
-- rows; scouts can insert and update only their own dates.

create table if not exists public.user_daily_completions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  drop_date date not null,
  solved boolean not null default false,
  score integer not null default 0 check (score >= 0 and score <= 10000),
  challenge_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, drop_date)
);

create index if not exists user_daily_completions_user_idx
  on public.user_daily_completions (user_id, drop_date desc);

alter table public.user_daily_completions enable row level security;

drop policy if exists "daily_completions_select_own" on public.user_daily_completions;
create policy "daily_completions_select_own"
  on public.user_daily_completions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "daily_completions_insert_own" on public.user_daily_completions;
create policy "daily_completions_insert_own"
  on public.user_daily_completions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "daily_completions_update_own" on public.user_daily_completions;
create policy "daily_completions_update_own"
  on public.user_daily_completions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
