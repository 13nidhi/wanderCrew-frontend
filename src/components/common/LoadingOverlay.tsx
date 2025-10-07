import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  spinnerSize?: 'small' | 'medium' | 'large';
  blur?: boolean;
  opacity?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
  className = '',
  overlayClassName = '',
  spinnerSize = 'medium',
  blur = false,
  opacity = 0.8,
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`loading-overlay-container ${className}`}>
      {children}
      <div 
        className={`loading-overlay ${overlayClassName}`}
        style={{ 
          '--overlay-opacity': opacity,
          '--blur-amount': blur ? '4px' : '0px',
        } as React.CSSProperties}
      >
        <div className="loading-overlay-content">
          <div className={`loading-overlay-spinner loading-overlay-spinner-${spinnerSize}`}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
          {message && (
            <p className="loading-overlay-message">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
