-- Add AI-generated review fields to skills table
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_summary TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_strengths TEXT[];
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_weaknesses TEXT[];
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_quality_score INTEGER;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_generated_at TIMESTAMPTZ;
