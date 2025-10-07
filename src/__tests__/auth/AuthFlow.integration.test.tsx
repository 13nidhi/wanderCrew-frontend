import App from '@App';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Firebase Auth
const mockSignInWithEmail = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSendPasswordResetEmail = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();

vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signInWithEmailAndPassword: mockSignInWithEmail,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  doc: () => ({}),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: () => ({}),
}));

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_FIREBASE_API_KEY: 'test-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    VITE_FIREBASE_APP_ID: '1:123456789:web:abcdef',
    VITE_FIREBASE_MEASUREMENT_ID: 'G-ABCDEFGHIJ',
  },
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful auth state change
    mockOnAuthStateChanged.mockImplementation((callback) => {
      callback(null); // No user initially
      return () => {}; // Unsubscribe function
    });
  });

  describe('Login Flow', () => {
    it('should complete full login flow successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      mockSignInWithEmail.mockResolvedValueOnce({
        user: mockUser,
      });

      mockOnAuthStateChanged.mockImplementation((callback) => {
        // Simulate auth state change after login
        setTimeout(() => callback(mockUser), 100);
        return () => {};
      });

      renderApp();

      // Navigate to login page
      const loginLink = screen.getByRole('link', { name: /sign in/i });
      fireEvent.click(loginLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      });

      // Fill login form
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Verify login was called
      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });

      // Should redirect to dashboard after successful login
      await waitFor(() => {
        expect(screen.getByText(/welcome mate/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle login failure gracefully', async () => {
      const errorMessage = 'Invalid credentials';
      mockSignInWithEmail.mockRejectedValueOnce(new Error(errorMessage));

      renderApp();

      // Navigate to login page
      const loginLink = screen.getByRole('link', { name: /sign in/i });
      fireEvent.click(loginLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      });

      // Fill login form with invalid credentials
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/sign in failed: invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Signup Flow', () => {
    it('should complete full signup flow successfully', async () => {
      const mockUser = {
        uid: 'new-user-uid',
        email: 'newuser@example.com',
        displayName: 'New User',
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
        user: mockUser,
      });

      mockOnAuthStateChanged.mockImplementation((callback) => {
        // Simulate auth state change after signup
        setTimeout(() => callback(mockUser), 100);
        return () => {};
      });

      renderApp();

      // Navigate to signup page
      const signupLink = screen.getByRole('link', { name: /sign up/i });
      fireEvent.click(signupLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Fill signup form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'New User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      // Verify signup was called
      await waitFor(() => {
        expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'newuser@example.com',
          'Password123'
        );
      });

      // Should redirect to dashboard after successful signup
      await waitFor(() => {
        expect(screen.getByText(/welcome mate/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should validate password requirements', async () => {
      renderApp();

      // Navigate to signup page
      const signupLink = screen.getByRole('link', { name: /sign up/i });
      fireEvent.click(signupLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Fill form with weak password
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'New User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });
      fireEvent.click(submitButton);

      // Should show password validation errors
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Flow', () => {
    it('should complete password reset flow successfully', async () => {
      mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);

      renderApp();

      // Navigate to login page first
      const loginLink = screen.getByRole('link', { name: /sign in/i });
      fireEvent.click(loginLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      });

      // Navigate to forgot password
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i });
      fireEvent.click(forgotPasswordLink);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill forgot password form
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      // Verify password reset was called
      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com'
        );
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/a password reset link has been sent to/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate between auth pages correctly', async () => {
      renderApp();

      // Start at login page
      const loginLink = screen.getByRole('link', { name: /sign in/i });
      fireEvent.click(loginLink);

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      // Navigate to signup
      const signupLink = screen.getByRole('link', { name: /sign up here/i });
      fireEvent.click(signupLink);

      await waitFor(() => {
        expect(screen.getByText(/join wandercrew/i)).toBeInTheDocument();
      });

      // Navigate back to login
      const backToLoginLink = screen.getByRole('link', { name: /sign in/i });
      fireEvent.click(backToLoginLink);

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      // Navigate to forgot password
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i });
      fireEvent.click(forgotPasswordLink);

      await waitFor(() => {
        expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
      });
    });
  });
});

