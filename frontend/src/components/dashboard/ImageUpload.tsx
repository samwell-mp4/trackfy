import React, { useRef, useState } from 'react';
import { Button } from '@components/common/Button';
import './ImageUpload.css';

interface ImageUploadProps {
    onImageSelect: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas imagens.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            onImageSelect(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    return (
        <div
            className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <div className="upload-icon">📁</div>
            <p className="upload-text">
                Clique ou arraste uma imagem aqui
            </p>
            <Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
            }}>
                Selecionar Arquivo
            </Button>
        </div>
    );
};
