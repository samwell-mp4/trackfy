-- Add role column with default 'producer'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('producer', 'artist', 'manager')) DEFAULT 'producer';

-- Add artist_id column to link user to an artist profile
ALTER TABLE users ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_artist_id ON users(artist_id);
