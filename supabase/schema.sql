-- mdskills.ai schema
-- Run this in Supabase SQL Editor to create tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Skills table (can be synced from skills.sh or created via mdskills)
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

-- Index for search
create index if not exists skills_slug_idx on public.skills (slug);
create index if not exists skills_name_idx on public.skills using gin (to_tsvector('english', name));
create index if not exists skills_tags_idx on public.skills using gin (tags);

-- Enable RLS (Row Level Security)
alter table public.skills enable row level security;

-- Allow public read access to skills
create policy "Skills are viewable by everyone"
  on public.skills for select
  using (true);
