import React, { useEffect, useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { CreateArtistModal } from '../components/CreateArtistModal';
import './artists-view.css';

interface Artist {
    id: string;
    name: string;
    full_name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    image_url?: string;
    social_links?: {
        spotify?: string;
        instagram?: string;
        youtube?: string;
    };
}

export const Artists: React.FC = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadArtists();
    }, []);

    const loadArtists = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await artistHubService.getArtists();
            setArtists(data);
        } catch (error: any) {
            console.error('Error loading artists:', error);
            setError(error.message || 'Erro ao carregar artistas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja excluir este artista?')) {
            try {
                await artistHubService.deleteArtist(id);
                setArtists(artists.filter(a => a.id !== id));
            } catch (error) {
                alert('Erro ao excluir artista');
            }
        }
    };

    const handleEdit = (e: React.MouseEvent, _artist: Artist) => {
        e.stopPropagation();
        // Open modal pre-filled (To be implemented fully, for now just open create modal as placeholder or TODO)
        // Ideally we would pass the artist to the modal
        alert('Edição rápida em breve! Por enquanto use o painel do artista.');
    };

    const copyToClipboard = (e: React.MouseEvent, text: string, label: string) => {
        e.stopPropagation();
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert(`${label} copiado!`);
    };

    const filteredArtists = artists.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="artists-page">
            <div className="page-header">
                <div className="header-title-row">
                    <h1 style={{ color: 'white' }}>Gerenciar Artistas</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar por nome, email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Novo Artista
                </Button>
            </div>

            {error && (
                <div style={{ padding: '15px', background: '#ff444433', border: '1px solid #ff4444', borderRadius: '8px', marginBottom: '20px', color: '#ff8888' }}>
                    <strong>Erro:</strong> {error}
                </div>
            )}

            {loading ? (
                <p>Carregando...</p>
            ) : (
                <div className="artists-list-container">
                    {filteredArtists.length === 0 && (
                        <div className="empty-state">
                            <p>Nenhum artista encontrado.</p>
                        </div>
                    )}

                    <div className="artists-list">
                        {filteredArtists.map(artist => (
                            <div
                                key={artist.id}
                                className="artist-list-item"
                                onClick={() => window.location.href = `/artist-hub/artists/${artist.id}/dashboard`}
                            >
                                <div className="artist-col-main">
                                    <div className="artist-avatar-small">
                                        {artist.image_url ? <img src={artist.image_url} alt={artist.name} /> : '👤'}
                                    </div>
                                    <div className="artist-info">
                                        <h3>{artist.name}</h3>
                                        <span className="artist-role-badge">Artista</span>
                                    </div>
                                </div>

                                <div className="artist-col-info">
                                    {artist.email && (
                                        <div className="quick-info" onClick={(e) => copyToClipboard(e, artist.email!, 'Email')}>
                                            <span>📧 {artist.email}</span>
                                        </div>
                                    )}
                                    {artist.phone && (
                                        <div className="quick-info" onClick={(e) => copyToClipboard(e, artist.phone!, 'Telefone')}>
                                            <span>📱 {artist.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="artist-col-actions">
                                    <button className="action-icon-btn" title="Editar" onClick={(e) => handleEdit(e, artist)}>
                                        ✏️
                                    </button>
                                    <button className="action-icon-btn delete" title="Excluir" onClick={(e) => handleDelete(e, artist.id)}>
                                        🗑️
                                    </button>
                                    <div className="arrow-nav">➝</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CreateArtistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadArtists}
            />
        </div>
    );
};
