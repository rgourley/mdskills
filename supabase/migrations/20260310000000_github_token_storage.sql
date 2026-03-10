-- Store user GitHub OAuth tokens for private repository access
-- Separate table from public.users to prevent exposure via public SELECT policies

CREATE TABLE IF NOT EXISTS public.user_github_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS with NO public policies — only accessible via service role
ALTER TABLE public.user_github_tokens ENABLE ROW LEVEL SECURITY;
