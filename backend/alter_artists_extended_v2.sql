-- Add remaining fields from the form
ALTER TABLE artists ADD COLUMN IF NOT EXISTS share_email TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_company TEXT; -- "Nome da empresa"
-- Ensure social_links can store apple_music if not already structured, but JSONB is fine.
