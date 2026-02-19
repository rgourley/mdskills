-- ============================================================================
-- Migration: Marketplace Evolution
-- Evolves mdskills from a skills-only marketplace to a broader AI Capability
-- Marketplace supporting MCP servers, workflow packs, rulesets, and more.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1a. Add artifact_type column to skills
-- ----------------------------------------------------------------------------
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS artifact_type TEXT DEFAULT 'skill_pack';

-- Migrate existing data: all current skills are skill_packs
UPDATE public.skills SET artifact_type = 'skill_pack' WHERE artifact_type IS NULL;

-- Index for filtering by artifact type
CREATE INDEX IF NOT EXISTS idx_skills_artifact_type ON public.skills(artifact_type);

-- ----------------------------------------------------------------------------
-- 1b. Create clients table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_slug ON public.clients(slug);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients are viewable by everyone"
  ON public.clients FOR SELECT
  USING (true);

-- ----------------------------------------------------------------------------
-- 1c. Create listing_clients join table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  install_instructions TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skill_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_clients_skill ON public.listing_clients(skill_id);
CREATE INDEX IF NOT EXISTS idx_listing_clients_client ON public.listing_clients(client_id);

ALTER TABLE public.listing_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listing clients are viewable by everyone"
  ON public.listing_clients FOR SELECT
  USING (true);

-- ----------------------------------------------------------------------------
-- 1d. Add permission columns to skills
-- ----------------------------------------------------------------------------
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS perm_filesystem_read BOOLEAN DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS perm_filesystem_write BOOLEAN DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS perm_shell_exec BOOLEAN DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS perm_network_access BOOLEAN DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS perm_git_write BOOLEAN DEFAULT false;

-- ----------------------------------------------------------------------------
-- 1e. Seed clients
-- ----------------------------------------------------------------------------
INSERT INTO public.clients (slug, name, icon, website_url, sort_order) VALUES
  ('claude-code',     'Claude Code',     'claude',   'https://claude.ai',              1),
  ('claude-desktop',  'Claude Desktop',  'claude',   'https://claude.ai/download',     2),
  ('cursor',          'Cursor',          'cursor',   'https://cursor.com',             3),
  ('vscode-copilot',  'VS Code Copilot', 'copilot',  'https://code.visualstudio.com',  4),
  ('chatgpt',         'ChatGPT',         'chatgpt',  'https://chatgpt.com',            5),
  ('gemini',          'Gemini',          'gemini',   'https://gemini.google.com',      6),
  ('windsurf',        'Windsurf',        'windsurf', 'https://windsurf.com',           7),
  ('continue-dev',    'Continue',        'continue', 'https://continue.dev',           8),
  ('codex',           'OpenAI Codex',    'codex',    'https://openai.com',             9),
  ('grok',            'Grok',            'grok',     'https://grok.x.ai',             10),
  ('replit',          'Replit Agent',     'replit',   'https://replit.com',             11)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 1f. Seed new outcome-oriented categories
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (slug, name, description, icon, sort_order) VALUES
  ('design-systems',           'Design Systems',           'Build consistent UIs and component libraries',                    'palette',    11),
  ('information-architecture', 'Information Architecture', 'Structure content, navigation, and information hierarchies',      'layout',     12),
  ('resume-writing',           'Resume & Career',          'Resume optimization, cover letters, and career advice',           'file-text',  13),
  ('devops-ci-cd',             'DevOps & CI/CD',           'Deployment pipelines, infrastructure, and automation',            'rocket',     14),
  ('database-design',          'Database Design',          'Schema design, migrations, and data modeling',                    'database',   15),
  ('content-creation',         'Content Creation',         'Blog posts, marketing copy, and content strategy',               'pen-tool',   16),
  ('research-analysis',        'Research & Analysis',      'Literature review, data synthesis, and analytical tasks',         'search',     17),
  ('code-generation',          'Code Generation',          'Scaffolding, boilerplate, and code generation tasks',             'code',       18)
ON CONFLICT (slug) DO NOTHING;
