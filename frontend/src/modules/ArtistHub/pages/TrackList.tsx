import React, { useEffect, useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { useNavigate } from 'react-router-dom';
import { AgendaCalendar } from '../components/Agenda/AgendaCalendar';
import { EventModal } from '../components/Agenda/EventModal';
import './TrackList.css';

interface Track {
    id: string;
    title: string;
    status: string;
    release_date: string;
    artists?: { name: string };
}

interface Event {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    type: string;
    status: string;
    priority: string;
    metadata?: any;
}

export const TrackList: React.FC = () => {
    // Tabs
    const [activeTab, setActiveTab] = useState<'overview' | 'list'>('overview');

    // Tracks State
    const [tracks, setTracks] = useState<Track[]>([]);
    const [artists, setArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Agenda State & Logic
    const [events, setEvents] = useState<Event[]>([]);
    const [currentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArtist, setSelectedArtist] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        loadData();
    }, []);

    // Load Events when needed or on date change
    useEffect(() => {
        loadEvents();
    }, [currentDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tracksData, artistsData] = await Promise.all([
                artistHubService.getTracks(),
                artistHubService.getArtists()
            ]);
            setTracks(tracksData);
            setArtists(artistsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadEvents = async () => {
        try {
            const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
            const data = await artistHubService.getEvents(start, end);
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleNewEvent = () => {
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    // Metrics Calculation
    const metrics = {
        total: tracks.length,
        released: tracks.filter(t => t.status === 'released').length,
        in_progress: tracks.filter(t => ['pre_production', 'production', 'mixing', 'mastering'].includes(t.status)).length
    };

    // Filtering & Sorting
    const filteredTracks = tracks
        .filter(track => {
            const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesArtist = selectedArtist ? track.artists?.name === selectedArtist : true; // Note: track.artists might be object or array, simplified here assuming mapped name or single artist
            // If backend returns artist_id, better to filter by that. But UI shows name. Assuming track.artists.name matches value.
            // Let's assume we filter by artist ID if available or just name for now.
            // Actually, let's verify track structure. Usually it has an ID.
            // For now, let's match loose to ensure it works.
            const matchesStatus = selectedStatus ? track.status === selectedStatus : true;
            return matchesSearch && matchesArtist && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
            if (sortBy === 'oldest') return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime();
            if (sortBy === 'az') return a.title.localeCompare(b.title);
            return 0;
        });

    const handleStatusChange = async (trackId: string, newStatus: string) => {
        // Optimistic Update
        const updatedTracks = tracks.map(t =>
            t.id === trackId ? { ...t, status: newStatus } : t
        );
        setTracks(updatedTracks);

        try {
            await artistHubService.updateTrack(trackId, { status: newStatus });
        } catch (error) {
            console.error('Failed to update status', error);
            loadData(); // Revert on error
        }
    };

    const getProgress = (status: string) => {
        switch (status) {
            case 'idea': return 10;
            case 'pre_production': return 30;
            case 'recording': return 50;
            case 'mixing': return 70;
            case 'mastering': return 90;
            case 'released': return 100;
            default: return 0;
        }
    };

    const handleShare = (track: Track) => {
        const link = `${window.location.origin}/artist-hub/tracks/${track.id}`;
        navigator.clipboard.writeText(link);
        alert(`Link copiado! 🔗`);
    };

    const handleDelete = async (trackId: string) => {
        if (window.confirm('Tem certeza que deseja excluir?')) {
            try {
                await artistHubService.deleteTrack(trackId);
                const updatedTracks = tracks.filter(t => t.id !== trackId);
                setTracks(updatedTracks);
            } catch (error) {
                console.error("Erro ao excluir música:", error);
                alert('Erro ao excluir. Tente novamente.');
            }
        }
    };

    return (
        <div className="track-list-page">
            <div className="page-header">
                <h1>🎵 Músicas & Projetos</h1>
                <Button onClick={() => navigate('/artist-hub/organizer')}>
                    + Nova Música
                </Button>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div className="track-dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Visão Geral
                </button>
                <button
                    className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    📝 Lista de Músicas
                </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="tab-content overview-tab fade-in">
                    {/* Metrics Row */}
                    <div className="tl-metrics-row">
                        <div className="tl-metric-card">
                            <span className="label">Total de Projetos</span>
                            <span className="value">{metrics.total}</span>
                        </div>
                        <div className="tl-metric-card">
                            <span className="label">Lançados</span>
                            <span className="value">{metrics.released}</span>
                        </div>
                        <div className="tl-metric-card">
                            <span className="label">Em Produção</span>
                            <span className="value">{metrics.in_progress}</span>
                        </div>
                    </div>

                    {/* Integrated Agenda */}
                    <div className="integrated-agenda-section">
                        <div className="section-header">
                            <h2>📅 Agenda & Prazos</h2>
                            <div className="agenda-actions">
                                <Button size="sm" onClick={handleNewEvent}>+ Novo Evento</Button>
                            </div>
                        </div>
                        <div className="agenda-wrapper">
                            <AgendaCalendar
                                currentDate={currentDate}
                                events={events}
                                onEventClick={handleEventClick}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: LIST */}
            {activeTab === 'list' && (
                <div className="tab-content list-tab fade-in">
                    {/* Filter Toolbar */}
                    <div className="tl-filter-toolbar">
                        <div className="search-box">
                            <span className="icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar música..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <select
                            value={selectedArtist}
                            onChange={(e) => setSelectedArtist(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Todos os Artistas</option>
                            {artists.map(a => (
                                <option key={a.id} value={a.name}>{a.name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Todos os Status</option>
                            <option value="draft">Rascunho</option>
                            <option value="pre_production">Pré-Produção</option>
                            <option value="production">Produção</option>
                            <option value="mixing">Mixagem</option>
                            <option value="mastering">Masterização</option>
                            <option value="released">Lançado</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="newest">Mais Recentes</option>
                            <option value="oldest">Mais Antigos</option>
                            <option value="az">A-Z</option>
                        </select>
                    </div>

                    {loading && <p>Carregando...</p>}
                    {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

                    {!loading && !error && filteredTracks.length === 0 && (
                        <div className="empty-state">
                            <p>Nenhuma música encontrada com estes filtros.</p>
                        </div>
                    )}

                    <div className="tracks-grid">
                        {filteredTracks.map(track => {
                            const progress = getProgress(track.status);
                            return (
                                <div key={track.id} className="track-card">
                                    <div className="track-card-inner">
                                        <div className="track-info-section">
                                            <h3>{track.title}</h3>
                                            <div className="track-meta-row">
                                                <span className="artist-name">{track.artists?.name || 'Artista Desconhecido'}</span>
                                                <span className="separator">•</span>
                                                <div className="status-selector-wrapper">
                                                    <select
                                                        className={`mini-status-selector status-${track.status}`}
                                                        value={track.status}
                                                        onChange={(e) => handleStatusChange(track.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <option value="idea">💡 Ideia</option>
                                                        <option value="pre_production">🎹 Pré-Produção</option>
                                                        <option value="recording">🎙️ Gravação</option>
                                                        <option value="mixing">🎚️ Mixagem</option>
                                                        <option value="mastering">📀 Masterização</option>
                                                        <option value="released">🚀 Lançado</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="track-actions-section">
                                            <div className="quick-actions-hover">
                                                <button className="icon-btn" onClick={() => handleShare(track)} title="Compartilhar">🔗</button>
                                                <button className="icon-btn delete-btn" onClick={() => handleDelete(track.id)} title="Excluir">🗑️</button>
                                            </div>
                                            <Button variant="outline" onClick={() => navigate(`/artist-hub/tracks/${track.id}`)}>
                                                Abrir Dashboard
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress Line */}
                                    <div className="track-progress-line" style={{ width: `${progress}%` }} title={`${progress}% Concluído`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Event Modal for Agenda */}
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadEvents}
                event={selectedEvent}
            />
        </div>
    );
};
