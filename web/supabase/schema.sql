create extension if not exists "pgcrypto";

create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null,
  color text not null,
  created_at timestamptz default now()
);

create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  label text not null,
  value integer not null,
  type text not null check (type in ('gain', 'loss', 'reward')),
  reward_cost integer,
  active boolean default true,
  sort_order integer default 0
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  rule_id uuid references rules(id) on delete set null,
  label text not null,
  value integer not null,
  date date not null default current_date,
  added_by text not null check (added_by in ('michael', 'leila')),
  note text,
  created_at timestamptz default now()
);

create table if not exists reward_claims (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  rule_id uuid references rules(id) on delete set null,
  cost integer not null,
  date date not null default current_date,
  added_by text not null check (added_by in ('michael', 'leila')),
  created_at timestamptz default now()
);

alter table children enable row level security;
alter table rules enable row level security;
alter table transactions enable row level security;
alter table reward_claims enable row level security;

create policy "family_full_children" on children for all using (true) with check (true);
create policy "family_full_rules" on rules for all using (true) with check (true);
create policy "family_full_transactions" on transactions for all using (true) with check (true);
create policy "family_full_reward_claims" on reward_claims for all using (true) with check (true);
