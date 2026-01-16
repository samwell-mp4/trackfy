import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { artistHubService } from '../../../services/artistHubService';
import './MediaLibrary.css';

// --- Types & Interfaces ---

type FileStatus = 'draft' | 'ready' | 'published' | 'archived';
type FileType = 'folder' | 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

interface FileNode {
    id: string;
    name: string;
    type: FileType;
    children?: FileNode[];
    url?: string;
    mimeType?: string;

    // Advanced Metadata
    tags?: string[];
    status?: FileStatus;
    version?: string; // v1, v2, final
    driveLink?: string; // Google Drive Link
    createdAt?: string;
    updatedAt?: string;
    size?: number;
    duration?: string; // For audio/video

    // Relations
    relatedTo?: {
        type: 'track' | 'release' | 'campaign' | 'event';
        id: string;
        name: string;
    };

    // Permissions
    isLocked?: boolean; // Prevent deletion (e.g. mandatory folders)
}

// --- Constants & Default Structure ---

const DEFAULT_STRUCTURE: FileNode[] = [
    {
        id: 'visual-identity', name: 'Identidade Visual', type: 'folder', isLocked: true, children: [
            { id: 'logo', name: 'Logotipo', type: 'folder', children: [] },
            { id: 'photos', name: 'Fotos Oficiais', type: 'folder', children: [] },
            { id: 'covers', name: 'Capas', type: 'folder', children: [] },
            { id: 'palette', name: 'Paleta de Cores', type: 'folder', children: [] },
            { id: 'typography', name: 'Tipografia', type: 'folder', children: [] },
            { id: 'moodboard', name: 'Moodboard', type: 'folder', children: [] },
        ]
    },
    {
        id: 'music', name: 'Músicas', type: 'folder', isLocked: true, children: [
            // Subfolders per song will be created dynamically
        ]
    },
    {
        id: 'social', name: 'Redes Sociais', type: 'folder', isLocked: true, children: [
            {
                id: 'instagram', name: 'Instagram', type: 'folder', children: [
                    { id: 'reels', name: 'Reels', type: 'folder', children: [] },
                    { id: 'stories', name: 'Stories', type: 'folder', children: [] },
                    { id: 'feed', name: 'Feed', type: 'folder', children: [] },
                    { id: 'collabs', name: 'Colabs', type: 'folder', children: [] },
                ]
            },
            {
                id: 'tiktok', name: 'TikTok', type: 'folder', children: [
                    { id: 'trends', name: 'Trends', type: 'folder', children: [] },
                    { id: 'drafts', name: 'Rascunhos', type: 'folder', children: [] },
                ]
            },
            {
                id: 'youtube', name: 'YouTube', type: 'folder', children: [
                    { id: 'shorts', name: 'Shorts', type: 'folder', children: [] },
                    { id: 'vlogs', name: 'Vlogs', type: 'folder', children: [] },
                ]
            },
            { id: 'ads', name: 'Anúncios / Tráfego', type: 'folder', children: [] },
        ]
    },
    {
        id: 'videos', name: 'Vídeos Oficiais', type: 'folder', isLocked: true, children: [
            { id: 'clips', name: 'Videoclipes', type: 'folder', children: [] },
            { id: 'lyric', name: 'Lyric Videos', type: 'folder', children: [] },
            { id: 'visualizers', name: 'Visualizers', type: 'folder', children: [] },
            { id: 'live', name: 'Performance ao Vivo', type: 'folder', children: [] },
        ]
    },
    {
        id: 'backstage', name: 'Bastidores', type: 'folder', isLocked: true, children: [
            { id: 'studio', name: 'Estúdio', type: 'folder', children: [] },
            { id: 'recordings', name: 'Gravações', type: 'folder', children: [] },
            { id: 'making-of', name: 'Making Of', type: 'folder', children: [] },
            { id: 'travel', name: 'Viagens', type: 'folder', children: [] },
            { id: 'shows-backstage', name: 'Shows', type: 'folder', children: [] },
        ]
    },
    {
        id: 'presskit', name: 'Presskit', type: 'folder', isLocked: true, children: [
            { id: 'bio-short', name: 'Bio Curta', type: 'folder', children: [] },
            { id: 'bio-full', name: 'Bio Completa', type: 'folder', children: [] },
            { id: 'promo-photos', name: 'Fotos Promocionais', type: 'folder', children: [] },
            { id: 'releases', name: 'Releases', type: 'folder', children: [] },
        ]
    },
    {
        id: 'tour', name: 'Shows & Turnê', type: 'folder', isLocked: true, children: [
            { id: 'riders', name: 'Riders Técnicos', type: 'folder', children: [] },
            { id: 'setlists', name: 'Setlists', type: 'folder', children: [] },
            { id: 'stage-maps', name: 'Mapas de Palco', type: 'folder', children: [] },
            { id: 'contracts-shows', name: 'Contratos', type: 'folder', children: [] },
        ]
    },
    {
        id: 'docs', name: 'Documentos', type: 'folder', isLocked: true, children: [
            { id: 'contracts-general', name: 'Contratos', type: 'folder', children: [] },
            { id: 'splits', name: 'Splits', type: 'folder', children: [] },
            { id: 'copyright', name: 'Autorais', type: 'folder', children: [] },
            { id: 'financial', name: 'Financeiro', type: 'folder', children: [] },
        ]
    },
    {
        id: 'distribution', name: 'Distribuição', type: 'folder', isLocked: true, children: [
            { id: 'metadata', name: 'Metadados', type: 'folder', children: [] },
            { id: 'isrc', name: 'ISRC', type: 'folder', children: [] },
            { id: 'lyrics-sync', name: 'Letras Sincronizadas', type: 'folder', children: [] },
            { id: 'reports', name: 'Relatórios', type: 'folder', children: [] },
        ]
    },
    {
        id: 'temp', name: 'Arquivos Temporários', type: 'folder', isLocked: true, children: []
    },
];

