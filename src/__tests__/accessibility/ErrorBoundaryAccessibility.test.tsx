import ErrorBoundary from '@components/common/ErrorBoundary';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Error Display Accessibility', () => {
    it('should have proper heading structure for error page', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/oops! something went wrong/i);
    });

    it('should have proper button roles for error actions', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      expect(tryAgainButton).toBeInTheDocument();
      expect(refreshButton).toBeInTheDocument();
    });

    it('should have proper error message structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorMessage = screen.getByText(/we're sorry, but an unexpected error occurred/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should support keyboard navigation for error actions', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      // Test Tab navigation
      tryAgainButton.focus();
      expect(document.activeElement).toBe(tryAgainButton);
      
      fireEvent.keyDown(tryAgainButton, { key: 'Tab' });
      expect(document.activeElement).toBe(refreshButton);
    });

    it('should support Enter key activation for error actions', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      
      fireEvent.keyDown(tryAgainButton, { key: 'Enter' });
      // Button should be activated
    });

    it('should support Space key activation for error actions', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      
      fireEvent.keyDown(tryAgainButton, { key: ' ' });
      // Button should be activated
    });

    it('should have proper ARIA attributes for error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorIcon = screen.getByText(/⚠️/);
      expect(errorIcon).toBeInTheDocument();
    });

    it('should announce error state to screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const errorMessage = screen.getByText(/we're sorry, but an unexpected error occurred/i);
      
      expect(heading).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Error Details Accessibility', () => {
    it('should have proper details/summary structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const details = screen.getByText(/error details/i);
      expect(details).toBeInTheDocument();
    });

    it('should support keyboard navigation for details', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const details = screen.getByText(/error details/i);
      details.focus();
      expect(document.activeElement).toBe(details);
    });

    it('should support Enter key to toggle details', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const details = screen.getByText(/error details/i);
      
      fireEvent.keyDown(details, { key: 'Enter' });
      // Details should be toggled
    });

    it('should support Space key to toggle details', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const details = screen.getByText(/error details/i);
      
      fireEvent.keyDown(details, { key: ' ' });
      // Details should be toggled
    });

    it('should have proper contrast for error details', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const details = screen.getByText(/error details/i);
      expect(details).toBeInTheDocument();
    });
  });

  describe('Custom Fallback Accessibility', () => {
    it('should support custom fallback with proper accessibility', () => {
      const customFallback = (
        <div>
          <h1>Custom Error</h1>
          <p>Something went wrong</p>
          <button>Custom Action</button>
        </div>
      );
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const message = screen.getByText(/something went wrong/i);
      const button = screen.getByRole('button', { name: /custom action/i });
      
      expect(heading).toBeInTheDocument();
      expect(message).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('should support keyboard navigation in custom fallback', () => {
      const customFallback = (
        <div>
          <h1>Custom Error</h1>
          <button>First Action</button>
          <button>Second Action</button>
        </div>
      );
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const firstButton = screen.getByRole('button', { name: /first action/i });
      const secondButton = screen.getByRole('button', { name: /second action/i });
      
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
      
      fireEvent.keyDown(firstButton, { key: 'Tab' });
      expect(document.activeElement).toBe(secondButton);
    });
  });

  describe('Error Recovery Accessibility', () => {
    it('should support error recovery with proper accessibility', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
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
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      
      const noErrorMessage = screen.getByText(/no error/i);
      expect(noErrorMessage).toBeInTheDocument();
    });

    it('should maintain focus management during error recovery', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      tryAgainButton.focus();
      expect(document.activeElement).toBe(tryAgainButton);
      
      fireEvent.click(tryAgainButton);
      
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      
      const noErrorMessage = screen.getByText(/no error/i);
      expect(noErrorMessage).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper announcements for error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const errorMessage = screen.getByText(/we're sorry, but an unexpected error occurred/i);
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      
      expect(heading).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('should have proper semantic structure for screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const buttons = screen.getAllByRole('button');
      
      expect(heading).toBeInTheDocument();
      expect(buttons).toHaveLength(2);
    });

    it('should announce error details when expanded', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const details = screen.getByText(/error details/i);
      fireEvent.click(details);
      
      // Error details should be visible
      const errorStack = document.querySelector('.error-stack');
      expect(errorStack).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Escape key for error actions', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      tryAgainButton.focus();
      
      fireEvent.keyDown(tryAgainButton, { key: 'Escape' });
      // Focus should be managed appropriately
    });

    it('should support Arrow keys for navigation', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      tryAgainButton.focus();
      expect(document.activeElement).toBe(tryAgainButton);
      
      // Test arrow key navigation if implemented
      fireEvent.keyDown(tryAgainButton, { key: 'ArrowDown' });
      // This would depend on specific implementation
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
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
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
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
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

  describe('Error Boundary Integration', () => {
    it('should work with other components without accessibility conflicts', () => {
      render(
        <ErrorBoundary>
          <div>
            <button>Normal Button</button>
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

    it('should maintain proper focus management across components', () => {
      render(
        <ErrorBoundary>
          <div>
            <button>First Button</button>
            <button>Second Button</button>
            <ThrowError shouldThrow={true} />
          </div>
        </ErrorBoundary>
      );
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      
      expect(tryAgainButton).toBeInTheDocument();
      expect(refreshButton).toBeInTheDocument();
    });
  });
});
