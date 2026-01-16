import React, { useState, useEffect } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { CHECKLIST_TEMPLATES, type ChecklistTemplate } from '../constants/checklistTemplates';
import { useNavigate } from 'react-router-dom';
import { TrackMetadataForm } from '../components/TrackMetadataForm';
import './checklists-view.css';

interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    checklist_id: string;
    description?: string;
}

interface Checklist {
    id: string;
    title: string;
    type: string;
    tasks?: Task[];
    created_at: string;
    related_entity_type?: string;
    related_entity_id?: string;
}

export const Checklists: React.FC = () => {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my_lists' | 'templates' | 'by_song'>('my_lists');
    const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
    const [tracks, setTracks] = useState<any[]>([]);
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
    const [selectedTrackId, setSelectedTrackId] = useState<string>('');
    const [selectedTrackForTab, setSelectedTrackForTab] = useState<any | null>(null);
    const [showMetadataForm, setShowMetadataForm] = useState(false);

    // Accordion State
    const [expandedChecklistIds, setExpandedChecklistIds] = useState<Set<string>>(new Set());

    const navigate = useNavigate();

    useEffect(() => {
        loadChecklists();
        loadTracks();
    }, []);

    const loadChecklists = async () => {
        setLoading(true);
        try {
            const data = await artistHubService.getChecklists();
            setChecklists(data);
        } catch (error) {
            console.error('Error loading checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTracks = async () => {
        try {
            const data = await artistHubService.getTracks();
            setTracks(data);
        } catch (error) {
            console.error('Error loading tracks:', error);
        }
    };

    const handleUseTemplate = (template: ChecklistTemplate) => {
        setSelectedTemplate(template);
        if (activeTab === 'by_song' && selectedTrackForTab) {
            setSelectedTrackId(selectedTrackForTab.id);
        } else {
            setSelectedTrackId('');
        }
        setIsTrackModalOpen(true);
    };

    const confirmCreateChecklist = async () => {
        if (!selectedTemplate) return;
        if (!selectedTrackId) {
            alert('Por favor, selecione uma música para associar a este checklist.');
            return;
        }

        try {
            setLoading(true);
            setIsTrackModalOpen(false);

            const newChecklist = await artistHubService.createChecklist({
                title: `${selectedTemplate.title} - ${tracks.find(t => t.id === selectedTrackId)?.title || 'Música'}`,
                type: 'instance',
                related_entity_type: 'track',
                related_entity_id: selectedTrackId
            });

            for (const item of selectedTemplate.items) {
                await artistHubService.createTask({
                    checklist_id: newChecklist.id,
                    title: item.title,
                    status: 'todo',
                    description: item.category
                });
            }

            alert('Checklist criado com sucesso!');

            if (activeTab === 'by_song' && selectedTrackForTab?.id === selectedTrackId) {
                loadChecklists();
            } else {
                setActiveTab('my_lists');
                loadChecklists();
            }

        } catch (error) {
            console.error('Error creating checklist:', error);
            alert('Erro ao criar checklist. Verifique se você já criou a música primeiro.');
        } finally {
            setLoading(false);
            setSelectedTemplate(null);
        }
    };

    const deleteChecklist = async (id: string) => {
        // alert(`Tentando excluir checklist: ${id}`);
        if (!confirm('Tem certeza que deseja excluir esta lista?')) return;
        try {
            await artistHubService.deleteChecklist(id);
            loadChecklists();
            if (selectedChecklist?.id === id) setSelectedChecklist(null);
        } catch (error) {
            console.error('Error deleting checklist:', error);
            alert('Erro ao excluir checklist. Verifique o console.');
        }
    };

    const toggleChecklistExpansion = (id: string) => {
        const newSet = new Set(expandedChecklistIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedChecklistIds(newSet);
    };

    const toggleTaskStatus = async (task: Task) => {
        // Cycle: todo -> in_progress -> done -> todo
        let newStatus: 'todo' | 'in_progress' | 'done' = 'todo';
        if (task.status === 'todo') newStatus = 'in_progress';
        else if (task.status === 'in_progress') newStatus = 'done';
        else if (task.status === 'done') newStatus = 'todo';

        try {
            if (selectedChecklist && selectedChecklist.tasks) {
                const updatedTasks = selectedChecklist.tasks.map(t =>
                    t.id === task.id ? { ...t, status: newStatus } : t
                ) as Task[];
                setSelectedChecklist({ ...selectedChecklist, tasks: updatedTasks });
            }

            await artistHubService.updateTask(task.id, { status: newStatus });
            loadChecklists();
        } catch (error) {
            console.error('Error updating task:', error);
            loadChecklists();
        }
    };

    const getFilteredChecklists = () => {
        if (activeTab === 'by_song' && selectedTrackForTab) {
            return checklists.filter(c =>
                c.related_entity_type === 'track' &&
                c.related_entity_id === selectedTrackForTab.id
            );
        }
        return checklists;
    };

    const renderProgressBar = (tasks: Task[] = []) => {
        if (!tasks.length) return null;

        const total = tasks.length;
        const done = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const todo = tasks.filter(t => t.status === 'todo').length;

        const donePercent = (done / total) * 100;
        const inProgressPercent = (inProgress / total) * 100;

        return (
            <div className="progress-container">
                <div className="progress-stats">
                    <span>{todo} Pendente{todo !== 1 ? 's' : ''}</span>
                    <span className="dot">•</span>
                    <span className="stat-progress">{inProgress} Iniciando</span>
                    <span className="dot">•</span>
                    <span className="stat-done">{done} Concluída{done !== 1 ? 's' : ''}</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill done"
                        style={{ width: `${donePercent}%` }}
                    ></div>
                    <div
                        className="progress-fill in-progress"
                        style={{ width: `${inProgressPercent}%`, left: `${donePercent}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="checklists-page">
            <div className="page-header">
                <h1 style={{ color: 'white' }}>Checklists & Processos</h1>
                <div className="header-actions">
                    <Button
                        variant={activeTab === 'my_lists' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('my_lists')}
                    >
                        Minhas Listas
                    </Button>
                    <Button
                        variant={activeTab === 'by_song' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('by_song')}
                    >
                        Por Música
                    </Button>
                    <Button
                        variant={activeTab === 'templates' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('templates')}
                    >
                        Modelos Prontos
                    </Button>
                </div>
            </div>

            <div className="checklists-content">
                {activeTab === 'templates' ? (
                    <div className="templates-grid">
                        {CHECKLIST_TEMPLATES.map(template => (
                            <div key={template.id} className="template-card">
                                <h3>{template.title}</h3>
                                <p>{template.description}</p>
                                <div className="template-meta">
                                    <span>{template.items.length} tarefas</span>
                                </div>
                                <Button onClick={() => handleUseTemplate(template)} fullWidth>
                                    Usar Modelo
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'by_song' ? (
                    <div className="by-song-container">
                        <div className="lists-sidebar">
                            <h3>Selecione a Música</h3>
                            {tracks.length === 0 && <p className="empty-msg">Nenhuma música encontrada.</p>}
                            {tracks.map(track => (
                                <div
                                    key={track.id}
                                    className={`list-item ${selectedTrackForTab?.id === track.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedTrackForTab(track);
                                        setSelectedChecklist(null);
                                        setShowMetadataForm(false);
                                    }}
                                >
                                    <div className="list-info">
                                        <h4>{track.title}</h4>
                                        <span>{track.artists?.name || 'Artista Desconhecido'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="list-detail">
                            {selectedTrackForTab ? (
                                <>
                                    <div className="detail-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2>{selectedTrackForTab.title}</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowMetadataForm(!showMetadataForm)}
                                        >
                                            {showMetadataForm ? 'Ocultar Guia' : '📝 Guia da Música'}
                                        </Button>
                                    </div>

                                    {showMetadataForm && (
                                        <TrackMetadataForm
                                            track={selectedTrackForTab}
                                            onSave={() => {
                                                loadTracks();
                                            }}
                                            onCancel={() => setShowMetadataForm(false)}
                                        />
                                    )}

                                    <div className="track-checklists">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h3>Checklists da Música</h3>
                                            <Button onClick={() => setActiveTab('templates')} size="sm">
                                                + Novo Checklist
                                            </Button>
                                        </div>

                                        {getFilteredChecklists().length === 0 ? (
                                            <p className="empty-msg">Nenhum checklist criado para esta música.</p>
                                        ) : (
                                            <div className="checklists-grid">
                                                {getFilteredChecklists().map(list => {
                                                    const isExpanded = expandedChecklistIds.has(list.id);
                                                    return (
                                                        <div key={list.id} className={`checklist-card ${isExpanded ? 'expanded' : ''}`}>
                                                            <div
                                                                className="checklist-header"
                                                                onClick={() => toggleChecklistExpansion(list.id)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>▶</span>
                                                                        <h4>{list.title}</h4>
                                                                    </div>
                                                                    <button
                                                                        className="delete-btn"
                                                                        onClick={(e) => { e.stopPropagation(); deleteChecklist(list.id); }}
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>

                                                                {renderProgressBar(list.tasks)}
                                                            </div>

                                                            {isExpanded && (
                                                                <div className="tasks-preview">
                                                                    {list.tasks?.sort((a, b) => a.id.localeCompare(b.id)).map(task => (
                                                                        <div
                                                                            key={task.id}
                                                                            className={`task-item ${task.status}`}
                                                                            onClick={() => {
                                                                                setSelectedChecklist(list);
                                                                                toggleTaskStatus(task);
                                                                            }}
                                                                        >
                                                                            <div className={`status-indicator ${task.status}`}></div>
                                                                            <span className="task-title">
                                                                                {task.title}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="no-selection">
                                    <p>Selecione uma música para ver seus checklists e guia.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="my-lists-container">
                        <div className="lists-sidebar">
                            {checklists.length === 0 && !loading && <p className="empty-msg">Nenhuma lista criada.</p>}
                            {checklists.map(list => (
                                <div
                                    key={list.id}
                                    className={`list-item ${selectedChecklist?.id === list.id ? 'active' : ''}`}
                                    onClick={() => setSelectedChecklist(list)}
                                >
                                    <div className="list-info">
                                        <h4>{list.title}</h4>
                                        <span>{new Date(list.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => { e.stopPropagation(); deleteChecklist(list.id); }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="list-detail">
                            {selectedChecklist ? (
                                <>
                                    <div className="detail-header">
                                        <h2>{selectedChecklist.title}</h2>
                                        {renderProgressBar(selectedChecklist.tasks)}
                                    </div>

                                    <div className="tasks-list">
                                        {selectedChecklist.tasks?.sort((a, b) => a.id.localeCompare(b.id)).map(task => (
                                            <div
                                                key={task.id}
                                                className={`task-item ${task.status}`}
                                                onClick={() => toggleTaskStatus(task)}
                                            >
                                                <div className={`status-indicator ${task.status}`}></div>
                                                <div className="task-content">
                                                    <span className="task-title">{task.title}</span>
                                                    {task.description && <span className="task-category">{task.description}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="no-selection">
                                    <p>Selecione uma lista para ver os detalhes</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isTrackModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Selecionar Música</h2>
                        <p>Para qual música você deseja criar este checklist?</p>

                        {tracks.length > 0 ? (
                            <div className="form-group">
                                <select
                                    value={selectedTrackId}
                                    onChange={(e) => setSelectedTrackId(e.target.value)}
                                >
                                    <option value="">Selecione uma música...</option>
                                    {tracks.map(track => (
                                        <option key={track.id} value={track.id}>
                                            {track.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="no-tracks-warning">
                                <p>Você ainda não tem músicas cadastradas.</p>
                                <Button onClick={() => navigate('/artist-hub/tracks')}>
                                    Criar Nova Música
                                </Button>
                            </div>
                        )}

                        <div className="modal-actions">
                            <Button variant="outline" onClick={() => setIsTrackModalOpen(false)}>
                                Cancelar
                            </Button>
                            {tracks.length > 0 && (
                                <Button onClick={confirmCreateChecklist} disabled={!selectedTrackId}>
                                    Criar Checklist
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
