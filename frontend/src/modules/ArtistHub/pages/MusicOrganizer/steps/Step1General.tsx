import React from 'react';

interface Step1Props {
    data: any;
    updateData: (data: any) => void;
}

export const Step1General: React.FC<Step1Props> = ({ data, updateData }) => {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app, we'd upload this. For now, create a local URL
            const url = URL.createObjectURL(file);
            updateData({ coverImage: file, coverPreview: url });
        }
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Informações Gerais</h2>

            <div className="form-row">
                <div className="form-col" style={{ flex: '0 0 250px' }}>
                    <label className="form-label">Capa da Música *</label>
                    <div className="upload-area" onClick={() => document.getElementById('cover-upload')?.click()}>
                        {data.coverPreview ? (
                            <img src={data.coverPreview} alt="Capa" className="cover-preview" />
                        ) : (
                            <div style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🖼️</div>
                                <div>Clique para enviar</div>
                                <div style={{ fontSize: '0.8rem' }}>JPG ou PNG</div>
                            </div>
                        )}
                        <input
                            type="file"
                            id="cover-upload"
                            hidden
                            accept="image/png, image/jpeg"
                            onChange={handleImageUpload}
                        />
                    </div>
                </div>

                <div className="form-col">
                    <div className="form-section">
                        <label className="form-label">Título da Música *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ex: Minha Obra Prima"
                            value={data.title || ''}
                            onChange={e => updateData({ title: e.target.value })}
                        />
                    </div>

                    <div className="form-section">
                        <label className="form-label">Subtítulo (Opcional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ex: Remix, Ao Vivo, Feat..."
                            value={data.subtitle || ''}
                            onChange={e => updateData({ subtitle: e.target.value })}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Gênero Principal</label>
                            <select
                                className="form-select"
                                value={data.genre || ''}
                                onChange={e => updateData({ genre: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                <option value="pop">Pop</option>
                                <option value="rock">Rock</option>
                                <option value="hiphop">Hip Hop / Rap</option>
                                <option value="sertanejo">Sertanejo</option>
                                <option value="funk">Funk</option>
                                <option value="electronic">Eletrônica</option>
                                <option value="mpb">MPB</option>
                                <option value="gospel">Gospel</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>
                        <div className="form-col">
                            <label className="form-label">Data de Lançamento (Interna)</label>
                            <input
                                type="date"
                                className="form-input"
                                value={data.releaseDate || ''}
                                onChange={e => updateData({ releaseDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={data.explicit || false}
                                onChange={e => updateData({ explicit: e.target.checked })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            Conteúdo Explícito (Explicit Content)
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};
