-- Store contact/inquiry form submissions
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'general', -- 'sponsor', 'general', etc.
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: only service role can insert/read (API route uses service role)
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
