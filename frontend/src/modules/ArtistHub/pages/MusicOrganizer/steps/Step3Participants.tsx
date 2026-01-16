import React, { useState } from 'react';
import { Button } from '@components/common/Button';
import { ParticipantSelector } from '../../../components/ParticipantSelector';

interface Step3Props {
    data: any;
    updateData: (data: any) => void;
}


export const Step3Participants: React.FC<Step3Props> = ({ data, updateData }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ name: string; role: string; email: string }>({ name: '', role: '', email: '' });
    const [showParticipantSelector, setShowParticipantSelector] = useState(false);

    const removeParticipant = (id: string) => {
        if (confirm('Tem certeza que deseja remover este participante?')) {
            const updatedList = data.participants.filter((p: any) => p.id !== id);
            updateData({ participants: updatedList });
        }
    };

    const startEdit = (p: any) => {
        setEditingId(p.id);
        setEditForm({ name: p.name, role: p.role, email: p.email || '' });
    };

    const saveEdit = (id: string) => {
        const updatedList = data.participants.map((p: any) =>
            p.id === id ? { ...p, ...editForm } : p
        );
        updateData({ participants: updatedList });
        setEditingId(null);
    };

    const sendAuth = (email: string) => {
        if (!email) return alert("Adicione um email para enviar a autorização.");
        alert(`Autorização enviada para ${email}! 📧`);
    };

    return (
        <>
            <div className="step-container">
                <h2 className="step-title">Participantes / Colaboradores</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Adicione todos que contribuíram para esta obra.
                </p>

                <div className="participants-list">
                    {data.participants?.map((p: any) => (
                        <div key={p.id} className="participant-item" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    {editingId === p.id ? (
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexDirection: 'column' }}>
                                            <input
                                                className="form-input"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                placeholder="Nome"
                                            />
                                            <input
                                                className="form-input"
                                                value={editForm.role}
                                                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                                placeholder="Função"
                                            />
                                            <input
                                                className="form-input"
                                                value={editForm.email}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                placeholder="Email para contrato"
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <Button size="sm" onClick={() => saveEdit(p.id)}>Salvar</Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>{p.name}</span>
                                                <span className="role-badge">{p.role}</span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                {p.email || 'Sem email cadastrado'}
                                            </div>
                                            {p.observation && (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    Obs: {p.observation}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {editingId !== p.id && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button variant="outline" size="sm" onClick={() => sendAuth(p.email)} title="Enviar Autorização">
                                            📧
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => startEdit(p)} title="Editar">
                                            ✏️
                                        </Button>
                                        <Button variant="outline" size="sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => removeParticipant(p.id)} title="Excluir">
                                            🗑️
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {(!data.participants || data.participants.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                            Nenhum participante adicionado.
                        </div>
                    )}
                </div>

                <Button onClick={() => setShowParticipantSelector(true)} style={{ marginTop: '24px' }}>
                    + Adicionar Participante
                </Button>
            </div>

            {/* Participant Selector */}
            {showParticipantSelector && (
                <ParticipantSelector
                    isOpen={showParticipantSelector}
                    onClose={() => setShowParticipantSelector(false)}
                    onSelect={(artist, role, split) => {
                        const newP = {
                            id: Date.now().toString(),
                            name: artist.name,
                            role: role,
                            artist_id: artist.id,
                            percentage: split,
                            email: artist.email || '', // Capture email if available from selector
                            observation: ''
                        };
                        const updatedList = [...(data.participants || []), newP];
                        updateData({ participants: updatedList });
                    }}
                />
            )}
        </>

    );
};
