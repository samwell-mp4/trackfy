import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Image, Youtube, Music, ChevronRight } from 'lucide-react';

interface SidebarProps {
    activeView: 'create' | 'gallery' | 'highlights';
    onNavigate: (view: 'create' | 'gallery' | 'highlights') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'create', label: 'Criar Vídeo', icon: Video },
        { id: 'gallery', label: 'Galeria', icon: Image },
        { id: 'highlights', label: 'Destaques YouTube', icon: Youtube },
    ];

    return (
        <div className="dashboard-sidebar">
            <div className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-btn ${isActive ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id as any)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                            {isActive && <ChevronRight size={16} className="active-indicator" />}
                        </button>
                    );
                })}

                <div className="sidebar-divider"></div>

                <button
                    className="sidebar-btn artist-hub-btn"
                    onClick={() => navigate('/artist-hub')}
                >
                    <Music size={20} />
                    <span>Ir para Trackfy</span>
                </button>
            </div>
        </div>
    );
};
