-- Add missing columns to skills table (idempotent).
-- Create categories, seed categories, add indexes. Safe: IF NOT EXISTS / ON CONFLICT DO NOTHING.

-- Add missing columns to skills table
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS author_username TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS github_stars INTEGER DEFAULT 0;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS github_forks INTEGER DEFAULT 0;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS skills_sh_installs INTEGER;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS license TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{"claude","codex","cursor"}';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO public.categories (slug, name, description, icon, sort_order) VALUES
  ('code-review', 'Code Review', 'Skills for reviewing code quality, security, and best practices', 'code-review', 1),
  ('documentation', 'Documentation', 'Generate and maintain documentation from code and comments', 'book', 2),
  ('testing', 'Testing & QA', 'Test generation, automation, and quality assurance', 'test-tube', 3),
  ('security', 'Security', 'Security audits, vulnerability scanning, and compliance', 'shield', 4),
  ('api-development', 'API Development', 'API testing, documentation, and integration', 'api', 5),
  ('data-analysis', 'Data Analysis', 'Data processing, visualization, and insights', 'chart', 6),
  ('productivity', 'Productivity', 'Workflow automation and productivity tools', 'lightning', 7),
  ('creative', 'Creative', 'Content creation, writing, and design', 'sparkles', 8)
ON CONFLICT (slug) DO NOTHING;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_author ON public.skills(author_username);
CREATE INDEX IF NOT EXISTS idx_skills_slug ON public.skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_status ON public.skills(status);
CREATE INDEX IF NOT EXISTS idx_skills_featured ON public.skills(featured);
