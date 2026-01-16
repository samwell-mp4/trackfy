import React, { useState } from 'react';
import { Button } from '@components/common/Button';

interface RoyaltiesTabProps {
    track: any;
    onUpdate: () => void;
}

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
}

const EXPENSE_CATEGORIES = [
    { id: 'video', label: 'Videoclipe / Visualizer', icon: '🎬' },
    { id: 'production', label: 'Produção Musical (Beat/Mix)', icon: '🎧' },
    { id: 'marketing', label: 'Marketing & Tráfego', icon: '📈' },
    { id: 'design', label: 'Capa & Design', icon: '🎨' },
    { id: 'other', label: 'Outros', icon: '📝' }
];

export const RoyaltiesTab: React.FC<RoyaltiesTabProps> = ({ track, onUpdate }) => {
    const participants = track.metadata.rights || [];
    const [expenses, setExpenses] = useState<Expense[]>(track.metadata.expenses || []);

    // Form State
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [newExpense, setNewExpense] = useState<Partial<Expense>>({
        category: 'production',
        date: new Date().toISOString().split('T')[0]
    });

    const handleWhatsAppReminder = (participant: any) => {
        const phone = participant.phone || '';
        const message = `Ei ${participant.name}! 👋 Passando pra lembrar de conferir os royalties da faixa *${track.title}*. Qualquer atualização, registra no painel 😉`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const calculateTotalRoyalties = () => {
        return participants.reduce((acc: number, curr: any) => acc + (Number(curr.percentage) || 0), 0);
    };

    const totalRoyalties = calculateTotalRoyalties();

    const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const handleSaveExpense = () => {
        if (!newExpense.description || !newExpense.amount) {
            alert('Preencha a descrição e o valor.');
            return;
        }

        const expense: Expense = {
            id: Date.now().toString(),
            description: newExpense.description,
            amount: Number(newExpense.amount),
            category: newExpense.category || 'other',
            date: newExpense.date || new Date().toISOString().split('T')[0]
        };

        // 1. Update Local State
        const updatedExpenses = [...expenses, expense];
        setExpenses(updatedExpenses);

        // 2. Sync with Track Metadata (via Parent)
        // We need to mutate the track object directly here or pass it up. 
        // Ideally we call an update function, but reusing the track object prop pattern:
        if (!track.metadata.expenses) track.metadata.expenses = [];
        track.metadata.expenses = updatedExpenses;

        // 3. Sync with Global Financial Module (LocalStorage)
        try {
            const savedTransactions = localStorage.getItem('financial_transactions');
            const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];

            const globalTransaction = {
                id: `track-${track.id}-${expense.id}`, // Unique ID linking to track
                title: `${expense.description} - ${track.title}`, // Context in title
                amount: expense.amount,
                type: 'expense',
                category: expense.category, // Map if needed, but IDs mostly match
                date: expense.date,
                paymentMethod: 'pix', // Default or add field
                trackId: track.id // Reference
            };

            transactions.push(globalTransaction);
            localStorage.setItem('financial_transactions', JSON.stringify(transactions));
            console.log('Synced to Global Finance:', globalTransaction);
        } catch (e) {
            console.error('Error syncing to global finance:', e);
        }

        // 4. Close and Notify
        setNewExpense({ category: 'production', date: new Date().toISOString().split('T')[0], description: '', amount: 0 });
        setShowExpenseForm(false);
        onUpdate(); // Triggers save in parent
        alert('Despesa adicionada e sincronizada com o Financeiro! 💸');
    };

    const handleDeleteExpense = (expenseId: string) => {
        if (!confirm('Excluir esta despesa? Ela também será removida do Financeiro Geral.')) return;

        // 1. Remove from Local
        const updatedExpenses = expenses.filter(e => e.id !== expenseId);
        setExpenses(updatedExpenses);
        track.metadata.expenses = updatedExpenses;

        // 2. Remove from Global
        try {
            const savedTransactions = localStorage.getItem('financial_transactions');
            if (savedTransactions) {
                const transactions = JSON.parse(savedTransactions);
                const filtered = transactions.filter((t: any) => t.id !== `track-${track.id}-${expenseId}`);
                localStorage.setItem('financial_transactions', JSON.stringify(filtered));
            }
        } catch (e) { console.error(e); }

        onUpdate();
    };

    return (
        <div className="royalties-tab">
            {/* Header / Royalties Section */}
            <div className="rt-header">
                <h3>👑 Distribuição de Royalties (Splits)</h3>
                <div className={`rt-total-badge ${totalRoyalties === 100 ? 'valid' : 'invalid'}`}>
                    Total: {totalRoyalties}%
                </div>
            </div>

            <div className="rt-grid">
                {participants.length === 0 ? (
                    <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                        <p>Nenhum participante registrado para divisão de lucros.</p>
                        <Button variant="outline" onClick={() => document.querySelector<HTMLElement>('.td-tab:nth-child(4)')?.click()}>
                            Gerenciar Equipe
                        </Button>
                    </div>
                ) : (
                    participants.map((p: any, index: number) => (
                        <div key={index} className="rt-card">
                            <div className="rt-card-header">
                                <div className="rt-user-info">
                                    <div className="rt-avatar">{p.name.charAt(0)}</div>
                                    <div>
                                        <h4>{p.name}</h4>
                                        <span className="rt-role">{p.role}</span>
                                    </div>
                                </div>
                                <div className="rt-percentage">{p.percentage}%</div>
                            </div>
                            <div className="rt-card-actions">
                                <Button variant="outline" size="sm" onClick={() => handleWhatsAppReminder(p)}>📢 Cobrar</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Expenses Checklist Section */}
            <div className="expenses-section" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3>📉 Checklist de Gastos da Faixa</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Estes gastos aparecem automaticamente no seu Financeiro Geral.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Investimento Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
                        </div>
                    </div>
                </div>

                {/* Expense List */}
                <div className="expenses-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {expenses.map(expense => (
                        <div key={expense.id} className="expense-item" style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)', padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.2rem' }}>{EXPENSE_CATEGORIES.find(c => c.id === expense.category)?.icon || '💸'}</span>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{expense.description}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(expense.date).toLocaleDateString()} • {EXPENSE_CATEGORIES.find(c => c.id === expense.category)?.label}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>
                                    - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}
                                </span>
                                <Button variant="ghost" size="sm" style={{ color: '#ef4444' }} onClick={() => handleDeleteExpense(expense.id)}>🗑️</Button>
                            </div>
                        </div>
                    ))}

                    {expenses.length === 0 && !showExpenseForm && (
                        <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: '#94a3b8' }}>
                            Nenhum gasto registrado nesta faixa.
                        </div>
                    )}
                </div>

                {/* Add Form */}
                {showExpenseForm ? (
                    <div className="expense-form" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ marginBottom: '15px' }}>Novo Gasto</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Descrição</label>
                                <input
                                    className="form-input"
                                    placeholder="Ex: Videoclipe"
                                    value={newExpense.description || ''}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Valor (R$)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0,00"
                                    value={newExpense.amount || ''}
                                    onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Categoria</label>
                                <select
                                    value={newExpense.category}
                                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                >
                                    {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Data</label>
                                <input
                                    type="date"
                                    value={newExpense.date}
                                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button variant="outline" onClick={() => setShowExpenseForm(false)}>Cancelar</Button>
                            <Button onClick={handleSaveExpense}>Salvar Despesa</Button>
                        </div>
                    </div>
                ) : (
                    <Button onClick={() => setShowExpenseForm(true)} style={{ width: '100%' }}>+ Adicionar Novo Gasto</Button>
                )}
            </div>

            <style>{`
                .royalties-tab { padding: 1rem; color: white; }
                .rt-header { display: flex; justifyContent: space-between; alignItems: center; margin-bottom: 0.5rem; }
                .rt-total-badge { padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }
                .rt-total-badge.valid { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
                .rt-total-badge.invalid { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; }
                .rt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .rt-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.5rem; transition: all 0.2s; }
                .rt-card:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-2px); }
                .rt-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .rt-user-info { display: flex; align-items: center; gap: 1rem; }
                .rt-avatar { width: 40px; height: 40px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .rt-percentage { font-size: 1.25rem; font-weight: bold; color: #fff; }
                .rt-role { font-size: 0.85rem; color: #94a3b8; }
            `}</style>
        </div>
    );
};
