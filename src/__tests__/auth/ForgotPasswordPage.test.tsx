import { AuthProvider } from '@contexts/AuthContext';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the AuthContext
const mockResetPassword = vi.fn();
const mockAuthContext = {
  user: null,
  firebaseUser: null,
  isLoading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  resetPassword: mockResetPassword,
};

vi.mock('@contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => mockAuthContext,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
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

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders forgot password form with email field', () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email field', async () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('calls resetPassword with correct email on valid form submission', async () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success message after successful password reset', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/a password reset link has been sent to/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });

  it('shows error message on password reset failure', async () => {
    const errorMessage = 'User not found';
    mockResetPassword.mockRejectedValueOnce(new Error(errorMessage));
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password reset failed: user not found/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during password reset', async () => {
    mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/sending link/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('has link to login page', () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows back to login link after successful reset', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const backToLoginLink = screen.getByRole('link', { name: /back to login/i });
      expect(backToLoginLink).toHaveAttribute('href', '/login');
    });
  });

  it('clears field errors when user starts typing', async () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    // Trigger validation error
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    
    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });

  it('disables form after successful submission', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    
    renderWithProviders(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/a password reset link has been sent to/i)).toBeInTheDocument();
    });
    
    // Form should be disabled after success
    expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
  });
});

