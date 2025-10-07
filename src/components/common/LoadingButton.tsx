import React from 'react';

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  loadingText,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}) => {
  const baseClasses = [
    'loading-button',
    `loading-button-${variant}`,
    `loading-button-${size}`,
    fullWidth ? 'loading-button-full-width' : '',
    loading ? 'loading-button-loading' : '',
    disabled || loading ? 'loading-button-disabled' : '',
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
    >
      {loading && (
        <span className="loading-button-spinner" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </span>
      )}
      <span className="loading-button-content">
        {loading ? (loadingText || 'Loading...') : children}
      </span>
    </button>
  );
};

export default LoadingButton;
