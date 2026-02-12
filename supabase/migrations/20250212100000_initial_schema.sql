-- mdskills.ai base schema (skills table)
-- Applied first when using Supabase CLI; safe to skip if you already ran schema.sql in the dashboard.

create extension if not exists "uuid-ossp";

create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text,
  owner text not null,
  repo text not null,
  skill_path text not null,
  github_url text,
  weekly_installs integer default 0,
  tags text[] default '{}',
  platforms text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists skills_slug_idx on public.skills (slug);
create index if not exists skills_name_idx on public.skills using gin (to_tsvector('english', name));
create index if not exists skills_tags_idx on public.skills using gin (tags);

alter table public.skills enable row level security;

drop policy if exists "Skills are viewable by everyone" on public.skills;
create policy "Skills are viewable by everyone"
  on public.skills for select
  using (true);
