import React, { useState } from 'react';
import { Button } from '@components/common/Button';
import { useAuth } from '@hooks/useAuth';

export const YouTubeHighlights: React.FC = () => {
    const { token } = useAuth();
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [highlights, setHighlights] = useState<string[]>([]);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setStatus('processing');
        setError('');
        setHighlights([]);

        try {
            const backendUrl = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';
            const response = await fetch(`${backendUrl}/api/youtube-highlights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao processar vídeo');
            }

            setHighlights(data.highlights);
            setStatus('completed');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro desconhecido');
            setStatus('error');
        }
    };

    return (
        <div className="youtube-highlights-container" style={{ padding: '2rem', color: 'white' }}>
            <h2>Destaques do YouTube</h2>
            <p style={{ marginBottom: '2rem', color: '#ccc' }}>
                Cole um link do YouTube abaixo para gerar automaticamente os melhores momentos.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        backgroundColor: '#1a1a1a',
                        color: 'white'
                    }}
                />
                <Button type="submit" disabled={status === 'processing'}>
                    {status === 'processing' ? 'Processando...' : 'Gerar Destaques'}
                </Button>
            </form>

            {status === 'processing' && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="loading-spinner" style={{
                        border: '4px solid rgba(255,255,255,0.1)',
                        borderLeftColor: '#646cff',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Baixando e processando vídeo... Isso pode levar alguns minutos.</p>
                    <style>{`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

            {status === 'error' && (
                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', borderRadius: '8px', color: '#ff6b6b' }}>
                    Erro: {error}
                </div>
            )}

            {status === 'completed' && (
                <div className="highlights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {highlights.map((videoPath, index) => {
                        const backendUrl = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';
                        return (
                            <div key={index} className="highlight-card" style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
                                <h3 style={{ marginTop: 0 }}>Destaque {index + 1}</h3>
                                <video
                                    controls
                                    width="100%"
                                    src={`${backendUrl}${videoPath}`}
                                    style={{ borderRadius: '4px' }}
                                />
                                <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                    <a
                                        href={`${backendUrl}${videoPath}`}
                                        download
                                        style={{ color: '#646cff', textDecoration: 'none', fontSize: '0.9rem' }}
                                    >
                                        Baixar Vídeo
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
