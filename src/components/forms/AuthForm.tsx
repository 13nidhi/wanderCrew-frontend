import { LoadingButton } from '@components/common';
import React, { useCallback, useMemo, useState } from 'react';

// Form field types
export type AuthFormField = {
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
};

// Form configuration types
export type AuthFormConfig = {
  title: string;
  subtitle: string;
  fields: AuthFormField[];
  submitText: string;
  loadingText: string;
  footerText?: string;
  footerLink?: {
    text: string;
    to: string;
  };
  additionalActions?: React.ReactNode;
};

// Form data interface
export interface AuthFormData {
  [key: string]: string;
}

// Form errors interface
export interface AuthFormErrors {
  [key: string]: string;
}

// Props interface
interface AuthFormProps {
  config: AuthFormConfig;
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  showPasswordStrength?: boolean;
  onFieldChange?: (field: string, value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// Password strength calculation
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Common patterns (reduce score)
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 1; // Common sequences
  
  const strengthLevels = [
    { score: 0, label: 'Very Weak', color: '#ff4444' },
    { score: 1, label: 'Weak', color: '#ff8800' },
    { score: 2, label: 'Fair', color: '#ffaa00' },
    { score: 3, label: 'Good', color: '#88cc00' },
    { score: 4, label: 'Strong', color: '#44aa44' },
    { score: 5, label: 'Very Strong', color: '#00aa44' },
  ];
  
  const level = strengthLevels[Math.min(score, strengthLevels.length - 1)];
  return { score, ...level };
};

// Field validation function
const validateField = (field: AuthFormField, value: string): string | null => {
  if (field.required && !value.trim()) {
    return `${field.label} is required`;
  }
  
  if (!value.trim()) return null; // Skip validation for empty optional fields
  
  // Type-specific validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
  }
  
  // Length validation
  if (field.validation?.minLength && value.length < field.validation.minLength) {
    return `${field.label} must be at least ${field.validation.minLength} characters`;
  }
  
  if (field.validation?.maxLength && value.length > field.validation.maxLength) {
    return `${field.label} must be no more than ${field.validation.maxLength} characters`;
  }
  
  // Pattern validation
  if (field.validation?.pattern && !field.validation.pattern.test(value)) {
    return `${field.label} format is invalid`;
  }
  
  // Custom validation
  if (field.validation?.custom) {
    return field.validation.custom(value);
  }
  
  return null;
};

// Password confirmation validation
const validatePasswordConfirmation = (password: string, confirmPassword: string): string | null => {
  if (confirmPassword && password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

const AuthForm: React.FC<AuthFormProps> = ({
  config,
  onSubmit,
  isLoading = false,
  className = '',
  showPasswordStrength = false,
  onFieldChange,
  onValidationChange,
}) => {
  // Form state
  const [formData, setFormData] = useState<AuthFormData>({});
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  // Initialize form data
  const initialFormData = useMemo(() => {
    const data: AuthFormData = {};
    config.fields.forEach(field => {
      data[field.name] = '';
    });
    return data;
  }, [config.fields]);

  // Reset form data when config changes
  React.useEffect(() => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setShowPasswords({});
  }, [initialFormData]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: AuthFormErrors = {};
    let isValid = true;

    config.fields.forEach(field => {
      const value = formData[field.name] || '';
      const fieldError = validateField(field, value);
      
      if (fieldError) {
        newErrors[field.name] = fieldError;
        isValid = false;
      }
    });

    // Special validation for password confirmation
    const passwordField = config.fields.find(f => f.name === 'password');
    const confirmPasswordField = config.fields.find(f => f.name === 'confirmPassword');
    
    if (passwordField && confirmPasswordField) {
      const passwordError = validatePasswordConfirmation(
        formData.password || '',
        formData.confirmPassword || ''
      );
      
      if (passwordError) {
        newErrors.confirmPassword = passwordError;
        isValid = false;
      }
    }

    setErrors(newErrors);
    onValidationChange?.(isValid);
    return isValid;
  }, [formData, config.fields, onValidationChange]);

  // Handle field changes
  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    onFieldChange?.(fieldName, value);

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }

    // Mark field as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, [errors, onFieldChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const field = config.fields.find(f => f.name === fieldName);
    if (field) {
      const value = formData[fieldName] || '';
      const fieldError = validateField(field, value);
      
      if (fieldError) {
        setErrors(prev => ({ ...prev, [fieldName]: fieldError }));
      }
    }
  }, [formData, config.fields]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    config.fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    }
  }, [formData, validateForm, onSubmit, config.fields]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((fieldName: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  }, []);

  // Get password strength for password fields
  const getPasswordStrength = useCallback((fieldName: string) => {
    if (!showPasswordStrength || fieldName !== 'password') return null;
    const password = formData[fieldName] || '';
    return calculatePasswordStrength(password);
  }, [formData, showPasswordStrength]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0 && 
           config.fields.every(field => {
             if (field.required) {
               return formData[field.name]?.trim();
             }
             return true;
           });
  }, [errors, formData, config.fields]);

  return (
    <div className={`auth-form-container ${className}`}>
      <div className="auth-form-header">
        <h1 className="auth-form-title">{config.title}</h1>
        <p className="auth-form-subtitle">{config.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {config.fields.map((field) => {
          const fieldError = errors[field.name];
          const isTouched = touched[field.name];
          const showError = isTouched && fieldError;
          const isPasswordField = field.type === 'password';
          const showPassword = showPasswords[field.name];
          const passwordStrength = getPasswordStrength(field.name);

          return (
            <div key={field.name} className="auth-form-field">
              <label htmlFor={field.name} className="auth-form-label">
                {field.label}
                {field.required && <span className="required-asterisk">*</span>}
              </label>
              
              <div className="auth-form-input-container">
                <input
                  id={field.name}
                  name={field.name}
                  type={isPasswordField && !showPassword ? 'password' : field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  onBlur={() => handleFieldBlur(field.name)}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  className={`auth-form-input ${showError ? 'error' : ''}`}
                  disabled={isLoading}
                  aria-invalid={showError}
                  aria-describedby={showError ? `${field.name}-error` : undefined}
                />
                
                {isPasswordField && (
                  <button
                    type="button"
                    className="auth-form-password-toggle"
                    onClick={() => togglePasswordVisibility(field.name)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                )}
              </div>

              {showError && (
                <div id={`${field.name}-error`} className="auth-form-error" role="alert">
                  {fieldError}
                </div>
              )}

              {passwordStrength && formData[field.name] && (
                <div className="auth-form-password-strength">
                  <div className="password-strength-bar">
                    <div 
                      className="password-strength-fill"
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                  <span 
                    className="password-strength-label"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {config.additionalActions && (
          <div className="auth-form-additional-actions">
            {config.additionalActions}
          </div>
        )}

        <LoadingButton
          type="submit"
          loading={isLoading}
          loadingText={config.loadingText}
          className="auth-form-submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={!isFormValid}
        >
          {config.submitText}
        </LoadingButton>
      </form>

      {config.footerText && (
        <div className="auth-form-footer">
          <p className="auth-form-footer-text">
            {config.footerText}
            {config.footerLink && (
              <a href={config.footerLink.to} className="auth-form-footer-link">
                {config.footerLink.text}
              </a>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthForm;