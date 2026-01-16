-- Drop all existing policies on users table to ensure clean slate
DROP POLICY IF EXISTS "Allow public insert" ON users;
DROP POLICY IF EXISTS "Allow individual select" ON users;
DROP POLICY IF EXISTS "Allow all for anon" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON users;
DROP POLICY IF EXISTS "Users can update own profile." ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON users;

-- Create a single, simple policy to allow everything (Access Control handled by Backend)
CREATE POLICY "Allow all public access" ON users
FOR ALL
USING (true)
WITH CHECK (true);
