import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import {
    Home,
    Mic2,
    Calendar,
    CheckSquare,
    Music,
    PlusCircle,
    Folder,
    DollarSign,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import './ArtistHubLayout.css';

export const ArtistHubLayout: React.FC = () => {
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="artist-hub-layout">
            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <span className="mobile-brand">Trackfy</span>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu}></div>}

            <aside className={`hub-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>

                <div className="hub-brand">
                    <div className="brand-icon">🎸</div>
                    <div className="brand-text">
                        <span className="brand-title">Trackfy</span>
                        <span className="brand-subtitle">Workspace</span>
                    </div>
                </div>

                <nav className="hub-nav">
                    <div className="nav-section">
                        <span className="nav-label">Menu Principal</span>
                        <NavLink
                            to="/artist-hub"
                            end
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            <Home size={20} />
                            <span>Home</span>
                        </NavLink>
                        <NavLink
                            to="/artist-hub/artists"
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            <Mic2 size={20} />
                            <span>Artistas</span>
                        </NavLink>
                        <NavLink
                            to="/artist-hub/agenda"
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            <Calendar size={20} />
                            <span>Agenda</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <span className="nav-label">Gestão</span>
                        <NavLink
                            to="/artist-hub/checklists"
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            <CheckSquare size={20} />
                            <span>Checklists</span>
                        </NavLink>
                        <NavLink
                            to="/artist-hub/tracks"
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            <Music size={20} />
                            <span>Músicas</span>
                        </NavLink>
                        <NavLink
                            to="/artist-hub/organizer"
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            <PlusCircle size={20} />
                            <span>Novo Lançamento</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <span className="nav-label">Arquivos</span>
                        <NavLink
                            to="/artist-hub/files"
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            <Folder size={20} />
                            <span>Arquivos</span>
                        </NavLink>
                        <NavLink
                            to="/artist-hub/financial"
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            <DollarSign size={20} />
                            <span>Financeiro</span>
                        </NavLink>
                    </div>
                </nav>

                <div className="hub-footer">
                    <button onClick={logout} className="logout-btn-sidebar">
                        <LogOut size={18} />
                        <span>Sair da Conta</span>
                    </button>
                </div>
            </aside>
            <main className="hub-content">
                <Outlet />
            </main>
        </div>
    );
};
