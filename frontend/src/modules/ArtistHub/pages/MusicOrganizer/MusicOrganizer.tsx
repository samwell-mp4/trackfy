import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artistHubService } from '../../../../services/artistHubService';
import './MusicOrganizer.css';

// Steps
import { Step1General } from './steps/Step1General';
import { Step2Artist } from './steps/Step2Artist';
import { Step3Participants } from './steps/Step3Participants';
import { Step4Rights } from './steps/Step4Rights';
import { Step5Upload } from './steps/Step5Upload';
import { Step6Summary } from './steps/Step6Summary';

interface ArtistData {
    id?: string;
    name: string;
    full_name?: string;
    cpf?: string;
    rg?: string;
    email?: string;
    instagram?: string;
    isNew?: boolean;
}

interface Participant {
    name: string;
    role: string;
    observation?: string;
}

interface Right {
    id: string;
    name: string;
    role: string;
    percentage: number;
}

interface FormData {
    title: string;
    subtitle: string;
    genre: string;
    releaseDate: string;
    coverImage: File | null;
    coverPreview: string;
    explicit: boolean;
    mainArtist: ArtistData | null;
    participants: Participant[];
    rights: Right[];
    audioFile: File | null;
    audioUrl: string;
    duration: number;
}

export const MusicOrganizer: React.FC = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'wizard' | 'fast'>('fast');
    const [uploading, setUploading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        // Step 1
        title: '',
        subtitle: '',
        genre: '',
        releaseDate: '',
        coverImage: null,
        coverPreview: '',
        explicit: false,
        // Step 2
        mainArtist: null,
        // Step 3
        participants: [],
        // Step 4
        rights: [],
        // Step 5
        audioFile: null,
        audioUrl: '',
        duration: 0
    });

    // Fast Track State
    const [fastTrackData, setFastTrackData] = useState({
        file: null as File | null,
        title: '',
        participants: [{ name: '', role: 'Artist', id: 1 }]
    });

    const updateData = (newData: any) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!formData.title) return alert('O título é obrigatório.');
                if (!formData.coverImage) return alert('A capa é obrigatória.');
                return true;
            case 2:
                if (!formData.mainArtist) return alert('Selecione ou cadastre o artista principal.');
                // @ts-ignore
                if (formData.mainArtist.isNew && (!formData.mainArtist.name || !formData.mainArtist.full_name || !formData.mainArtist.cpf)) {
                    return alert('Preencha os campos obrigatórios do artista (Nome, Nome Completo, CPF).');
                }
                return true;
            case 5:
                if (!formData.audioFile) return alert('O upload do áudio é obrigatório.');
                return true;
            default:
                return true;
        }
    };

    const handleSave = async () => {
        console.log('handleSave initiated', formData);
        try {
            // 1. Handle Artist (Create if new)
            let artistId = formData.mainArtist?.id;

            // @ts-ignore
            if (formData.mainArtist?.isNew) {
                console.log('Creating new artist...');
                try {
                    const newArtist = await artistHubService.createArtist({
                        name: formData.mainArtist.name,
                        full_name: formData.mainArtist.full_name,
                        cpf: formData.mainArtist.cpf,
                        rg: formData.mainArtist.rg,
                        email: formData.mainArtist.email,
                        instagram: formData.mainArtist.instagram,
                        status: 'active'
                    });
                    console.log('New artist created:', newArtist);
                    artistId = newArtist.id;
                } catch (error) {
                    console.error('Error creating artist:', error);
                    alert('Erro ao cadastrar novo artista. Tente novamente.');
                    return;
                }
            }

            // 2. Upload Audio File if present
            let finalAudioUrl = formData.audioUrl;
            let fileType = 'mp3'; // Default

            if (formData.audioFile) {
                console.log('Uploading audio file...');
                try {
                    // Determine type based on file
                    if (formData.audioFile.type.includes('wav')) {
                        fileType = 'wav';
                    } else if (formData.audioFile.name.endsWith('.wav')) {
                        fileType = 'wav';
                    }

                    const uploadResult: any = await artistHubService.uploadFile(formData.audioFile);
                    console.log('Audio uploaded:', uploadResult);
                    finalAudioUrl = uploadResult.url;
                } catch (uploadError) {
                    console.error('Error uploading audio:', uploadError);
                    alert('Erro ao fazer upload do arquivo de áudio. A música será salva sem o arquivo.');
                    finalAudioUrl = '';
                }
            }

            // 3. Prepare Track Data
            // The database schema uses a 'metadata' JSONB column for extra fields
            const trackData = {
                title: formData.title,
                artist_id: artistId,
                release_date: formData.releaseDate || null,
                status: 'pre_production',
                metadata: {
                    subtitle: formData.subtitle,
                    genre: formData.genre,
                    cover_url: formData.coverPreview || 'https://via.placeholder.com/300',
                    explicit_content: formData.explicit,
                    participants: formData.participants.map((p: any) => ({
                        name: p.name,
                        role: p.role,
                        observation: p.observation
                    })),
                    rights: formData.rights.map((r: any) => ({
                        collaborator_id: r.id,
                        name: r.name,
                        role: r.role,
                        percentage: r.percentage
                    })),
                    audio_file_url: finalAudioUrl,
                    duration: formData.duration,
                    files: {
                        [fileType]: finalAudioUrl // Assign to mp3 or wav
                    }
                }
            };

            console.log('Track Data to send:', trackData);

            // 3. Save Track
            console.log('Sending track data to API...');
            await artistHubService.createTrack(trackData);

            console.log('Track created successfully!');

            // Force a small delay to ensure the UI updates if needed, though alert blocks.
            setTimeout(() => {
                alert('Música organizada com sucesso! 🎵\nEla agora aparecerá na sua lista de músicas.');
                navigate('/artist-hub/tracks');
            }, 100);

        } catch (error) {
            console.error('Error saving track:', error);
            alert('Erro ao salvar música. Verifique o console para mais detalhes.');
        }
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

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1General data={formData} updateData={updateData} />;
            case 2: return <Step2Artist data={formData} updateData={updateData} />;
            case 3: return <Step3Participants data={formData} updateData={updateData} />;
            case 4: return <Step4Rights data={formData} updateData={updateData} />;
            case 5: return <Step5Upload data={formData} updateData={updateData} />;
            case 6: return <Step6Summary data={formData} />;
            default: return null;
        }
    };

    return (
        <div className="music-organizer-container">
            <div className="mo-header">
                <h1>Organizador Musical</h1>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        className={`btn-nav ${mode === 'fast' ? 'active' : ''}`}
                        onClick={() => setMode('fast')}
                        style={{ background: mode === 'fast' ? '#3b82f6' : 'transparent', border: '1px solid #3b82f6' }}
                    >
                        🚀 Fast Track
                    </button>
                    <button
                        className={`btn-nav ${mode === 'wizard' ? 'active' : ''}`}
                        onClick={() => setMode('wizard')}
                        style={{ background: mode === 'wizard' ? '#3b82f6' : 'transparent', border: '1px solid #3b82f6' }}
                    >
                        📝 Completo
                    </button>
                </div>
                {mode === 'wizard' && <p>Passo {currentStep} de 6</p>}
            </div>

            {mode === 'wizard' ? (
                <>
                    <div className="mo-stepper">
                        {[1, 2, 3, 4, 5, 6].map(step => (
                            <div
                                key={step}
                                className={`step-indicator ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
                            >
                                {step < currentStep ? '✓' : step}
                            </div>
                        ))}
                    </div>

                    <div className="mo-content">
                        {renderStep()}

                        <div className="mo-actions">
                            <button
                                className="btn-nav btn-prev"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
                            >
                                Voltar
                            </button>

                            {currentStep < 6 ? (
                                <button className="btn-nav btn-next" onClick={nextStep}>
                                    Próximo
                                </button>
                            ) : (
                                <button className="btn-nav btn-next" onClick={handleSave} style={{ background: '#10b981' }}>
                                    💾 Salvar Música
                                </button>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="mo-content fade-in">
                    <form onSubmit={handleFastTrackSubmit} className="fast-track-form">
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
                                    marginBottom: '1rem',
                                    background: 'rgba(255,255,255,0.05)'
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
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: 'white'
                                    }}
                                />
                            </div>

                            <div className="participants-section" style={{ marginTop: '1.5rem' }}>
                                <label>Integrantes (Opcional)</label>
                                {fastTrackData.participants.map((p) => (
                                    <div key={p.id} className="participant-row" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Nome"
                                            value={p.name}
                                            onChange={e => updateFastParticipant(p.id, 'name', e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: '6px',
                                                background: 'rgba(255,255,255,0.1)',
                                                border: 'none',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addFastParticipant}
                                    style={{
                                        marginTop: '0.5rem',
                                        background: 'transparent',
                                        border: '1px dashed rgba(255,255,255,0.3)',
                                        color: 'rgba(255,255,255,0.7)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Adicionar Integrante
                                </button>
                            </div>

                            <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        padding: '0.75rem 2rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        opacity: uploading ? 0.7 : 1
                                    }}
                                >
                                    {uploading ? 'Enviando...' : '🚀 Subir e Gerar Link'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
