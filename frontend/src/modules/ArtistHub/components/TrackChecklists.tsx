import React, { useState, useEffect } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { CHECKLIST_TEMPLATES, type ChecklistTemplate } from '../constants/checklistTemplates';
import '../pages/checklists-view.css'; // Reuse styles

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

interface TrackChecklistsProps {
    trackId: string;
    trackTitle: string;
}

export const TrackChecklists: React.FC<TrackChecklistsProps> = ({ trackId }) => {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedChecklistIds, setExpandedChecklistIds] = useState<Set<string>>(new Set());
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // New Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [addingTaskToChecklistId, setAddingTaskToChecklistId] = useState<string | null>(null);

    useEffect(() => {
        if (trackId) loadChecklists();
    }, [trackId]);

    const loadChecklists = async () => {
        setLoading(true);
        try {
            // Fetch all checklists and filter client-side or use query params if supported
            // The service supports filtering by related_entity_type and id
            const data = await artistHubService.getChecklists('track', trackId);
            setChecklists(data);
        } catch (error) {
            console.error('Error loading checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFromTemplate = async (template: ChecklistTemplate) => {
        try {
            setLoading(true);
            setShowTemplateModal(false);

            const newChecklist = await artistHubService.createChecklist({
                title: `${template.title}`,
                type: 'instance',
                related_entity_type: 'track',
                related_entity_id: trackId
            });

            for (const item of template.items) {
                await artistHubService.createTask({
                    checklist_id: newChecklist.id,
                    title: item.title,
                    status: 'todo',
                    description: item.category
                });
            }

            loadChecklists();
            alert('Checklist criado com sucesso!');
        } catch (error) {
            console.error('Error creating checklist:', error);
            alert('Erro ao criar checklist.');
        } finally {
            setLoading(false);
        }
    };

    const deleteChecklist = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta lista?')) return;
        try {
            console.log('Deleting checklist:', id);
            await artistHubService.deleteChecklist(id);
            loadChecklists();
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
        let newStatus: 'todo' | 'in_progress' | 'done' = 'todo';
        if (task.status === 'todo') newStatus = 'in_progress';
        else if (task.status === 'in_progress') newStatus = 'done';
        else if (task.status === 'done') newStatus = 'todo';

        try {
            // Optimistic update
            const updatedChecklists = checklists.map(list => {
                if (list.id === task.checklist_id && list.tasks) {
                    return {
                        ...list,
                        tasks: list.tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
                    };
                }
                return list;
            });
            setChecklists(updatedChecklists);

            await artistHubService.updateTask(task.id, { status: newStatus });
        } catch (error) {
            console.error('Error updating task:', error);
            loadChecklists(); // Revert on error
        }
    };

    const handleAddTask = async (checklistId: string) => {
        if (!newTaskTitle.trim()) return;
        try {
            await artistHubService.createTask({
                checklist_id: checklistId,
                title: newTaskTitle,
                status: 'todo',
                description: 'Personalizado'
            });
            setNewTaskTitle('');
            setAddingTaskToChecklistId(null);
            loadChecklists();
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Erro ao adicionar tarefa.');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Excluir esta tarefa?')) return;
        try {
            console.log('Deleting task:', taskId);
            await artistHubService.deleteTask(taskId);
            loadChecklists();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Erro ao excluir tarefa. Verifique o console.');
        }
    };

    const renderProgressBar = (tasks: Task[] = []) => {
        if (!tasks.length) return null;
        const total = tasks.length;
        const done = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const donePercent = (done / total) * 100;
        const inProgressPercent = (inProgress / total) * 100;

        return (
            <div className="progress-bar" style={{ marginTop: '10px' }}>
                <div className="progress-fill done" style={{ width: `${donePercent}%` }}></div>
                <div className="progress-fill in-progress" style={{ width: `${inProgressPercent}%`, left: `${donePercent}%` }}></div>
            </div>
        );
    };

    return (
        <div className="track-checklists-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Checklists & Processos</h3>
                <Button onClick={() => setShowTemplateModal(true)}>+ Novo Checklist</Button>
            </div>

            {loading ? (
                <div className="loading-spinner">Carregando...</div>
            ) : checklists.length === 0 ? (
                <div className="empty-msg">Nenhum checklist criado para esta música.</div>
            ) : (
                <div className="checklists-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {checklists.map(list => {
                        const isExpanded = expandedChecklistIds.has(list.id);
                        return (
                            <div key={list.id} className={`checklist-card ${isExpanded ? 'expanded' : ''}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div
                                        className="checklist-header"
                                        onClick={() => toggleChecklistExpansion(list.id)}
                                        style={{ cursor: 'pointer', flex: 1, marginRight: '10px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{list.title}</h4>
                                        </div>
                                        {renderProgressBar(list.tasks)}
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChecklist(list.id);
                                        }}
                                        title="Excluir Checklist"
                                        style={{ marginTop: '5px', zIndex: 10, position: 'relative' }}
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="tasks-preview" style={{ marginTop: '16px', paddingLeft: '16px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                        {/* Add Task Input */}
                                        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                                            {addingTaskToChecklistId === list.id ? (
                                                <>
                                                    <input
                                                        className="meta-input"
                                                        style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }}
                                                        placeholder="Nome da tarefa..."
                                                        value={newTaskTitle}
                                                        onChange={e => setNewTaskTitle(e.target.value)}
                                                        autoFocus
                                                        onKeyDown={e => e.key === 'Enter' && handleAddTask(list.id)}
                                                    />
                                                    <Button size="sm" onClick={() => handleAddTask(list.id)}>Adicionar</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setAddingTaskToChecklistId(null)}>Cancelar</Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="ghost" onClick={() => setAddingTaskToChecklistId(list.id)}>+ Adicionar Tarefa</Button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {list.tasks?.sort((a, b) => a.id.localeCompare(b.id)).map(task => (
                                                <div
                                                    key={task.id}
                                                    className={`task-item ${task.status}`}
                                                    style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                                >
                                                    <div
                                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
                                                        onClick={() => toggleTaskStatus(task)}
                                                    >
                                                        <div className={`status-indicator ${task.status}`}></div>
                                                        <span className="task-title" style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.6 : 1 }}>
                                                            {task.title}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="delete-btn"
                                                        style={{ fontSize: '0.9rem', opacity: 0.5 }}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Template Selection Modal */}
            {
                showTemplateModal && (
                    <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <h2>Escolha um Modelo</h2>
                            <div className="templates-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                                {CHECKLIST_TEMPLATES.map(template => (
                                    <div key={template.id} className="template-card" style={{ cursor: 'default' }}>
                                        <h3>{template.title}</h3>
                                        <p>{template.description}</p>
                                        <Button onClick={() => handleCreateFromTemplate(template)} fullWidth>
                                            Usar Modelo
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>Fechar</Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
