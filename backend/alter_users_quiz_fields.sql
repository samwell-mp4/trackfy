-- Add columns for extended user profile information (Quiz Answers)

-- For Artists
ALTER TABLE users ADD COLUMN IF NOT EXISTS artistic_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS musical_genre TEXT;

-- For Producers
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_artists_count INTEGER;

-- Ensure role is capable of handling these values (already done in previous steps but good to confirm)
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
-- ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('producer', 'artist', 'manager'));
