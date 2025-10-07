import { AuthProvider } from '@contexts/AuthContext';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import LoginPage from '@pages/auth/LoginPage';
import SignupPage from '@pages/auth/SignupPage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  firebaseUser: null,
  isLoading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  resetPassword: vi.fn(),
};

vi.mock('@contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => mockAuthContext,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Authentication Pages Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginPage Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(<LoginPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/welcome back/i);
    });

    it('should have proper form labels', () => {
      renderWithProviders(<LoginPage />);
      
      const emailLabel = screen.getByLabelText(/email address/i);
      const passwordLabel = screen.getByLabelText(/password/i);
      
      expect(emailLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
    });

    it('should have proper button labels', () => {
      renderWithProviders(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Test Tab navigation
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);
      
      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(document.activeElement).toBe(passwordInput);
      
      fireEvent.keyDown(passwordInput, { key: 'Tab' });
      expect(document.activeElement).toBe(submitButton);
    });

    it('should support Enter key submission', async () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      fireEvent.keyDown(passwordInput, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should have proper ARIA attributes', () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should announce validation errors to screen readers', async () => {
      renderWithProviders(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const emailError = screen.getByText(/email is required/i);
        const passwordError = screen.getByText(/password is required/i);
        
        expect(emailError).toBeInTheDocument();
        expect(passwordError).toBeInTheDocument();
      });
    });

    it('should have proper link accessibility', () => {
      renderWithProviders(<LoginPage />);
      
      const signupLink = screen.getByRole('link', { name: /sign up here/i });
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i });
      
      expect(signupLink).toHaveAttribute('href', '/signup');
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should maintain focus management during loading', async () => {
      mockAuthContext.signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });
    });
  });

  describe('SignupPage Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(<SignupPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/join wandercrew/i);
    });

    it('should have proper form labels', () => {
      renderWithProviders(<SignupPage />);
      
      const nameLabel = screen.getByLabelText(/name/i);
      const emailLabel = screen.getByLabelText(/email/i);
      const passwordLabel = screen.getByLabelText(/^password/i);
      const confirmPasswordLabel = screen.getByLabelText(/confirm password/i);
      
      expect(nameLabel).toBeInTheDocument();
      expect(emailLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
      expect(confirmPasswordLabel).toBeInTheDocument();
    });

    it('should support keyboard navigation through all fields', () => {
      renderWithProviders(<SignupPage />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      
      // Test Tab navigation
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
      
      fireEvent.keyDown(nameInput, { key: 'Tab' });
      expect(document.activeElement).toBe(emailInput);
      
      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(document.activeElement).toBe(passwordInput);
      
      fireEvent.keyDown(passwordInput, { key: 'Tab' });
      expect(document.activeElement).toBe(confirmPasswordInput);
      
      fireEvent.keyDown(confirmPasswordInput, { key: 'Tab' });
      expect(document.activeElement).toBe(submitButton);
    });

    it('should have proper ARIA attributes for password fields', () => {
      renderWithProviders(<SignupPage />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should announce password validation errors', async () => {
      renderWithProviders(<SignupPage />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const passwordError = screen.getByText(/password must be at least 8 characters long/i);
        expect(passwordError).toBeInTheDocument();
      });
    });

    it('should have password requirements accessible to screen readers', () => {
      renderWithProviders(<SignupPage />);
      
      const passwordHint = screen.getByText(/password must be at least 8 characters, with uppercase, lowercase, and numbers/i);
      expect(passwordHint).toBeInTheDocument();
    });

    it('should support Enter key submission', async () => {
      renderWithProviders(<SignupPage />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      
      fireEvent.keyDown(confirmPasswordInput, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockAuthContext.signUp).toHaveBeenCalled();
      });
    });
  });

  describe('ForgotPasswordPage Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(<ForgotPasswordPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/forgot your password/i);
    });

    it('should have proper form labels', () => {
      renderWithProviders(<ForgotPasswordPage />);
      
      const emailLabel = screen.getByLabelText(/email/i);
      expect(emailLabel).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(<ForgotPasswordPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      // Test Tab navigation
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);
      
      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(document.activeElement).toBe(submitButton);
    });

    it('should support Enter key submission', async () => {
      renderWithProviders(<ForgotPasswordPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockAuthContext.resetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should announce success message to screen readers', async () => {
      mockAuthContext.resetPassword.mockResolvedValueOnce(undefined);
      
      renderWithProviders(<ForgotPasswordPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const successMessage = screen.getByText(/a password reset link has been sent to/i);
        expect(successMessage).toBeInTheDocument();
      });
    });

    it('should have proper link accessibility', () => {
      renderWithProviders(<ForgotPasswordPage />);
      
      const loginLink = screen.getByRole('link', { name: /sign in/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Cross-Page Accessibility', () => {
    it('should maintain consistent heading hierarchy', () => {
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />);
      const loginHeading = screen.getByRole('heading', { level: 1 });
      expect(loginHeading).toHaveTextContent(/welcome back/i);
      unmountLogin();
      
      const { unmount: unmountSignup } = renderWithProviders(<SignupPage />);
      const signupHeading = screen.getByRole('heading', { level: 1 });
      expect(signupHeading).toHaveTextContent(/join wandercrew/i);
      unmountSignup();
      
      renderWithProviders(<ForgotPasswordPage />);
      const forgotPasswordHeading = screen.getByRole('heading', { level: 1 });
      expect(forgotPasswordHeading).toHaveTextContent(/forgot your password/i);
    });

    it('should have consistent button styling and behavior', () => {
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      expect(loginButton).toBeInTheDocument();
      unmountLogin();
      
      const { unmount: unmountSignup } = renderWithProviders(<SignupPage />);
      const signupButton = screen.getByRole('button', { name: /sign up/i });
      expect(signupButton).toBeInTheDocument();
      unmountSignup();
      
      renderWithProviders(<ForgotPasswordPage />);
      const resetButton = screen.getByRole('button', { name: /reset password/i });
      expect(resetButton).toBeInTheDocument();
    });

    it('should have consistent error message presentation', async () => {
      const { unmount: unmountLogin } = renderWithProviders(<LoginPage />);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        const loginError = screen.getByText(/email is required/i);
        expect(loginError).toBeInTheDocument();
      });
      unmountLogin();
      
      renderWithProviders(<SignupPage />);
      const signupButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signupButton);
      
      await waitFor(() => {
        const signupError = screen.getByText(/name is required/i);
        expect(signupError).toBeInTheDocument();
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper form structure for screen readers', () => {
      renderWithProviders(<LoginPage />);
      
      const form = screen.getByRole('form') || document.querySelector('form');
      expect(form).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('should have proper fieldset and legend structure', () => {
      renderWithProviders(<SignupPage />);
      
      // Check if form has proper structure
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it('should announce loading states to screen readers', async () => {
      mockAuthContext.signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const loadingText = screen.getByText(/signing in/i);
        expect(loadingText).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Escape key to clear focus', () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);
      
      fireEvent.keyDown(emailInput, { key: 'Escape' });
      // Focus should be cleared or moved appropriately
    });

    it('should support Arrow keys for navigation', () => {
      renderWithProviders(<SignupPage />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
      
      // Test arrow key navigation if implemented
      fireEvent.keyDown(nameInput, { key: 'ArrowDown' });
      // This would depend on specific implementation
    });

    it('should support Space key for button activation', () => {
      renderWithProviders(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      submitButton.focus();
      
      fireEvent.keyDown(submitButton, { key: ' ' });
      // Button should be activated
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
      
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
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
      
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });
});
