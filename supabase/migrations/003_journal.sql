-- הטקסט עובר לעמודות מוצפנות. עמודות הטקסט הגלוי נמחקות.
alter table public.journal_entries
  drop column mood_word,
  drop column breakfast,
  drop column lunch,
  drop column dinner,
  drop column snacks,
  drop column note,
  add column secret_ciphertext text,
  add column secret_iv text,
  add column secret_key text;

-- המפתחות של היומן: הציבורי גלוי, הפרטי מוצפן בסיסמה שלך
create table public.journal_keys (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  public_key text not null,
  encrypted_private_key text not null,
  salt text not null,
  iv text not null,
  created_at timestamptz not null default now()
);

alter table public.journal_keys enable row level security;

create policy "journal keys: own row"
on public.journal_keys for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());