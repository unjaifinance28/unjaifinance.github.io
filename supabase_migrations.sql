-- =============================================================
-- Unjai Finance — Agent System Migration
-- Run this in Supabase SQL Editor
-- =============================================================

-- 1. agents table
create table if not exists agents (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  username     text not null unique,
  password     text not null,
  phone        text,
  commission_rate numeric(15,2) not null default 0,  -- fixed kip amount per remittance period
  status       text not null default 'active' check (status in ('active','inactive')),
  created_at   timestamptz not null default now()
);

-- 2. agent_collections table
--    One row per payment collected by an agent in the field
create table if not exists agent_collections (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references agents(id) on delete cascade,
  loan_id      uuid not null,
  amount       numeric(15,2) not null,
  method       text not null default 'cash',
  note         text,
  collected_at timestamptz not null default now(),
  remitted     boolean not null default false
);

-- 3. agent_remittances table
--    One row per batch remittance an agent submits to admin
create table if not exists agent_remittances (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references agents(id) on delete cascade,
  total_amount numeric(15,2) not null,
  slip_image   text,               -- base64 or storage URL
  note         text,
  status       text not null default 'pending' check (status in ('pending','confirmed')),
  submitted_at timestamptz not null default now(),
  confirmed_at timestamptz
);

-- =============================================================
-- Row Level Security (RLS)
-- Enable RLS but allow anon key full access (same pattern as
-- lao_loans / lao_payments in this project).
-- Tighten these policies if you add auth later.
-- =============================================================

alter table agents               enable row level security;
alter table agent_collections    enable row level security;
alter table agent_remittances    enable row level security;

-- Allow anon key to read/write all rows (matches existing app pattern)
create policy "anon all agents"
  on agents for all to anon using (true) with check (true);

create policy "anon all agent_collections"
  on agent_collections for all to anon using (true) with check (true);

create policy "anon all agent_remittances"
  on agent_remittances for all to anon using (true) with check (true);

-- =============================================================
-- Indexes for common queries
-- =============================================================

create index if not exists idx_collections_agent    on agent_collections(agent_id);
create index if not exists idx_collections_loan     on agent_collections(loan_id);
create index if not exists idx_collections_remitted on agent_collections(remitted);
create index if not exists idx_remittances_agent    on agent_remittances(agent_id);
create index if not exists idx_remittances_status   on agent_remittances(status);

-- =============================================================
-- Sample agent (optional — delete before production)
-- password: agent123
-- =============================================================
-- insert into agents (name, username, password, phone, commission_rate)
-- values ('ທົດສອບ Agent', 'agent01', 'agent123', '020-0000000', 500000);
