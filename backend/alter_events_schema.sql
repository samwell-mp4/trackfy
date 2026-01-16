-- Remove the existing check constraint on 'type' to allow new types
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;

-- Add new columns if they don't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')) DEFAULT 'planned';
ALTER TABLE events ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium';
ALTER TABLE events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS checklist_id UUID REFERENCES checklists(id) ON DELETE SET NULL;

-- Re-add type constraint with new values (optional, or just leave as text if we want full flexibility)
-- For now, let's just drop the constraint to allow the new types requested by the user without strict enforcement at DB level yet, 
-- or we can add a new broader constraint.
-- User requested types: Lançamento Musical, Gravação em Estúdio, Reunião Estratégica, Produção de Conteúdo, Show / Apresentação, Ensaio, Viagem, Entrega de Material, Deadline, Live / Entrevista, Postagem Programada, Outros
-- Let's keep it flexible for now as 'text' or add a very broad list. 
-- The prompt said "Cada tipo deve ter comportamento próprio", so enforcing types might be good, but "Outros (personalizado)" implies flexibility.
-- Let's just leave it as TEXT for maximum flexibility as requested by "Outros (personalizado)".
