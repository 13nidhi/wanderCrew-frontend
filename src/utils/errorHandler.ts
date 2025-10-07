// Comprehensive error handling utilities

export interface ErrorInfo {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
  context?: string;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
  context?: string;
}

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

// Error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  // Firebase Auth errors
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
  'auth/invalid-credential': 'Invalid login credentials.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  
  // Generic errors
  'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'PERMISSION_ERROR': 'You do not have permission to perform this action.',
  'NOT_FOUND_ERROR': 'The requested resource was not found.',
  'SERVER_ERROR': 'Server error occurred. Please try again later.',
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
};

// Parse error and extract useful information
export const parseError = (error: unknown): ErrorInfo => {
  const timestamp = new Date();
  
  if (error instanceof Error) {
    return {
      code: error.name || 'UNKNOWN_ERROR',
      message: error.message,
      timestamp,
      context: error.stack,
    };
  }
  
  if (typeof error === 'string') {
    return {
      code: 'STRING_ERROR',
      message: error,
      timestamp,
    };
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    return {
      code: (error as any).code || 'UNKNOWN_ERROR',
      message: (error as any).message || 'Unknown error occurred',
      details: error,
      timestamp,
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error,
    timestamp,
  };
};

// Get user-friendly error message
export const getErrorMessage = (error: unknown, fallback?: string): string => {
  const errorInfo = parseError(error);
  
  // Check for specific error codes
  if (ERROR_MESSAGES[errorInfo.code]) {
    return ERROR_MESSAGES[errorInfo.code];
  }
  
  // Check for Firebase auth errors
  if (errorInfo.code.startsWith('auth/')) {
    return ERROR_MESSAGES[errorInfo.code] || 'Authentication error occurred';
  }
  
  // Return custom message or fallback
  return errorInfo.message || fallback || 'An unexpected error occurred';
};

// Categorize error type
export const getErrorType = (error: unknown): ErrorType => {
  const errorInfo = parseError(error);
  
  if (errorInfo.code.startsWith('auth/')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (errorInfo.code.includes('network') || errorInfo.code.includes('NETWORK')) {
    return ErrorType.NETWORK;
  }
  
  if (errorInfo.code.includes('validation') || errorInfo.code.includes('VALIDATION')) {
    return ErrorType.VALIDATION;
  }
  
  if (errorInfo.code.includes('permission') || errorInfo.code.includes('PERMISSION')) {
    return ErrorType.PERMISSION;
  }
  
  if (errorInfo.code.includes('not-found') || errorInfo.code.includes('NOT_FOUND')) {
    return ErrorType.NOT_FOUND;
  }
  
  if (errorInfo.code.includes('server') || errorInfo.code.includes('SERVER')) {
    return ErrorType.SERVER;
  }
  
  return ErrorType.UNKNOWN;
};

// Handle error with options
export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = {}
): ErrorInfo => {
  const {
    showToast = true,
    logToConsole = true,
    fallbackMessage,
    context,
  } = options;
  
  const errorInfo = parseError(error);
  const userMessage = getErrorMessage(error, fallbackMessage);
  const errorType = getErrorType(error);
  
  // Add context if provided
  if (context) {
    errorInfo.context = context;
  }
  
  // Log to console in development
  if (logToConsole && process.env.NODE_ENV === 'development') {
    console.error('Error handled:', {
      ...errorInfo,
      userMessage,
      errorType,
    });
  }
  
  // Show toast notification (if toast system is available)
  if (showToast) {
    // This would integrate with a toast notification system
    // For now, we'll just log it
    console.warn('Toast notification:', userMessage);
  }
  
  return errorInfo;
};

// Create error handler for specific contexts
export const createErrorHandler = (context: string) => {
  return (error: unknown, options: Omit<ErrorHandlerOptions, 'context'> = {}) => {
    return handleError(error, { ...options, context });
  };
};

// Validation error handler
export const handleValidationError = (errors: Record<string, string>) => {
  const errorInfo: ErrorInfo = {
    code: 'VALIDATION_ERROR',
    message: 'Form validation failed',
    timestamp: new Date(),
    details: errors,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('Validation errors:', errors);
  }
  
  return errorInfo;
};

// Network error handler
export const handleNetworkError = (error: unknown) => {
  return handleError(error, {
    fallbackMessage: 'Network connection failed. Please check your internet connection.',
    context: 'NETWORK',
  });
};

// Authentication error handler
export const handleAuthError = (error: unknown) => {
  return handleError(error, {
    fallbackMessage: 'Authentication failed. Please check your credentials.',
    context: 'AUTHENTICATION',
  });
};

// Retry mechanism for network errors
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Error boundary error handler
export const handleErrorBoundaryError = (error: Error, errorInfo: React.ErrorInfo) => {
  const errorDetails: ErrorInfo = {
    code: 'REACT_ERROR_BOUNDARY',
    message: error.message,
    timestamp: new Date(),
    context: `Component: ${errorInfo.componentStack}`,
    details: {
      error: error.toString(),
      errorInfo,
    },
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary caught error:', errorDetails);
  }
  
  return errorDetails;
};
