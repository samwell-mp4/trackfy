import type { ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';
import type { AuthContextType, User, RegisterData } from '@/types/auth.types';

const BACKEND_URL = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            console.log('AuthContext: Checking localStorage');
            const savedUser = localStorage.getItem('videosia_user');
            const savedToken = localStorage.getItem('videosia_token');

            if (savedUser && savedToken) {
                try {
                    // Validate token with backend
                    const response = await fetch(`${BACKEND_URL}/me`, {
                        headers: {
                            'Authorization': `Bearer ${savedToken}`
                        }
                    });

                    if (response.ok) {
                        console.log('AuthContext: Token valid');
                        setUser(JSON.parse(savedUser));
                    } else {
                        console.warn('AuthContext: Token invalid or expired');
                        localStorage.removeItem('videosia_user');
                        localStorage.removeItem('videosia_token');
                    }
                } catch (e) {
                    console.error('Auth check failed', e);
                    // On network error, maybe keep user logged in or not? 
                    // Safer to keep logged in if it's just network, but if 403 it will be caught above.
                    // If fetch fails (network), we might want to assume offline and keep user.
                    // But for now, let's trust the stored user if network fails, 
                    // but if response is 401/403 (handled above), we logout.
                    setUser(JSON.parse(savedUser));
                }
            } else {
                console.log('AuthContext: No user/token found');
            }
            setIsLoading(false);
        };

        checkAuth();

        const handleUnauthorized = () => {
            console.warn('AuthContext: Received unauthorized event, logging out...');
            logout();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };

    }, []);

    const login = async (email: string, password: string): Promise<User | void> => {
        setIsLoading(true);
        try {
            // Call backend API for login
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Email ou senha inválidos');
            }

            const { token, user: userData } = await response.json();

            const userToSave: User = {
                id: userData.id.toString(),
                usuario: userData.usuario,
                email: userData.email
            };

            // Save to state and localStorage
            setUser(userToSave);
            localStorage.setItem('videosia_user', JSON.stringify(userToSave));
            localStorage.setItem('videosia_token', token);
            return userToSave;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usuario: data.name,
                    email: data.email,
                    password: data.password,
                    role: data.role,
                    artistic_name: data.artistic_name,
                    musical_genre: data.musical_genre,
                    company_name: data.company_name,
                    managed_artists_count: data.managed_artists_count
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Erro ao criar conta';
                try {
                    const error = await response.json();
                    errorMessage = error.error || errorMessage;
                } catch (e) {
                    // Fallback to text if JSON parse fails
                    const text = await response.text();
                    errorMessage = text || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const { token, user: userData } = await response.json();

            const userToSave: User = {
                id: userData.id.toString(),
                usuario: userData.usuario,
                email: userData.email,
                role: userData.role
            };

            // Save to state and localStorage
            setUser(userToSave);
            localStorage.setItem('videosia_user', JSON.stringify(userToSave));
            localStorage.setItem('videosia_token', token);
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('videosia_user');
        localStorage.removeItem('videosia_token');
    };

    const value: AuthContextType = {
        user,
        token: localStorage.getItem('videosia_token'),
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
