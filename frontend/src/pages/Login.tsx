import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import './Login.css';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        try {
            await login(email, password);
            navigate('/artist-hub');
        } catch (err: any) {
            setError(err.message || 'Email ou senha inválidos');
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="login-gradient" />
            </div>

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-card">
                    <div className="login-header">
                        <img src="/logo-light.png" alt="Trackfy" className="login-logo-img" />
                        <p className="login-subtitle">Gestão Inteligente para sua Música</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />

                        <Input
                            type="password"
                            label="Senha"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />

                        {error && (
                            <motion.div
                                className="login-error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button type="submit" fullWidth isLoading={isLoading} size="lg">
                            Entrar
                        </Button>
                    </form>

                    <div className="login-footer">
                        <p className="login-link-text">
                            Não tem uma conta? <Link to="/register">Registrar-se</Link>
                        </p>
                        <p className="login-footer-text">
                            Powered by Samwell Midia
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
