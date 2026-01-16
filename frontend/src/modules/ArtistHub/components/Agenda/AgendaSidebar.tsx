import React from 'react';
import './AgendaSidebar.css';

interface AgendaSidebarProps {
    filters: {
        types: string[];
        status: string[];
    };
    onFilterChange: (newFilters: any) => void;
}

export const AgendaSidebar: React.FC<AgendaSidebarProps> = ({ filters, onFilterChange }) => {

    const toggleType = (type: string) => {
        const newTypes = filters.types.includes(type)
            ? filters.types.filter(t => t !== type)
            : [...filters.types, type];
        onFilterChange({ ...filters, types: newTypes });
    };

    const toggleStatus = (status: string) => {
        const newStatus = filters.status.includes(status)
            ? filters.status.filter(s => s !== status)
            : [...filters.status, status];
        onFilterChange({ ...filters, status: newStatus });
    };

    return (
        <div className="agenda-sidebar">
            <div className="sidebar-section">
                <h3>Tipos de Evento</h3>
                <div className="filter-list">
                    {[
                        { id: 'release', label: 'Lançamento', color: '#ec4899' },
                        { id: 'show', label: 'Show', color: '#eab308' },
                        { id: 'recording', label: 'Gravação', color: '#ef4444' },
                        { id: 'content', label: 'Conteúdo', color: '#a855f7' },
                        { id: 'meeting', label: 'Reunião', color: '#3b82f6' },
                        { id: 'deadline', label: 'Deadline', color: '#f97316' },
                        { id: 'other', label: 'Outros', color: '#94a3b8' },
                    ].map(type => (
                        <div
                            key={type.id}
                            className={`filter-item ${filters.types.includes(type.id) ? 'active' : ''}`}
                            onClick={() => toggleType(type.id)}
                        >
                            <span className="color-dot" style={{ backgroundColor: type.color }}></span>
                            {type.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="sidebar-section">
                <h3>Status</h3>
                <div className="filter-list">
                    {[
                        { id: 'planned', label: 'Planejado' },
                        { id: 'confirmed', label: 'Confirmado' },
                        { id: 'completed', label: 'Concluído' },
                        { id: 'cancelled', label: 'Cancelado' },
                    ].map(status => (
                        <div
                            key={status.id}
                            className={`filter-item ${filters.status.includes(status.id) ? 'active' : ''}`}
                            onClick={() => toggleStatus(status.id)}
                        >
                            <span className="checkbox-mock">{filters.status.includes(status.id) ? '✓' : ''}</span>
                            {status.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
