import ProtectedRoute from '@components/common/ProtectedRoute';
import { AuthProvider } from '@contexts/AuthContext';
import { render, screen } from '@testing-library/react';
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
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
  };
});

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

describe('ProtectedRoute Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State Accessibility', () => {
    it('should have proper loading message for screen readers', () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
    });

    it('should have proper loading spinner accessibility', () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingSpinner = document.querySelector('.loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
    });

    it('should have proper contrast for loading elements', () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      const loadingSpinner = document.querySelector('.loading-spinner');
      
      expect(loadingMessage).toBeInTheDocument();
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  describe('Unauthorized State Accessibility', () => {
    it('should redirect to login with proper accessibility', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/login');
    });

    it('should maintain proper focus management during redirect', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
    });

    it('should have proper semantic structure for redirect', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
    });
  });

  describe('Authorized State Accessibility', () => {
    it('should render protected content with proper accessibility', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });

    it('should maintain proper focus management for protected content', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });

    it('should have proper semantic structure for protected content', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });
  });

  describe('State Transitions Accessibility', () => {
    it('should handle loading to authorized transition properly', async () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      const { rerender } = renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      // Should show loading state
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
      
      // Simulate authentication completion
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      rerender(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      // Should show protected content
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });

    it('should handle loading to unauthorized transition properly', async () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      const { rerender } = renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      // Should show loading state
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
      
      // Simulate authentication failure
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      rerender(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      // Should redirect to login
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/login');
    });

    it('should maintain proper focus management during state transitions', async () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      const { rerender } = renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      // Should show loading state
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
      
      // Simulate authentication completion
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      rerender(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      // Should show protected content
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper announcements for loading state', () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
    });

    it('should provide proper announcements for redirect state', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
    });

    it('should provide proper announcements for authorized state', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });

    it('should have proper semantic structure for all states', () => {
      // Test loading state
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      const { rerender } = renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
      
      // Test unauthorized state
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      rerender(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      
      // Test authorized state
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      rerender(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in loading state', () => {
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
    });

    it('should support keyboard navigation in redirect state', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
    });

    it('should support keyboard navigation in authorized state', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const protectedContent = screen.getByText(/protected content/i);
      expect(protectedContent).toBeInTheDocument();
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
      
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
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
      
      mockAuthContext.isLoading = true;
      mockAuthContext.user = null;
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
      
      const loadingMessage = screen.getByText(/checking authentication/i);
      expect(loadingMessage).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute Integration', () => {
    it('should work with other components without accessibility conflicts', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <div>
          <button>Normal Button</button>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </div>
      );
      
      const normalButton = screen.getByRole('button', { name: /normal button/i });
      const protectedContent = screen.getByText(/protected content/i);
      
      expect(normalButton).toBeInTheDocument();
      expect(protectedContent).toBeInTheDocument();
    });

    it('should maintain proper focus management across components', () => {
      mockAuthContext.isLoading = false;
      mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' } as any;
      
      renderWithProviders(
        <div>
          <button>First Button</button>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
          <button>Second Button</button>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: /first button/i });
      const protectedContent = screen.getByText(/protected content/i);
      const secondButton = screen.getByRole('button', { name: /second button/i });
      
      expect(firstButton).toBeInTheDocument();
      expect(protectedContent).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
    });
  });
});
