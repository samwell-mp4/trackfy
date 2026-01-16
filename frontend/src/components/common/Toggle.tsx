import React from 'react';
import './Toggle.css';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled }) => {
    return (
        <label className={`toggle-container ${disabled ? 'disabled' : ''}`}>
            <div className="toggle-switch">
                <input
                    type="checkbox"
                    className="toggle-input"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                />
                <span className="toggle-slider" />
            </div>
            {label && <span className="toggle-label">{label}</span>}
        </label>
    );
};
