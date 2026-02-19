-- Phase 9: Expand clients to match agentskills.io ecosystem (27+ agents)
-- and add format_standard column to skills table

-- ============================================================
-- 1. Add 16 new clients (continuing from sort_order 12)
-- ============================================================
INSERT INTO public.clients (slug, name, icon, website_url, sort_order) VALUES
  ('gemini-cli',    'Gemini CLI',    'gemini',     'https://github.com/google-gemini/gemini-cli', 12),
  ('amp',           'Amp',           'amp',        'https://ampcode.com',                          13),
  ('roo-code',      'Roo Code',      'roo',        'https://roocode.com',                          14),
  ('goose',         'Goose',         'goose',      'https://block.github.io/goose',                15),
  ('github',        'GitHub',        'github',     'https://github.com',                           16),
  ('vscode',        'VS Code',       'vscode',     'https://code.visualstudio.com',                17),
  ('opencode',      'OpenCode',      'opencode',   'https://opencode.ai',                          18),
  ('firebender',    'Firebender',    'firebender', 'https://firebender.com',                       19),
  ('letta',         'Letta',         'letta',      'https://letta.com',                             20),
  ('factory',       'Factory',       'factory',    'https://factory.ai',                            21),
  ('trae',          'TRAE',          'trae',       'https://trae.ai',                               22),
  ('spring-ai',     'Spring AI',     'spring',     'https://spring.io/projects/spring-ai',          23),
  ('qodo',          'Qodo',          'qodo',       'https://qodo.ai',                               24),
  ('databricks',    'Databricks',    'databricks', 'https://databricks.com',                        25),
  ('agentman',      'Agentman',      'agentman',   'https://agentman.ai',                           26),
  ('command-code',  'Command Code',  'command',    'https://commandcode.ai',                        27)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Add format_standard column to skills table
-- Tracks which specific file format a listing targets
-- ============================================================
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS format_standard TEXT DEFAULT 'skill_md';

COMMENT ON COLUMN public.skills.format_standard IS
  'The file format standard this listing targets: skill_md, agents_md, claude_md, cursorrules, copilot_instructions, gemini_md, clinerules, windsurf_rules, mdc, generic';

CREATE INDEX IF NOT EXISTS idx_skills_format_standard ON public.skills(format_standard);
