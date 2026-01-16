import React from 'react';

interface Step6Props {
    data: any;
}

export const Step6Summary: React.FC<Step6Props> = ({ data }) => {
    const formatDuration = (seconds: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Resumo Final</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Revise todas as informações antes de salvar no arquivo.
            </p>

            <div className="summary-grid">
                <div className="summary-left">
                    {data.coverPreview ? (
                        <img src={data.coverPreview} alt="Capa" className="summary-cover" />
                    ) : (
                        <div className="summary-cover" style={{ background: '#333', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Sem Capa
                        </div>
                    )}

                    <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Arquivo de Áudio</div>
                        <div style={{ fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-all' }}>
                            {data.audioFile?.name || 'Não anexado'}
                        </div>
                        <div style={{ marginTop: '4px', color: '#10b981' }}>
                            ⏱ {formatDuration(data.duration)}
                        </div>
                    </div>
                </div>

                <div className="summary-details">
                    <h3>{data.title}</h3>
                    {data.subtitle && <div className="summary-subtitle">{data.subtitle}</div>}

                    <div className="detail-row">
                        <span className="detail-label">Artista Principal</span>
                        <span className="detail-value">{data.mainArtist?.name}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Gênero</span>
                        <span className="detail-value" style={{ textTransform: 'capitalize' }}>{data.genre}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Lançamento</span>
                        <span className="detail-value">{data.releaseDate ? new Date(data.releaseDate).toLocaleDateString() : 'Não definido'}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Conteúdo</span>
                        <span className="detail-value">
                            {data.explicit ? <span style={{ color: '#ef4444' }}>⚠️ Explícito</span> : 'Livre'}
                        </span>
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <h4 style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                            Equipe & Direitos
                        </h4>
                        {data.rights?.map((r: any) => (
                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>{r.name}</span>
                                    <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>({r.role})</span>
                                </div>
                                <div>{r.percentage}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
