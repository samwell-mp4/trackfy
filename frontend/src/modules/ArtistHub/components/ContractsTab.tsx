import React, { useState } from 'react';
import { Button } from '@components/common/Button';

interface ContractsTabProps {
    track: any;
}

export const ContractsTab: React.FC<ContractsTabProps> = ({ track }) => {
    const [viewMode, setViewMode] = useState<'list' | 'preview'>('list');
    const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
    const [contractStatus, setContractStatus] = useState<any>({}); // Mock status tracking

    const participants = track.metadata.rights || [];

    const handleViewContract = (participant: any) => {
        setSelectedParticipant(participant);
        setViewMode('preview');
    };

    const handleSignContract = () => {
        if (!selectedParticipant) return;

        // Mock signing
        const signature = {
            signed: true,
            date: new Date().toISOString(),
            ip: '192.168.1.1' // Mock IP
        };

        setContractStatus({
            ...contractStatus,
            [selectedParticipant.email]: signature // Using email as key for now
        });

        alert('Contrato assinado digitalmente com sucesso! ✍️');
    };

    const renderContractPreview = () => {
        if (!selectedParticipant) return null;

        const isSigned = contractStatus[selectedParticipant.email]?.signed;
        const signDate = contractStatus[selectedParticipant.email]?.date;

        return (
            <div className="contract-preview">
                <div className="preview-header">
                    <Button variant="outline" onClick={() => setViewMode('list')}>← Voltar</Button>
                    <div className="contract-meta">
                        <span className="doc-id">DOC-REF: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                </div>

                <div className="paper-document">
                    <div className="doc-header">
                        <h2>CONTRATO DE CESSÃO DE DIREITOS E PARTICIPAÇÃO</h2>
                        <p className="doc-date">São Paulo, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    <div className="doc-body">
                        <p>
                            Pelo presente instrumento particular, as partes:
                        </p>
                        <p>
                            <strong>ARTISTA PRINCIPAL:</strong> {track.artists?.name || 'Artista da Silva'}<br />
                            <strong>PARTICIPANTE:</strong> {selectedParticipant.name} (Função: {selectedParticipant.role})
                        </p>

                        <p>
                            Acordam a participação na obra musical intitulada <strong>"{track.title}"</strong>, sob as seguintes condições:
                        </p>

                        <div className="clause-box">
                            <h4>CLÁUSULA 1 - DA PARTICIPAÇÃO</h4>
                            <p>
                                O PARTICIPANTE fará jus a <strong>{selectedParticipant.percentage}%</strong> (por cento) dos royalties
                                líquidos gerados pela exploração comercial da OBRA em todas as plataformas digitais.
                            </p>
                        </div>

                        <div className="clause-box">
                            <h4>CLÁUSULA 2 - PRAZO</h4>
                            <p>
                                Este acordo é válido por tempo indeterminado e abrange todo o território mundial.
                            </p>
                        </div>
                    </div>

                    <div className="doc-footer">
                        <div className="signatures">
                            <div className="sig-block signed">
                                <div className="sig-line">Assinado Digitalmente</div>
                                <span>{track.artists?.name}</span>
                                <small>Artista Principal</small>
                            </div>

                            <div className={`sig-block ${isSigned ? 'signed' : 'pending'}`}>
                                <div className="sig-line">
                                    {isSigned ? `Assinado em ${new Date(signDate).toLocaleDateString()}` : 'Aguardando Assinatura'}
                                </div>
                                <span>{selectedParticipant.name}</span>
                                <small>Participante</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="preview-actions">
                    <Button variant="outline">📥 Baixar PDF</Button>
                    {!isSigned && (
                        <Button variant="primary" onClick={handleSignContract}>
                            ✍️ Assinar Digitalmente (Simulação)
                        </Button>
                    )}
                    {isSigned && (
                        <Button variant="ghost" disabled>✅ Contrato Aceito</Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="contracts-tab">
            {viewMode === 'list' && (
                <>
                    <div className="ct-header">
                        <h3>📜 Contratos Automáticos</h3>
                        <p>Contratos gerados automaticamente com base nos splits definidos.</p>
                    </div>

                    <div className="ct-grid">
                        {participants.length === 0 ? (
                            <div className="empty-state">
                                <p>Nenhum participante para gerar contratos.</p>
                            </div>
                        ) : (
                            participants.map((p: any, index: number) => (
                                <div key={index} className="ct-card">
                                    <div className="ct-icon">⚖️</div>
                                    <div className="ct-info">
                                        <h4>{p.name} - {track.title}</h4>
                                        <div className="ct-meta">
                                            <span>Versão: 1.0</span>
                                            <span className="dot">•</span>
                                            <span>Split: {p.percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="ct-status">
                                        {contractStatus[p.email]?.signed ? (
                                            <span className="badge success">Assinado</span>
                                        ) : (
                                            <span className="badge warning">Pendente</span>
                                        )}
                                    </div>
                                    <Button size="sm" onClick={() => handleViewContract(p)}>
                                        Visualizar
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {viewMode === 'preview' && renderContractPreview()}

            <style>{`
                .contracts-tab {
                    padding: 1rem;
                    color: white;
                }
                .ct-header {
                    margin-bottom: 2rem;
                }
                .ct-header h3 { margin-bottom: 0.5rem; }
                .ct-header p { color: #94a3b8; margin: 0; }
                
                .ct-grid {
                    display: grid;
                    gap: 1rem;
                }
                .ct-card {
                    display: flex;
                    align-items: center;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 1.5rem;
                    border-radius: 12px;
                    gap: 1.5rem;
                }
                .ct-icon { font-size: 2rem; }
                .ct-info { flex: 1; }
                .ct-info h4 { margin: 0 0 0.25rem 0; font-size: 1.1rem; }
                .ct-meta { font-size: 0.9rem; color: #94a3b8; display: flex; align-items: center; gap: 0.5rem; }
                
                .badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                .badge.success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                .badge.warning { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }

                /* Preview Styles */
                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .paper-document {
                    background: #fff;
                    color: #1e293b;
                    padding: 4rem;
                    border-radius: 4px;
                    max-width: 800px;
                    margin: 0 auto 2rem;
                    min-height: 800px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    font-family: 'Times New Roman', serif;
                }
                .doc-header { text-align: center; margin-bottom: 3rem; border-bottom: 2px solid #000; padding-bottom: 2rem; }
                .doc-body { line-height: 1.6; font-size: 1.1rem; }
                .doc-body p { margin-bottom: 1.5rem; }
                .clause-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                }
                .clause-box h4 { margin-top: 0; }
                
                .doc-footer { margin-top: 4rem; }
                .signatures { display: flex; justify-content: space-between; margin-top: 3rem; }
                .sig-block {
                    border-top: 1px solid #000;
                    padding-top: 0.5rem;
                    width: 40%;
                    text-align: center;
                }
                .sig-line { font-family: 'Courier New'; font-size: 0.8rem; margin-bottom: 0.5rem; color: #64748b; }
                .sig-block.signed .sig-line { color: #10b981; }

                .preview-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    padding-bottom: 2rem;
                }
            `}</style>
        </div>
    );
};
