-- Add extended profile fields to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS artist_type TEXT CHECK (artist_type IN ('signed', 'independent')) DEFAULT 'independent';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_phone TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_email TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_percentage NUMERIC;