// --- Component ---

export const MediaLibrary: React.FC = () => {
    const [currentPath, setCurrentPath] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [rootStructure, setRootStructure] = useState<FileNode[]>([]);

    // UI State
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('all'); // all, image, video, audio, doc
    const [viewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadArtists();
    }, []);

    const loadArtists = async () => {
        try {
            const data = await artistHubService.getArtists();

            const artistNodes: FileNode[] = data.map((artist: any) => {
                let children = [];
                try {
                    if (typeof artist.files_structure === 'string') {
                        children = JSON.parse(artist.files_structure);
                    } else if (Array.isArray(artist.files_structure)) {
                        children = artist.files_structure;
                    }

                    // Fallback if parsed children is empty (fix for empty library issue)
                    if (!children || children.length === 0) {
                        children = JSON.parse(JSON.stringify(DEFAULT_STRUCTURE));
                    }
                } catch (e) {
                    console.error('Error parsing structure for artist:', artist.name, e);
                    children = JSON.parse(JSON.stringify(DEFAULT_STRUCTURE));
                }

                return {
                    id: artist.id,
                    name: artist.name,
                    type: 'folder',
                    isLocked: true,
                    children: children
                };
            });

            setRootStructure(artistNodes);
        } catch (error) {
            console.error('Error loading artists:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentFolder = (): FileNode => {
        if (currentPath.length === 0) return { id: 'root', name: 'Root', type: 'folder', children: rootStructure };

        let current = rootStructure.find(n => n.id === currentPath[0].id);
        for (let i = 1; i < currentPath.length; i++) {
            if (current && current.children) {
                current = current.children.find(n => n.id === currentPath[i].id);
            }
        }
        return current || { id: 'error', name: 'Error', type: 'folder', children: [] };
    };

    const currentFolder = getCurrentFolder();

    // Filter Logic
    const getFilteredChildren = () => {
        let children = currentFolder.children || [];

        // Search
        if (searchTerm) {
            // Deep search would be better, but for now filtering current view
            children = children.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Type Filter
        if (activeFilter !== 'all') {
            if (activeFilter === 'folder') {
                children = children.filter(c => c.type === 'folder');
            } else {
                children = children.filter(c => c.type !== 'folder' && c.type === activeFilter);
            }
        }

        return children;
    };

    const filteredChildren = getFilteredChildren();

    const handleNavigate = (node: FileNode) => {
        if (node.type === 'folder') {
            setCurrentPath([...currentPath, node]);
            setSelectedFile(null);
        } else {
            setSelectedFile(node);
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        setCurrentPath(currentPath.slice(0, index + 1));
        setSelectedFile(null);
    };

    const handleRootClick = () => {
        setCurrentPath([]);
        setSelectedFile(null);
    };

    const handleShare = (file: FileNode) => {
        if (file.type === 'folder') {
            alert('Compartilhamento de pastas em breve! 📁');
            return;
        }

        const url = file.url?.startsWith('http')
            ? file.url
            : `${window.location.origin}${file.url}`;

        navigator.clipboard.writeText(url);
        alert(`Link direto para "${file.name}" copiado! 🔗`);
    };

    // Drag and Drop
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (currentPath.length === 0) {
            alert('Selecione uma pasta de artista para enviar arquivos.');
            return;
        }

        for (const file of acceptedFiles) {
            try {
                const result: any = await artistHubService.uploadFile(file);

                // Determine file type
                let type: FileType = 'other';
                if (file.type.startsWith('image/')) type = 'image';
                else if (file.type.startsWith('video/')) type = 'video';
                else if (file.type.startsWith('audio/')) type = 'audio';
                else if (file.type.includes('pdf') || file.type.includes('document')) type = 'document';
                else if (file.type.includes('zip') || file.type.includes('rar')) type = 'archive';

                const newNode: FileNode = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type: type,
                    url: result.url,
                    mimeType: file.type,
                    size: file.size,
                    createdAt: new Date().toISOString(),
                    status: 'draft',
                    version: 'v1'
                };

                updateStructure(newNode);
            } catch (error) {
                console.error('Upload failed:', error);
                alert(`Erro ao enviar ${file.name}`);
            }
        }
    }, [currentPath, rootStructure]);

    const updateStructure = async (newNode: FileNode) => {
        const newRoot = [...rootStructure];

        const addToPath = (nodes: FileNode[], pathIndex: number): boolean => {
            const targetId = currentPath[pathIndex].id;
            const targetNode = nodes.find(n => n.id === targetId);

            if (targetNode) {
                if (pathIndex === currentPath.length - 1) {
                    if (!targetNode.children) targetNode.children = [];
                    targetNode.children.push(newNode);
                    return true;
                } else {
                    return targetNode.children ? addToPath(targetNode.children, pathIndex + 1) : false;
                }
            }
            return false;
        };

        if (currentPath.length > 0) {
            addToPath(newRoot, 0);
            setRootStructure(newRoot);

            const artistId = currentPath[0].id;
            const artistNode = newRoot.find(n => n.id === artistId);
            if (artistNode && artistNode.children) {
                try {
                    await artistHubService.updateArtist(artistId, {
                        files_structure: artistNode.children
                    });
                } catch (err) {
                    console.error('Failed to save structure:', err);
                }
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true
    });

    const getIcon = (node: FileNode) => {
        if (node.type === 'folder') {
            // Custom icons for mandatory folders
            const icons: Record<string, string> = {
                'visual-identity': '🎨',
                'music': '🎵',
                'social': '📱',
                'videos': '🎬',
                'backstage': '🎥',
                'presskit': '📰',
                'tour': '🎫',
                'docs': '📄',
                'distribution': '🌍',
                'temp': '⏳'
            };
            return icons[node.id] || '📂';
        }
        switch (node.type) {
            case 'image': return '🖼️';
            case 'video': return '🎞️';
            case 'audio': return '🎧';
            case 'document': return '📝';
            case 'archive': return '📦';
            default: return '📄';
        }
    };

    const getStatusBadge = (status?: FileStatus) => {
        if (!status) return null;

        // Using inline styles for now as we don't have tailwind classes setup
        const style = {
            draft: { background: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.3)' },
            ready: { background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' },
            published: { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' },
            archived: { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
        };

        const labels = {
            draft: 'Rascunho',
            ready: 'Pronto',
            published: 'Publicado',
            archived: 'Arquivado'
        };

        return (
            <span className="status-badge" style={style[status]}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="media-library-wrapper" {...getRootProps()}>
            <input {...getInputProps()} />

            {isDragActive && (
                <div className="dropzone-overlay">
                    <div className="dropzone-icon">📂</div>
                    <h2>Solte os arquivos aqui</h2>
                </div>
            )}

            {/* Sidebar Filters */}
            <div className="ml-sidebar">
                <div className="ml-sidebar-header">
                    <h3>Filtros</h3>
                </div>
                <div className="ml-filter-group">
                    <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>Todos</button>
                    <button className={`filter-btn ${activeFilter === 'image' ? 'active' : ''}`} onClick={() => setActiveFilter('image')}>Imagens</button>
                    <button className={`filter-btn ${activeFilter === 'video' ? 'active' : ''}`} onClick={() => setActiveFilter('video')}>Vídeos</button>
                    <button className={`filter-btn ${activeFilter === 'audio' ? 'active' : ''}`} onClick={() => setActiveFilter('audio')}>Áudio</button>
                    <button className={`filter-btn ${activeFilter === 'document' ? 'active' : ''}`} onClick={() => setActiveFilter('document')}>Documentos</button>
                </div>

                <div className="ml-sidebar-header" style={{ marginTop: '2rem' }}>
                    <h3>Integrações</h3>
                </div>
                <div className="ml-integration-status connected">
                    <span className="dot"></span> Google Drive Conectado
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-main">
                <div className="ml-header">
                    <h1 style={{ color: 'white' }}>Arquivos</h1>
                    <div className="ml-search">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="ml-breadcrumbs">
                    <div
                        className={`breadcrumb-item ${currentPath.length === 0 ? 'active' : ''}`}
                        onClick={handleRootClick}
                    >
                        🏠 Início
                    </div>
                    {currentPath.map((node, index) => (
                        <React.Fragment key={node.id}>
                            <span className="breadcrumb-separator">/</span>
                            <div
                                className={`breadcrumb-item ${index === currentPath.length - 1 ? 'active' : ''}`}
                                onClick={() => handleBreadcrumbClick(index)}
                            >
                                {node.name}
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-spinner">Carregando...</div>
                ) : (
                    <div className={`ml-grid ${viewMode}`}>
                        {filteredChildren.map(node => (
                            <div
                                key={node.id}
                                className={`ml-item ${selectedFile?.id === node.id ? 'selected' : ''}`}
                                onClick={() => handleNavigate(node)}
                            >
                                <div className="ml-icon">
                                    {node.type === 'image' && node.url ? (
                                        <img src={node.url} alt={node.name} className="ml-thumbnail" />
                                    ) : (
                                        getIcon(node)
                                    )}
                                </div>
                                <div className="ml-info">
                                    {node.type === 'folder' && <div className="ml-name">{node.name}</div>}
                                    <div className="ml-meta-row">
                                        {node.type === 'folder' ? (
                                            <span className="meta-text">{node.children?.length || 0} itens</span>
                                        ) : (
                                            <>
                                                {getStatusBadge(node.status)}
                                                {node.version && <span className="version-tag">{node.version}</span>}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-actions-row">
                                    <button
                                        className="ml-action-icon-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShare(node);
                                        }}
                                        title="Compartilhar"
                                    >
                                        🔗
                                    </button>
                                    {node.type !== 'folder' && (
                                        <button
                                            className="ml-action-icon-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(node.url, '_blank');
                                            }}
                                            title="Baixar"
                                        >
                                            ⬇️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredChildren.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <p>Nenhum arquivo encontrado.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Details Panel */}
            {selectedFile && selectedFile.type !== 'folder' && (
                <div className="ml-details-panel">
                    <div className="details-header">
                        <button className="close-btn" onClick={() => setSelectedFile(null)}>✕</button>
                        <h3>Detalhes</h3>
                    </div>

                    <div className="file-preview">
                        {selectedFile.type === 'image' && selectedFile.url ? (
                            <img src={selectedFile.url} alt={selectedFile.name} />
                        ) : (
                            <div className="preview-icon">{getIcon(selectedFile)}</div>
                        )}
                    </div>

                    <div className="details-content">
                        <div className="detail-group">
                            <label>Nome</label>
                            <div className="detail-value">{selectedFile.name}</div>
                        </div>

                        <div className="detail-group">
                            <label>Status</label>
                            <div className="detail-value">{getStatusBadge(selectedFile.status)}</div>
                        </div>

                        <div className="detail-group">
                            <label>Versão</label>
                            <div className="detail-value">{selectedFile.version || 'v1'}</div>
                        </div>

                        <div className="detail-group">
                            <label>Tamanho</label>
                            <div className="detail-value">
                                {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Desconhecido'}
                            </div>
                        </div>

                        <div className="detail-actions">
                            <button className="action-btn primary" onClick={() => window.open(selectedFile.url, '_blank')}>
                                👁️ Visualizar
                            </button>
                            <button className="action-btn secondary" onClick={() => handleShare(selectedFile)}>
                                🔗 Gerar Link
                            </button>
                            <button className="action-btn danger">
                                🗑️ Excluir
                            </button>
                        </div>

                        {/* Smart Actions based on folder */}
                        {currentPath.some(p => p.id === 'presskit') && (
                            <div className="smart-action-card">
                                <h4>🚀 Ação Rápida</h4>
                                <p>Este arquivo está no Presskit.</p>
                                <button className="smart-btn">Incluir no ZIP Oficial</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
