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

describe('ResponsiveWrapper Component', () => {
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

  describe('Basic Rendering', () => {
    it('should render children by default', () => {
      render(
        <ResponsiveWrapper>
          <div>Default Content</div>
        </ResponsiveWrapper>
      );

      expect(screen.getByText('Default Content')).toBeInTheDocument();
    });

    it('should apply default className', () => {
      const { container } = render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('responsive-wrapper');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ResponsiveWrapper className="custom-class">
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('responsive-wrapper', 'custom-class');
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      
      const { container } = render(
        <ResponsiveWrapper style={customStyle}>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle('background-color: red');
    });
  });

  describe('Breakpoint-Specific Content', () => {
    it('should render mobile content on mobile breakpoint', () => {
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

      expect(screen.getByText('Mobile Content')).toBeInTheDocument();
    });

    it('should render tablet content on tablet breakpoint', () => {
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

      expect(screen.getByText('Tablet Content')).toBeInTheDocument();
    });

    it('should render desktop content on desktop breakpoint', () => {
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

      expect(screen.getByText('Desktop Content')).toBeInTheDocument();
    });

    it('should render large desktop content on large desktop breakpoint', () => {
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

      expect(screen.getByText('Large Desktop Content')).toBeInTheDocument();
    });
  });

  describe('Breakpoint-Specific Classes', () => {
    it('should apply mobile class on mobile breakpoint', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });

      const { container } = render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('responsive-wrapper', 'mobile');
    });

    it('should apply tablet class on tablet breakpoint', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'tablet',
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeDesktop: false,
      });

      const { container } = render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('responsive-wrapper', 'tablet');
    });

    it('should apply desktop class on desktop breakpoint', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });

      const { container } = render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('responsive-wrapper', 'desktop');
    });

    it('should apply large desktop class on large desktop breakpoint', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'largeDesktop',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: true,
      });

      const { container } = render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('responsive-wrapper', 'large-desktop');
    });
  });

  describe('Hide/Show Functionality', () => {
    it('should hide content on specified breakpoints', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });

      const { container } = render(
        <ResponsiveWrapper hideOn={['mobile']}>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should show content only on specified breakpoints', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });

      const { container } = render(
        <ResponsiveWrapper showOn={['desktop']}>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should show content when current breakpoint is in showOn list', () => {
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

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should show content when showOn is empty (default behavior)', () => {
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

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('should set data-breakpoint attribute', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'tablet',
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeDesktop: false,
      });

      const { container } = render(
        <ResponsiveWrapper>
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveAttribute('data-breakpoint', 'tablet');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple breakpoint-specific content with hide/show', () => {
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

      expect(screen.getByText('Desktop Content')).toBeInTheDocument();
    });

    it('should handle custom breakpoint prop', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });

      const { container } = render(
        <ResponsiveWrapper breakpoint="tablet">
          <div>Content</div>
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('responsive-tablet');
    });

    it('should handle all props together', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });

      mockUseResponsiveValue.mockReturnValue('Desktop Content');

      const { container } = render(
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

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('responsive-wrapper', 'custom-class', 'desktop', 'responsive-desktop');
      expect(wrapper).toHaveStyle('background-color: blue');
      expect(wrapper).toHaveAttribute('data-breakpoint', 'desktop');
      expect(screen.getByText('Desktop Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined breakpoint-specific content', () => {
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

      expect(screen.getByText('Default Content')).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      const { container } = render(
        <ResponsiveWrapper>
          {null}
        </ResponsiveWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('responsive-wrapper');
    });

    it('should handle multiple children', () => {
      render(
        <ResponsiveWrapper>
          <div>First Child</div>
          <div>Second Child</div>
        </ResponsiveWrapper>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });
});
