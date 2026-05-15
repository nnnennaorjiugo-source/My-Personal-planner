-- ═══════════════════════════════════════════
-- Hannah's Planner — Supabase Schema
-- Run this entire block in the SQL Editor
-- ═══════════════════════════════════════════

-- Tasks
create table if not exists tasks (
  id text primary key,
  name text not null,
  tier text default 'should',
  cat text,
  weight integer default 10,
  priority integer default 0,
  start_time text,
  end_time text,
  created_at timestamptz default now()
);

-- Daily task statuses (done/half/none per day)
create table if not exists task_statuses (
  id text primary key,       -- format: "YYYY-MM-DD_taskId"
  task_id text not null,
  date text not null,        -- "YYYY-MM-DD"
  status text default 'none', -- none | half | done
  created_at timestamptz default now()
);

-- Top 3 per day
create table if not exists top3 (
  id text primary key,       -- format: "YYYY-MM-DD"
  date text not null,
  slot0 text,
  slot1 text,
  slot2 text,
  updated_at timestamptz default now()
);

-- Goals (weekly/monthly/quarterly)
create table if not exists goals (
  id text primary key,
  name text not null,
  term text not null,        -- weekly | monthly | quarterly
  period text,               -- "Week 20" | "May" | "Q3 2026"
  cat text,
  priority integer default 2,
  deadline text,
  done boolean default false,
  created_at timestamptz default now()
);

-- Hair clients
create table if not exists hair_clients (
  id text primary key,
  name text not null,
  style text,
  amount numeric default 0,
  date text,
  start_time text,
  end_time text,
  deposit_paid boolean default false,
  contact text,
  notes text,
  created_at timestamptz default now()
);

-- Content pipeline
create table if not exists content_items (
  id text primary key,
  name text not null,
  platform text,
  status text default 'idea',
  notes text,
  created_at timestamptz default now()
);

-- Brain dump
create table if not exists dump_items (
  id text primary key,
  text text not null,
  cat text default 'other',
  created_at timestamptz default now()
);

-- Categories
create table if not exists categories (
  id text primary key,
  name text not null,
  color text default '#5b4de8',
  created_at timestamptz default now()
);

-- Week scores
create table if not exists week_scores (
  id text primary key,       -- day name e.g. "Mon"
  day_name text not null,
  score integer default 0,
  updated_at timestamptz default now()
);

-- ─── Row Level Security ───────────────────
alter table tasks enable row level security;
alter table task_statuses enable row level security;
alter table top3 enable row level security;
alter table goals enable row level security;
alter table hair_clients enable row level security;
alter table content_items enable row level security;
alter table dump_items enable row level security;
alter table categories enable row level security;
alter table week_scores enable row level security;

-- ─── Policies (single-user public app) ───
create policy "Public access" on tasks for all using (true) with check (true);
create policy "Public access" on task_statuses for all using (true) with check (true);
create policy "Public access" on top3 for all using (true) with check (true);
create policy "Public access" on goals for all using (true) with check (true);
create policy "Public access" on hair_clients for all using (true) with check (true);
create policy "Public access" on content_items for all using (true) with check (true);
create policy "Public access" on dump_items for all using (true) with check (true);
create policy "Public access" on categories for all using (true) with check (true);
create policy "Public access" on week_scores for all using (true) with check (true);

-- ─── Default categories ───────────────────
insert into categories (id, name, color) values
  ('c-cert', 'Certification', '#5b4de8'),
  ('c-k8s', 'Kubernetes', '#00a87a'),
  ('c-int', 'Interview', '#c47d00'),
  ('c-job', 'Job search', '#0077cc'),
  ('c-lab', 'Lab / Build', '#e8420a'),
  ('c-cnt', 'Content', '#0077b5'),
  ('c-adm', 'Admin', '#888885'),
  ('c-wel', 'Wellbeing', '#c44488'),
  ('c-bbl', 'Bible / Prayer', '#a06830'),
  ('c-hair', 'Hair clients', '#e87040')
on conflict (id) do nothing;
