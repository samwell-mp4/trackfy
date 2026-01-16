import React, { useState, useEffect } from 'react';
import { Button } from '@components/common/Button';
import './Financial.css';

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    paymentMethod: string;
}

const CATEGORIES = {
    income: [
        { id: 'shows', label: 'Shows & Cachês', icon: '🎤', color: '#8b5cf6' },
        { id: 'streaming', label: 'Streaming (Spotify/Apple)', icon: '🎧', color: '#10b981' },
        { id: 'merch', label: 'Merchandising', icon: '👕', color: '#f59e0b' },
        { id: 'copyright', label: 'Direitos Autorais', icon: '©️', color: '#3b82f6' },
        { id: 'sponsorship', label: 'Patrocínios', icon: '🤝', color: '#ec4899' }
    ],
    expense: [
        { id: 'video', label: 'Produção de Videoclipe', icon: '🎬', color: '#ef4444' },
        { id: 'marketing', label: 'Marketing & Tráfego', icon: '📈', color: '#f97316' },
        { id: 'transport', label: 'Transporte & Logística', icon: '🚗', color: '#6366f1' },
        { id: 'equipment', label: 'Equipamentos', icon: '🎸', color: '#14b8a6' },
        { id: 'studio', label: 'Estúdio & Mix/Master', icon: '🎚️', color: '#8b5cf6' },
        { id: 'team', label: 'Equipe & Staff', icon: '👥', color: '#64748b' }
    ]
};

const PAYMENT_METHODS = [
    { id: 'pix', label: 'Pix' },
    { id: 'credit_card', label: 'Cartão de Crédito' },
    { id: 'debit_card', label: 'Cartão de Débito' },
    { id: 'cash', label: 'Dinheiro' },
    { id: 'boleto', label: 'Boleto' },
    { id: 'transfer', label: 'Transferência' }
];

