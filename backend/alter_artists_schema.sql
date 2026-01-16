-- Add personal info columns to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS email_contact TEXT;
