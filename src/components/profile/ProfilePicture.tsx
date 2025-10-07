import { LoadingSpinner } from '@components/common';
import type { ProfilePictureProps } from '@types/profile';
import React, { useCallback, useRef, useState } from 'react';

// Size configurations
const SIZE_CONFIGS = {
  small: { size: '3rem', iconSize: '1.5rem' },
  medium: { size: '6rem', iconSize: '2rem' },
  large: { size: '9rem', iconSize: '3rem' },
  xlarge: { size: '12rem', iconSize: '4rem' },
};

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userId,
  profilePicture,
  size = 'medium',
  editable = false,
  onUpload,
  onRemove,
  loading = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const sizeConfig = SIZE_CONFIGS[size];

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!onUpload) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setError(null);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await onUpload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      setUploadProgress(0);
    }
  }, [onUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to upload
  const handleClick = useCallback(() => {
    if (editable && !loading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [editable, loading]);

  // Handle remove picture
  const handleRemove = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRemove) return;

    try {
      setError(null);
      await onRemove();
    } catch (err: any) {
      setError(err.message || 'Failed to remove image');
    }
  }, [onRemove]);

  // Render profile picture or placeholder
  const renderPicture = () => {
    if (loading || uploadProgress > 0) {
      return (
        <div className="profile-picture-loading">
          <LoadingSpinner size="small" />
          {uploadProgress > 0 && (
            <div className="profile-picture-progress">
              <div 
                className="profile-picture-progress-bar"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      );
    }

    if (profilePicture) {
      return (
        <img
          src={profilePicture}
          alt="Profile picture"
          className="profile-picture-image"
          onError={() => setError('Failed to load image')}
        />
      );
    }

    return (
      <div className="profile-picture-placeholder">
        <svg
          width={sizeConfig.iconSize}
          height={sizeConfig.iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`profile-picture-container ${className}`}>
      <div
        className={`profile-picture ${size} ${editable ? 'editable' : ''} ${isHovered ? 'hovered' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{ width: sizeConfig.size, height: sizeConfig.size }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role={editable ? 'button' : 'img'}
        tabIndex={editable ? 0 : -1}
        aria-label={profilePicture ? 'Profile picture' : 'No profile picture'}
        aria-describedby={editable ? 'profile-picture-instructions' : undefined}
      >
        {renderPicture()}

        {/* Upload overlay */}
        {editable && isHovered && !loading && (
          <div className="profile-picture-overlay">
            <div className="profile-picture-overlay-content">
              {profilePicture ? (
                <>
                  <svg
                    width="1.5rem"
                    height="1.5rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span>Change</span>
                </>
              ) : (
                <>
                  <svg
                    width="1.5rem"
                    height="1.5rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span>Upload</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Remove button */}
        {editable && profilePicture && isHovered && !loading && onRemove && (
          <button
            type="button"
            className="profile-picture-remove"
            onClick={handleRemove}
            aria-label="Remove profile picture"
          >
            <svg
              width="1rem"
              height="1rem"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Drag and drop indicator */}
        {isDragging && (
          <div className="profile-picture-drag-overlay">
            <div className="profile-picture-drag-content">
              <svg
                width="2rem"
                height="2rem"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Drop image here</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
          className="profile-picture-file-input"
          aria-hidden="true"
        />
      )}

      {/* Instructions */}
      {editable && (
        <div id="profile-picture-instructions" className="profile-picture-instructions">
          Click to upload or drag and drop an image
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="profile-picture-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
