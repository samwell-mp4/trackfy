import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="modal-header">
                        <h2 className="modal-title">{title}</h2>
                        <button className="modal-close" onClick={onClose}>
                            ×
                        </button>
                    </div>
                    <div className="modal-body">{children}</div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};
