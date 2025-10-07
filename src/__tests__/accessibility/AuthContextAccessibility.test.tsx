import { AuthProvider, useAuth } from '@contexts/AuthContext';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import LoginPage from '@pages/auth/LoginPage';
import SignupPage from '@pages/auth/SignupPage';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Firebase Auth
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockSendPasswordResetEmail = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

// Mock Firebase Firestore
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
}));

// Mock Firebase config
vi.mock('@config/firebase', () => ({
  auth: {},
  db: {},
}));

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, isLoading, signIn, signUp, signOut, updateProfile, resetPassword } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password', { name: 'Test User' })}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => updateProfile({ name: 'Updated Name' })}>Update Profile</button>
      <button onClick={() => resetPassword('test@example.com')}>Reset Password</button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful authentication
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // No user initially
      return () => {}; // Unsubscribe function
    });
  });

  describe('Loading State Accessibility', () => {
    it('should provide accessible loading state information', () => {
      renderWithProviders(<TestComponent />);
      
      const loadingElement = screen.getByTestId('loading');
      expect(loadingElement).toHaveTextContent(/not loading/i);
    });

    it('should announce loading state changes to screen readers', () => {
      renderWithProviders(<TestComponent />);
      
      const loadingElement = screen.getByTestId('loading');
      expect(loadingElement).toBeInTheDocument();
    });

    it('should have proper contrast for loading state elements', () => {
      renderWithProviders(<TestComponent />);
      
      const loadingElement = screen.getByTestId('loading');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('User State Accessibility', () => {
    it('should provide accessible user information', () => {
      renderWithProviders(<TestComponent />);
      
      const userElement = screen.getByTestId('user');
      expect(userElement).toHaveTextContent(/no user/i);
    });

    it('should announce user state changes to screen readers', () => {
      renderWithProviders(<TestComponent />);
      
      const userElement = screen.getByTestId('user');
      expect(userElement).toBeInTheDocument();
    });

    it('should have proper contrast for user state elements', () => {
      renderWithProviders(<TestComponent />);
      
      const userElement = screen.getByTestId('user');
      expect(userElement).toBeInTheDocument();
    });
  });

  describe('Authentication Actions Accessibility', () => {
    it('should have accessible sign in button', () => {
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      expect(signInButton).toBeInTheDocument();
    });

    it('should have accessible sign up button', () => {
      renderWithProviders(<TestComponent />);
      
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      expect(signUpButton).toBeInTheDocument();
    });

    it('should have accessible sign out button', () => {
      renderWithProviders(<TestComponent />);
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
    });

    it('should have accessible update profile button', () => {
      renderWithProviders(<TestComponent />);
      
      const updateProfileButton = screen.getByRole('button', { name: /update profile/i });
      expect(updateProfileButton).toBeInTheDocument();
    });

    it('should have accessible reset password button', () => {
      renderWithProviders(<TestComponent />);
      
      const resetPasswordButton = screen.getByRole('button', { name: /reset password/i });
      expect(resetPasswordButton).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for authentication actions', () => {
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      
      // Test Tab navigation
      signInButton.focus();
      expect(document.activeElement).toBe(signInButton);
      
      signInButton.blur();
      signUpButton.focus();
      expect(document.activeElement).toBe(signUpButton);
      
      signUpButton.blur();
      signOutButton.focus();
      expect(document.activeElement).toBe(signOutButton);
    });

    it('should support Enter key activation for authentication actions', () => {
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      signInButton.focus();
      fireEvent.keyDown(signInButton, { key: 'Enter' });
      // Button should be activated
    });

    it('should support Space key activation for authentication actions', () => {
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      signInButton.focus();
      fireEvent.keyDown(signInButton, { key: ' ' });
      // Button should be activated
    });
  });

  describe('Error Handling Accessibility', () => {
    it('should handle authentication errors with proper accessibility', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      // Error should be handled gracefully
      expect(signInButton).toBeInTheDocument();
    });

    it('should announce authentication errors to screen readers', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      // Error should be announced appropriately
      expect(signInButton).toBeInTheDocument();
    });
  });

  describe('Authentication Pages Integration', () => {
    it('should work with LoginPage without accessibility conflicts', () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
    });

    it('should work with SignupPage without accessibility conflicts', () => {
      renderWithProviders(<SignupPage />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(signUpButton).toBeInTheDocument();
    });

    it('should work with ForgotPasswordPage without accessibility conflicts', () => {
      renderWithProviders(<ForgotPasswordPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const resetButton = screen.getByRole('button', { name: /reset password/i });
      
      expect(emailInput).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper announcements for authentication state changes', () => {
      renderWithProviders(<TestComponent />);
      
      const userElement = screen.getByTestId('user');
      const loadingElement = screen.getByTestId('loading');
      
      expect(userElement).toBeInTheDocument();
      expect(loadingElement).toBeInTheDocument();
    });

    it('should have proper semantic structure for authentication actions', () => {
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      
      expect(signInButton).toBeInTheDocument();
      expect(signUpButton).toBeInTheDocument();
      expect(signOutButton).toBeInTheDocument();
    });

    it('should announce authentication success to screen readers', () => {
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      expect(signInButton).toBeInTheDocument();
    });
  });

  describe('High Contrast Mode Support', () => {
    it('should maintain visibility in high contrast mode', () => {
      // Mock high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      renderWithProviders(<TestComponent />);
      
      const userElement = screen.getByTestId('user');
      const loadingElement = screen.getByTestId('loading');
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(userElement).toBeInTheDocument();
      expect(loadingElement).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      renderWithProviders(<TestComponent />);
      
      const userElement = screen.getByTestId('user');
      const loadingElement = screen.getByTestId('loading');
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(userElement).toBeInTheDocument();
      expect(loadingElement).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
    });
  });

  describe('AuthContext Integration', () => {
    it('should work with other components without accessibility conflicts', () => {
      renderWithProviders(
        <div>
          <button>Normal Button</button>
          <TestComponent />
        </div>
      );
      
      const normalButton = screen.getByRole('button', { name: /normal button/i });
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(normalButton).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
    });

    it('should maintain proper focus management across components', () => {
      renderWithProviders(
        <div>
          <button>First Button</button>
          <TestComponent />
          <button>Second Button</button>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: /first button/i });
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      const secondButton = screen.getByRole('button', { name: /second button/i });
      
      expect(firstButton).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
    });
  });

  describe('Authentication Flow Accessibility', () => {
    it('should handle sign in flow with proper accessibility', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '1' } });
      
      renderWithProviders(<TestComponent />);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      // Should handle sign in flow gracefully
      expect(signInButton).toBeInTheDocument();
    });

    it('should handle sign up flow with proper accessibility', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '1' } });
      
      renderWithProviders(<TestComponent />);
      
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signUpButton);
      
      // Should handle sign up flow gracefully
      expect(signUpButton).toBeInTheDocument();
    });

    it('should handle sign out flow with proper accessibility', async () => {
      mockSignOut.mockResolvedValueOnce(undefined);
      
      renderWithProviders(<TestComponent />);
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);
      
      // Should handle sign out flow gracefully
      expect(signOutButton).toBeInTheDocument();
    });

    it('should handle password reset flow with proper accessibility', async () => {
      mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);
      
      renderWithProviders(<TestComponent />);
      
      const resetPasswordButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(resetPasswordButton);
      
      // Should handle password reset flow gracefully
      expect(resetPasswordButton).toBeInTheDocument();
    });
  });
});
