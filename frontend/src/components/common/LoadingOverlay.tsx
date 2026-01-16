import React, { useEffect, useState } from 'react';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
    isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('Inicializando...');

    useEffect(() => {
        if (!isVisible) {
            setProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 99) return 99;

                // Logarithmic-ish progress simulation
                const increment = Math.max(0.5, (100 - prev) / 20);
                return prev + increment;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [isVisible]);

    useEffect(() => {
        if (progress < 10) setMessage('Conectando ao servidor...');
        else if (progress < 30) setMessage('Processando imagens...');
        else if (progress < 50) setMessage('Analisando conteúdo...');
        else if (progress < 70) setMessage('Gerando vídeo com IA...');
        else if (progress < 90) setMessage('Renderizando efeitos...');
        else setMessage('Finalizando...');
    }, [progress]);

    if (!isVisible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="hacker-loader">
                    <div className="glitch-box"></div>
                </div>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="loading-text">
                    <span className="percentage">{Math.floor(progress)}%</span>
                    <span className="message">{message}</span>
                </div>
                <div className="terminal-logs">
                    <div>{'>'} System.init(verbose=true)</div>
                    <div style={{ opacity: progress > 20 ? 1 : 0 }}>{'>'} Loading modules... OK</div>
                    <div style={{ opacity: progress > 40 ? 1 : 0 }}>{'>'} Processing assets... OK</div>
                    <div style={{ opacity: progress > 60 ? 1 : 0 }}>{'>'} Generating frames...</div>
                </div>
            </div>
        </div>
    );
};
