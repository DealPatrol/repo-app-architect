-- Repo Architect: Share blueprints table
-- Run this in Supabase SQL Editor or via Supabase CLI

create table if not exists repo_blueprints (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  data jsonb not null,
  is_shared boolean not null default true,
  share_slug text unique not null,
  created_at timestamptz default now()
);

create index if not exists idx_repo_blueprints_share_slug
  on repo_blueprints (share_slug)
  where is_shared = true;

-- RLS: restrict access for security
alter table repo_blueprints enable row level security;

-- Allow anyone to insert (API creates shares)
create policy "Allow insert for shared blueprints"
  on repo_blueprints for insert
  with check (true);

-- Allow public read only for shared blueprints (by slug, enforced in API)
create policy "Allow select shared blueprints"
  on repo_blueprints for select
  using (is_shared = true);
