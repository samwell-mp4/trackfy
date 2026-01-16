import React, { useState, useEffect } from 'react';
import { artistHubService } from '../../../../services/artistHubService';
import { Button } from '@components/common/Button';
import './EventModal.css';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    event?: any; // If provided, we are in edit mode
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSuccess, event }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('other');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [status, setStatus] = useState('planned');
    const [priority, setPriority] = useState('medium');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    // Dynamic Metadata Fields
    const [metadata, setMetadata] = useState<any>({});
    const [tracks, setTracks] = useState<any[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<string>('');

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            const data = await artistHubService.getTracks();
            setTracks(data);
        } catch (error) {
            console.error('Error loading tracks:', error);
        }
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setType(event.type);
            setStartTime(new Date(event.start_time).toISOString().slice(0, 16));
            setEndTime(new Date(event.end_time).toISOString().slice(0, 16));
            setStatus(event.status || 'planned');
            setPriority(event.priority || 'medium');
            setDescription(event.description || '');
            setLocation(event.location || '');
            setMetadata(event.metadata || {});
            setSelectedTrackId(event.track_id || '');
        } else {
            // Reset for new event
            setTitle('');
            setType('other');
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setStartTime(now.toISOString().slice(0, 16));
            const end = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
            setEndTime(end.toISOString().slice(0, 16));
            setStatus('planned');
            setPriority('medium');
            setDescription('');
            setLocation('');
            setMetadata({});
            setSelectedTrackId('');
        }
    }, [event, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startTime || !endTime) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            setLoading(true);
            const eventData = {
                title,
                type,
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString(),
                status,
                priority,
                description,
                location,
                metadata,
                track_id: selectedTrackId || null
            };

            if (event) {
                await artistHubService.updateEvent(event.id, eventData);
            } else {
                await artistHubService.createEvent(eventData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar evento');
        } finally {
            setLoading(false);
        }
    };

    const renderMetadataFields = () => {
        switch (type) {
            case 'release':
                return (
                    <div className="metadata-section">
                        <h4>Detalhes do Lançamento</h4>
                        <div className="form-group">
                            <label>Música Relacionada</label>
                            <select
                                value={selectedTrackId}
                                onChange={(e) => {
                                    setSelectedTrackId(e.target.value);
                                    // Auto-fill title if empty
                                    if (!title && e.target.value) {
                                        const track = tracks.find(t => t.id === e.target.value);
                                        if (track) setTitle(`Lançamento: ${track.title}`);
                                    }
                                }}
                            >
                                <option value="">Selecione uma música...</option>
                                {tracks.map(track => (
                                    <option key={track.id} value={track.id}>
                                        {track.title} {track.version ? `(${track.version})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tipo de Lançamento</label>
                            <select
                                value={metadata.releaseType || 'single'}
                                onChange={(e) => setMetadata({ ...metadata, releaseType: e.target.value })}
                            >
                                <option value="single">Single</option>
                                <option value="ep">EP</option>
                                <option value="album">Álbum</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Link do Pré-save</label>
                            <input
                                type="text"
                                value={metadata.preSaveLink || ''}
                                onChange={(e) => setMetadata({ ...metadata, preSaveLink: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                );
            case 'show':
                return (
                    <div className="metadata-section">
                        <h4>Detalhes do Show</h4>
                        <div className="form-group">
                            <label>Casa de Show / Evento</label>
                            <input
                                type="text"
                                value={metadata.venue || ''}
                                onChange={(e) => setMetadata({ ...metadata, venue: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Passagem de Som</label>
                            <input
                                type="time"
                                value={metadata.soundCheck || ''}
                                onChange={(e) => setMetadata({ ...metadata, soundCheck: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 'content':
                return (
                    <div className="metadata-section">
                        <h4>Produção de Conteúdo</h4>
                        <div className="form-group">
                            <label>Plataforma</label>
                            <select
                                value={metadata.platform || 'instagram'}
                                onChange={(e) => setMetadata({ ...metadata, platform: e.target.value })}
                            >
                                <option value="instagram">Instagram</option>
                                <option value="tiktok">TikTok</option>
                                <option value="youtube">YouTube</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Formato</label>
                            <select
                                value={metadata.format || 'reel'}
                                onChange={(e) => setMetadata({ ...metadata, format: e.target.value })}
                            >
                                <option value="reel">Reel</option>
                                <option value="story">Story</option>
                                <option value="post">Feed Post</option>
                                <option value="video">Vídeo Longo</option>
                            </select>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} aria-hidden="true">
            <div className="modal-content event-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{event ? 'Editar Evento' : 'Novo Evento'}</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Fechar">✕</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group flex-2">
                                <label>Título *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Título do evento"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Tipo</label>
                                <select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="other">Outro</option>
                                    <option value="release">Lançamento</option>
                                    <option value="show">Show</option>
                                    <option value="meeting">Reunião</option>
                                    <option value="recording">Gravação</option>
                                    <option value="content">Conteúdo</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="rehearsal">Ensaio</option>
                                    <option value="travel">Viagem</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Início *</label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Fim *</label>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="planned">Planejado</option>
                                    <option value="confirmed">Confirmado</option>
                                    <option value="completed">Concluído</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Prioridade</label>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                    <option value="critical">Crítica</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Local</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Local físico ou link da reunião"
                            />
                        </div>

                        <div className="form-group">
                            <label>Descrição</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {renderMetadataFields()}
                    </form>
                </div>

                <div className="modal-actions">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Salvar' : (event ? 'Atualizar' : 'Agendar')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
