import React, { type ReactNode } from 'react';
import './AuthForm.css';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'url';
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
}

export interface AuthFormProps {
  title: string;
  subtitle: string;
  fields: FormField[];
  submitText: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  footer?: ReactNode;
  generalError?: string;
  className?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  fields,
  submitText,
  isLoading,
  onSubmit,
  footer,
  generalError,
  className = ''
}) => {
  return (
    <div className={`auth-container ${className}`}>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        
        {generalError && (
          <div className="auth-error-general" role="alert">
            {generalError}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="auth-form" noValidate>
          {fields.map((field) => (
            <div key={field.id} className="form-group">
              <label htmlFor={field.id} className="form-label">
                {field.label}
                {field.required && <span className="form-required">*</span>}
              </label>
              <input
                id={field.id}
                name={field.name}
                type={field.type}
                value={field.value}
                onChange={field.onChange}
                className={`form-input ${field.error ? 'form-input-error' : ''}`}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                disabled={field.disabled || isLoading}
                aria-describedby={field.error ? `${field.id}-error` : undefined}
                required={field.required}
              />
              {field.error && (
                <span id={`${field.id}-error`} className="form-error" role="alert">
                  {field.error}
                </span>
              )}
            </div>
          ))}
          
          <button 
            type="submit" 
            className={`auth-button ${isLoading ? 'auth-button-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="auth-button-spinner" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              submitText
            )}
          </button>
        </form>
        
        {footer && (
          <div className="auth-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
