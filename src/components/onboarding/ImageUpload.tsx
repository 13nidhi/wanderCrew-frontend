import React, { useCallback, useRef, useState } from 'react';

export interface ImageUploadProps {
  readonly onSelect: (file: File) => void;
  readonly disabled?: boolean;
  readonly maxSizeBytes?: number; // default 5MB
  readonly accept?: string[]; // mime types e.g. ['image/jpeg','image/png']
  readonly initialPreviewUrl?: string | undefined;
  readonly className?: string;
  readonly 'aria-label'?: string;
}

const DEFAULT_MAX = 5 * 1024 * 1024;
const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

const ImageUpload: React.FC<ImageUploadProps> = ({
  onSelect,
  disabled = false,
  maxSizeBytes = DEFAULT_MAX,
  accept = DEFAULT_ACCEPT,
  initialPreviewUrl,
  className,
  'aria-label': ariaLabel = 'Profile image uploader',
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialPreviewUrl);

  const validateFile = useCallback((file: File): string | null => {
    if (!accept.includes(file.type)) {
      return `Unsupported file type. Allowed: ${accept.join(', ')}`;
    }
    if (file.size > maxSizeBytes) {
      const mb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      return `File too large. Max ${mb}MB`;
    }
    return null;
  }, [accept, maxSizeBytes]);

  const handleFiles = useCallback((files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    const file = files[0];
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onSelect(file);
  }, [onSelect, validateFile]);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;
    const dt = event.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleFiles(dt.files);
      dt.clearData();
    }
  }, [disabled, handleFiles]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onClickBrowse = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  return (
    <div className={`profile-picture-upload ${className || ''}`.trim()}>
      <div
        className={`upload-zone ${isDragActive ? 'active' : ''}`.trim()}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        onClick={onClickBrowse}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClickBrowse(); }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: '2px dashed var(--border-color, #d1d5db)',
          borderRadius: 8,
          padding: '1.25rem',
          background: isDragActive ? 'var(--primary-light, #eff6ff)' : 'var(--surface-secondary, #f8fafc)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          aria-hidden
          tabIndex={-1}
          style={{ display: 'none' }}
          disabled={disabled}
          onChange={onChangeInput}
        />

        {previewUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={previewUrl}
              alt="Profile preview"
              style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light, #e2e8f0)' }}
            />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Change profile picture</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)' }}>Click or drag a new image here</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary, #6b7280)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📷</div>
            <div style={{ fontWeight: 600 }}>Drag & drop an image, or click to browse</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Max {(maxSizeBytes / (1024 * 1024)).toFixed(1)}MB · {accept.map(a => a.split('/')[1].toUpperCase()).join(', ')}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="form-error" style={{ marginTop: 8 }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
