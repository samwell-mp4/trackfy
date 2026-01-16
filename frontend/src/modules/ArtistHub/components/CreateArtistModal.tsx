import React, { useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import './CreateArtistModal.css'; // Dedicated styles

interface CreateArtistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'type' | 'personal' | 'artistic' | 'responsible' | 'access';

export const CreateArtistModal: React.FC<CreateArtistModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('type');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        // Type
        artist_type: 'independent', // 'signed' | 'independent'

        // Personal
        full_name: '',
        cpf: '',
        rg: '',
        birth_date: '',
        phone: '',
        email_contact: '',
        address: '',

        // Artistic
        name: '', // Artistic Name
        bio: '',
        share_email: '',
        socials: {
            spotify: '',
            instagram: '',
            youtube: '',
            apple: ''
        },

        // Responsible
        responsible_name: '',
        responsible_phone: '',
        responsible_email: '',
        responsible_company: '',
        responsible_percentage: '',

        // Access
        create_user: false,
        user_email: '',
        user_password: ''
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateSocial = (network: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socials: { ...prev.socials, [network]: value }
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Create Artist
            const artistData = {
                name: formData.name,
                bio: formData.bio,
                full_name: formData.full_name,
                artist_type: formData.artist_type,
                cpf: formData.cpf,
                rg: formData.rg,
                birth_date: formData.birth_date || null,
                phone: formData.phone,
                email_contact: formData.email_contact,
                address: formData.address,
                share_email: formData.share_email,
                social_links: formData.socials,
                responsible_name: formData.responsible_name,
                responsible_phone: formData.responsible_phone,
                responsible_email: formData.responsible_email,
                responsible_company: formData.responsible_company,
                responsible_percentage: formData.responsible_percentage ? parseFloat(formData.responsible_percentage) : null
            };

            const artist = await artistHubService.createArtist(artistData);

            // 2. Create User (Optional)
            if (formData.create_user && artist.id) {
                if (!formData.user_email || !formData.user_password) {
                    throw new Error('Email e senha são obrigatórios para criar usuário.');
                }
                await artistHubService.createArtistUser(artist.id, {
                    email: formData.user_email,
                    password: formData.user_password,
                    name: formData.name
                });
            }

            onSuccess();
            onClose();
            // Reset form
            setStep('type');
            setFormData({ ...formData, name: '', full_name: '', cpf: '' }); // Reset key fields
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao criar artista');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 'type':
                return (
                    <div className="wizard-step">
                        <h3>Tipo de Cadastro</h3>
                        <div className="type-selection">
                            <div
                                className={`type-card ${formData.artist_type === 'signed' ? 'selected' : ''}`}
                                onClick={() => updateField('artist_type', 'signed')}
                            >
                                <div className="icon">🏢</div>
                                <div>
                                    <h4>Produtora</h4>
                                    <p>Artista agenciado.</p>
                                </div>
                            </div>
                            <div
                                className={`type-card ${formData.artist_type === 'independent' ? 'selected' : ''}`}
                                onClick={() => updateField('artist_type', 'independent')}
                            >
                                <div className="icon">🦅</div>
                                <div>
                                    <h4>Avulso</h4>
                                    <p>Artista independente.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'personal':
                return (
                    <div className="wizard-step">
                        <h3>Dados Pessoais</h3>
                        <div className="form-row">
                            <div className="form-group flex-2">
                                <label>Nome Completo (Civil) *</label>
                                <input value={formData.full_name} onChange={e => updateField('full_name', e.target.value)} placeholder="Nome do documento" />
                            </div>
                            <div className="form-group flex-1">
                                <label>Data de Nasc.</label>
                                <input type="date" value={formData.birth_date} onChange={e => updateField('birth_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>CPF *</label>
                                <input value={formData.cpf} onChange={e => updateField('cpf', e.target.value)} placeholder="000.000.000-00" />
                            </div>
                            <div className="form-group">
                                <label>RG</label>
                                <input value={formData.rg} onChange={e => updateField('rg', e.target.value)} placeholder="00.000.000-0" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Telefone / WhatsApp *</label>
                                <input value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="(00) 00000-0000" />
                            </div>
                            <div className="form-group">
                                <label>Email de Contato</label>
                                <input value={formData.email_contact} onChange={e => updateField('email_contact', e.target.value)} placeholder="contato@email.com" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Endereço Completo</label>
                            <input value={formData.address} onChange={e => updateField('address', e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
                        </div>
                    </div>
                );

            case 'artistic':
                return (
                    <div className="wizard-step">
                        <h3>Perfil Artístico</h3>
                        <div className="form-group">
                            <label>Nome Artístico *</label>
                            <input value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Ex: The Artist" />
                        </div>
                        <div className="form-group">
                            <label>Email para Share (Material)</label>
                            <input value={formData.share_email} onChange={e => updateField('share_email', e.target.value)} placeholder="share@artista.com" />
                        </div>
                        <div className="form-group">
                            <label>Biografia</label>
                            <textarea value={formData.bio} onChange={e => updateField('bio', e.target.value)} rows={3} />
                        </div>
                        <h4>Redes Sociais</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Instagram</label>
                                <input value={formData.socials.instagram} onChange={e => updateSocial('instagram', e.target.value)} placeholder="@usuario" />
                            </div>
                            <div className="form-group">
                                <label>Spotify</label>
                                <input value={formData.socials.spotify} onChange={e => updateSocial('spotify', e.target.value)} placeholder="Link do perfil" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>YouTube</label>
                                <input value={formData.socials.youtube} onChange={e => updateSocial('youtube', e.target.value)} placeholder="Link do canal" />
                            </div>
                            <div className="form-group">
                                <label>Apple Music</label>
                                <input value={formData.socials.apple} onChange={e => updateSocial('apple', e.target.value)} placeholder="Link do perfil" />
                            </div>
                        </div>
                    </div>
                );

            case 'responsible':
                return (
                    <div className="wizard-step">
                        <h3>Responsável / Empresário</h3>
                        <p className="step-desc">Preencha se o artista for menor de idade ou tiver empresário.</p>
                        <div className="form-group">
                            <label>Nome do Responsável / Empresa</label>
                            <input value={formData.responsible_company} onChange={e => updateField('responsible_company', e.target.value)} placeholder="Nome da Mãe, Pai ou Empresa" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nome do Contato</label>
                                <input value={formData.responsible_name} onChange={e => updateField('responsible_name', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Telefone</label>
                                <input value={formData.responsible_phone} onChange={e => updateField('responsible_phone', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input value={formData.responsible_email} onChange={e => updateField('responsible_email', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>% Combinada (Se houver)</label>
                                <input type="number" value={formData.responsible_percentage} onChange={e => updateField('responsible_percentage', e.target.value)} placeholder="Ex: 20" />
                            </div>
                        </div>
                    </div>
                );

            case 'access':
                return (
                    <div className="wizard-step">
                        <h3>Acesso ao Sistema</h3>
                        <div className="user-creation-section">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', marginBottom: formData.create_user ? '1.5rem' : '0', fontSize: '1.1rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.create_user}
                                    onChange={(e) => updateField('create_user', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <strong>Criar Login para o Artista</strong>
                            </label>

                            {formData.create_user && (
                                <div className="user-fields">
                                    <div className="form-group">
                                        <label>Email de Login *</label>
                                        <input
                                            type="email"
                                            value={formData.user_email}
                                            onChange={(e) => updateField('user_email', e.target.value)}
                                            placeholder="artista@email.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Senha Provisória *</label>
                                        <input
                                            type="password"
                                            value={formData.user_password}
                                            onChange={(e) => updateField('user_password', e.target.value)}
                                            placeholder="******"
                                        />
                                    </div>
                                    <p className="info-text">O artista poderá alterar a senha após o primeiro acesso.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    // Close on Escape key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const steps: Step[] = ['type', 'personal', 'artistic', 'responsible', 'access'];
    const currentStepIndex = steps.indexOf(step);
    const isLastStep = currentStepIndex === steps.length - 1;

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setStep(steps[currentStepIndex + 1]);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setStep(steps[currentStepIndex - 1]);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} aria-hidden="true">
            <div className="modal-content artist-wizard-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wizard-header">
                    <h2>Novo Cadastro</h2>
                    <button className="close-modal-btn" onClick={onClose} aria-label="Fechar">
                        ✕
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="wizard-body">
                    {renderStepContent()}
                </div>

                <div className="modal-actions wizard-actions">
                    <Button type="button" variant="outline" onClick={currentStepIndex === 0 ? onClose : handleBack} disabled={loading}>
                        {currentStepIndex === 0 ? 'Cancelar' : 'Voltar'}
                    </Button>

                    {isLastStep ? (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            Próximo
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
