create extension if not exists "pgcrypto";

create table if not exists transactions (
  id uuid primary key,
  child_id text not null check (child_id in ('lisandro', 'mila')),
  rule_id text not null,
  label text not null,
  value integer not null,
  date date not null,
  added_by text not null check (added_by in ('michael', 'leila')),
  created_at timestamptz not null
);

create index if not exists idx_transactions_child_date
  on transactions (child_id, date);

create table if not exists weekly_carryovers (
  child_id text not null check (child_id in ('lisandro', 'mila')),
  week_key date not null,
  amount integer not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  primary key (child_id, week_key)
);
