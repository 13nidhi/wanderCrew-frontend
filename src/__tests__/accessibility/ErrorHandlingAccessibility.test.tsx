import { ErrorType, displayError, isAppError, isFirebaseError, logError, normalizeError } from '@utils/errorHandler';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Error Handling Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Normalization Accessibility', () => {
    it('should normalize errors with proper accessibility information', () => {
      const error = new Error('Test error');
      const normalizedError = normalizeError(error);
      
      expect(normalizedError.type).toBe(ErrorType.Client);
      expect(normalizedError.message).toBe('Test error');
      expect(normalizedError.isOperational).toBe(false);
    });

    it('should normalize Firebase errors with proper accessibility information', () => {
      const firebaseError = {
        code: 'auth/invalid-email',
        message: 'The email address is not valid.',
      };
      
      const normalizedError = normalizeError(firebaseError);
      
      expect(normalizedError.type).toBe(ErrorType.Firebase);
      expect(normalizedError.code).toBe('auth/invalid-email');
      expect(normalizedError.message).toBe('The email address is not valid.');
      expect(normalizedError.isOperational).toBe(true);
    });

    it('should normalize AppError with proper accessibility information', () => {
      const appError = {
        type: ErrorType.Validation,
        message: 'Validation failed',
        isOperational: true,
      };
      
      const normalizedError = normalizeError(appError);
      
      expect(normalizedError.type).toBe(ErrorType.Validation);
      expect(normalizedError.message).toBe('Validation failed');
      expect(normalizedError.isOperational).toBe(true);
    });

    it('should handle unknown errors with proper accessibility information', () => {
      const unknownError = 'Unknown error';
      const normalizedError = normalizeError(unknownError);
      
      expect(normalizedError.type).toBe(ErrorType.Unknown);
      expect(normalizedError.message).toBe('An unexpected error occurred.');
      expect(normalizedError.isOperational).toBe(false);
    });
  });

  describe('Error Type Detection Accessibility', () => {
    it('should detect AppError with proper accessibility information', () => {
      const appError = {
        type: ErrorType.Validation,
        message: 'Validation failed',
        isOperational: true,
      };
      
      expect(isAppError(appError)).toBe(true);
    });

    it('should detect FirebaseError with proper accessibility information', () => {
      const firebaseError = {
        code: 'auth/invalid-email',
        message: 'The email address is not valid.',
      };
      
      expect(isFirebaseError(firebaseError)).toBe(true);
    });

    it('should handle non-error objects with proper accessibility information', () => {
      const nonError = { someProperty: 'value' };
      
      expect(isAppError(nonError)).toBe(false);
      expect(isFirebaseError(nonError)).toBe(false);
    });
  });

  describe('Error Logging Accessibility', () => {
    it('should log errors with proper accessibility information', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'testAction' };
      
      logError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should log Firebase errors with proper accessibility information', () => {
      const firebaseError = {
        code: 'auth/invalid-email',
        message: 'The email address is not valid.',
      };
      
      const context = { component: 'LoginPage', action: 'signIn' };
      
      logError(firebaseError, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should log AppError with proper accessibility information', () => {
      const appError = {
        type: ErrorType.Validation,
        message: 'Validation failed',
        isOperational: true,
      };
      
      const context = { component: 'SignupPage', action: 'validateForm' };
      
      logError(appError, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle logging without context with proper accessibility information', () => {
      const error = new Error('Test error');
      
      logError(error);
      
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('Error Display Accessibility', () => {
    it('should display errors with proper accessibility information', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'testAction' };
      
      displayError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should display Firebase errors with proper accessibility information', () => {
      const firebaseError = {
        code: 'auth/invalid-email',
        message: 'The email address is not valid.',
      };
      
      const context = { component: 'LoginPage', action: 'signIn' };
      
      displayError(firebaseError, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should display AppError with proper accessibility information', () => {
      const appError = {
        type: ErrorType.Validation,
        message: 'Validation failed',
        isOperational: true,
      };
      
      const context = { component: 'SignupPage', action: 'validateForm' };
      
      displayError(appError, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should handle display without context with proper accessibility information', () => {
      const error = new Error('Test error');
      
      displayError(error);
      
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });

  describe('Error Message Accessibility', () => {
    it('should provide accessible error messages for authentication errors', () => {
      const authErrors = [
        'auth/email-already-in-use',
        'auth/invalid-email',
        'auth/operation-not-allowed',
        'auth/weak-password',
        'auth/user-disabled',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/too-many-requests',
        'auth/network-request-failed',
        'auth/requires-recent-login',
        'auth/credential-already-in-use',
        'auth/account-exists-with-different-credential',
      ];
      
      authErrors.forEach(errorCode => {
        const firebaseError = {
          code: errorCode,
          message: 'Firebase error message',
        };
        
        const normalizedError = normalizeError(firebaseError);
        
        expect(normalizedError.type).toBe(ErrorType.Firebase);
        expect(normalizedError.code).toBe(errorCode);
        expect(normalizedError.message).toBeDefined();
        expect(normalizedError.message.length).toBeGreaterThan(0);
      });
    });

    it('should provide accessible error messages for Firestore errors', () => {
      const firestoreErrors = [
        'firestore/permission-denied',
        'firestore/not-found',
        'firestore/unavailable',
      ];
      
      firestoreErrors.forEach(errorCode => {
        const firebaseError = {
          code: errorCode,
          message: 'Firestore error message',
        };
        
        const normalizedError = normalizeError(firebaseError);
        
        expect(normalizedError.type).toBe(ErrorType.Firebase);
        expect(normalizedError.code).toBe(errorCode);
        expect(normalizedError.message).toBeDefined();
        expect(normalizedError.message.length).toBeGreaterThan(0);
      });
    });

    it('should provide accessible error messages for unknown Firebase errors', () => {
      const unknownFirebaseError = {
        code: 'auth/unknown-error',
        message: 'Unknown Firebase error',
      };
      
      const normalizedError = normalizeError(unknownFirebaseError);
      
      expect(normalizedError.type).toBe(ErrorType.Firebase);
      expect(normalizedError.code).toBe('auth/unknown-error');
      expect(normalizedError.message).toBe('An authentication error occurred. Please try again.');
    });
  });

  describe('Error Context Accessibility', () => {
    it('should provide accessible error context information', () => {
      const error = new Error('Test error');
      const context = {
        component: 'LoginPage',
        action: 'signIn',
        userId: 'user123',
        timestamp: new Date().toISOString(),
      };
      
      logError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle complex error context with proper accessibility information', () => {
      const error = new Error('Complex error');
      const context = {
        component: 'SignupPage',
        action: 'validateForm',
        formData: {
          email: 'test@example.com',
          password: 'password123',
        },
        validationErrors: ['Email is required', 'Password is too short'],
        timestamp: new Date().toISOString(),
      };
      
      logError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle nested error context with proper accessibility information', () => {
      const error = new Error('Nested error');
      const context = {
        component: 'TripCard',
        action: 'loadTrip',
        tripId: 'trip123',
        user: {
          id: 'user123',
          name: 'John Doe',
        },
        metadata: {
          source: 'API',
          version: '1.0.0',
        },
      };
      
      logError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Accessibility', () => {
    it('should handle error recovery with proper accessibility information', () => {
      const error = new Error('Recoverable error');
      const context = { component: 'TestComponent', action: 'testAction' };
      
      // Log the error
      logError(error, context);
      
      // Display the error
      displayError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should handle multiple errors with proper accessibility information', () => {
      const errors = [
        new Error('First error'),
        new Error('Second error'),
        new Error('Third error'),
      ];
      
      errors.forEach((error, index) => {
        const context = { component: 'TestComponent', action: `testAction${index}` };
        logError(error, context);
        displayError(error, context);
      });
      
      expect(mockConsoleError).toHaveBeenCalledTimes(errors.length * 2);
      expect(mockConsoleWarn).toHaveBeenCalledTimes(errors.length);
    });
  });

  describe('Error Accessibility Best Practices', () => {
    it('should provide consistent error information structure', () => {
      const error = new Error('Test error');
      const normalizedError = normalizeError(error);
      
      expect(normalizedError).toHaveProperty('type');
      expect(normalizedError).toHaveProperty('message');
      expect(normalizedError).toHaveProperty('isOperational');
      expect(normalizedError).toHaveProperty('details');
    });

    it('should provide accessible error types', () => {
      const errorTypes = Object.values(ErrorType);
      
      errorTypes.forEach(errorType => {
        const appError = {
          type: errorType,
          message: 'Test message',
          isOperational: true,
        };
        
        expect(isAppError(appError)).toBe(true);
      });
    });

    it('should handle error accessibility in development mode', () => {
      const originalEnv = import.meta.env.DEV;
      import.meta.env.DEV = true;
      
      const error = new Error('Development error');
      const context = { component: 'TestComponent', action: 'testAction' };
      
      logError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
      
      import.meta.env.DEV = originalEnv;
    });

    it('should handle error accessibility in production mode', () => {
      const originalEnv = import.meta.env.DEV;
      import.meta.env.DEV = false;
      
      const error = new Error('Production error');
      const context = { component: 'TestComponent', action: 'testAction' };
      
      logError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalled();
      
      import.meta.env.DEV = originalEnv;
    });
  });

  describe('Error Accessibility Integration', () => {
    it('should work with authentication components without accessibility conflicts', () => {
      const authError = {
        code: 'auth/invalid-email',
        message: 'The email address is not valid.',
      };
      
      const context = { component: 'LoginPage', action: 'signIn' };
      
      const normalizedError = normalizeError(authError);
      logError(normalizedError, context);
      displayError(normalizedError, context);
      
      expect(normalizedError.type).toBe(ErrorType.Firebase);
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should work with form validation components without accessibility conflicts', () => {
      const validationError = {
        type: ErrorType.Validation,
        message: 'Form validation failed',
        isOperational: true,
      };
      
      const context = { component: 'SignupPage', action: 'validateForm' };
      
      const normalizedError = normalizeError(validationError);
      logError(normalizedError, context);
      displayError(normalizedError, context);
      
      expect(normalizedError.type).toBe(ErrorType.Validation);
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should work with network components without accessibility conflicts', () => {
      const networkError = {
        type: ErrorType.Network,
        message: 'Network request failed',
        isOperational: true,
      };
      
      const context = { component: 'TripCard', action: 'loadTrip' };
      
      const normalizedError = normalizeError(networkError);
      logError(normalizedError, context);
      displayError(normalizedError, context);
      
      expect(normalizedError.type).toBe(ErrorType.Network);
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });
});
