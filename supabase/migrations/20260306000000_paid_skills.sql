-- =============================================================================
-- Paid skill downloads: new columns, purchases table, creator earnings view
-- =============================================================================

-- 1. New columns on skills table for paid skill support
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS price_amount INTEGER;         -- price in cents
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS price_currency TEXT DEFAULT 'usd';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS source_file_path TEXT;         -- Supabase Storage path

CREATE INDEX IF NOT EXISTS idx_skills_is_paid ON public.skills(is_paid) WHERE is_paid = true;

-- 2. Purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,                          -- total charged in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  platform_fee INTEGER NOT NULL,                    -- mdskills 15% cut in cents
  stripe_session_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)                         -- one purchase per user per skill
);

CREATE INDEX IF NOT EXISTS idx_purchases_user   ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_skill  ON public.purchases(skill_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON public.purchases(stripe_session_id);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchases
CREATE POLICY "Users can read own purchases"
  ON public.purchases FOR SELECT
  USING (user_id = auth.uid());

-- 3. Creator earnings view
CREATE OR REPLACE VIEW public.creator_earnings AS
SELECT
  s.submitted_by  AS creator_id,
  s.id            AS skill_id,
  s.name          AS skill_name,
  s.slug          AS skill_slug,
  COUNT(p.id)                                        AS total_sales,
  COALESCE(SUM(p.amount - p.platform_fee), 0)        AS total_earnings_cents,
  COALESCE(SUM(p.platform_fee), 0)                   AS total_platform_fees_cents
FROM public.skills s
LEFT JOIN public.purchases p ON p.skill_id = s.id
WHERE s.is_paid = true AND s.submitted_by IS NOT NULL
GROUP BY s.submitted_by, s.id, s.name, s.slug;
