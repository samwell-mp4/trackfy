import React from 'react';
import { User, LogOut, Settings, Heart, Clock } from 'lucide-react';
import './MobileSidebar.css';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onLogout: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, user, onLogout }) => {
    return (
        <>
            <div className={`mobile-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="user-profile">
                        <div className="avatar-large">
                            {user?.usuario?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <h3>{user?.usuario}</h3>
                            <span>{user?.email || 'Artista'}</span>
                        </div>
                    </div>
                    {/* <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button> */}
                </div>

                <div className="sidebar-menu">
                    <button className="menu-item">
                        <User size={20} />
                        <span>Minha Conta</span>
                    </button>
                    <button className="menu-item">
                        <Heart size={20} />
                        <span>Favoritos</span>
                    </button>
                    <button className="menu-item">
                        <Clock size={20} />
                        <span>Histórico</span>
                    </button>
                    <button className="menu-item">
                        <Settings size={20} />
                        <span>Configurações</span>
                    </button>

                    <div className="menu-divider" />

                    <button className="menu-item logout" onClick={onLogout}>
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </div>
        </>
    );
};
