import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import './Register.css';

type RegisterStep = 1 | 2 | 3;
type UserRole = 'producer' | 'artist' | 'manager';

export const Register: React.FC = () => {
    const [step, setStep] = useState<RegisterStep>(1);
    const [role, setRole] = useState<UserRole | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        // Artist specific
        artistic_name: '',
        musical_genre: '',
        // Producer specific
        company_name: '',
        managed_artists_count: '',
        verification_code: ''
    });

    const [error, setError] = useState('');
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleNext = () => {
        setError('');
        if (step === 1 && !role) {
            setError('Por favor, selecione um perfil para continuar.');
            return;
        }
        if (step === 2) {
            // Validação do passo 2
            if (role === 'artist') {
                if (!formData.artistic_name || !formData.musical_genre) {
                    setError('Por favor, preencha todos os campos.');
                    return;
                }
            } else if (role === 'producer') {
                if (!formData.company_name) {
                    setError('Por favor, informe o nome da produtora.');
                    return;
                }
            }
        }
        setStep((prev) => (prev + 1) as RegisterStep);
    };

    const handleBack = () => {
        setStep((prev) => (prev - 1) as RegisterStep);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step === 3) {
            if (!formData.name || !formData.email || !formData.password) {
                setError('Por favor, preencha todos os campos');
                return;
            }

            try {
                await register({
                    ...formData,
                    role: role!,
                    managed_artists_count: formData.managed_artists_count ? parseInt(formData.managed_artists_count) : undefined
                });
                navigate('/artist-hub');
            } catch (err: any) {
                setError(err.message || 'Erro ao criar conta');
            }
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const renderStep1 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="step-container"
        >
            <h2 className="register-title">Como você se identifica?</h2>
            <p className="register-subtitle">Escolha o perfil que melhor se adapta a você.</p>

            <div className="role-selection-grid" style={{ marginTop: '2rem' }}>
                <div
                    className={`role-card ${role === 'artist' ? 'selected' : ''}`}
                    onClick={() => setRole('artist')}
                >
                    <span className="role-icon">🎤</span>
                    <h3 className="role-title">Artista</h3>
                    <p className="role-description">Para quem cria e performa música.</p>
                </div>

                <div
                    className={`role-card ${role === 'producer' ? 'selected' : ''}`}
                    onClick={() => setRole('producer')}
                >
                    <span className="role-icon">🎧</span>
                    <h3 className="role-title">Produtora</h3>
                    <p className="role-description">Para quem gerencia artistas e carreiras.</p>
                </div>
            </div>

            <Button onClick={handleNext} fullWidth disabled={!role} size="lg">
                Continuar
            </Button>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="step-container"
        >
            <h2 className="register-title">Conte mais sobre {role === 'artist' ? 'sua arte' : 'sua produtora'}</h2>
            <p className="register-subtitle">Essas informações nos ajudam a personalizar sua experiência.</p>

            <div className="register-form" style={{ marginTop: '2rem' }}>
                {role === 'artist' ? (
                    <>
                        <Input
                            label="Nome Artístico"
                            placeholder="Como você é conhecido?"
                            value={formData.artistic_name}
                            onChange={(e) => updateFormData('artistic_name', e.target.value)}
                        />
                        <Input
                            label="Gênero Musical Principal"
                            placeholder="Ex: Pop, Funk, Sertanejo..."
                            value={formData.musical_genre}
                            onChange={(e) => updateFormData('musical_genre', e.target.value)}
                        />
                    </>
                ) : (
                    <>
                        <Input
                            label="Nome da Produtora"
                            placeholder="Nome da sua empresa/selo"
                            value={formData.company_name}
                            onChange={(e) => updateFormData('company_name', e.target.value)}
                        />
                        <Input
                            label="Quantos artistas você gerencia?"
                            type="number"
                            placeholder="0"
                            value={formData.managed_artists_count}
                            onChange={(e) => updateFormData('managed_artists_count', e.target.value)}
                        />
                    </>
                )}

                <div className="form-actions">
                    <Button variant="outline" onClick={handleBack} style={{ flex: 1 }}>
                        Voltar
                    </Button>
                    <Button onClick={handleNext} style={{ flex: 1 }}>
                        Continuar
                    </Button>
                </div>
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="step-container"
        >
            <h2 className="register-title">Quase lá!</h2>
            <p className="register-subtitle">Crie suas credenciais de acesso.</p>

            <form onSubmit={handleSubmit} className="register-form" style={{ marginTop: '2rem' }}>
                <Input
                    label="Nome Completo"
                    placeholder="Seu nome real"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                />

                <Input
                    type="email"
                    label="Email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                />

                <Input
                    type="password"
                    label="Senha"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    required
                />

                <div className="form-actions">
                    <Button type="button" variant="outline" onClick={handleBack} style={{ flex: 1 }}>
                        Voltar
                    </Button>
                    <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
                        Criar Conta
                    </Button>
                </div>
            </form>
        </motion.div>
    );


    return (
        <div className="register-page">
            <div className="register-background">
                <div className="register-gradient" />
            </div>

            <motion.div
                className="register-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="register-card">
                    {/* Progress Dots */}
                    <div className="register-progress">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`progress-dot ${step >= s ? 'active' : ''}`}
                            />
                        ))}
                    </div>

                    <div className="register-header">
                        <img src="/logo-light.png" alt="Trackfy" className="login-logo-img" style={{ maxHeight: '50px' }} />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </AnimatePresence>

                    {error && (
                        <motion.div
                            className="register-error"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: '1rem' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="register-footer">
                        <p className="register-link-text">
                            Já tem uma conta? <Link to="/login">Entrar</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
