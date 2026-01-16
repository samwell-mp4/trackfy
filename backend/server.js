require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        // 1. Verificar usuário no Supabase (tabela 'users')
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password) // Nota: Em produção, use hash de senha!
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // 2. Gerar Token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                usuario: user.usuario,
                role: user.role || 'producer',
                artist_id: user.artist_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 3. Retornar dados
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                usuario: user.usuario,
                role: user.role || 'producer',
                artist_id: user.artist_id
            }
        });

    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Register Route
app.post('/register', async (req, res) => {
    const {
        usuario,
        email,
        password,
        role,
        artistic_name,
        musical_genre,
        company_name,
        managed_artists_count
    } = req.body;

    if (!usuario || !email || !password || !role) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando (usuario, email, senha, função)' });
    }

    try {
        // 1. Verificar se o usuário já existe
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Este email já está cadastrado' });
        }

        // 2. Inserir novo usuário com todos os dados do Quiz
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                usuario,
                email,
                password, // Nota: Em produção, use hash de senha
                role,
                artistic_name: artistic_name || null,
                musical_genre: musical_genre || null,
                company_name: company_name || null,
                managed_artists_count: managed_artists_count ? parseInt(managed_artists_count) : null
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Erro ao inserir usuário:', insertError);
            return res.status(500).json({ error: 'Erro ao criar conta' });
        }

        // 3. Gerar Token JWT
        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                usuario: newUser.usuario,
                role: newUser.role,
                artist_id: newUser.artist_id // Provavelmente null no registro inicial, mas ok
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                usuario: newUser.usuario,
                role: newUser.role,
                artistic_name: newUser.artistic_name, // Retornar novos campos se útil
                company_name: newUser.company_name
            }
        });

    } catch (err) {
        console.error('Erro no registro:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Middleware de Autenticação (Exemplo para rotas protegidas futuras)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Erro de autenticação:', err.message);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// Criar nova requisição de vídeo
app.post('/api/video-request', authenticateToken, async (req, res) => {
    const { metodo, frase, num_images } = req.body;

    if (!metodo || !num_images) {
        return res.status(400).json({ error: 'Método e número de imagens são obrigatórios' });
    }

    try {
        const { data, error } = await supabase
            .from('video_requests')
            .insert([
                {
                    user_id: req.user.id,
                    metodo,
                    frase: frase || null,
                    num_images,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar requisição:', error);
            return res.status(500).json({ error: 'Erro ao salvar requisição' });
        }

        res.json({ success: true, request: data });
    } catch (err) {
        console.error('Erro ao criar requisição:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar requisições de vídeo do usuário
app.get('/api/video-requests', authenticateToken, async (req, res) => {
    const { status } = req.query;

    try {
        let query = supabase
            .from('video_requests')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar requisições:', error);
            return res.status(500).json({ error: 'Erro ao buscar requisições' });
        }

        res.json({ requests: data });
    } catch (err) {
        console.error('Erro ao listar requisições:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Importar serviço do Google Drive
const driveService = require('./services/driveService');

// Rota da Galeria (Google Drive + Supabase Tracking)
app.get('/api/gallery', authenticateToken, async (req, res) => {
    try {
        // 1. Buscar vídeos do Drive
        const driveVideos = await driveService.listUserVideos(req.user.id);

        // 2. Buscar status de postagem no Supabase
        const { data: trackingData, error } = await supabase
            .from('gallery_tracking')
            .select('drive_file_id, is_posted')
            .eq('user_id', req.user.id);

        if (error) {
            console.error('Erro ao buscar tracking:', error);
            // Não falha a requisição, apenas loga o erro e segue sem status
        }

        // 3. Mesclar dados
        console.log(`[Gallery Debug] Drive Videos: ${driveVideos.length}, Tracking Data: ${trackingData?.length || 0}`);
        if (driveVideos.length > 0) console.log('[Gallery Debug] First Drive Video ID:', driveVideos[0].id);
        if (trackingData && trackingData.length > 0) console.log('[Gallery Debug] First Tracking ID:', trackingData[0].drive_file_id);

        const videos = driveVideos.map(video => {
            const tracking = trackingData?.find(t => t.drive_file_id === video.id);
            // Log mismatch for the first video only to avoid spam
            if (video === driveVideos[0]) {
                console.log('[Gallery Debug] Matching first video:', {
                    videoId: video.id,
                    foundTracking: !!tracking,
                    trackingStatus: tracking?.is_posted
                });
            }
            return {
                ...video,
                isPosted: tracking ? tracking.is_posted : false
            };
        });

        res.json({ videos });
    } catch (error) {
        console.error('Erro na rota da galeria:', error);
        res.status(500).json({
            error: 'Erro ao carregar galeria',
            details: error.message
        });
    }
});

// Rota para alternar status de postagem
app.post('/api/gallery/toggle-posted', authenticateToken, async (req, res) => {
    const { drive_file_id, is_posted } = req.body;

    console.log(`[Toggle Posted] User: ${req.user.id}, File: ${drive_file_id}, Status: ${is_posted}`);

    if (!drive_file_id) {
        return res.status(400).json({ error: 'ID do arquivo é obrigatório' });
    }

    try {
        // Primeiro verificamos se já existe para debug
        const { data: existing } = await supabase
            .from('gallery_tracking')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('drive_file_id', drive_file_id)
            .single();

        console.log('[Toggle Posted] Existing record:', existing);

        let result;

        if (existing) {
            // 2. Atualizar se existir
            console.log('[Toggle Posted] Updating existing record...');
            const { data, error } = await supabase
                .from('gallery_tracking')
                .update({ is_posted })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // 3. Inserir se não existir
            console.log('[Toggle Posted] Inserting new record...');
            const { data, error } = await supabase
                .from('gallery_tracking')
                .insert([{
                    user_id: req.user.id,
                    drive_file_id,
                    is_posted
                }])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        console.log('[Toggle Posted] Success:', result);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({
            error: 'Erro ao atualizar status',
            details: error.message || JSON.stringify(error),
            hint: 'Verifique o console do servidor para mais detalhes.'
        });
    }
});

// Rota de teste protegida
app.get('/me', authenticateToken, (req, res) => {
    res.json({ message: 'Acesso autorizado', user: req.user });
});

// Proxy para n8n webhook (evita CORS)
app.post('/api/trigger-n8n', authenticateToken, async (req, res) => {
    const { request_id, user, metodo, frase, images } = req.body;

    if (!images || images.length === 0) {
        return res.status(400).json({ error: 'Imagens são obrigatórias' });
    }

    try {
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
            console.error('N8N_WEBHOOK_URL não configurado');
            return res.status(500).json({ error: 'Webhook não configurado' });
        }

        const payload = {
            request_id,
            user,
            metodo,
            images
        };

        if (metodo === 'Manual' && frase) {
            payload.frase = frase;
        }

        // Fazer requisição para n8n
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro do n8n:', errorText);
            return res.status(response.status).json({
                error: 'Falha ao acionar workflow',
                details: errorText
            });
        }

        const result = await response.json();

        // Atualizar status no banco
        const status = (result.result && result.result.complete === 'true') ? 'completed' : 'pending';

        await supabase
            .from('video_requests')
            .update({ status })
            .eq('id', request_id);

        res.json({ success: true, result });

    } catch (error) {
        console.error('Erro ao chamar n8n:', error);

        // Atualizar status para erro
        if (request_id) {
            await supabase
                .from('video_requests')
                .update({ status: 'failed' })
                .eq('id', request_id);
        }

        res.status(500).json({ error: 'Erro ao acionar workflow' });
    }
});

// Servir arquivos de destaques (gerados pelo backend)
app.use('/highlights', express.static(path.join(__dirname, 'public/highlights')));

// Serviço de YouTube
const youtubeService = require('./services/youtubeService');

// Rota para gerar destaques do YouTube
app.post('/api/youtube-highlights', authenticateToken, async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL do YouTube é obrigatória' });
    }

    try {
        // 1. Baixar vídeo
        console.log(`Recebida requisição de destaques para: ${url}`);
        const videoPath = await youtubeService.downloadVideo(url);

        // 2. Extrair destaques
        console.log(`Vídeo baixado em: ${videoPath}. Iniciando extração...`);
        const highlights = await youtubeService.extractHighlights(videoPath);

        // 3. Retornar caminhos (URLs relativas)
        console.log('Destaques gerados:', highlights);
        res.json({ success: true, highlights });

        // Opcional: Limpar vídeo original após processamento para economizar espaço
        // fs.unlinkSync(videoPath); 

    } catch (error) {
        console.error('Erro ao processar destaques:', error);
        res.status(500).json({
            error: 'Erro ao processar vídeo',
            details: error.message
        });
    }
});

// Health check para monitoramento
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- FILE UPLOAD HANDLING ---
const UPLOADS_DIR = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));

app.post('/api/upload', authenticateToken, async (req, res) => {
    try {
        const { file, filename, type } = req.body;

        if (!file || !filename) {
            return res.status(400).json({ error: 'Arquivo e nome são obrigatórios' });
        }

        // Remove header do Base64 (ex: "data:image/png;base64,")
        const base64Data = file.replace(/^data:.*,/, "");
        const filePath = path.join(UPLOADS_DIR, `${Date.now()}_${filename}`);

        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err) {
                console.error('Erro ao salvar arquivo:', err);
                return res.status(500).json({ error: 'Erro ao salvar arquivo no disco' });
            }

            const publicUrl = `/uploads/${path.basename(filePath)}`;
            res.json({ success: true, url: publicUrl });
        });

    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro interno no upload' });
    }
});

// --- PUBLIC SHARE ROUTES ---
app.post('/api/public/track/access', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token) return res.status(400).json({ error: 'Token obrigatório' });

        console.log('[Public Access] Searching for token:', token);

        // Buscar track pelo token no metadata usando operador seta ->> (texto)
        const { data: tracks, error } = await supabase
            .from('tracks')
            .select('*, artists(*)')
            // Tenta buscar onde metadata->>share_token é igual ao token
            .eq('metadata->>share_token', token);

        if (error) {
            console.error('[Public Access] DB Error:', error);
            return res.status(500).json({ error: 'Erro no banco de dados' });
        }

        if (!tracks || tracks.length === 0) {
            console.warn('[Public Access] Token not found:', token);
            // Fallback: Tentar .contains caso a sintaxe ->> não funcione em algumas versões/configurações
            const { data: fallbackTracks } = await supabase
                .from('tracks')
                .select('*, artists(*)')
                .contains('metadata', { share_token: token });

            if (!fallbackTracks || fallbackTracks.length === 0) {
                return res.status(404).json({ error: 'Música não encontrada ou link inválido' });
            }
            // Se achou no fallback
            console.log('[Public Access] Found via fallback .contains');
            const track = fallbackTracks[0];
            return handleTrackResponse(track, password, res);
        }

        const track = tracks[0];
        handleTrackResponse(track, password, res);

    } catch (error) {
        console.error('Erro ao acessar link público:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

function handleTrackResponse(track, password, res) {
    const storedPassword = track.metadata.share_password;

    // Verificar senha se existir
    if (storedPassword && storedPassword !== password) {
        return res.status(403).json({ error: 'Senha incorreta', requirePassword: true });
    }

    // Retornar dados
    res.json(track);
}



// --- ARTISTA HUB ROUTES ---

const artistService = require('./services/artistService');
const agendaService = require('./services/agendaService');
const taskService = require('./services/taskService');

// Artists
app.get('/api/artist-hub/artists', authenticateToken, async (req, res) => {
    try {
        const artists = await artistService.listArtists(req.user.id);
        res.json(artists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Criar usuário para um artista
app.post('/api/artist-hub/artists/:id/user', authenticateToken, async (req, res) => {
    const { email, password, name } = req.body;
    const artistId = req.params.id;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        // 1. Check if email exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // 2. Create User
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
                email,
                password, // Note: Hash in production!
                usuario: name,
                role: 'artist',
                artist_id: artistId
            }])
            .select()
            .single();

        if (createError) throw createError;

        res.json(newUser);
    } catch (err) {
        console.error('Erro ao criar usuário do artista:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/artist-hub/artists', authenticateToken, async (req, res) => {
    try {
        const artist = await artistService.createArtist(req.user.id, req.body);
        res.json(artist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/artist-hub/artists/:id', authenticateToken, async (req, res) => {
    try {
        const artist = await artistService.updateArtist(req.user.id, req.params.id, req.body);
        res.json(artist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/artist-hub/artists/:id', authenticateToken, async (req, res) => {
    try {
        await artistService.deleteArtist(req.user.id, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tracks
app.get('/api/artist-hub/tracks', authenticateToken, async (req, res) => {
    try {
        const tracks = await artistService.listTracks(req.user.id, req.query.artist_id);
        res.json(tracks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/artist-hub/tracks/:id', authenticateToken, async (req, res) => {
    try {
        const track = await artistService.getTrack(req.user.id, req.params.id);
        res.json(track);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/artist-hub/tracks', authenticateToken, async (req, res) => {
    try {
        const track = await artistService.createTrack(req.user.id, req.body);
        res.json(track);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/artist-hub/tracks/:id', authenticateToken, async (req, res) => {
    try {
        const track = await artistService.updateTrack(req.user.id, req.params.id, req.body);
        res.json(track);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/artist-hub/tracks/:id', authenticateToken, async (req, res) => {
    try {
        await artistService.deleteTrack(req.user.id, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/artist-hub/tracks/:id/files/:type', authenticateToken, async (req, res) => {
    try {
        const { id, type } = req.params;
        const { track, deletedFileUrl } = await artistService.deleteTrackFile(req.user.id, id, type);

        // Physical deletion
        if (deletedFileUrl) {
            try {
                const filename = path.basename(deletedFileUrl);
                // Ensure we only delete files in the uploads directory to prevent traversal
                const filePath = path.join(UPLOADS_DIR, filename);

                // Verify the path is actually inside UPLOADS_DIR
                if (filePath.startsWith(UPLOADS_DIR) && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`[File Deletion] Deleted physical file: ${filePath}`);
                }
            } catch (fsError) {
                console.error('[File Deletion] Error deleting physical file:', fsError);
                // We don't fail the request if physical deletion fails, as DB is already updated
            }
        }

        res.json(track);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Events
app.get('/api/artist-hub/events', authenticateToken, async (req, res) => {
    try {
        const events = await agendaService.listEvents(req.user.id, req.query.start, req.query.end, req.query.track_id);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/artist-hub/events', authenticateToken, async (req, res) => {
    try {
        const event = await agendaService.createEvent(req.user.id, req.body);
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/artist-hub/events/:id', authenticateToken, async (req, res) => {
    try {
        const event = await agendaService.updateEvent(req.user.id, req.params.id, req.body);
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/artist-hub/events/:id', authenticateToken, async (req, res) => {
    try {
        await agendaService.deleteEvent(req.user.id, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Checklists & Tasks
app.get('/api/artist-hub/checklists', authenticateToken, async (req, res) => {
    try {
        const checklists = await taskService.listChecklists(req.user.id, req.query.related_entity_type, req.query.related_entity_id);
        res.json(checklists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/artist-hub/checklists', authenticateToken, async (req, res) => {
    try {
        const checklist = await taskService.createChecklist(req.user.id, req.body);
        res.json(checklist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/artist-hub/checklists/:id', authenticateToken, async (req, res) => {
    try {
        await taskService.deleteChecklist(req.user.id, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/artist-hub/tasks', authenticateToken, async (req, res) => {
    try {
        const task = await taskService.createTask(req.user.id, req.body);
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/artist-hub/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const task = await taskService.updateTask(req.user.id, req.params.id, req.body);
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/artist-hub/tasks/:id', authenticateToken, async (req, res) => {
    try {
        await taskService.deleteTask(req.user.id, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Servir arquivos estáticos do frontend (build do Vite)
const frontendPath = path.join(__dirname, '../frontend/dist');

// Verificar se o build do frontend existe
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    // Rota catch-all para SPA
    app.get('*', (req, res) => {
        const indexPath = path.join(frontendPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Frontend build not found (index.html missing)');
        }
    });
    console.log(`Frontend estático configurado em: ${frontendPath}`);
} else {
    console.log('⚠️ Frontend build não encontrado. Rodando em modo API-only.');
    console.log('   Para servir o frontend, rode "npm run build" na pasta frontend.');
}



app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
// Trigger restart
