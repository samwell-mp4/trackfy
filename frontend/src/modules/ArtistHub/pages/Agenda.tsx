import React, { useState, useEffect } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { EventModal } from '../components/Agenda/EventModal';
import { AgendaCalendar } from '../components/Agenda/AgendaCalendar';
import { AgendaSidebar } from '../components/Agenda/AgendaSidebar';
import './agenda-view.css'; // Renamed to force git update

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

export const Agenda: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'month' | 'list'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

    const [filters, setFilters] = useState({
        types: ['release', 'show', 'recording', 'content', 'meeting', 'deadline', 'other'],
        status: ['planned', 'confirmed', 'completed']
    });

    useEffect(() => {
        loadEvents();
    }, [currentDate]);

    useEffect(() => {
        filterEvents();
    }, [events, filters]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

            const data = await artistHubService.getEvents(start, end);
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterEvents = () => {
        const filtered = events.filter(event => {
            const typeMatch = filters.types.includes(event.type);
            const statusMatch = filters.status.includes(event.status || 'planned');
            return typeMatch && statusMatch;
        });
        setFilteredEvents(filtered);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleNewEvent = () => {
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="agenda-page">
            <div className="agenda-container">
                <AgendaSidebar
                    filters={filters}
                    onFilterChange={setFilters}
                />

                <div className="agenda-main">
                    <div className="page-header">
                        <div className="header-left">
                            <h1 style={{ color: 'white' }}>Agenda</h1>
                            <div className="date-controls">
                                <button onClick={prevMonth}>&lt;</button>
                                <span>{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                                <button onClick={nextMonth}>&gt;</button>
                            </div>
                        </div>
                        <div className="header-actions">
                            <Button variant={view === 'month' ? 'primary' : 'outline'} onClick={() => setView('month')}>Mês</Button>
                            <Button onClick={() => document.querySelector('.agenda-sidebar')?.classList.toggle('show-mobile')}>
                                🌪️ Filtros
                            </Button>
                            <Button onClick={handleNewEvent}>+ Novo Evento</Button>
                        </div>
                    </div>

                    {/* Mobile Filters Drawer Style */}
                    <style>{`
                        @media (max-width: 768px) {
                            .agenda-sidebar.show-mobile {
                                display: block !important;
                                position: fixed;
                                top: 0; left: 0; bottom: 0;
                                width: 80%;
                                z-index: 1000;
                                background: #1e293b; 
                                padding: 20px;
                                box-shadow: 10px 0 30px rgba(0,0,0,0.5);
                            }
                            /* Overlay when menu is open */
                            .agenda-sidebar.show-mobile::before {
                                content: '';
                                position: fixed;
                                top: 0; left: 0; right: 0; bottom: 0;
                                background: rgba(0,0,0,0.5);
                                z-index: -1;
                            }
                        }
                    `}</style>

                    {loading ? (
                        <div className="loading-state">Carregando agenda...</div>
                    ) : (
                        <AgendaCalendar
                            currentDate={currentDate}
                            events={filteredEvents}
                            onEventClick={handleEventClick}
                        />
                    )}
                </div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadEvents}
                event={selectedEvent}
            />
        </div>
    );
};
