import ErrorBoundary from '@components/common/ErrorBoundary';
import LoadingButton from '@components/common/LoadingButton';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ProtectedRoute from '@components/common/ProtectedRoute';
import ResponsiveWrapper from '@components/common/ResponsiveWrapper';
import { AuthProvider } from '@contexts/AuthContext';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import LoginPage from '@pages/auth/LoginPage';
import SignupPage from '@pages/auth/SignupPage';
import { fireEvent, render, screen } from '@testing-library/react';
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

// Mock the useResponsive hook
const mockUseResponsive = vi.fn();
const mockUseResponsiveValue = vi.fn();

vi.mock('@hooks/useResponsive', () => ({
  useResponsive: mockUseResponsive,
  useResponsiveValue: mockUseResponsiveValue,
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
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
  };
});

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Test component
const TestComponent = () => <div>Protected Content</div>;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Accessibility Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock values
    mockUseResponsive.mockReturnValue({
      breakpoint: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLargeDesktop: false,
    });
    
    mockUseResponsiveValue.mockReturnValue('default content');
  });

  describe('Authentication Pages Integration', () => {
    it('should work with LoginPage and responsive components without accessibility conflicts', () => {
      renderWithProviders(
        <ResponsiveWrapper>
          <LoginPage />
        </ResponsiveWrapper>
      );
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
    });

    it('should work with SignupPage and loading components without accessibility conflicts', () => {
      renderWithProviders(
        <div>
          <SignupPage />
          <LoadingButton loading={false}>
            Additional Action
          </LoadingButton>
        </div>
      );
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      const additionalButton = screen.getByRole('button', { name: /additional action/i });
      
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(signUpButton).toBeInTheDocument();
      expect(additionalButton).toBeInTheDocument();
    });

    it('should work with ForgotPasswordPage and error boundary without accessibility conflicts', () => {
      renderWithProviders(
        <ErrorBoundary>
          <ForgotPasswordPage />
        </ErrorBoundary>
      );
      
      const emailInput = screen.getByLabelText(/email/i);
      const resetButton = screen.getByRole('button', { name: /reset password/i });
      
      expect(emailInput).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('Loading Components Integration', () => {
    it('should work with LoadingButton and responsive wrapper without accessibility conflicts', () => {
      renderWithProviders(
        <ResponsiveWrapper>
          <LoadingButton loading={false}>
            Submit
          </LoadingButton>
        </ResponsiveWrapper>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeInTheDocument();
    });

    it('should work with LoadingSpinner and error boundary without accessibility conflicts', () => {
      renderWithProviders(
        <ErrorBoundary>
          <LoadingSpinner message="Loading..." />
        </ErrorBoundary>
      );
      
      const spinner = document.querySelector('.loading-spinner');
      const message = screen.getByText(/loading/i);
      
      expect(spinner).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it('should work with multiple loading components without accessibility conflicts', () => {
      renderWithProviders(
        <div>
          <LoadingButton loading={true} loadingText="Submitting...">
            Submit
          </LoadingButton>
          <LoadingSpinner message="Processing..." />
        </div>
      );
      
      const button = screen.getByRole('button', { name: /submitting/i });
      const spinner = document.querySelector('.loading-spinner');
      const message = screen.getByText(/processing/i);
      
      expect(button).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should work with error boundary and responsive wrapper without accessibility conflicts', () => {
      renderWithProviders(
        <ErrorBoundary>
          <ResponsiveWrapper>
            <ThrowError shouldThrow={true} />
          </ResponsiveWrapper>
        </ErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      expect(heading).toBeInTheDocument();
      expect(tryAgainButton).toBeInTheDocument();
      expect(refreshButton).toBeInTheDocument();
    });

    it('should work with error boundary and loading components without accessibility conflicts', () => {
      renderWithProviders(
        <ErrorBoundary>
          <div>
            <LoadingButton loading={false}>
              Action
            </LoadingButton>
            <ThrowError shouldThrow={true} />
          </div>
        </ErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      expect(heading).toBeInTheDocument();
      expect(tryAgainButton).toBeInTheDocument();
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Protected Route Integration', () => {
    it('should work with ProtectedRoute and responsive wrapper without accessibility conflicts', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <ResponsiveWrapper>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </ResponsiveWrapper>
      );
      
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });

    it('should work with ProtectedRoute and loading components without accessibility conflicts', () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <div>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
          <LoadingSpinner message="Loading..." />
        </div>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      const spinner = document.querySelector('.loading-spinner');
      
      expect(loadingMessage).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
    });

    it('should work with ProtectedRoute and error boundary without accessibility conflicts', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ErrorBoundary>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </ErrorBoundary>
      );
      
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/login');
    });
  });

  describe('Responsive Components Integration', () => {
    it('should work with ResponsiveWrapper and authentication pages without accessibility conflicts', () => {
      renderWithProviders(
        <ResponsiveWrapper
          mobile="Mobile Login"
          tablet="Tablet Login"
          desktop="Desktop Login"
        >
          <LoginPage />
        </ResponsiveWrapper>
      );
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
    });

    it('should work with ResponsiveWrapper and loading components without accessibility conflicts', () => {
      renderWithProviders(
        <ResponsiveWrapper>
          <LoadingButton loading={false}>
            Submit
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
        </ResponsiveWrapper>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      const spinner = document.querySelector('.loading-spinner');
      const message = screen.getByText(/loading/i);
      
      expect(button).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it('should work with ResponsiveWrapper and error boundary without accessibility conflicts', () => {
      renderWithProviders(
        <ResponsiveWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ResponsiveWrapper>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      expect(heading).toBeInTheDocument();
      expect(tryAgainButton).toBeInTheDocument();
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Complete Application Integration', () => {
    it('should work with all components together without accessibility conflicts', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <ErrorBoundary>
          <ResponsiveWrapper>
            <ProtectedRoute>
              <div>
                <LoginPage />
                <LoadingButton loading={false}>
                  Submit
                </LoadingButton>
                <LoadingSpinner message="Loading..." />
              </div>
            </ProtectedRoute>
          </ResponsiveWrapper>
        </ErrorBoundary>
      );
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      const submitButton = screen.getByRole('button', { name: /submit/i });
      const spinner = document.querySelector('.loading-spinner');
      const message = screen.getByText(/loading/i);
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it('should handle complex interactions without accessibility conflicts', async () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ErrorBoundary>
          <ResponsiveWrapper>
            <ProtectedRoute>
              <div>
                <LoginPage />
                <LoadingButton loading={false}>
                  Submit
                </LoadingButton>
              </div>
            </ProtectedRoute>
          </ResponsiveWrapper>
        </ErrorBoundary>
      );
      
      // Should redirect to login since user is null
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/login');
    });

    it('should handle error states without accessibility conflicts', () => {
      renderWithProviders(
        <ErrorBoundary>
          <ResponsiveWrapper>
            <div>
              <LoginPage />
              <ThrowError shouldThrow={true} />
            </div>
          </ResponsiveWrapper>
        </ErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      expect(heading).toBeInTheDocument();
      expect(tryAgainButton).toBeInTheDocument();
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Accessibility Best Practices Integration', () => {
    it('should maintain proper heading hierarchy across components', () => {
      renderWithProviders(
        <div>
          <h1>Main Heading</h1>
          <LoginPage />
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </div>
      );
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      const loginHeading = screen.getByRole('heading', { level: 1 });
      const errorHeading = screen.getByRole('heading', { level: 1 });
      
      expect(mainHeading).toBeInTheDocument();
      expect(loginHeading).toBeInTheDocument();
      expect(errorHeading).toBeInTheDocument();
    });

    it('should maintain proper button roles across components', () => {
      renderWithProviders(
        <div>
          <button>Normal Button</button>
          <LoginPage />
          <LoadingButton loading={false}>
            Loading Button
          </LoadingButton>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </div>
      );
      
      const normalButton = screen.getByRole('button', { name: /normal button/i });
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      const loadingButton = screen.getByRole('button', { name: /loading button/i });
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      expect(normalButton).toBeInTheDocument();
      expect(signInButton).toBeInTheDocument();
      expect(loadingButton).toBeInTheDocument();
      expect(tryAgainButton).toBeInTheDocument();
      expect(refreshButton).toBeInTheDocument();
    });

    it('should maintain proper form structure across components', () => {
      renderWithProviders(
        <div>
          <LoginPage />
          <SignupPage />
          <ForgotPasswordPage />
        </div>
      );
      
      const loginEmailInput = screen.getByLabelText(/email address/i);
      const loginPasswordInput = screen.getByLabelText(/password/i);
      const signupNameInput = screen.getByLabelText(/name/i);
      const signupEmailInput = screen.getByLabelText(/email/i);
      const signupPasswordInput = screen.getByLabelText(/^password/i);
      const signupConfirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const forgotPasswordEmailInput = screen.getByLabelText(/email/i);
      
      expect(loginEmailInput).toBeInTheDocument();
      expect(loginPasswordInput).toBeInTheDocument();
      expect(signupNameInput).toBeInTheDocument();
      expect(signupEmailInput).toBeInTheDocument();
      expect(signupPasswordInput).toBeInTheDocument();
      expect(signupConfirmPasswordInput).toBeInTheDocument();
      expect(forgotPasswordEmailInput).toBeInTheDocument();
    });
  });

  describe('Performance and Accessibility Integration', () => {
    it('should handle rapid state changes without accessibility conflicts', async () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      const { rerender } = renderWithProviders(
        <ResponsiveWrapper>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </ResponsiveWrapper>
      );
      
      // Should show loading state
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
      
      // Simulate authentication completion
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      rerender(
        <ResponsiveWrapper>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </ResponsiveWrapper>
      );
      
      // Should show protected content
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });

    it('should handle error recovery without accessibility conflicts', () => {
      const { rerender } = renderWithProviders(
        <ErrorBoundary>
          <ResponsiveWrapper>
            <ThrowError shouldThrow={true} />
          </ResponsiveWrapper>
        </ErrorBoundary>
      );
      
      // Error should be displayed
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      
      // Try to recover
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);
      
      // Re-render without error
      rerender(
        <ErrorBoundary>
          <ResponsiveWrapper>
            <ThrowError shouldThrow={false} />
          </ResponsiveWrapper>
        </ErrorBoundary>
      );
      
      const noErrorMessage = screen.getByText(/no error/i);
      expect(noErrorMessage).toBeInTheDocument();
    });
  });
});
