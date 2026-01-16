import React, { useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import './CreateTrackModal.css'; // Reusing modal styles

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('other');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startTime || !endTime) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            setLoading(true);
            await artistHubService.createEvent({
                title,
                type,
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString()
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar evento');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Novo Evento</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Título do Evento *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Lançamento do Single"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Tipo de Evento</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="other">Outro</option>
                            <option value="release">Lançamento</option>
                            <option value="show">Show</option>
                            <option value="meeting">Reunião</option>
                            <option value="recording">Gravação</option>
                            <option value="deadline">Deadline</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Início *</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Fim *</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Agendar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
