-- User submission flow: add columns for tracking who submitted a skill and review lifecycle

-- Add submission tracking columns to skills
ALTER TABLE skills ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);
ALTER TABLE skills ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index for fast lookup of user's own submissions
CREATE INDEX IF NOT EXISTS idx_skills_submitted_by ON skills(submitted_by) WHERE submitted_by IS NOT NULL;

-- Index for admin review queue (pending/in_review statuses)
CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status) WHERE status IN ('pending_review', 'in_review');

-- RLS: Users can read their own skills regardless of status
CREATE POLICY "Users can read own submissions"
  ON skills FOR SELECT
  USING (submitted_by = auth.uid());

-- RLS: Users can insert their own draft skills
CREATE POLICY "Users can create draft submissions"
  ON skills FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid()
    AND status = 'draft'
  );

-- RLS: Users can update their own draft or rejected skills
CREATE POLICY "Users can update own drafts"
  ON skills FOR UPDATE
  USING (
    submitted_by = auth.uid()
    AND status IN ('draft', 'rejected')
  )
  WITH CHECK (
    submitted_by = auth.uid()
    AND status IN ('draft', 'rejected', 'pending_review')
  );

-- RLS: Users can delete their own draft skills only
CREATE POLICY "Users can delete own drafts"
  ON skills FOR DELETE
  USING (
    submitted_by = auth.uid()
    AND status = 'draft'
  );
