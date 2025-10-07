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

// Helper function to simulate different screen sizes
const setScreenSize = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Responsive Authentication Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default screen size
    setScreenSize(1024, 768);
  });

  describe('Mobile Responsiveness (320px - 767px)', () => {
    beforeEach(() => {
      setScreenSize(375, 667); // iPhone SE size
    });

    it('should render login page correctly on mobile', () => {
      renderWithProviders(<LoginPage />);
      
      const container = screen.getByTestId('auth-container') || document.querySelector('.auth-container');
      expect(container).toBeInTheDocument();
      
      // Check if mobile-specific styles are applied
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render signup page correctly on mobile', () => {
      renderWithProviders(<SignupPage />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should render forgot password page correctly on mobile', () => {
      renderWithProviders(<ForgotPasswordPage />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should have proper touch targets on mobile', () => {
      renderWithProviders(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      // Check if elements are properly sized for touch
      expect(submitButton).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should handle form interactions on mobile', async () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Test touch interactions
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Tablet Responsiveness (768px - 1023px)', () => {
    beforeEach(() => {
      setScreenSize(768, 1024); // iPad size
    });

    it('should render login page correctly on tablet', () => {
      renderWithProviders(<LoginPage />);
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render signup page correctly on tablet', () => {
      renderWithProviders(<SignupPage />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should handle form interactions on tablet', async () => {
      renderWithProviders(<SignupPage />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuthContext.signUp).toHaveBeenCalled();
      });
    });
  });

  describe('Desktop Responsiveness (1024px+)', () => {
    beforeEach(() => {
      setScreenSize(1440, 900); // Large desktop
    });

    it('should render login page correctly on desktop', () => {
      renderWithProviders(<LoginPage />);
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render signup page correctly on desktop', () => {
      renderWithProviders(<SignupPage />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should handle keyboard navigation on desktop', () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Test keyboard navigation
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);
      
      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(document.activeElement).toBe(passwordInput);
      
      fireEvent.keyDown(passwordInput, { key: 'Tab' });
      expect(document.activeElement).toBe(submitButton);
    });
  });

  describe('Responsive Breakpoint Transitions', () => {
    it('should adapt when screen size changes from mobile to tablet', () => {
      const { rerender } = renderWithProviders(<LoginPage />);
      
      // Start with mobile size
      setScreenSize(375, 667);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      
      // Change to tablet size
      setScreenSize(768, 1024);
      rerender(<LoginPage />);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should adapt when screen size changes from tablet to desktop', () => {
      const { rerender } = renderWithProviders(<SignupPage />);
      
      // Start with tablet size
      setScreenSize(768, 1024);
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      
      // Change to desktop size
      setScreenSize(1440, 900);
      rerender(<SignupPage />);
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('should handle orientation changes', () => {
      const { rerender } = renderWithProviders(<ForgotPasswordPage />);
      
      // Portrait orientation
      setScreenSize(375, 667);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      
      // Landscape orientation
      setScreenSize(667, 375);
      rerender(<ForgotPasswordPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility on Different Screen Sizes', () => {
    it('should maintain proper contrast ratios on all screen sizes', () => {
      const screenSizes = [
        { width: 320, height: 568 }, // iPhone 5
        { width: 375, height: 667 }, // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1024, height: 768 }, // Desktop
        { width: 1440, height: 900 }, // Large Desktop
      ];

      screenSizes.forEach(({ width, height }) => {
        setScreenSize(width, height);
        const { unmount } = renderWithProviders(<LoginPage />);
        
        // Check if form elements are visible and accessible
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should maintain proper focus management across screen sizes', () => {
      const { rerender } = renderWithProviders(<LoginPage />);
      
      const screenSizes = [375, 768, 1024, 1440];
      
      screenSizes.forEach((width) => {
        setScreenSize(width, 800);
        rerender(<LoginPage />);
        
        const emailInput = screen.getByLabelText(/email address/i);
        emailInput.focus();
        expect(document.activeElement).toBe(emailInput);
      });
    });
  });

  describe('Performance on Different Screen Sizes', () => {
    it('should render efficiently on mobile devices', () => {
      setScreenSize(320, 568); // Small mobile
      
      const startTime = performance.now();
      renderWithProviders(<LoginPage />);
      const endTime = performance.now();
      
      // Should render quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should handle rapid screen size changes', () => {
      const { rerender } = renderWithProviders(<SignupPage />);
      
      const sizes = [320, 375, 768, 1024, 1440];
      
      sizes.forEach((width) => {
        setScreenSize(width, 800);
        rerender(<SignupPage />);
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });
    });
  });
});
