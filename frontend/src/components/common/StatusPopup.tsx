import React, { useState, useEffect } from 'react';
import './StatusPopup.css';

interface StatusPopupProps {
    isVisible: boolean;
    status?: 'idle' | 'generating' | 'success' | 'error';
}

export const StatusPopup: React.FC<StatusPopupProps & { notification?: { type: 'success' | 'error', message: string } | null, onClose?: () => void }> = ({ isVisible, status = 'generating', notification, onClose }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    // Reset dismissed state when status or notification changes
    useEffect(() => {
        if (isVisible) {
            setIsDismissed(false);
        }
    }, [isVisible, status, notification]);

    if (isDismissed) return null;
    if (!isVisible && status !== 'success' && !notification) return null;
    if (status === 'idle' && !notification) return null;

    const isSuccess = status === 'success' || notification?.type === 'success';
    const isError = status === 'error' || notification?.type === 'error';

    const handleClose = () => {
        setIsDismissed(true);
        if (onClose) onClose();
    };

    return (
        <div className={`status-popup ${isSuccess ? 'success' : ''} ${isError ? 'error' : ''}`}>
            <button className="status-close" onClick={handleClose}>×</button>
            {isSuccess ? (
                <div className="status-icon success">✓</div>
            ) : isError ? (
                <div className="status-icon error">✕</div>
            ) : (
                <div className="status-spinner"></div>
            )}
            <div className="status-content">
                <span className="status-title">
                    {notification ? (isSuccess ? 'Sucesso!' : 'Atenção') : (isSuccess ? 'Vídeo Finalizado!' : 'Gerando Vídeo...')}
                </span>
                <span className="status-desc">
                    {notification ? notification.message : (isSuccess ? 'Veja na galeria.' : 'Isso pode levar alguns minutos.')}
                </span>
                {!isSuccess && !isError && (
                    <span className="status-info">
                        Os vídeos podem demorar até 2 minutos para aparecer na galeria.
                    </span>
                )}
            </div>
        </div>
    );
};
