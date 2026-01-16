import React, { useState, useEffect } from 'react';
import { Button } from '@components/common/Button';
import { artistHubService } from '../../../services/artistHubService';
import './TrackMetadataForm.css';

interface TrackMetadataFormProps {
    track: any;
    onSave: () => void;
    onCancel: () => void;
}

export const TrackMetadataForm: React.FC<TrackMetadataFormProps> = ({ track, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        producers: '',
        genre: '',
        key: '',
        bpm: '',
        vibe: '',
        references: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (track && track.metadata) {
            setFormData({
                producers: track.metadata.producers || '',
                genre: track.metadata.genre || '',
                key: track.metadata.key || '',
                bpm: track.metadata.bpm || '',
                vibe: track.metadata.vibe || '',
                references: track.metadata.references || ''
            });
        }
    }, [track]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await artistHubService.updateTrack(track.id, {
                metadata: {
                    ...track.metadata, // Preserve existing metadata if any
                    ...formData
                }
            });
            onSave();
        } catch (error) {
            console.error('Error updating track metadata:', error);
            alert('Erro ao salvar dados da música.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="track-metadata-form">
            <h3>Guia da Música: {track.title}</h3>
            <p className="form-description">
                Preencha os dados básicos para guiar o processo de produção e lançamento.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Produtores / Colaboradores</label>
                    <input
                        type="text"
                        name="producers"
                        value={formData.producers}
                        onChange={handleChange}
                        placeholder="Ex: Eu, Produtor X..."
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Gênero</label>
                        <input
                            type="text"
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            placeholder="Ex: Pop, Trap..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Tom (Key)</label>
                        <input
                            type="text"
                            name="key"
                            value={formData.key}
                            onChange={handleChange}
                            placeholder="Ex: Cm, F#..."
                        />
                    </div>
                    <div className="form-group">
                        <label>BPM</label>
                        <input
                            type="number"
                            name="bpm"
                            value={formData.bpm}
                            onChange={handleChange}
                            placeholder="Ex: 120"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Vibe / Mood</label>
                    <input
                        type="text"
                        name="vibe"
                        value={formData.vibe}
                        onChange={handleChange}
                        placeholder="Ex: Triste, Energética, Noturna..."
                    />
                </div>

                <div className="form-group">
                    <label>Referências</label>
                    <textarea
                        name="references"
                        value={formData.references}
                        onChange={handleChange}
                        placeholder="Links ou nomes de músicas de referência..."
                        rows={3}
                    />
                </div>

                <div className="form-actions">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Dados'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
