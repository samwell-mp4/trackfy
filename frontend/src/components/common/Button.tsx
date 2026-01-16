import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    className = '',
    ...props
}) => {
    const classes = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && 'btn--full-width',
        isLoading && 'btn--loading',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} disabled={disabled || isLoading} {...props}>
            {isLoading ? (
                <>
                    <span className="btn__spinner" />
                    <span className="btn__text">Carregando...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};
