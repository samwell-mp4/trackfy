import React, { useState, useEffect } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { CreateArtistModal } from './CreateArtistModal';
import { Button } from '@components/common/Button';

interface ParticipantSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (artist: any, role: string, split: number) => void;
}

const ROLES = [
    'Artista Principal',
    'Feat / Participação',
    'Produtor Musical',
    'Beatmaker',
    'Compositor',
    'Instrumentista',
    'Engenheiro de Mixagem',
    'Engenheiro de Masterização',
    'Editora',
    'Outro'
];

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({ isOpen, onClose, onSelect }) => {
    const [view, setView] = useState<'search' | 'role_config'>('search');
    const [artists, setArtists] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Config State
    const [role, setRole] = useState(ROLES[0]);
    const [split, setSplit] = useState<number>(0);

    const loadArtists = async () => {
        setLoading(true);
        try {
            const data = await artistHubService.getArtists();
            setArtists(data);
        } catch (error) {
            console.error('Error loading artists:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setView('search');
            setSelectedArtist(null);
            setSearchQuery('');
            loadArtists();
        }
    }, [isOpen]);

    const filteredArtists = artists.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleArtistSelect = (artist: any) => {
        setSelectedArtist(artist);
        setView('role_config');
    };

    const handleConfirm = () => {
        if (selectedArtist) {
            onSelect(selectedArtist, role, split);
            onClose();
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        loadArtists(); // Reload to include new artist
        // Optional: Auto-select the newly created artist if we can get the ID.
        // For now, user will just see it in the list (or we could fetch sorted by date).
        alert('Artista criado com sucesso! Agora você pode selecioná-lo na lista.');
    };

    if (!isOpen) return null;

    if (showCreateModal) {
        return (
            <CreateArtistModal
                isOpen={true}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                {view === 'search' ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Selecionar Participante</h2>
                            <Button size="sm" onClick={() => setShowCreateModal(true)}>
                                + Novo Cadastro
                            </Button>
                        </div>

                        <input
                            type="text"
                            placeholder="Buscar artista por nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                marginBottom: '20px'
                            }}
                            autoFocus
                        />

                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {loading ? (
                                <p style={{ textAlign: 'center', color: '#94a3b8' }}>Carregando...</p>
                            ) : filteredArtists.length > 0 ? (
                                filteredArtists.map(artist => (
                                    <div
                                        key={artist.id}
                                        onClick={() => handleArtistSelect(artist)}
                                        style={{
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {artist.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{artist.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{artist.artist_type === 'signed' ? 'Gravadora' : 'Independente'}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Nenhum artista encontrado.</p>
                            )}
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Configurar Participação</h2>
                        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                            Participante: <strong>{selectedArtist?.name}</strong>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Função na Faixa</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }}
                            >
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Split de Royalties (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={split}
                                onChange={(e) => setSplit(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <Button variant="ghost" onClick={() => setView('search')}>Voltar</Button>
                            <Button onClick={handleConfirm}>Confirmar & Adicionar</Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
