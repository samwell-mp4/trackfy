import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';


interface VideoContextType {
    isGenerating: boolean;
    generationStatus: 'idle' | 'generating' | 'success' | 'error';
    notification: { type: 'success' | 'error', message: string } | null;
    clearNotification: () => void;
    generateVideo: (
        token: string,
        backendUrl: string,
        payload: {
            user: any;
            metodo: string;
            frase: string | null;
            images: string[];
            autoPhrase: boolean;
            customPhrase: string;
        }
    ) => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const { token } = useAuth();

    const clearNotification = () => {
        setNotification(null);
    };

    // Removed polling and persistence logic as requested

    const generateVideo = async (
        tokenArg: string,
        backendUrl: string,
        payload: {
            user: any;
            metodo: string;
            frase: string | null;
            images: string[];
            autoPhrase: boolean;
            customPhrase: string;
        }
    ) => {
        if (isGenerating) return;

        setIsGenerating(true);
        setGenerationStatus('generating');
        setNotification(null);

        try {
            // 1. Save request to DB
            const saveResponse = await fetch(`${backendUrl}/api/video-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenArg}`
                },
                body: JSON.stringify({
                    metodo: payload.metodo,
                    frase: payload.frase,
                    num_images: payload.images.length
                })
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                throw new Error(errorData.details || 'Erro ao salvar requisição');
            }

            const { request } = await saveResponse.json();

            // 2. Trigger N8N (Fire and forget)
            const n8nPayload: any = {
                request_id: request.id,
                user: payload.user?.id || 'anonymous',
                metodo: payload.metodo,
                images: payload.images.map((img: string) => img.split(',')[1])
            };

            if (!payload.autoPhrase) n8nPayload.frase = payload.customPhrase;

            // Don't await this, just trigger it
            fetch(`${backendUrl}/api/trigger-n8n`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenArg}`
                },
                body: JSON.stringify(n8nPayload),
            }).catch(console.error);

            // 3. Immediate Success
            setGenerationStatus('success');
            setIsGenerating(false);
            setNotification({
                type: 'success',
                message: 'Solicitação enviada! O vídeo aparecerá na galeria em breve.'
            });

            // Reset status after a few seconds
            setTimeout(() => setGenerationStatus('idle'), 5000);

        } catch (error: any) {
            console.error('Error generating video:', error);
            setGenerationStatus('error');
            setIsGenerating(false);
            setNotification({ type: 'error', message: error.message || 'Erro ao enviar solicitação.' });
        }
    };

    // Background polling for new videos
    useEffect(() => {
        if (!token) return;

        let lastVideoCount = 0;
        const checkNewVideos = async () => {
            try {
                // Use VITE_BACKEND_URL if available, otherwise relative path
                const backendUrl = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';
                const response = await fetch(`${backendUrl}/api/gallery`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const currentCount = data.videos?.length || 0;

                    // Only notify if count INCREASED (and it's not the first load)
                    if (lastVideoCount > 0 && currentCount > lastVideoCount) {
                        setNotification({
                            type: 'success',
                            message: 'Novo vídeo chegou na galeria! 🎉'
                        });
                        // Clear notification after 5s
                        setTimeout(() => setNotification(null), 5000);
                    }

                    lastVideoCount = currentCount;
                }
            } catch (err) {
                console.error('Background poll error:', err);
            }
        };

        // Initial check
        checkNewVideos();

        // Poll every 15 seconds
        const interval = setInterval(checkNewVideos, 15000);

        return () => clearInterval(interval);
    }, [token]);

    return (
        <VideoContext.Provider value={{ isGenerating, generationStatus, generateVideo, notification, clearNotification }}>
            {children}
        </VideoContext.Provider>
    );
};

export const useVideo = () => {
    const context = useContext(VideoContext);
    if (context === undefined) {
        throw new Error('useVideo must be used within a VideoProvider');
    }
    return context;
};
