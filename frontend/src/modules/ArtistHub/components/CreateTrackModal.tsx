import React, { useState, useEffect } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { CreateArtistModal } from './CreateArtistModal';
import './CreateTrackModal.css';

interface CreateTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateTrackModal: React.FC<CreateTrackModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [artistId, setArtistId] = useState('');
    const [artists, setArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadArtists();
            setTitle('');
            setArtistId('');
            setError(null);
        }
    }, [isOpen]);

    const loadArtists = async () => {
        try {
            const data = await artistHubService.getArtists();
            setArtists(data);
            if (data.length > 0) {
                // If we just created an artist (and it's the only one or last one), select it?
                // For now just select the first one or keep selection if valid
                if (!artistId) setArtistId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to load artists', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !artistId) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            setLoading(true);
            await artistHubService.createTrack({
                title,
                artist_id: artistId,
                status: 'pre_production'
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar música');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Nova Música</h2>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Título da Música *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Minha Obra Prima"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Artista Principal *</label>
                            {artists.length > 0 ? (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select
                                        value={artistId}
                                        onChange={(e) => setArtistId(e.target.value)}
                                        style={{ flex: 1 }}
                                    >
                                        {artists.map(artist => (
                                            <option key={artist.id} value={artist.id}>
                                                {artist.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Button type="button" variant="outline" onClick={() => setIsArtistModalOpen(true)} style={{ whiteSpace: 'nowrap' }}>
                                        +
                                    </Button>
                                </div>
                            ) : (
                                <div className="no-artist-warning">
                                    <p>Nenhum artista encontrado.</p>
                                    <Button type="button" variant="outline" onClick={() => setIsArtistModalOpen(true)}>
                                        + Criar Artista
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading || artists.length === 0}>
                                {loading ? 'Criando...' : 'Criar Projeto'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <CreateArtistModal
                isOpen={isArtistModalOpen}
                onClose={() => setIsArtistModalOpen(false)}
                onSuccess={() => {
                    loadArtists();
                    // Optional: could auto-select the new artist here if we returned it
                }}
            />
        </>
    );
};
