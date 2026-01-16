import React from 'react';
import { Video, Image, Youtube, Music, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './BottomNav.css';

interface BottomNavProps {
    activeView: 'create' | 'gallery' | 'highlights';
    onNavigate: (view: 'create' | 'gallery' | 'highlights') => void;
    onMenuClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, onMenuClick }) => {
    const navigate = useNavigate();

    return (
        <div className="bottom-nav-container">
            <div className="bottom-nav">
                <button
                    className={`nav-item ${activeView === 'create' ? 'active' : ''}`}
                    onClick={() => onNavigate('create')}
                >
                    <Video size={24} />
                    <span className="nav-dot"></span>
                </button>

                <button
                    className={`nav-item ${activeView === 'gallery' ? 'active' : ''}`}
                    onClick={() => onNavigate('gallery')}
                >
                    <Image size={24} />
                    <span className="nav-dot"></span>
                </button>

                <button
                    className={`nav-item ${activeView === 'highlights' ? 'active' : ''}`}
                    onClick={() => onNavigate('highlights')}
                >
                    <Youtube size={24} />
                    <span className="nav-dot"></span>
                </button>

                <button
                    className="nav-item"
                    onClick={() => navigate('/artist-hub')}
                >
                    <Music size={24} />
                </button>

                <button
                    className="nav-item"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>
            </div>
        </div>
    );
};
