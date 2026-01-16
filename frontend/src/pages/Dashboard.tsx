import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useMobile } from '@hooks/useMobile';
import { Sidebar } from '@components/dashboard/Sidebar';
import { BottomNav } from '@components/dashboard/BottomNav';
import { MobileSidebar } from '@components/dashboard/MobileSidebar';
import { CreateVideo } from '@components/dashboard/CreateVideo';
import { Gallery } from '@components/dashboard/Gallery';
import { YouTubeHighlights } from '@components/dashboard/YouTubeHighlights';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState<'create' | 'gallery' | 'highlights'>('create');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useMobile();

    return (
        <div className="dashboard">
            {/* Desktop Header */}
            {/* Desktop Header Removed as requested */}

            <div className="dashboard-layout">
                {/* Desktop Sidebar */}
                {!isMobile && <Sidebar activeView={activeView} onNavigate={setActiveView} />}

                <div className="dashboard-content">
                    {/* Active View Content */}
                    <div className="active-view-container">
                        {activeView === 'create' && <CreateVideo />}
                        {activeView === 'gallery' && <Gallery />}
                        {activeView === 'highlights' && <YouTubeHighlights />}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {isMobile && (
                <MobileSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    user={user}
                    onLogout={logout}
                />
            )}

            {/* Mobile Bottom Nav */}
            {isMobile && (
                <BottomNav
                    activeView={activeView}
                    onNavigate={setActiveView}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
            )}
        </div>
    );
};
