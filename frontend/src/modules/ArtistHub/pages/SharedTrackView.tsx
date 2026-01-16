import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import './TrackDashboard.css'; // Reuse styles

export const SharedTrackView: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [track, setTrack] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [requirePassword, setRequirePassword] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'lyrics' | 'files' | 'docs'>('overview');

    useEffect(() => {
        if (token) loadTrack();
    }, [token]);

    const loadTrack = async (pwd?: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await artistHubService.getSharedTrack(token!, pwd);
            setTrack(data);
            setRequirePassword(false);
        } catch (err: any) {
            if (err.requirePassword) {
                console.log('Password required for shared track');
                setRequirePassword(true);
            } else {
                console.error('Error loading shared track:', err);
                setError('Link inválido ou expirado.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadTrack(password);
    };

    if (loading && !requirePassword) return <div className="loading-spinner">Carregando...</div>;

    if (requirePassword) {
        return (
            <div className="modal-overlay" style={{ background: '#0f172a' }}>
                <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <h2>🔒 Acesso Protegido</h2>
                    <p>Esta música é protegida por senha.</p>
                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            className="meta-input"
                            style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', margin: '1rem 0', textAlign: 'center' }}
                            placeholder="Digite a senha..."
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoFocus
                        />
                        <Button variant="primary" style={{ width: '100%' }} type="submit">Acessar</Button>
                    </form>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>😕 Ops!</h2>
                <div className="error-message" style={{ color: '#ef4444', fontSize: '1.2rem', marginBottom: '1rem' }}>{error}</div>
                <p style={{ color: '#94a3b8' }}>Verifique se o link está correto.</p>
                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontFamily: 'monospace' }}>
                    Token: {token}
                </div>
            </div>
        );
    }

    if (!track) return null;

    const renderOverview = () => (
        <div className="overview-grid">
            <div className="cover-section">
                <img src={track.metadata.cover_url || 'https://via.placeholder.com/300'} alt="Cover" className="cover-art-large" />
            </div>
            <div className="metadata-grid">
                <div className="meta-item"><span className="meta-label">Título</span><div className="meta-value">{track.title}</div></div>
                <div className="meta-item"><span className="meta-label">Versão</span><div className="meta-value">{track.metadata.subtitle || '-'}</div></div>
                <div className="meta-item"><span className="meta-label">ISRC</span><div className="meta-value">{track.metadata.isrc || '-'}</div></div>
                <div className="meta-item"><span className="meta-label">UPC</span><div className="meta-value">{track.metadata.upc || '-'}</div></div>
                <div className="meta-item"><span className="meta-label">Gênero</span><div className="meta-value">{track.metadata.genre || '-'}</div></div>
                <div className="meta-item"><span className="meta-label">BPM</span><div className="meta-value">{track.metadata.bpm || '-'}</div></div>
            </div>
        </div>
    );

    const renderFiles = () => (
        <div className="files-list">
            {['wav', 'mp3', 'stems'].map(type => (
                <div className="file-item" key={type}>
                    <div className="file-info">
                        <div className="file-icon">{type === 'wav' ? '🎵' : type === 'mp3' ? '🎧' : '🎹'}</div>
                        <div>
                            <div className="file-name">{type.toUpperCase()}</div>
                            <div className="file-meta">{track.metadata.files?.[type] ? 'Disponível' : 'Indisponível'}</div>
                        </div>
                    </div>
                    <div className="file-actions">
                        {track.metadata.files?.[type] && (
                            <Button variant="outline" size="sm" onClick={() => window.open(track.metadata.files[type], '_blank')}>⬇️ Baixar</Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem' }}>
            <div className="track-dashboard-container">
                <div className="td-header">
                    <div className="td-title-section">
                        <h1>{track.title}</h1>
                        <div className="td-subtitle">{track.artists?.name} • {track.metadata.subtitle}</div>
                    </div>
                    <div className="td-actions">
                        <Button variant="primary" disabled>🔒 Modo Visualização</Button>
                    </div>
                </div>

                <div className="td-tabs">
                    <button className={`td-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Visão Geral</button>
                    <button className={`td-tab ${activeTab === 'lyrics' ? 'active' : ''}`} onClick={() => setActiveTab('lyrics')}>Letra</button>
                    <button className={`td-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>Arquivos</button>
                    <button className={`td-tab ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>Documentos</button>
                </div>

                <div className="td-content">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'lyrics' && (
                        <div className="lyrics-container">
                            <textarea className="lyrics-textarea" readOnly value={track.metadata.lyrics || ''} />
                        </div>
                    )}
                    {activeTab === 'files' && renderFiles()}
                    {activeTab === 'docs' && (
                        <div className="files-list">
                            {track.metadata.files?.docs?.map((doc: any, i: number) => (
                                <div className="file-item" key={i}>
                                    <div className="file-info"><div>{doc.name}</div></div>
                                    <Button size="sm" onClick={() => window.open(doc.url, '_blank')}>Visualizar</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
