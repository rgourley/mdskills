-- Add review tier columns for Stripe-powered paid review tiers
ALTER TABLE skills ADD COLUMN IF NOT EXISTS review_tier TEXT DEFAULT 'standard';
ALTER TABLE skills ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Index for finding featured skills that haven't expired
CREATE INDEX IF NOT EXISTS idx_skills_featured_until ON skills(featured_until) WHERE featured_until IS NOT NULL;