export const Financial: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Transaction>>({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'pix'
    });

    useEffect(() => {
        const saved = localStorage.getItem('financial_transactions');
        if (saved) {
            setTransactions(JSON.parse(saved));
        } else {
            // Initial Mock Data
            const initialData: Transaction[] = [
                { id: '1', title: 'Cachê Festival de Verão', amount: 15000, type: 'income', category: 'shows', date: '2025-12-10', paymentMethod: 'transfer' },
                { id: '2', title: 'Produção Clipe "Eu Amo"', amount: 4500, type: 'expense', category: 'video', date: '2025-12-08', paymentMethod: 'pix' },
                { id: '3', title: 'Royalties Spotify Nov/25', amount: 3200.50, type: 'income', category: 'streaming', date: '2025-12-05', paymentMethod: 'transfer' },
                { id: '4', title: 'Uber para Reunião', amount: 45.90, type: 'expense', category: 'transport', date: '2025-12-04', paymentMethod: 'credit_card' },
                { id: '5', title: 'Ads Instagram', amount: 800, type: 'expense', category: 'marketing', date: '2025-12-01', paymentMethod: 'credit_card' },
            ];
            setTransactions(initialData);
            localStorage.setItem('financial_transactions', JSON.stringify(initialData));
        }
    }, []);

    const saveTransactions = (newTransactions: Transaction[]) => {
        setTransactions(newTransactions);
        localStorage.setItem('financial_transactions', JSON.stringify(newTransactions));
    };

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleSave = () => {
        if (!formData.title || !formData.amount || !formData.category) {
            alert("Por favor, preencha todos os campos: Descrição, Valor e Categoria.");
            return;
        }

        if (editingId) {
            const updated = transactions.map(t =>
                t.id === editingId ? { ...t, ...formData } as Transaction : t
            );
            saveTransactions(updated);
        } else {
            const transaction: Transaction = {
                id: Date.now().toString(),
                title: formData.title,
                amount: Number(formData.amount),
                type: formData.type as 'income' | 'expense',
                category: formData.category,
                date: formData.date || new Date().toISOString().split('T')[0],
                paymentMethod: formData.paymentMethod || 'pix'
            };
            saveTransactions([transaction, ...transactions]);
        }

        closeModal();
    };

    const handleEdit = (transaction: Transaction) => {
        setFormData(transaction);
        setEditingId(transaction.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            const updated = transactions.filter(t => t.id !== id);
            saveTransactions(updated);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ type: 'expense', date: new Date().toISOString().split('T')[0], paymentMethod: 'pix' });
    };

    const getCategoryInfo = (catId: string, type: 'income' | 'expense') => {
        return CATEGORIES[type].find(c => c.id === catId) || { label: catId, icon: '💰', color: '#ccc' };
    };

    const getPaymentLabel = (method: string) => {
        return PAYMENT_METHODS.find(m => m.id === method)?.label || method;
    };

    return (
        <div className="financial-page">
            <div className="page-header">
                <h1>💰 Gestão Financeira</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Nova Transação
                </Button>
            </div>

            <div className="financial-grid">
                {/* Summary Cards */}
                <div className="summary-card card-balance">
                    <div className="summary-label">
                        <span>Saldo Atual</span>
                    </div>
                    <div className="summary-value" style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}>
                        {formatCurrency(balance)}
                    </div>
                    <div className="summary-trend trend-positive">
                        <span>↗ +12% vs mês anterior</span>
                    </div>
                </div>

                <div className="summary-card card-income">
                    <div className="summary-label">
                        <span>Receita Mensal</span>
                    </div>
                    <div className="summary-value" style={{ color: '#10b981' }}>
                        {formatCurrency(totalIncome)}
                    </div>
                    <div className="summary-trend trend-positive">
                        <span>↗ 3 Shows realizados</span>
                    </div>
                </div>

                <div className="summary-card card-expense">
                    <div className="summary-label">
                        <span>Despesas Mensais</span>
                    </div>
                    <div className="summary-value" style={{ color: '#ef4444' }}>
                        {formatCurrency(totalExpense)}
                    </div>
                    <div className="summary-trend trend-negative">
                        <span>↘ Investimento em Carreira</span>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="transactions-section">
                    <div className="section-header">
                        <h3>Últimas Movimentações</h3>
                        <Button variant="outline" size="sm">Exportar Relatório</Button>
                    </div>
                    <div className="transaction-list">
                        {transactions.map(t => {
                            const cat = getCategoryInfo(t.category, t.type);
                            return (
                                <div key={t.id} className="transaction-item">
                                    <div className="t-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
                                        {cat.icon}
                                    </div>
                                    <div className="t-info">
                                        <div className="t-title">{t.title}</div>
                                        <div className="t-meta">
                                            <span>{cat.label}</span>
                                            <span className="separator">•</span>
                                            <span>{getPaymentLabel(t.paymentMethod)}</span>
                                            <span className="separator">•</span>
                                            <span>{new Date(t.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className={`t-amount ${t.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </div>
                                    <div className="t-actions">
                                        <button className="action-btn edit" onClick={() => handleEdit(t)}>✏️</button>
                                        <button className="action-btn delete" onClick={() => handleDelete(t.id)}>🗑️</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Categories Breakdown */}
                <div className="categories-section">
                    <div className="section-header">
                        <h3>Por Categoria (Despesas)</h3>
                    </div>
                    {CATEGORIES.expense.map(cat => {
                        const catTotal = transactions
                            .filter(t => t.type === 'expense' && t.category === cat.id)
                            .reduce((acc, curr) => acc + curr.amount, 0);

                        if (catTotal === 0) return null;

                        const percent = (catTotal / totalExpense) * 100;

                        return (
                            <div key={cat.id} className="category-bar">
                                <div className="cat-header">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {cat.icon} {cat.label}
                                    </span>
                                    <span>{formatCurrency(catTotal)} ({Math.round(percent)}%)</span>
                                </div>
                                <div className="cat-progress">
                                    <div
                                        className="cat-fill"
                                        style={{ width: `${percent}%`, background: cat.color }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add/Edit Transaction Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingId ? 'Editar Transação' : 'Nova Transação'}</h2>

                        <div className="type-toggle">
                            <button
                                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'income' })}
                            >
                                Entrada (Receita)
                            </button>
                            <button
                                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'expense' })}
                            >
                                Saída (Despesa)
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Descrição</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ex: Cachê Show SP"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Valor (R$)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0,00"
                                    value={formData.amount || ''}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Data</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Categoria</label>
                                <select
                                    className="form-select"
                                    value={formData.category || ''}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {CATEGORIES[formData.type as 'income' | 'expense'].map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Método de Pagamento</label>
                                <select
                                    className="form-select"
                                    value={formData.paymentMethod || ''}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                >
                                    {PAYMENT_METHODS.map(method => (
                                        <option key={method.id} value={method.id}>{method.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <Button variant="outline" onClick={closeModal}>Cancelar</Button>
                            <Button onClick={handleSave}>Salvar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
