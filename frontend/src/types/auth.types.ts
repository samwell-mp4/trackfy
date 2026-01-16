export interface User {
    id: string;
    usuario: string;
    email: string;
    role?: 'producer' | 'artist' | 'manager' | 'admin';
    artistic_name?: string;
    company_name?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'producer' | 'artist' | 'manager';
    artistic_name?: string;
    musical_genre?: string;
    company_name?: string;
    managed_artists_count?: number;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User | void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UserRow {
    Usuario: string;
    Email: string;
    Senha: string;
}
