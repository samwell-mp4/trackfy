import React, { useEffect } from 'react';

interface Step4Props {
    data: any;
    updateData: (data: any) => void;
}

export const Step4Rights: React.FC<Step4Props> = ({ data, updateData }) => {
    // Initialize rights based on participants if not already set
    useEffect(() => {
        if (!data.rights || data.rights.length === 0) {
            const initialRights = [
                { id: 'main', name: data.mainArtist?.name || 'Artista Principal', role: 'Artista Principal', percentage: 0 },
                ...(data.participants || []).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    percentage: 0
                }))
            ];
            updateData({ rights: initialRights });
        }
    }, []);

    const handlePercentageChange = (id: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        const updatedRights = data.rights.map((r: any) =>
            r.id === id ? { ...r, percentage: numValue } : r
        );
        updateData({ rights: updatedRights });
    };

    const totalPercentage = data.rights?.reduce((acc: number, curr: any) => acc + (curr.percentage || 0), 0) || 0;

    return (
        <div className="step-container">
            <h2 className="step-title">Divisão de Direitos (Organização)</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Defina a porcentagem de participação de cada colaborador.
                <br />
                <small>Isso é apenas para controle interno.</small>
            </p>

            <table className="rights-table">
                <thead>
                    <tr>
                        <th>Colaborador</th>
                        <th>Função</th>
                        <th style={{ textAlign: 'right' }}>Participação (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.rights?.map((r: any) => (
                        <tr key={r.id}>
                            <td>
                                {r.name}
                                {r.id !== 'main' && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Remover este participante da divisão de royalties?')) {
                                                const updatedRights = data.rights.filter((right: any) => right.id !== r.id);
                                                updateData({ rights: updatedRights });
                                            }
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            marginLeft: '8px',
                                            fontSize: '0.8rem',
                                            opacity: 0.6
                                        }}
                                        title="Remover"
                                    >
                                        ❌
                                    </button>
                                )}
                            </td>
                            <td><span className="role-badge">{r.role}</span></td>
                            <td style={{ textAlign: 'right' }}>
                                <input
                                    type="number"
                                    className="form-input percentage-input"
                                    value={r.percentage}
                                    onChange={e => handlePercentageChange(r.id, e.target.value)}
                                    min="0"
                                    max="100"
                                /> %
                            </td>
                        </tr>
                    ))}
                    <tr className="total-row">
                        <td colSpan={2} style={{ textAlign: 'right' }}>Total:</td>
                        <td style={{ textAlign: 'right', color: totalPercentage > 100 ? '#ef4444' : totalPercentage === 100 ? '#10b981' : '#fff' }}>
                            {totalPercentage}%
                        </td>
                    </tr>
                </tbody>
            </table>

            {totalPercentage > 100 && (
                <div className="warning-text">
                    ⚠️ Essa soma excede 100%. Isso não impede salvar, pois é apenas organização interna.
                </div>
            )}
            {totalPercentage < 100 && totalPercentage > 0 && (
                <div className="warning-text" style={{ color: '#3b82f6' }}>
                    ℹ️ A soma é menor que 100%.
                </div>
            )}
        </div>
    );
};
