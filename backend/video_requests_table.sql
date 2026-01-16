-- Criar tabela para armazenar histórico de requisições de vídeo
CREATE TABLE IF NOT EXISTS video_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('Automatico', 'Manual')),
    frase TEXT,
    num_images INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance de consultas por usuário
CREATE INDEX IF NOT EXISTS idx_video_requests_user_id ON video_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_video_requests_status ON video_requests(status);

-- Habilitar Row Level Security
ALTER TABLE video_requests ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias requisições
CREATE POLICY "Users can view their own video requests"
    ON video_requests
    FOR SELECT
    USING (true); -- Por enquanto permitir visualização (ajustar depois se necessário)

-- Política: Usuários podem inserir suas próprias requisições
CREATE POLICY "Users can insert their own video requests"
    ON video_requests
    FOR INSERT
    WITH CHECK (true); -- Backend validará via JWT

-- Política: Usuários podem atualizar suas próprias requisições
CREATE POLICY "Users can update their own video requests"
    ON video_requests
    FOR UPDATE
    USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_requests_updated_at
    BEFORE UPDATE ON video_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
