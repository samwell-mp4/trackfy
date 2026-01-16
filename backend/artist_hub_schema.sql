-- Habilitar extensão UUID se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Artistas
CREATE TABLE IF NOT EXISTS artists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    files_structure JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Músicas (Tracks)
CREATE TABLE IF NOT EXISTS tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    isrc TEXT,
    upc TEXT,
    status TEXT CHECK (status IN ('pre_production', 'recording', 'mixing', 'mastering', 'finished', 'released')) DEFAULT 'pre_production',
    release_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb, -- Armazena compositores, produtores, splits, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Eventos (Agenda)
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT CHECK (type IN ('release', 'recording', 'meeting', 'deadline', 'rehearsal', 'show', 'post', 'mastering', 'other')) DEFAULT 'other',
    location TEXT,
    google_event_id TEXT,
    track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Checklists
CREATE TABLE IF NOT EXISTS checklists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('template', 'instance')) DEFAULT 'instance',
    related_entity_type TEXT CHECK (related_entity_type IN ('track', 'release', 'general')),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Tarefas (Tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
    due_date TIMESTAMP WITH TIME ZONE,
    assignee TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Arquivos (Media Library)
CREATE TABLE IF NOT EXISTS files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    drive_file_id TEXT,
    drive_view_link TEXT,
    drive_download_link TEXT,
    category TEXT CHECK (category IN ('reels', 'shorts', 'image', 'behind_scenes', 'stems', 'master', 'document', 'video_long', 'presskit', 'other')) DEFAULT 'other',
    tags TEXT[],
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_files_track_id ON files(track_id);
CREATE INDEX IF NOT EXISTS idx_tasks_checklist_id ON tasks(checklist_id);
