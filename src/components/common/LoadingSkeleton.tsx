import React from 'react';

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
  lines = 1,
}) => {
  const baseClasses = [
    'loading-skeleton',
    `loading-skeleton-${variant}`,
    `loading-skeleton-${animation}`,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (lines === 1) {
    return (
      <div 
        className={`${baseClasses} ${className}`}
        style={style}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`loading-skeleton-container ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${index < lines - 1 ? 'loading-skeleton-line' : ''}`}
          style={{
            ...style,
            width: index === lines - 1 ? '75%' : '100%',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
