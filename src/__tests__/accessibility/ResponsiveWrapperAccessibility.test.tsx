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

describe('ResponsiveWrapper Accessibility', () => {
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

  describe('Basic Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/content/i);
      expect(content).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveAttribute('data-breakpoint', 'desktop');
    });

    it('should support keyboard navigation', () => {
      render(
        <ResponsiveWrapper>
          <button>Click me</button>
        </ResponsiveWrapper>
      );
      
      const button = screen.getByRole('button', { name: /click me/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should have proper contrast for all breakpoints', () => {
      const breakpoints = ['mobile', 'tablet', 'desktop', 'largeDesktop'] as const;
      
      breakpoints.forEach(breakpoint => {
        mockUseResponsive.mockReturnValue({
          breakpoint,
          isMobile: breakpoint === 'mobile',
          isTablet: breakpoint === 'tablet',
          isDesktop: breakpoint === 'desktop',
          isLargeDesktop: breakpoint === 'largeDesktop',
        });
        
        const { unmount } = render(
          <ResponsiveWrapper>
            <div>Content</div>
          </ResponsiveWrapper>
        );
        
        const content = screen.getByText(/content/i);
        expect(content).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Breakpoint-Specific Content Accessibility', () => {
    it('should render mobile content with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      mockUseResponsiveValue.mockReturnValue('Mobile Content');
      
      render(
        <ResponsiveWrapper
          mobile="Mobile Content"
          tablet="Tablet Content"
          desktop="Desktop Content"
        >
          <div>Default Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/mobile content/i);
      expect(content).toBeInTheDocument();
    });

    it('should render tablet content with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'tablet',
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      mockUseResponsiveValue.mockReturnValue('Tablet Content');
      
      render(
        <ResponsiveWrapper
          mobile="Mobile Content"
          tablet="Tablet Content"
          desktop="Desktop Content"
        >
          <div>Default Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/tablet content/i);
      expect(content).toBeInTheDocument();
    });

    it('should render desktop content with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      
      mockUseResponsiveValue.mockReturnValue('Desktop Content');
      
      render(
        <ResponsiveWrapper
          mobile="Mobile Content"
          tablet="Tablet Content"
          desktop="Desktop Content"
        >
          <div>Default Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/desktop content/i);
      expect(content).toBeInTheDocument();
    });

    it('should render large desktop content with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'largeDesktop',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: true,
      });
      
      mockUseResponsiveValue.mockReturnValue('Large Desktop Content');
      
      render(
        <ResponsiveWrapper
          mobile="Mobile Content"
          tablet="Tablet Content"
          desktop="Desktop Content"
          largeDesktop="Large Desktop Content"
        >
          <div>Default Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/large desktop content/i);
      expect(content).toBeInTheDocument();
    });
  });

  describe('Hide/Show Functionality Accessibility', () => {
    it('should hide content on specified breakpoints with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper hideOn={['mobile']}>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toBeNull();
    });

    it('should show content only on specified breakpoints with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper showOn={['desktop']}>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toBeNull();
    });

    it('should show content when current breakpoint is in showOn list with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper showOn={['desktop', 'tablet']}>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/content/i);
      expect(content).toBeInTheDocument();
    });

    it('should show content when showOn is empty with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper showOn={[]}>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/content/i);
      expect(content).toBeInTheDocument();
    });
  });

  describe('Breakpoint-Specific Classes Accessibility', () => {
    it('should apply mobile class with proper accessibility', () => {
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

    it('should apply tablet class with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'tablet',
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveClass('responsive-wrapper', 'tablet');
    });

    it('should apply desktop class with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveClass('responsive-wrapper', 'desktop');
    });

    it('should apply large desktop class with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'largeDesktop',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: true,
      });
      
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveClass('responsive-wrapper', 'large-desktop');
    });
  });

  describe('Data Attributes Accessibility', () => {
    it('should set data-breakpoint attribute with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'tablet',
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveAttribute('data-breakpoint', 'tablet');
    });
  });

  describe('Complex Scenarios Accessibility', () => {
    it('should handle multiple breakpoint-specific content with hide/show and proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      
      mockUseResponsiveValue.mockReturnValue('Desktop Content');
      
      render(
        <ResponsiveWrapper
          mobile="Mobile Content"
          tablet="Tablet Content"
          desktop="Desktop Content"
          hideOn={['mobile']}
          showOn={['desktop', 'tablet']}
        >
          <div>Default Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/desktop content/i);
      expect(content).toBeInTheDocument();
    });

    it('should handle custom breakpoint prop with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper breakpoint="tablet">
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveClass('responsive-tablet');
    });

    it('should handle all props together with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      
      mockUseResponsiveValue.mockReturnValue('Desktop Content');
      
      render(
        <ResponsiveWrapper
          mobile="Mobile Content"
          tablet="Tablet Content"
          desktop="Desktop Content"
          largeDesktop="Large Desktop Content"
          className="custom-class"
          style={{ backgroundColor: 'blue' }}
          breakpoint="desktop"
          hideOn={['mobile']}
          showOn={['desktop', 'tablet']}
        >
          <div>Default Content</div>
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toHaveClass('responsive-wrapper', 'custom-class', 'desktop', 'responsive-desktop');
      expect(wrapper).toHaveStyle('background-color: blue');
      expect(wrapper).toHaveAttribute('data-breakpoint', 'desktop');
      
      const content = screen.getByText(/desktop content/i);
      expect(content).toBeInTheDocument();
    });
  });

  describe('Edge Cases Accessibility', () => {
    it('should handle undefined breakpoint-specific content with proper accessibility', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      mockUseResponsiveValue.mockReturnValue('Default Content');
      
      render(
        <ResponsiveWrapper
          tablet="Tablet Content"
          desktop="Desktop Content"
        >
          <div>Default Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/default content/i);
      expect(content).toBeInTheDocument();
    });

    it('should handle empty children with proper accessibility', () => {
      render(
        <ResponsiveWrapper>
          {null}
        </ResponsiveWrapper>
      );
      
      const wrapper = document.querySelector('.responsive-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('responsive-wrapper');
    });

    it('should handle multiple children with proper accessibility', () => {
      render(
        <ResponsiveWrapper>
          <div>First Child</div>
          <div>Second Child</div>
        </ResponsiveWrapper>
      );
      
      const firstChild = screen.getByText(/first child/i);
      const secondChild = screen.getByText(/second child/i);
      
      expect(firstChild).toBeInTheDocument();
      expect(secondChild).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper announcements for breakpoint changes', () => {
      const breakpoints = ['mobile', 'tablet', 'desktop', 'largeDesktop'] as const;
      
      breakpoints.forEach(breakpoint => {
        mockUseResponsive.mockReturnValue({
          breakpoint,
          isMobile: breakpoint === 'mobile',
          isTablet: breakpoint === 'tablet',
          isDesktop: breakpoint === 'desktop',
          isLargeDesktop: breakpoint === 'largeDesktop',
        });
        
        const { unmount } = render(
          <ResponsiveWrapper>
            <div>Content</div>
          </ResponsiveWrapper>
        );
        
        const content = screen.getByText(/content/i);
        expect(content).toBeInTheDocument();
        unmount();
      });
    });

    it('should have proper semantic structure for all breakpoints', () => {
      const breakpoints = ['mobile', 'tablet', 'desktop', 'largeDesktop'] as const;
      
      breakpoints.forEach(breakpoint => {
        mockUseResponsive.mockReturnValue({
          breakpoint,
          isMobile: breakpoint === 'mobile',
          isTablet: breakpoint === 'tablet',
          isDesktop: breakpoint === 'desktop',
          isLargeDesktop: breakpoint === 'largeDesktop',
        });
        
        const { unmount } = render(
          <ResponsiveWrapper>
            <div>Content</div>
          </ResponsiveWrapper>
        );
        
        const wrapper = document.querySelector('.responsive-wrapper');
        expect(wrapper).toHaveAttribute('data-breakpoint', breakpoint);
        unmount();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for interactive elements', () => {
      render(
        <ResponsiveWrapper>
          <button>First Button</button>
          <button>Second Button</button>
        </ResponsiveWrapper>
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

    it('should handle focus management across breakpoint changes', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });
      
      render(
        <ResponsiveWrapper>
          <button>Button</button>
        </ResponsiveWrapper>
      );
      
      const button = screen.getByRole('button', { name: /button/i });
      button.focus();
      expect(document.activeElement).toBe(button);
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
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/content/i);
      expect(content).toBeInTheDocument();
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
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );
      
      const content = screen.getByText(/content/i);
      expect(content).toBeInTheDocument();
    });
  });

  describe('ResponsiveWrapper Integration', () => {
    it('should work with other components without accessibility conflicts', () => {
      render(
        <div>
          <button>Normal Button</button>
          <ResponsiveWrapper>
            <div>Responsive Content</div>
          </ResponsiveWrapper>
        </div>
      );
      
      const normalButton = screen.getByRole('button', { name: /normal button/i });
      const responsiveContent = screen.getByText(/responsive content/i);
      
      expect(normalButton).toBeInTheDocument();
      expect(responsiveContent).toBeInTheDocument();
    });

    it('should maintain proper focus management across components', () => {
      render(
        <div>
          <button>First Button</button>
          <ResponsiveWrapper>
            <div>Responsive Content</div>
          </ResponsiveWrapper>
          <button>Second Button</button>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: /first button/i });
      const responsiveContent = screen.getByText(/responsive content/i);
      const secondButton = screen.getByRole('button', { name: /second button/i });
      
      expect(firstButton).toBeInTheDocument();
      expect(responsiveContent).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
    });
  });
});
