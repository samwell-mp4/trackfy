-- Consolidated migration for Artists table
-- Run this single script to add all necessary columns

-- 1. Personal Info
ALTER TABLE artists ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS email_contact TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. Artist Type & Business Info
-- 'signed' = Na Produtora, 'independent' = Avulso
ALTER TABLE artists ADD COLUMN IF NOT EXISTS artist_type TEXT CHECK (artist_type IN ('signed', 'independent')) DEFAULT 'independent';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS share_email TEXT; -- Email para envio de material/share

-- 3. Responsible Party / Management Info
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_phone TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_email TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_company TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS responsible_percentage NUMERIC;
