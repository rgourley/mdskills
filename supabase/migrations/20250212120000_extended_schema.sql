-- Extended schema for mdskills.ai (categories, tags, users, votes, comments, collections, extra skill columns)
-- Safe to run on existing DB (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS). Applied after initial_schema when using supabase db push.

-- =============================================================================
-- 1. Categories (referenced by skills and tags)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- =============================================================================
-- 2. Tags and skill_tags (tags reference categories; skill_tags links skills↔tags)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

-- skill_tags created after we add any new columns to skills
CREATE TABLE IF NOT EXISTS public.skill_tags (
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (skill_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_tags_skill ON public.skill_tags(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_tags_tag ON public.skill_tags(tag_id);

-- =============================================================================
-- 3. Users (profiles; id matches Supabase auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  bio TEXT,
  github_connected BOOLEAN DEFAULT false,
  github_username TEXT,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =============================================================================
-- 4. Skills table – add new columns only (slug, name, description, etc. already exist)
-- =============================================================================
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS github_stars INTEGER DEFAULT 0;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS github_forks INTEGER DEFAULT 0;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS github_updated_at TIMESTAMPTZ;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS skills_sh_installs INTEGER;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS mdskills_upvotes INTEGER DEFAULT 0;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS mdskills_installs INTEGER DEFAULT 0;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS mdskills_forks INTEGER DEFAULT 0;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS license TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS author_username TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.skills(id);
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- =============================================================================
-- 5. Votes (one vote per user per skill; 1 = up, -1 = down)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_skill ON public.votes(skill_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.votes(user_id);

-- =============================================================================
-- 6. Comments (threaded via parent_id)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_skill ON public.comments(skill_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);

-- =============================================================================
-- 7. Collections (user-curated lists of skills)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  visibility TEXT DEFAULT 'public',
  featured BOOLEAN DEFAULT false,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_user ON public.collections(user_id);

-- =============================================================================
-- 8. Performance indexes on skills
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_skills_status ON public.skills(status);
CREATE INDEX IF NOT EXISTS idx_skills_featured ON public.skills(featured);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_author ON public.skills(author_username);
CREATE INDEX IF NOT EXISTS idx_skills_parent ON public.skills(parent_id);

-- Full-text search over name, description, content (content can be null initially)
CREATE INDEX IF NOT EXISTS idx_skills_search ON public.skills USING GIN(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, ''))
);

-- =============================================================================
-- 9. RLS for new tables
-- =============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Public read for categories and tags
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);

-- Public read for skill_tags (no sensitive data)
DROP POLICY IF EXISTS "Skill tags are viewable by everyone" ON public.skill_tags;
CREATE POLICY "Skill tags are viewable by everyone" ON public.skill_tags FOR SELECT USING (true);

-- Users: public can read profile (username, name, avatar, etc.)
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);

-- Votes: public read (for counts); insert/update/delete only own
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON public.votes;
CREATE POLICY "Votes are viewable by everyone" ON public.votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own votes" ON public.votes;
CREATE POLICY "Users can manage own votes" ON public.votes FOR ALL USING (auth.uid() = user_id);

-- Comments: public read; insert/update/delete only own
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own comments" ON public.comments;
CREATE POLICY "Users can manage own comments" ON public.comments FOR ALL USING (auth.uid() = user_id);

-- Collections: public read for public visibility; owner can manage
DROP POLICY IF EXISTS "Public collections are viewable by everyone" ON public.collections;
CREATE POLICY "Public collections are viewable by everyone" ON public.collections FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid());
DROP POLICY IF EXISTS "Users can manage own collections" ON public.collections;
CREATE POLICY "Users can manage own collections" ON public.collections FOR ALL USING (auth.uid() = user_id);
