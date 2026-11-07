-- העתק של היומן של בוט החדשות. הבוט כותב (עם secret key), הפאנל רק קורא.
create table public.eagle_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  ts timestamptz not null,
  news_id text,
  market text,
  source text,
  headline text,
  url text,
  symbol text,
  score smallint,
  reason text,
  price_at_score numeric,
  action text,
  mode text
);

create table public.eagle_trades (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  ts timestamptz not null,
  symbol text not null,
  side text not null,
  qty numeric,
  price numeric,
  stop_price numeric,
  reason text,
  mode text
);

create index eagle_scores_user_ts on public.eagle_scores (user_id, ts desc);
create index eagle_trades_user_ts on public.eagle_trades (user_id, ts desc);

-- בפאנל: רק קריאה, ורק של השורות שלך
alter table public.eagle_scores enable row level security;
alter table public.eagle_trades enable row level security;

create policy "eagle scores: read own" on public.eagle_scores
for select to authenticated using (user_id = auth.uid());

create policy "eagle trades: read own" on public.eagle_trades
for select to authenticated using (user_id = auth.uid());