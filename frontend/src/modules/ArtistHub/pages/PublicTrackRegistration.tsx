import React, { useState } from 'react';
import { Button } from '@components/common/Button';
import { artistHubService } from '../../../services/artistHubService';
import './PublicTrackRegistration.css';

export const PublicTrackRegistration: React.FC = () => {
    const [mode, setMode] = useState<'complete' | 'fast'>('fast'); // Default to fast track
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        // Track Info
        title: '',
        genre: '',
        bpm: '',
        observations: '',

        // Responsible Info
        responsibleName: '',
        email: '',
        phone: '',

        // Participants
        participants: [{ name: '', role: 'Artist', id: 1 }]
    });

    // Fast Track State
    const [fastTrackData, setFastTrackData] = useState({
        file: null as File | null,
        title: '',
        participants: [{ name: '', role: 'Artist', id: 1 }]
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const addParticipant = () => {
        setFormData({
            ...formData,
            participants: [...formData.participants, { name: '', role: 'Feat', id: Date.now() }]
        });
    };

    const updateParticipant = (id: number, field: string, value: string) => {
        const updated = formData.participants.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        );
        setFormData({ ...formData, participants: updated });
    };

    // Fast Track Handlers
    const handleFastTrackChange = (field: string, value: any) => {
        setFastTrackData({ ...fastTrackData, [field]: value });
    };

    const addFastParticipant = () => {
        setFastTrackData({
            ...fastTrackData,
            participants: [...fastTrackData.participants, { name: '', role: 'Feat', id: Date.now() }]
        });
    };

    const updateFastParticipant = (id: number, field: string, value: string) => {
        const updated = fastTrackData.participants.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        );
        setFastTrackData({ ...fastTrackData, participants: updated });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFastTrackData({ ...fastTrackData, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would call the API to create the track and user
        // await publicService.registerTrack(formData);

        alert('Música registrada com sucesso! Verifique seu e-mail para acessar o painel.');
        // clear form or redirect
    };

    const handleFastTrackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fastTrackData.file || !fastTrackData.title) {
            alert('Por favor, preencha o título e selecione um arquivo.');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload File
            const uploadResult: any = await artistHubService.uploadFile(fastTrackData.file);

            // Generate a simple random token
            const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // 2. Create Track
            const trackData = {
                title: fastTrackData.title,
                metadata: {
                    audio_file_url: uploadResult.url,
                    files: {
                        mp3: uploadResult.url
                    },
                    participants: fastTrackData.participants,
                    fast_track: true,
                    share_token: shareToken
                }
            };

            await artistHubService.createTrack(trackData);

            // 3. Success Feedback
            const shareUrl = `${window.location.origin}/shared/${shareToken}`;

            // Using a confirm dialog for simplicity in this iteration
            const shouldOpen = window.confirm(`Guia enviada com sucesso!\n\nLink para compartilhar:\n${shareUrl}\n\nDeseja abrir o link agora?`);

            if (shouldOpen) {
                window.open(shareUrl, '_blank');
            }

            // Reset form
            setFastTrackData({
                file: null,
                title: '',
                participants: [{ name: '', role: 'Artist', id: 1 }]
            });

        } catch (error) {
            console.error('Error in fast track upload:', error);
            alert('Erro ao enviar guia. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="public-registration-page">
            <div className="registration-container">
                <div className="reg-header">
                    <h1 style={{ color: 'white' }}>Registro de Nova Música</h1>
                    <p>Escolha como deseja registrar sua obra.</p>

                    <div className="mode-toggle" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                        <Button
                            variant={mode === 'fast' ? 'primary' : 'outline'}
                            onClick={() => setMode('fast')}
                        >
                            🚀 Subir Guia Rápida
                        </Button>
                        <Button
                            variant={mode === 'complete' ? 'primary' : 'outline'}
                            onClick={() => setMode('complete')}
                        >
                            📝 Registro Completo
                        </Button>
                    </div>
                </div>

                {mode === 'complete' ? (
                    <>
                        <div className="progress-steps">
                            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Música</div>
                            <div className="line"></div>
                            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Responsável</div>
                            <div className="line"></div>
                            <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Equipe</div>
                        </div>

                        <form onSubmit={handleSubmit} className="reg-form">
                            {step === 1 && (
                                <div className="form-section fade-in">
                                    <h3>Sobre a Música</h3>
                                    <div className="form-group">
                                        <label>Nome da Música *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => handleInputChange('title', e.target.value)}
                                            placeholder="Ex: Minha Obra Prima"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Gênero</label>
                                            <input
                                                type="text"
                                                value={formData.genre}
                                                onChange={e => handleInputChange('genre', e.target.value)}
                                                placeholder="Ex: Pop, Trap..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>BPM (Opcional)</label>
                                            <input
                                                type="text"
                                                value={formData.bpm}
                                                onChange={e => handleInputChange('bpm', e.target.value)}
                                                placeholder="120"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Observações / Link da Demo</label>
                                        <textarea
                                            value={formData.observations}
                                            onChange={e => handleInputChange('observations', e.target.value)}
                                            placeholder="Cole aqui links do Drive/Dropbox ou observações sobre a faixa..."
                                        />
                                    </div>
                                    <div className="form-actions right">
                                        <Button type="button" onClick={() => setStep(2)}>Próximo →</Button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="form-section fade-in">
                                    <h3>Seus Dados (Responsável)</h3>
                                    <div className="form-group">
                                        <label>Seu Nome Completo *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.responsibleName}
                                            onChange={e => handleInputChange('responsibleName', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>E-mail *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => handleInputChange('email', e.target.value)}
                                            placeholder="Enviaremos o acesso do painel aqui"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>WhatsApp *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={e => handleInputChange('phone', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <Button variant="outline" type="button" onClick={() => setStep(1)}>← Voltar</Button>
                                        <Button type="button" onClick={() => setStep(3)}>Próximo →</Button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="form-section fade-in">
                                    <h3>Participantes & Créditos</h3>
                                    <p className="helper-text">Liste quem participou (Beatmaker, Feats, Compositores).</p>

                                    <div className="participants-list">
                                        {formData.participants.map((p) => (
                                            <div key={p.id} className="participant-row">
                                                <div className="form-group grow">
                                                    <input
                                                        type="text"
                                                        placeholder="Nome do Artista"
                                                        value={p.name}
                                                        onChange={e => updateParticipant(p.id, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <select
                                                        value={p.role}
                                                        onChange={e => updateParticipant(p.id, 'role', e.target.value)}
                                                    >
                                                        <option>Artista Principal</option>
                                                        <option>Feat</option>
                                                        <option>Produtor</option>
                                                        <option>Compositor</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="outline" size="sm" type="button" onClick={addParticipant} style={{ marginBottom: '2rem' }}>
                                        + Adicionar Outro
                                    </Button>

                                    <div className="legal-check">
                                        <label>
                                            <input type="checkbox" required />
                                            Declaro que sou responsável pelas informações e autorizo o início do processo.
                                        </label>
                                    </div>

                                    <div className="form-actions">
                                        <Button variant="outline" type="button" onClick={() => setStep(2)}>← Voltar</Button>
                                        <Button type="submit" variant="primary">🚀 Registrar Música</Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleFastTrackSubmit} className="reg-form fade-in">
                        <div className="form-section">
                            <h3>Subir Guia Rápida</h3>
                            <p className="helper-text">Envie o áudio, coloque o nome e compartilhe o link!</p>

                            <div className="form-group">
                                <label>Arquivo de Áudio (MP3/WAV) *</label>
                                <div className="file-upload-box" style={{
                                    border: '2px dashed rgba(255,255,255,0.2)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    marginBottom: '1rem'
                                }}>
                                    <input
                                        type="file"
                                        accept=".mp3,.wav"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        id="fast-upload"
                                    />
                                    <label htmlFor="fast-upload" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                                        {fastTrackData.file ? (
                                            <span style={{ color: '#4ade80' }}>✅ {fastTrackData.file.name}</span>
                                        ) : (
                                            <span>📂 Clique para selecionar o arquivo</span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Nome da Música *</label>
                                <input
                                    type="text"
                                    required
                                    value={fastTrackData.title}
                                    onChange={e => handleFastTrackChange('title', e.target.value)}
                                    placeholder="Ex: Ideia Inicial V1"
                                />
                            </div>

                            <div className="participants-section" style={{ marginTop: '1.5rem' }}>
                                <label>Integrantes (Opcional)</label>
                                {fastTrackData.participants.map((p) => (
                                    <div key={p.id} className="participant-row" style={{ marginTop: '0.5rem' }}>
                                        <div className="form-group grow">
                                            <input
                                                type="text"
                                                placeholder="Nome"
                                                value={p.name}
                                                onChange={e => updateFastParticipant(p.id, 'name', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" type="button" onClick={addFastParticipant} style={{ marginTop: '0.5rem' }}>
                                    + Adicionar Integrante
                                </Button>
                            </div>

                            <div className="form-actions" style={{ marginTop: '2rem' }}>
                                <Button type="submit" variant="primary" disabled={uploading}>
                                    {uploading ? 'Enviando...' : '🚀 Subir e Gerar Link'}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
