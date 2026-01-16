import React from 'react';
import './AgendaCalendar.css';

interface Event {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    type: string;
    status: string;
    priority: string;
}

interface AgendaCalendarProps {
    currentDate: Date;
    events: Event[];
    onEventClick: (event: Event) => void;
}

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ currentDate, events, onEventClick }) => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const renderDays = () => {
        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.start_time.startsWith(dateStr));

            // Sort events by time
            dayEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

            days.push(
                <div key={day} className="calendar-day">
                    <span className={`day-number ${new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() ? 'today' : ''}`}>
                        {day}
                    </span>
                    <div className="day-events">
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                className={`event-pill type-${event.type} status-${event.status || 'planned'} priority-${event.priority || 'medium'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick(event);
                                }}
                                title={`${event.title} (${new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                            >
                                {event.priority === 'critical' && <span className="priority-dot"></span>}
                                {event.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="agenda-calendar">
            <div className="weekdays-header">
                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            <div className="calendar-grid">
                {renderDays()}
            </div>
        </div>
    );
};
