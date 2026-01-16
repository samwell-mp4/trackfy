import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    console.log('ProtectedRoute: Checking auth', { isAuthenticated, isLoading });

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-lg)'
            }}>
                Carregando...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
