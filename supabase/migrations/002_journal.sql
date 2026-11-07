-- רשומת יומן אחת לכל יום
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  mood smallint check (mood between 1 and 5),
  mood_word text,
  slept_at time,
  woke_at time,
  sleep_quality smallint check (sleep_quality between 1 and 5),
  breakfast text,
  lunch text,
  dinner text,
  snacks text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- כל משתמש רואה וכותב רק את השורות שלו
alter table public.journal_entries enable row level security;

create policy "journal: own rows"
on public.journal_entries for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());