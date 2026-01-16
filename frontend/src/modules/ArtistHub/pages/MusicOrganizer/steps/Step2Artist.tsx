import React, { useState, useEffect } from 'react';
import { Button } from '@components/common/Button';
import { artistHubService } from '../../../../../services/artistHubService';

interface Step2Props {
    data: any;
    updateData: (data: any) => void;
}

export const Step2Artist: React.FC<Step2Props> = ({ data, updateData }) => {
    const [mode, setMode] = useState<'search' | 'new'>(data.mainArtist ? 'search' : 'search');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [allArtists, setAllArtists] = useState<any[]>([]);

    useEffect(() => {
        loadArtists();
    }, []);

    const loadArtists = async () => {
        try {
            const artists = await artistHubService.getArtists();
            setAllArtists(artists || []);
        } catch (error) {
            console.error('Error loading artists:', error);
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term.length > 0) {
            const results = allArtists.filter(a =>
                a.name.toLowerCase().includes(term.toLowerCase()) ||
                (a.full_name && a.full_name.toLowerCase().includes(term.toLowerCase()))
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const selectArtist = (artist: any) => {
        updateData({ mainArtist: artist });
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleNewArtistChange = (field: string, value: string) => {
        const currentArtist = data.mainArtist || {};
        updateData({
            mainArtist: { ...currentArtist, [field]: value, isNew: true }
        });
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Artista Principal</h2>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <Button
                    variant={mode === 'search' ? 'primary' : 'outline'}
                    onClick={() => setMode('search')}
                >
                    🔍 Buscar Existente
                </Button>
                <Button
                    variant={mode === 'new' ? 'primary' : 'outline'}
                    onClick={() => {
                        setMode('new');
                        updateData({ mainArtist: {} }); // Clear selection for new
                    }}
                >
                    ➕ Cadastrar Novo
                </Button>
            </div>

            {mode === 'search' && (
                <div className="search-section">
                    <div className="form-section">
                        <label className="form-label">Buscar Artista</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Digite o nome artístico ou real..."
                            value={searchTerm}
                            onChange={e => handleSearch(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="search-results" style={{
                                background: 'rgba(0,0,0,0.8)',
                                borderRadius: '12px',
                                marginTop: '8px',
                                overflow: 'hidden'
                            }}>
                                {searchResults.map(artist => (
                                    <div
                                        key={artist.id}
                                        onClick={() => selectArtist(artist)}
                                        style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #333' }}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>{artist.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>{artist.full_name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {data.mainArtist && !data.mainArtist.isNew && (
                        <div className="selected-artist-card" style={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid #8b5cf6',
                            padding: '20px',
                            borderRadius: '16px',
                            marginTop: '24px'
                        }}>
                            <h3 style={{ margin: '0 0 12px 0' }}>✅ Artista Selecionado</h3>
                            <div className="detail-row">
                                <span className="detail-label">Nome Artístico:</span>
                                <span className="detail-value">{data.mainArtist.name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Nome Completo:</span>
                                <span className="detail-value">{data.mainArtist.full_name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">CPF:</span>
                                <span className="detail-value">{data.mainArtist.cpf}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {mode === 'new' && (
                <div className="new-artist-form">
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Nome Artístico *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={data.mainArtist?.name || ''}
                                onChange={e => handleNewArtistChange('name', e.target.value)}
                            />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Nome Completo *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={data.mainArtist?.full_name || ''}
                                onChange={e => handleNewArtistChange('full_name', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">CPF *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="000.000.000-00"
                                value={data.mainArtist?.cpf || ''}
                                onChange={e => handleNewArtistChange('cpf', e.target.value)}
                            />
                        </div>
                        <div className="form-col">
                            <label className="form-label">RG</label>
                            <input
                                type="text"
                                className="form-input"
                                value={data.mainArtist?.rg || ''}
                                onChange={e => handleNewArtistChange('rg', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={data.mainArtist?.email || ''}
                                onChange={e => handleNewArtistChange('email', e.target.value)}
                            />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Instagram</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="@usuario"
                                value={data.mainArtist?.instagram || ''}
                                onChange={e => handleNewArtistChange('instagram', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
