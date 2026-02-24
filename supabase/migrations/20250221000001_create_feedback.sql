-- Repo Architect: Feedback table for rating analysis quality
create table if not exists repo_feedback (
  id uuid primary key default gen_random_uuid(),
  target text,
  feedback_type text not null,
  rating smallint not null check (rating in (-1, 1)),
  created_at timestamptz default now()
);

create index if not exists idx_repo_feedback_target on repo_feedback (target);

alter table repo_feedback enable row level security;

create policy "Allow insert feedback"
  on repo_feedback for insert with check (true);

create policy "Allow select feedback"
  on repo_feedback for select using (true);

