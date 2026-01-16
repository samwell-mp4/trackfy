import React, { useEffect, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import './Gallery.css';

interface Video {
    id: string;
    name: string;
    thumbnail: string;
    downloadLink: string;
    createdAt: string;
    size: string;
    mimeType?: string;
    isPosted?: boolean;
}

export const Gallery: React.FC = () => {
    const { token, user } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'posted'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVideos = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use VITE_BACKEND_URL if available, otherwise relative path (proxy in dev, direct in prod)
            const backendUrl = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';
            const response = await fetch(`${backendUrl}/api/gallery`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar vídeos');
            }

            const data = await response.json();
            setVideos(data.videos || []);
        } catch (err) {
            console.error('Erro ao buscar vídeos:', err);
            setError('Não foi possível carregar sua galeria no momento.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchVideos();
        }
    }, [token]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatSize = (bytes: string) => {
        const size = parseInt(bytes);
        if (isNaN(size)) return 'N/A';
        const i = Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    };

    const togglePosted = async (video: Video) => {
        const newStatus = !video.isPosted;

        // Otimistic update
        setVideos(prev => prev.map(v =>
            v.id === video.id ? { ...v, isPosted: newStatus } : v
        ));

        try {
            const backendUrl = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';
            await fetch(`${backendUrl}/api/gallery/toggle-posted`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    drive_file_id: video.id,
                    is_posted: newStatus
                })
            });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            // Revert on error
            setVideos(prev => prev.map(v =>
                v.id === video.id ? { ...v, isPosted: !newStatus } : v
            ));
        }
    };

    const filteredVideos = videos.filter(video => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !video.isPosted;
        if (filter === 'posted') return video.isPosted;
        return true;
    });

    const metrics = {
        total: videos.length,
        pending: videos.filter(v => !v.isPosted).length,
        posted: videos.filter(v => v.isPosted).length
    };

    const [showDebug, setShowDebug] = useState(false);

    const [downloadedVideos, setDownloadedVideos] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('downloadedVideos');
        return new Set(saved ? JSON.parse(saved) : []);
    });

    const handleDownload = (videoId: string) => {
        const newSet = new Set(downloadedVideos);
        newSet.add(videoId);
        setDownloadedVideos(newSet);
        localStorage.setItem('downloadedVideos', JSON.stringify(Array.from(newSet)));
    };

    return (
        <div className="dashboard-card gallery-card">
            <div className="card-header">
                <div>
                    <h2 onClick={() => setShowDebug(!showDebug)} style={{ cursor: 'pointer' }}>
                        Minha Galeria {showDebug && '🐞'}
                    </h2>
                    <p>Gerencie seus vídeos gerados.</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={fetchVideos}
                        className="refresh-btn"
                        disabled={loading}
                        title="Atualizar lista"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {showDebug && videos.length > 0 && (
                <div style={{
                    background: '#111',
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto'
                }}>
                    <h4>DEBUG INFO (First Video)</h4>
                    <pre>{JSON.stringify(videos[0], null, 2)}</pre>
                </div>
            )}

            <div className="gallery-metrics">
                <div className="metric-item">
                    <span className="metric-value">{metrics.total}</span>
                    <span className="metric-label">Total</span>
                </div>
                <div className="metric-item pending">
                    <span className="metric-value">{metrics.pending}</span>
                    <span className="metric-label">Pendentes</span>
                </div>
                <div className="metric-item posted">
                    <span className="metric-value">{metrics.posted}</span>
                    <span className="metric-label">Postados</span>
                </div>
            </div>

            <div className="gallery-tabs">
                <button
                    className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                <button
                    className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pendentes
                </button>
                <button
                    className={`tab-btn ${filter === 'posted' ? 'active' : ''}`}
                    onClick={() => setFilter('posted')}
                >
                    Postados
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <p>Carregando vídeos...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchVideos} className="retry-btn">Tentar Novamente</button>
                </div>
            ) : videos.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum vídeo encontrado 📂</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Seus vídeos gerados aparecerão aqui automaticamente.
                    </p>
                    <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-gray-600">
                        <p>Debug Info:</p>
                        <p>User ID: {user?.id}</p>
                        <p>Email: {user?.email}</p>
                    </div>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredVideos.map((video) => (
                        <div key={video.id} className="video-card">
                            <div className="thumbnail-wrapper">
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} alt={video.name} className="thumbnail" referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.src.includes('drive.google.com/thumbnail')) {
                                                target.src = `https://drive.google.com/thumbnail?id=${video.id}&sz=w600`;
                                            } else {
                                                target.src = 'https://placehold.co/600x400/png?text=No+Thumbnail';
                                            }
                                        }}
                                    />
                                ) : (
                                    <img src="https://placehold.co/600x400/png?text=Video+Preview" className="thumbnail" alt="Placeholder" />
                                )}

                                <div className="posted-badge">
                                    <label className="posted-toggle">
                                        <input
                                            type="checkbox"
                                            checked={!!video.isPosted}
                                            onChange={() => togglePosted(video)}
                                        />
                                        <span className="toggle-ball"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="video-info">
                                <h3 className="video-title" title={video.name}>{video.name}</h3>
                                <div className="video-meta">
                                    <span>📅 {formatDate(video.createdAt)}</span>
                                    <span>💾 {formatSize(video.size)}</span>
                                </div>

                                <div className="video-actions">
                                    <a
                                        href={video.downloadLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`btn-download ${downloadedVideos.has(video.id) ? 'downloaded' : ''}`}
                                        onClick={() => handleDownload(video.id)}
                                    >
                                        <span>{downloadedVideos.has(video.id) ? '✅' : '⬇'}</span>
                                        {downloadedVideos.has(video.id) ? 'Baixado' : 'Baixar'}
                                    </a>
                                </div>

                                <div className="social-actions">
                                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="social-btn instagram" title="Postar no Instagram">
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>
                                    </a>
                                    <a href="https://www.tiktok.com/upload" target="_blank" rel="noopener noreferrer" className="social-btn tiktok" title="Postar no TikTok">
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                    </a>
                                    <a href="https://studio.youtube.com/" target="_blank" rel="noopener noreferrer" className="social-btn youtube" title="Postar no YouTube">
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                    </a>
                                    <a href="https://www.kwai.com/" target="_blank" rel="noopener noreferrer" className="social-btn kwai" title="Postar no Kwai">
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H15v-4.5h-1.5V16H12v-6h1.5v4.5H15V10h1.5v6z" /> <text x="6" y="17" fontSize="14" fontWeight="bold" fill="currentColor">K</text></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
