import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, icon, className = '', ...props }, ref) => {
        return (
            <div className="input-wrapper">
                {label && <label className="input-label">{label}</label>}

                <div className="input-container">
                    {icon && <div className="input-icon">{icon}</div>}
                    <input
                        ref={ref}
                        className={`input ${icon ? 'input--with-icon' : ''} ${error ? 'input--error' : ''} ${className}`}
                        {...props}
                    />
                </div>

                {error && <span className="input-error">{error}</span>}
                {helperText && !error && <span className="input-helper">{helperText}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
