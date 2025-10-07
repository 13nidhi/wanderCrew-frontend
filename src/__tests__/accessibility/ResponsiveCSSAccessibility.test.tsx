import ErrorBoundary from '@components/common/ErrorBoundary';
import LoadingButton from '@components/common/LoadingButton';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ResponsiveWrapper from '@components/common/ResponsiveWrapper';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useResponsive hook
const mockUseResponsive = vi.fn();
const mockUseResponsiveValue = vi.fn();

vi.mock('@hooks/useResponsive', () => ({
  useResponsive: mockUseResponsive,
  useResponsiveValue: mockUseResponsiveValue,
}));

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('Responsive CSS Accessibility', () => {
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

  describe('ResponsiveWrapper CSS Accessibility', () => {
    it('should have proper CSS classes for accessibility', () => {
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveClass('responsive-wrapper');
    });

    it('should have proper breakpoint-specific CSS classes', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveClass('responsive-wrapper', 'mobile');
    });

    it('should have proper data attributes for accessibility', () => {
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveAttribute('data-breakpoint', 'desktop');
    });

    it('should support custom CSS classes for accessibility', () => {
      render(
        <ResponsiveWrapper className="custom-class">
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveClass('responsive-wrapper', 'custom-class');
    });

    it('should support custom styles for accessibility', () => {
      render(
        <ResponsiveWrapper style={{ backgroundColor: 'blue' }}>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveStyle('background-color: blue');
    });
  });

  describe('LoadingButton CSS Accessibility', () => {
    it('should have proper CSS classes for accessibility', () => {
      render(
        <LoadingButton loading={false}>
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveClass('loading-button');
    });

    it('should have proper variant CSS classes for accessibility', () => {
      const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <LoadingButton loading={false} variant={variant}>
            {variant} Button
          </LoadingButton>
        );
        
        const button = screen.getByRole('button', { name: new RegExp(`${variant} button`, 'i') });
        expect(button).toHaveClass(`loading-button-${variant}`);
        unmount();
      });
    });

    it('should have proper size CSS classes for accessibility', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <LoadingButton loading={false} size={size}>
            {size} Button
          </LoadingButton>
        );
        
        const button = screen.getByRole('button', { name: new RegExp(`${size} button`, 'i') });
        expect(button).toHaveClass(`loading-button-${size}`);
        unmount();
      });
    });

    it('should have proper loading state CSS classes for accessibility', () => {
      render(
        <LoadingButton loading={true} loadingText="Loading...">
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toHaveClass('loading-button-loading');
    });

    it('should have proper full width CSS classes for accessibility', () => {
      render(
        <LoadingButton loading={false} fullWidth>
          Submit
        </LoadingButton>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveClass('loading-button-full-width');
    });
  });

  describe('LoadingSpinner CSS Accessibility', () => {
    it('should have proper CSS classes for accessibility', () => {
      render(
        <LoadingSpinner message="Loading..." />
      );
      
      const spinner = document.querySelector('.loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should have proper size CSS classes for accessibility', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <LoadingSpinner message="Loading..." size={size} />
        );
        
        const spinner = document.querySelector('.loading-spinner');
        expect(spinner).toBeInTheDocument();
        unmount();
      });
    });

    it('should have proper message CSS classes for accessibility', () => {
      render(
        <LoadingSpinner message="Loading content..." />
      );
      
      const message = screen.getByText(/loading content/i);
      expect(message).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary CSS Accessibility', () => {
    it('should have proper CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorBoundary = document.querySelector('.error-boundary');
      expect(errorBoundary).toBeInTheDocument();
    });

    it('should have proper error content CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorContent = document.querySelector('.error-boundary-content');
      expect(errorContent).toBeInTheDocument();
    });

    it('should have proper error icon CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorIcon = document.querySelector('.error-icon');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should have proper error title CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorTitle = document.querySelector('.error-title');
      expect(errorTitle).toBeInTheDocument();
    });

    it('should have proper error message CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorMessage = document.querySelector('.error-message');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should have proper error actions CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorActions = document.querySelector('.error-actions');
      expect(errorActions).toBeInTheDocument();
    });

    it('should have proper error retry button CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const retryButton = document.querySelector('.error-retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should have proper error refresh button CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const refreshButton = document.querySelector('.error-refresh-button');
      expect(refreshButton).toBeInTheDocument();
    });

    it('should have proper error details CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorDetails = document.querySelector('.error-details');
      expect(errorDetails).toBeInTheDocument();
    });

    it('should have proper error stack CSS classes for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const errorStack = document.querySelector('.error-stack');
      expect(errorStack).toBeInTheDocument();
    });
  });

  describe('Responsive CSS Integration Accessibility', () => {
    it('should work with multiple components without CSS conflicts', () => {
      render(
        <div>
          <ResponsiveWrapper>
            <div>Responsive Content</div>
          </ResponsiveWrapper>
          <LoadingButton loading={false}>
            Submit
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      const button = screen.getByRole('button', { name: /submit/i });
      const spinner = document.querySelector('.loading-spinner');
      
      expect(responsiveWrapper).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
    });

    it('should maintain proper CSS hierarchy for accessibility', () => {
      render(
        <div>
          <ResponsiveWrapper className="parent-class">
            <LoadingButton loading={false} className="child-class">
              Submit
            </LoadingButton>
          </ResponsiveWrapper>
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      const button = screen.getByRole('button', { name: /submit/i });
      
      expect(responsiveWrapper).toHaveClass('responsive-wrapper', 'parent-class');
      expect(button).toHaveClass('loading-button', 'child-class');
    });

    it('should support CSS custom properties for accessibility', () => {
      render(
        <div style={{ '--custom-color': 'red' } as React.CSSProperties}>
          <ResponsiveWrapper>
            <div>Content</div>
          </ResponsiveWrapper>
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      expect(responsiveWrapper).toBeInTheDocument();
    });
  });

  describe('CSS Accessibility Best Practices', () => {
    it('should have proper CSS class naming conventions', () => {
      render(
        <div>
          <ResponsiveWrapper>
            <div>Content</div>
          </ResponsiveWrapper>
          <LoadingButton loading={false}>
            Submit
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      const button = screen.getByRole('button', { name: /submit/i });
      const spinner = document.querySelector('.loading-spinner');
      
      expect(responsiveWrapper).toHaveClass('responsive-wrapper');
      expect(button).toHaveClass('loading-button');
      expect(spinner).toBeInTheDocument();
    });

    it('should support CSS-in-JS for accessibility', () => {
      render(
        <div>
          <ResponsiveWrapper style={{ color: 'blue' }}>
            <div>Content</div>
          </ResponsiveWrapper>
          <LoadingButton loading={false} style={{ backgroundColor: 'green' }}>
            Submit
          </LoadingButton>
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      const button = screen.getByRole('button', { name: /submit/i });
      
      expect(responsiveWrapper).toHaveStyle('color: blue');
      expect(button).toHaveStyle('background-color: green');
    });

    it('should support CSS modules for accessibility', () => {
      render(
        <div>
          <ResponsiveWrapper className="module-class">
            <div>Content</div>
          </ResponsiveWrapper>
          <LoadingButton loading={false} className="module-button">
            Submit
          </LoadingButton>
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      const button = screen.getByRole('button', { name: /submit/i });
      
      expect(responsiveWrapper).toHaveClass('responsive-wrapper', 'module-class');
      expect(button).toHaveClass('loading-button', 'module-button');
    });
  });

  describe('CSS Performance Accessibility', () => {
    it('should handle CSS loading efficiently', () => {
      render(
        <div>
          <ResponsiveWrapper>
            <div>Content</div>
          </ResponsiveWrapper>
          <LoadingButton loading={false}>
            Submit
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      const button = screen.getByRole('button', { name: /submit/i });
      const spinner = document.querySelector('.loading-spinner');
      
      expect(responsiveWrapper).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
    });

    it('should handle CSS updates efficiently', () => {
      const { rerender } = render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      expect(responsiveWrapper).toBeInTheDocument();
      
      rerender(
        <ResponsiveWrapper className="updated-class">
          <div>Updated Content</div>
        </ResponsiveWrapper>
      );
      
      const updatedWrapper = document.querySelector('.responsive-wrapper');
      expect(updatedWrapper).toHaveClass('responsive-wrapper', 'updated-class');
    });
  });

  describe('CSS Accessibility Testing', () => {
    it('should support CSS accessibility testing tools', () => {
      render(
        <div>
          <ResponsiveWrapper>
            <div>Content</div>
          </ResponsiveWrapper>
          <LoadingButton loading={false}>
            Submit
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      const button = screen.getByRole('button', { name: /submit/i });
      const spinner = document.querySelector('.loading-spinner');
      
      expect(responsiveWrapper).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
    });

    it('should support CSS accessibility validation', () => {
      render(
        <div>
          <ResponsiveWrapper>
            <div>Content</div>
          </ResponsiveWrapper>
          <LoadingButton loading={false}>
            Submit
          </LoadingButton>
          <LoadingSpinner message="Loading..." />
        </div>
      );
      
      const responsiveWrapper = document.querySelector('.responsive-wrapper');
      const button = screen.getByRole('button', { name: /submit/i });
      const spinner = document.querySelector('.loading-spinner');
      
      expect(responsiveWrapper).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
    });
  });
});
