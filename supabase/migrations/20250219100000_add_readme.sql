-- Add readme column to store the project README separately from SKILL.md content
ALTER TABLE skills ADD COLUMN IF NOT EXISTS readme TEXT;
