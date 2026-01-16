export interface ChecklistItem {
    id: string;
    title: string;
    description?: string;
    category: string;
    isOptional?: boolean;
    tags?: string[];
}

export interface ChecklistTemplate {
    id: string;
    title: string;
    description: string;
    items: ChecklistItem[];
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
    {
        id: 'identity',
        title: 'Identidade do Artista',
        description: 'Definição de marca, visual e posicionamento.',
        items: [
            { id: 'id_1', title: 'Definir conceito geral', category: 'Identidade', tags: ['branding'] },
            { id: 'id_2', title: 'Definir paleta de cores', category: 'Identidade', tags: ['design'] },
            { id: 'id_3', title: 'Criar moodboard', category: 'Identidade', tags: ['design'] },
            { id: 'id_4', title: 'Criar frase/posicionamento do artista', category: 'Identidade', tags: ['branding'] },
            { id: 'id_5', title: 'Criar presskit', category: 'Identidade', tags: ['press'] },
            { id: 'id_6', title: 'Criar mini bio (150 caracteres)', category: 'Identidade', tags: ['copy'] },
            { id: 'id_7', title: 'Criar bio completa (1.000 caracteres)', category: 'Identidade', tags: ['copy'] },
            { id: 'id_8', title: 'Criar logotipo', category: 'Identidade', tags: ['design'] },
            { id: 'id_9', title: 'Criar tipografia padrão', category: 'Identidade', tags: ['design'] },
            { id: 'id_10', title: 'Criar fotos profissionais', category: 'Identidade', tags: ['photo'] },
            { id: 'id_11', title: 'Criar pasta "Identidade" no Drive', category: 'Identidade', tags: ['organização'] },
            { id: 'id_12', title: 'Foto perfil Instagram (1080x1080)', category: 'Identidade', tags: ['social'] },
            { id: 'id_13', title: 'Foto capa Spotify (3000x3000, 300dpi)', category: 'Identidade', tags: ['streaming'] },
        ]
    },
    {
        id: 'content_routine',
        title: 'Rotina de Conteúdo',
        description: 'Planejamento e produção de conteúdo para redes sociais.',
        items: [
            // Reels / TikTok
            { id: 'cr_1', title: 'Criar planilha de ideias (mínimo 30)', category: 'Reels/TikTok', tags: ['planning'] },
            { id: 'cr_2', title: 'Separar áudios tendências', category: 'Reels/TikTok', tags: ['research'] },
            { id: 'cr_3', title: 'Gravar reels principais', category: 'Reels/TikTok', tags: ['production'] },
            { id: 'cr_4', title: 'Criar versão com legenda dinâmica', category: 'Reels/TikTok', tags: ['editing'] },
            { id: 'cr_5', title: 'Criar versão com hook inicial (2s)', category: 'Reels/TikTok', tags: ['editing'] },
            { id: 'cr_6', title: 'Criar versão quadrada para Facebook', category: 'Reels/TikTok', tags: ['editing'] },
            { id: 'cr_7', title: 'Criar versão 9:16 para TikTok', category: 'Reels/TikTok', tags: ['editing'] },
            { id: 'cr_8', title: 'Criar CTA de cada reel', category: 'Reels/TikTok', tags: ['copy'] },
            { id: 'cr_9', title: 'Revisar miniatura (thumbnail)', category: 'Reels/TikTok', tags: ['design'] },
            // Stories
            { id: 'cr_10', title: 'Story de rotina', category: 'Stories', tags: ['daily'] },
            { id: 'cr_11', title: 'Story call-to-action', category: 'Stories', tags: ['daily'] },
            { id: 'cr_12', title: 'Story bastidor', category: 'Stories', tags: ['daily'] },
            { id: 'cr_13', title: 'Story "bom dia / boa noite"', category: 'Stories', tags: ['daily'] },
            { id: 'cr_14', title: 'Story pergunta', category: 'Stories', tags: ['engagement'] },
            { id: 'cr_15', title: 'Story mostrando algo de valor', category: 'Stories', tags: ['value'] },
            { id: 'cr_16', title: 'Story repost de fãs', category: 'Stories', tags: ['community'] },
            // Shorts
            { id: 'cr_17', title: 'Reaproveitar reels para Shorts', category: 'YouTube Shorts', tags: ['repurpose'] },
            { id: 'cr_18', title: 'Criar thumb 1280x720', category: 'YouTube Shorts', tags: ['design'] },
        ]
    },
    {
        id: 'release_cycle',
        title: 'Ciclo de Lançamento Completo',
        description: 'Do pré ao pós-lançamento de uma música.',
        items: [
            // Pré-lançamento
            { id: 'rl_1', title: 'Stems organizados', category: 'Pré-lançamento', tags: ['files'] },
            { id: 'rl_2', title: 'Master final aprovada', category: 'Pré-lançamento', tags: ['audio'] },
            { id: 'rl_3', title: 'Preview 15s para redes sociais', category: 'Pré-lançamento', tags: ['promo'] },
            { id: 'rl_4', title: 'Versão rádio', category: 'Pré-lançamento', tags: ['audio'], isOptional: true },
            { id: 'rl_5', title: 'Versão instrumental', category: 'Pré-lançamento', tags: ['audio'] },
            { id: 'rl_6', title: 'Arquivar todas versões no Drive', category: 'Pré-lançamento', tags: ['organização'] },
            { id: 'rl_7', title: 'Criar capa 3000x3000', category: 'Pré-lançamento', tags: ['design'] },
            { id: 'rl_8', title: 'Criar teaser da capa', category: 'Pré-lançamento', tags: ['promo'] },
            { id: 'rl_9', title: 'Subir música na distribuidora', category: 'Distribuição', tags: ['distro'] },
            { id: 'rl_10', title: 'Preencher ISRC e Créditos', category: 'Distribuição', tags: ['metadata'] },
            { id: 'rl_11', title: 'Enviar letras', category: 'Distribuição', tags: ['metadata'] },
            { id: 'rl_12', title: 'Criar link de pré-save', category: 'Pré-save', tags: ['promo'] },
            { id: 'rl_13', title: 'Criar CTA para pré-save', category: 'Pré-save', tags: ['copy'] },
            // Lançamento
            { id: 'rl_14', title: 'Post oficial de lançamento', category: 'Lançamento', tags: ['social'] },
            { id: 'rl_15', title: 'Story oficial com link', category: 'Lançamento', tags: ['social'] },
            { id: 'rl_16', title: 'Reel oficial (hook + música)', category: 'Lançamento', tags: ['social'] },
            { id: 'rl_17', title: 'Responder todos os comentários', category: 'Lançamento', tags: ['community'] },
            { id: 'rl_18', title: 'Enviar para playlists', category: 'Lançamento', tags: ['pitching'] },
            // Pós-lançamento
            { id: 'rl_19', title: 'Reel mostrando resultados', category: 'Pós-lançamento', tags: ['social'] },
            { id: 'rl_20', title: 'Post agradecimento', category: 'Pós-lançamento', tags: ['social'] },
            { id: 'rl_21', title: 'Versão acústica', category: 'Pós-lançamento', tags: ['content'], isOptional: true },
            { id: 'rl_22', title: 'Criar campanha com Ads', category: 'Pós-lançamento', tags: ['ads'], isOptional: true },
        ]
    },
    {
        id: 'music_production',
        title: 'Produção Musical',
        description: 'Etapas da criação de uma faixa.',
        items: [
            { id: 'mp_1', title: 'Composição', category: 'Pré-produção', tags: ['creative'] },
            { id: 'mp_2', title: 'Guia da música', category: 'Pré-produção', tags: ['demo'] },
            { id: 'mp_3', title: 'Escolher BPM e tom', category: 'Pré-produção', tags: ['technical'] },
            { id: 'mp_4', title: 'Gravação voz principal', category: 'Gravação', tags: ['studio'] },
            { id: 'mp_5', title: 'Gravação backings', category: 'Gravação', tags: ['studio'] },
            { id: 'mp_6', title: 'Edição', category: 'Pós-produção', tags: ['technical'] },
            { id: 'mp_7', title: 'Mix 1', category: 'Pós-produção', tags: ['mix'] },
            { id: 'mp_8', title: 'Revisão Mix', category: 'Pós-produção', tags: ['review'] },
            { id: 'mp_9', title: 'Master final', category: 'Pós-produção', tags: ['master'] },
        ]
    },
    {
        id: 'video_production',
        title: 'Produção Audiovisual (Clipe)',
        description: 'Planejamento e execução de videoclipe.',
        items: [
            { id: 'vp_1', title: 'Criar roteiro', category: 'Pré-produção', tags: ['creative'] },
            { id: 'vp_2', title: 'Criar storyboard', category: 'Pré-produção', tags: ['creative'] },
            { id: 'vp_3', title: 'Escolher locações', category: 'Pré-produção', tags: ['logistics'] },
            { id: 'vp_4', title: 'Contratar equipe', category: 'Pré-produção', tags: ['team'] },
            { id: 'vp_5', title: 'Gravação (Diária)', category: 'Gravação', tags: ['set'] },
            { id: 'vp_6', title: 'Backup duplo dos arquivos', category: 'Gravação', tags: ['security'] },
            { id: 'vp_7', title: 'Captar making of', category: 'Gravação', tags: ['content'] },
            { id: 'vp_8', title: 'Edição v1', category: 'Pós-produção', tags: ['editing'] },
            { id: 'vp_9', title: 'Correção de cor', category: 'Pós-produção', tags: ['color'] },
            { id: 'vp_10', title: 'Export final', category: 'Pós-produção', tags: ['delivery'] },
        ]
    },
    {
        id: 'shows_tour',
        title: 'Shows e Turnê',
        description: 'Preparação para apresentações ao vivo.',
        items: [
            { id: 'st_1', title: 'Criar setlist', category: 'Preparação', tags: ['repertoire'] },
            { id: 'st_2', title: 'Enviar rider técnico', category: 'Logística', tags: ['tech'] },
            { id: 'st_3', title: 'Enviar mapa de palco', category: 'Logística', tags: ['tech'] },
            { id: 'st_4', title: 'Teste de som', category: 'Dia do Show', tags: ['soundcheck'] },
            { id: 'st_5', title: 'Gravar trechos do show', category: 'Dia do Show', tags: ['content'] },
            { id: 'st_6', title: 'Post show com highlights', category: 'Pós-Show', tags: ['social'] },
        ]
    },
    {
        id: 'financial',
        title: 'Gestão Financeira',
        description: 'Controle de custos e receitas.',
        items: [
            { id: 'fin_1', title: 'Definir orçamento do lançamento', category: 'Planejamento', tags: ['finance'] },
            { id: 'fin_2', title: 'Planilha de custos (produção, clipe, ads)', category: 'Planejamento', tags: ['finance'] },
            { id: 'fin_3', title: 'Cadastro no ECAD', category: 'Royalties', tags: ['legal'] },
            { id: 'fin_4', title: 'Cadastro na Associação (UBC/Abramus)', category: 'Royalties', tags: ['legal'] },
            { id: 'fin_5', title: 'Verificar recebimento de royalties', category: 'Acompanhamento', tags: ['finance'] },
        ]
    },
    {
        id: 'backstage',
        title: 'Bastidores / Backstage',
        description: 'Conteúdo de bastidores para engajamento.',
        items: [
            { id: 'bk_1', title: 'Fotos making of', category: 'Conteúdo', tags: ['photo'] },
            { id: 'bk_2', title: 'Vídeos brutos', category: 'Conteúdo', tags: ['video'] },
            { id: 'bk_3', title: 'Reels bastidor', category: 'Social', tags: ['reels'] },
            { id: 'bk_4', title: 'Story bastidor', category: 'Social', tags: ['stories'] },
            { id: 'bk_5', title: 'Depoimentos da equipe', category: 'Social', tags: ['content'] },
            { id: 'bk_6', title: 'Registro de estúdio', category: 'Produção', tags: ['studio'] },
            { id: 'bk_7', title: 'Conteúdo de humor / leve', category: 'Social', tags: ['fun'] },
        ]
    },
    {
        id: 'distribution',
        title: 'Distribuição e Metadados',
        description: 'Checklist técnico obrigatório.',
        items: [
            { id: 'dst_1', title: 'Gerar ISRC', category: 'Metadados', tags: ['tech'] },
            { id: 'dst_2', title: 'Gerar UPC', category: 'Metadados', tags: ['tech'] },
            { id: 'dst_3', title: 'Definir créditos (artistas, produtores)', category: 'Metadados', tags: ['legal'] },
            { id: 'dst_4', title: 'Definir splits percentuais', category: 'Metadados', tags: ['legal'] },
            { id: 'dst_5', title: 'Sincronizar letra', category: 'Metadados', tags: ['content'] },
            { id: 'dst_6', title: 'Nome da editora', category: 'Metadados', tags: ['legal'] },
            { id: 'dst_7', title: 'Contato de publishing', category: 'Metadados', tags: ['contact'] },
            { id: 'dst_8', title: 'Thumbnail para YouTube', category: 'Assets', tags: ['design'] },
            { id: 'dst_9', title: 'Categoria correta na distribuidora', category: 'Distribuição', tags: ['distro'] },
        ]
    },
    {
        id: 'drive_org',
        title: 'Organização no Google Drive',
        description: 'Estrutura de pastas sugerida.',
        items: [
            { id: 'drv_1', title: 'Criar pasta /Artista', category: 'Estrutura', tags: ['admin'] },
            { id: 'drv_2', title: 'Criar pasta /Identidade', category: 'Estrutura', tags: ['admin'] },
            { id: 'drv_3', title: 'Criar pasta /Fotos', category: 'Estrutura', tags: ['admin'] },
            { id: 'drv_4', title: 'Criar pasta /Músicas', category: 'Estrutura', tags: ['admin'] },
            { id: 'drv_5', title: 'Criar pasta /Vídeos', category: 'Estrutura', tags: ['admin'] },
            { id: 'drv_6', title: 'Criar pasta /Presskit', category: 'Estrutura', tags: ['admin'] },
            { id: 'drv_7', title: 'Organizar Stems e Master na pasta da faixa', category: 'Músicas', tags: ['files'] },
        ]
    }
];
