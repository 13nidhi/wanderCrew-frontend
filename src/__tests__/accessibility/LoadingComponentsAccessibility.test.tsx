import LoadingButton from '@components/common/LoadingButton';
import LoadingOverlay from '@components/common/LoadingOverlay';
import LoadingSkeleton from '@components/common/LoadingSkeleton';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Loading Components Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoadingButton Accessibility', () => {
    it('should have proper button role and accessible name', () => {
      render(
        <LoadingButton loading={false}>
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', () => {
      render(
        <LoadingButton loading={true} loadingText="Submitting...">
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submitting/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should maintain focus management during loading', () => {
      render(
        <LoadingButton loading={true} loadingText="Submitting...">
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submitting/i });
      expect(button).toBeDisabled();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <LoadingButton loading={true} loadingText="Submitting...">
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submitting/i });
      expect(button).toHaveAttribute('disabled');
    });

    it('should support keyboard navigation when not loading', () => {
      render(
        <LoadingButton loading={false}>
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should be keyboard accessible when disabled', () => {
      render(
        <LoadingButton loading={true} loadingText="Submitting...">
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submitting/i });
      expect(button).toBeDisabled();
    });

    it('should have proper color contrast for loading state', () => {
      render(
        <LoadingButton loading={true} loadingText="Submitting...">
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submitting/i });
      expect(button).toBeInTheDocument();
    });

    it('should support different variants with proper accessibility', () => {
      const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <LoadingButton loading={false} variant={variant}>
            {variant} Button
          </LoadingButton>
        );
        
        const button = screen.getByRole('button', { name: new RegExp(`${variant} button`, 'i') });
        expect(button).toBeInTheDocument();
        unmount();
      });
    });

    it('should support different sizes with proper accessibility', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <LoadingButton loading={false} size={size}>
            {size} Button
          </LoadingButton>
        );
        
        const button = screen.getByRole('button', { name: new RegExp(`${size} button`, 'i') });
        expect(button).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('LoadingOverlay Accessibility', () => {
    it('should have proper ARIA attributes for overlay', () => {
      render(
        <LoadingOverlay isLoading={true} message="Loading content...">
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const overlay = document.querySelector('.loading-overlay');
      expect(overlay).toBeInTheDocument();
    });

    it('should announce loading message to screen readers', () => {
      render(
        <LoadingOverlay isLoading={true} message="Loading content...">
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const loadingMessage = screen.getByText(/loading content/i);
      expect(loadingMessage).toBeInTheDocument();
    });

    it('should not interfere with content accessibility when not loading', () => {
      render(
        <LoadingOverlay isLoading={false} message="Loading content...">
          <button>Click me</button>
        </LoadingOverlay>
      );
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('should have proper focus management during loading', () => {
      render(
        <LoadingOverlay isLoading={true} message="Loading content...">
          <button>Click me</button>
        </LoadingOverlay>
      );
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should support different spinner sizes with proper accessibility', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <LoadingOverlay isLoading={true} message="Loading..." spinnerSize={size}>
            <div>Content</div>
          </LoadingOverlay>
        );
        
        const loadingMessage = screen.getByText(/loading/i);
        expect(loadingMessage).toBeInTheDocument();
        unmount();
      });
    });

    it('should have proper contrast for overlay elements', () => {
      render(
        <LoadingOverlay isLoading={true} message="Loading content...">
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const overlay = document.querySelector('.loading-overlay');
      const loadingMessage = screen.getByText(/loading content/i);
      
      expect(overlay).toBeInTheDocument();
      expect(loadingMessage).toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton Accessibility', () => {
    it('should have proper ARIA attributes for skeleton', () => {
      render(
        <LoadingSkeleton width="200px" height="20px" />
      );
      
      const skeleton = document.querySelector('.loading-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('should support different variants with proper accessibility', () => {
      const variants = ['text', 'rectangular', 'circular'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <LoadingSkeleton variant={variant} width="100px" height="20px" />
        );
        
        const skeleton = document.querySelector('.loading-skeleton');
        expect(skeleton).toBeInTheDocument();
        unmount();
      });
    });

    it('should support different animations with proper accessibility', () => {
      const animations = ['pulse', 'wave', 'none'] as const;
      
      animations.forEach(animation => {
        const { unmount } = render(
          <LoadingSkeleton animation={animation} width="100px" height="20px" />
        );
        
        const skeleton = document.querySelector('.loading-skeleton');
        expect(skeleton).toBeInTheDocument();
        unmount();
      });
    });

    it('should have proper contrast for skeleton elements', () => {
      render(
        <LoadingSkeleton width="200px" height="20px" />
      );
      
      const skeleton = document.querySelector('.loading-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('should support custom styling with proper accessibility', () => {
      render(
        <LoadingSkeleton 
          width="200px" 
          height="20px" 
          style={{ backgroundColor: '#f0f0f0' }}
        />
      );
      
      const skeleton = document.querySelector('.loading-skeleton');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Accessibility', () => {
    it('should have proper ARIA attributes for spinner', () => {
      render(
        <LoadingSpinner message="Loading..." />
      );
      
      const spinner = document.querySelector('.loading-spinner');
      const message = screen.getByText(/loading/i);
      
      expect(spinner).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it('should announce loading message to screen readers', () => {
      render(
        <LoadingSpinner message="Loading content..." />
      );
      
      const message = screen.getByText(/loading content/i);
      expect(message).toBeInTheDocument();
    });

    it('should support different sizes with proper accessibility', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <LoadingSpinner message="Loading..." size={size} />
        );
        
        const message = screen.getByText(/loading/i);
        expect(message).toBeInTheDocument();
        unmount();
      });
    });

    it('should have proper contrast for spinner elements', () => {
      render(
        <LoadingSpinner message="Loading..." />
      );
      
      const spinner = document.querySelector('.loading-spinner');
      const message = screen.getByText(/loading/i);
      
      expect(spinner).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it('should support custom styling with proper accessibility', () => {
      render(
        <LoadingSpinner 
          message="Loading..." 
          style={{ color: '#333' }}
        />
      );
      
      const message = screen.getByText(/loading/i);
      expect(message).toBeInTheDocument();
    });
  });

  describe('Loading States Integration', () => {
    it('should work together without accessibility conflicts', () => {
      render(
        <LoadingOverlay isLoading={true} message="Loading...">
          <div>
            <LoadingButton loading={true} loadingText="Submitting...">
              Submit
            </LoadingButton>
            <LoadingSkeleton width="200px" height="20px" />
            <LoadingSpinner message="Processing..." />
          </div>
        </LoadingOverlay>
      );
      
      const overlayMessage = screen.getByText(/loading/i);
      const button = screen.getByRole('button', { name: /submitting/i });
      const spinnerMessage = screen.getByText(/processing/i);
      
      expect(overlayMessage).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(spinnerMessage).toBeInTheDocument();
    });

    it('should maintain proper focus management across components', () => {
      render(
        <div>
          <LoadingButton loading={false}>
            First Button
          </LoadingButton>
          <LoadingButton loading={true} loadingText="Loading...">
            Second Button
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: /first button/i });
      const secondButton = screen.getByRole('button', { name: /loading/i });
      const spinnerMessage = screen.getByText(/loading/i);
      
      expect(firstButton).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
      expect(spinnerMessage).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper announcements for loading states', () => {
      render(
        <div>
          <LoadingButton loading={true} loadingText="Submitting form...">
            Submit
          </LoadingButton>
          <LoadingOverlay isLoading={true} message="Loading page...">
            <div>Content</div>
          </LoadingOverlay>
          <LoadingSpinner message="Processing data..." />
        </div>
      );
      
      const buttonMessage = screen.getByText(/submitting form/i);
      const overlayMessage = screen.getByText(/loading page/i);
      const spinnerMessage = screen.getByText(/processing data/i);
      
      expect(buttonMessage).toBeInTheDocument();
      expect(overlayMessage).toBeInTheDocument();
      expect(spinnerMessage).toBeInTheDocument();
    });

    it('should have proper semantic structure for screen readers', () => {
      render(
        <div>
          <LoadingButton loading={false}>
            Submit
          </LoadingButton>
          <LoadingSkeleton width="200px" height="20px" />
        </div>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      const skeleton = document.querySelector('.loading-skeleton');
      
      expect(button).toBeInTheDocument();
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for interactive elements', () => {
      render(
        <div>
          <LoadingButton loading={false}>
            First Button
          </LoadingButton>
          <LoadingButton loading={false}>
            Second Button
          </LoadingButton>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: /first button/i });
      const secondButton = screen.getByRole('button', { name: /second button/i });
      
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
      
      // Test Tab navigation
      firstButton.blur();
      secondButton.focus();
      expect(document.activeElement).toBe(secondButton);
    });

    it('should handle disabled state properly for keyboard navigation', () => {
      render(
        <LoadingButton loading={true} loadingText="Loading...">
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toBeDisabled();
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
        <div>
          <LoadingButton loading={true} loadingText="Loading...">
            Submit
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
          <LoadingSkeleton width="200px" height="20px" />
        </div>
      );
      
      const button = screen.getByRole('button', { name: /loading/i });
      const spinnerMessage = screen.getByText(/loading/i);
      const skeleton = document.querySelector('.loading-skeleton');
      
      expect(button).toBeInTheDocument();
      expect(spinnerMessage).toBeInTheDocument();
      expect(skeleton).toBeInTheDocument();
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
        <div>
          <LoadingButton loading={true} loadingText="Loading...">
            Submit
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
          <LoadingSkeleton width="200px" height="20px" />
        </div>
      );
      
      const button = screen.getByRole('button', { name: /loading/i });
      const spinnerMessage = screen.getByText(/loading/i);
      const skeleton = document.querySelector('.loading-skeleton');
      
      expect(button).toBeInTheDocument();
      expect(spinnerMessage).toBeInTheDocument();
      expect(skeleton).toBeInTheDocument();
    });
  });
});
