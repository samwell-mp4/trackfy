ALTER TABLE artists ADD COLUMN IF NOT EXISTS files_structure JSONB DEFAULT '[]'::jsonb;
