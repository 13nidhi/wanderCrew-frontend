import { useBreakpoint, useBreakpointDown, useBreakpointUp, useResponsive, useResponsiveValue } from '@hooks/useResponsive';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Mock resize event
const mockResizeEvent = new Event('resize');

describe('useResponsive Hook Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global window
    global.window = mockWindow as any;
    
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  describe('useResponsive Hook Accessibility', () => {
    it('should provide accessible breakpoint information', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it('should provide accessible breakpoint comparisons', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isLessThanTablet).toBe(true);
      expect(result.current.isLessThanDesktop).toBe(true);
      expect(result.current.isLessThanLargeDesktop).toBe(true);
    });

    it('should handle window resize events for accessibility', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe('mobile');

      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(mockResizeEvent);
      });

      expect(result.current.breakpoint).toBe('desktop');
    });

    it('should provide accessible custom breakpoints', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      const customBreakpoints = {
        mobile: 400,
        tablet: 600,
        desktop: 800,
        largeDesktop: 1200,
      };

      const { result } = renderHook(() => useResponsive(customBreakpoints));

      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isTablet).toBe(true);
    });
  });

  describe('useResponsiveValue Hook Accessibility', () => {
    it('should provide accessible responsive values', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const values = {
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
        largeDesktop: 'large-desktop-value',
      };

      const { result } = renderHook(() => useResponsiveValue(values, 'default'));

      expect(result.current).toBe('desktop-value');
    });

    it('should provide accessible fallback values', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const values = {
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        // desktop and largeDesktop not defined
      };

      const { result } = renderHook(() => useResponsiveValue(values, 'default'));

      expect(result.current).toBe('tablet-value');
    });

    it('should provide accessible default values', () => {
      const values = {};

      const { result } = renderHook(() => useResponsiveValue(values, 'default'));

      expect(result.current).toBe('default');
    });

    it('should handle responsive value changes for accessibility', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const values = {
        mobile: 'mobile-value',
        desktop: 'desktop-value',
      };

      const { result } = renderHook(() => useResponsiveValue(values, 'default'));

      expect(result.current).toBe('mobile-value');

      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(mockResizeEvent);
      });

      expect(result.current).toBe('desktop-value');
    });
  });

  describe('useBreakpoint Hook Accessibility', () => {
    it('should provide accessible breakpoint matching', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpoint('tablet'));

      expect(result.current).toBe(true);
    });

    it('should provide accessible breakpoint non-matching', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpoint('mobile'));

      expect(result.current).toBe(false);
    });

    it('should handle breakpoint changes for accessibility', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpoint('tablet'));

      expect(result.current).toBe(true);

      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(mockResizeEvent);
      });

      expect(result.current).toBe(false);
    });
  });

  describe('useBreakpointUp Hook Accessibility', () => {
    it('should provide accessible breakpoint up matching', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpointUp('mobile'));

      expect(result.current).toBe(true);
    });

    it('should provide accessible breakpoint up non-matching', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpointUp('desktop'));

      expect(result.current).toBe(false);
    });

    it('should handle breakpoint up changes for accessibility', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpointUp('desktop'));

      expect(result.current).toBe(false);

      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(mockResizeEvent);
      });

      expect(result.current).toBe(true);
    });
  });

  describe('useBreakpointDown Hook Accessibility', () => {
    it('should provide accessible breakpoint down matching', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpointDown('desktop'));

      expect(result.current).toBe(true);
    });

    it('should provide accessible breakpoint down non-matching', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpointDown('tablet'));

      expect(result.current).toBe(false);
    });

    it('should handle breakpoint down changes for accessibility', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useBreakpointDown('desktop'));

      expect(result.current).toBe(true);

      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(mockResizeEvent);
      });

      expect(result.current).toBe(false);
    });
  });

  describe('Edge Cases Accessibility', () => {
    it('should handle very small screen sizes for accessibility', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 200,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
    });

    it('should handle very large screen sizes for accessibility', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 2000,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe('largeDesktop');
      expect(result.current.isLargeDesktop).toBe(true);
    });

    it('should handle exact breakpoint values for accessibility', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Exact tablet breakpoint
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isTablet).toBe(true);
    });
  });

  describe('Accessibility Integration', () => {
    it('should work with accessibility tools', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { result } = renderHook(() => useResponsive());

      // Should provide consistent, accessible breakpoint information
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it('should provide accessible responsive values for UI components', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const values = {
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
        largeDesktop: 'large-desktop-value',
      };

      const { result } = renderHook(() => useResponsiveValue(values, 'default'));

      expect(result.current).toBe('desktop-value');
    });

    it('should handle accessibility requirements for different screen sizes', () => {
      const screenSizes = [320, 375, 768, 1024, 1440];
      
      screenSizes.forEach(size => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: size,
        });

        const { result } = renderHook(() => useResponsive());

        // Should provide consistent breakpoint information
        expect(result.current.breakpoint).toBeDefined();
        expect(result.current.isMobile).toBeDefined();
        expect(result.current.isTablet).toBeDefined();
        expect(result.current.isDesktop).toBeDefined();
        expect(result.current.isLargeDesktop).toBeDefined();
      });
    });
  });

  describe('Performance Accessibility', () => {
    it('should handle rapid screen size changes efficiently', () => {
      const { result } = renderHook(() => useResponsive());

      const sizes = [320, 375, 768, 1024, 1440];
      
      sizes.forEach(size => {
        act(() => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: size,
          });
          window.dispatchEvent(mockResizeEvent);
        });

        // Should provide consistent breakpoint information
        expect(result.current.breakpoint).toBeDefined();
      });
    });

    it('should handle event listener management for accessibility', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useResponsive());

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Accessibility Best Practices', () => {
    it('should provide consistent breakpoint information', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useResponsive());

      // Should provide consistent, predictable breakpoint information
      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it('should handle accessibility requirements for responsive design', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { result } = renderHook(() => useResponsive());

      // Should provide information needed for accessible responsive design
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isLessThanTablet).toBe(true);
      expect(result.current.isLessThanDesktop).toBe(true);
      expect(result.current.isLessThanLargeDesktop).toBe(true);
    });

    it('should support accessibility tools and screen readers', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useResponsive());

      // Should provide information that can be used by accessibility tools
      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isGreaterThanMobile).toBe(true);
      expect(result.current.isGreaterThanTablet).toBe(true);
      expect(result.current.isGreaterThanDesktop).toBe(false);
    });
  });
});
