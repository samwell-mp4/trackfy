ALTER TABLE artists ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active';
