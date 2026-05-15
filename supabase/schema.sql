-- Run this in your Supabase SQL editor now edited

create table tasks (
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

create table goals (
  id text primary key,
  name text not null,
  term text not null,
  period text,
  cat text,
  priority integer default 2,
  deadline text,
  done boolean default false,
  created_at timestamptz default now()
);

create table hair_clients (
  id text primary key,
  name text not null,
  style text,
  amount numeric default 0,
  date date,
  start_time text,
  end_time text,
  deposit_paid boolean default false,
  contact text,
  notes text,
  created_at timestamptz default now()
);

create table content_items (
  id text primary key,
  name text not null,
  platform text,
  status text default 'idea',
  notes text,
  created_at timestamptz default now()
);

create table dump_items (
  id text primary key,
  text text not null,
  cat text default 'other',
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) - anyone can read/write their own data
alter table tasks enable row level security;
alter table goals enable row level security;
alter table hair_clients enable row level security;
alter table content_items enable row level security;
alter table dump_items enable row level security;

-- Public access policies (for single-user app)
create policy "Public access" on tasks for all using (true);
create policy "Public access" on goals for all using (true);
create policy "Public access" on hair_clients for all using (true);
create policy "Public access" on content_items for all using (true);
create policy "Public access" on dump_items for all using (true);
