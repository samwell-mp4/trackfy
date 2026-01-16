-- Rode este comando no SQL Editor do Supabase para corrigir o erro 500
-- Isso permite que a tabela aceite IDs de texto (como emails ou UUIDs)

ALTER TABLE video_requests
ALTER COLUMN user_id TYPE text;
