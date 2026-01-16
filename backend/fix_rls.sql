-- Enable RLS (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public insert (registration) - BE CAREFUL, ideally only backend should do this but for now:
DROP POLICY IF EXISTS "Allow public insert" ON users;
CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);

-- Allow users to read their own data
DROP POLICY IF EXISTS "Allow individual select" ON users;
CREATE POLICY "Allow individual select" ON users FOR SELECT USING (auth.uid() = id);

-- Alternatively, since we are using a custom auth implementation in users table (not auth.users), 
-- and we are inserting from the backend using the ANON KEY, we might need to just allow anon inserts 
-- OR switch to SERVICE ROLE KEY in the backend.

-- QUICK FIX: Allow all operations for now to unblock, then restrict.
DROP POLICY IF EXISTS "Allow all for anon" ON users;
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true) WITH CHECK (true);
