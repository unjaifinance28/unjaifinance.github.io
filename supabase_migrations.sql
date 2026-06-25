-- =============================================================
-- Unjai Finance — Agent System Migration (v2 — corrected)
-- Run this in Supabase SQL Editor
--
-- IMPORTANT: If you already ran v1, drop the old tables first:
--   drop table if exists agent_remittances;
--   drop table if exists agent_collections;
--   drop table if exists agents;
-- Then run this file.
-- =============================================================

-- 1. agents
--    Uses text IDs (e.g. 'AGT123456') matching the rest of the app.
--    Column is full_name, matching admin.html's insert.
create table if not exists agents (
  id              text primary key,
  full_name       text not null,
  username        text not null unique,
  password        text not null,
  phone           text,
  commission_rate      numeric(15,2) not null default 0,  -- fixed kip amount per remittance period
  commission_paid_month text,                             -- "2026-05" format, set by admin on confirm
  status          text not null default 'active' check (status in ('active','inactive')),
  created_at      timestamptz not null default now()
);

-- 2. agent_collections
--    One row per payment an agent collects in the field.
--    loan_id is text (e.g. 'LAO399231') — not a foreign key because
--    loans table uses app-generated text PKs, not UUIDs.
create table if not exists agent_collections (
  id          text primary key,
  agent_id    text not null,
  loan_id     text not null,
  loan_name   text,
  amount      numeric(15,2) not null,
  method      text not null default 'cash',
  note        text,
  remitted    boolean not null default false,
  remittance_id text,
  created_at  timestamptz not null default now()
);

-- 3. agent_remittances
--    One row per batch remittance an agent submits to admin.
create table if not exists agent_remittances (
  id             text primary key,
  agent_id       text not null,
  agent_name     text,
  total_amount   numeric(15,2) not null,
  commission     numeric(15,2),
  net_amount     numeric(15,2),
  slip_image     text,           -- base64 JPEG data URL
  note           text,
  collection_ids jsonb,          -- array of agent_collections IDs
  status         text not null default 'pending' check (status in ('pending','confirmed')),
  created_at     timestamptz not null default now(),
  confirmed_at   timestamptz
);

-- =============================================================
-- Row Level Security (RLS)
-- Same open-anon pattern as lao_loans / lao_payments.
-- =============================================================

alter table agents               enable row level security;
alter table agent_collections    enable row level security;
alter table agent_remittances    enable row level security;

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
-- Sample agent (optional — remove before production)
-- Login: agent01 / agent123
-- =============================================================
-- insert into agents (id, full_name, username, password, phone, commission_rate)
-- values ('AGT000001', 'ທົດສອບ Agent', 'agent01', 'agent123', '020-0000000', 500000);


-- =============================================================
-- Payments table — interest/principal split columns
-- Run in Supabase SQL Editor
-- =============================================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS interest_amount numeric DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS principal_amount numeric DEFAULT 0;
