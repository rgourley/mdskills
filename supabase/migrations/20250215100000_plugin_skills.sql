-- Plugin/hybrid skill support: skill_type, has_plugin, has_examples, difficulty.
-- New categories: Design & Frontend, Claude Code Plugins.

ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS skill_type TEXT DEFAULT 'skill';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS has_plugin BOOLEAN DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS has_examples BOOLEAN DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS difficulty TEXT;

-- New categories (idempotent)
INSERT INTO public.categories (slug, name, description, icon, sort_order) VALUES
  ('design-frontend', 'Design & Frontend', 'Design systems, UI patterns, and frontend consistency', 'palette', 9),
  ('claude-code-plugins', 'Claude Code Plugins', 'Skills with Claude Code plugin for full features', 'puzzle', 10)
ON CONFLICT (slug) DO NOTHING;
