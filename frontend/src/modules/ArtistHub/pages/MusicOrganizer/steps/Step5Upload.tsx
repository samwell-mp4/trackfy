import React from 'react';

interface Step5Props {
    data: any;
    updateData: (data: any) => void;
}

export const Step5Upload: React.FC<Step5Props> = ({ data, updateData }) => {

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);

            // Update file immediately to ensure it's saved even if metadata fails
            updateData({
                audioFile: file,
                audioUrl: url,
                duration: 0
            });

            // Create audio element to get duration
            const audio = new Audio(url);
            audio.onloadedmetadata = () => {
                updateData({
                    duration: audio.duration
                });
            };
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="step-container">
            <h2 className="step-title">Upload do Áudio</h2>

            <div className="upload-area" onClick={() => document.getElementById('audio-upload')?.click()}>
                {data.audioFile ? (
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎵</div>
                        <h3 style={{ marginBottom: '8px' }}>{data.audioFile.name}</h3>
                        <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                            Duração: {formatDuration(data.duration)}
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Clique para substituir
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎧</div>
                        <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Arraste ou clique para enviar o áudio</div>
                        <div style={{ fontSize: '0.9rem' }}>WAV, MP3 ou AAC</div>
                    </div>
                )}
                <input
                    type="file"
                    id="audio-upload"
                    hidden
                    accept="audio/wav, audio/mpeg, audio/aac"
                    onChange={handleAudioUpload}
                />
            </div>

            {data.audioUrl && (
                <div style={{ marginTop: '32px' }}>
                    <label className="form-label">Preview</label>
                    <audio controls src={data.audioUrl} style={{ width: '100%' }} />
                </div>
            )}
        </div>
    );
};
