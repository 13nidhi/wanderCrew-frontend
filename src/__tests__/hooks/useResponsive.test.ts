import { useBreakpoint, useBreakpointDown, useBreakpointUp, useResponsive, useResponsiveValue } from '@hooks/useResponsive';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Mock resize event
const mockResizeEvent = new Event('resize');

describe('useResponsive Hook', () => {
  beforeEach(() => {
    // Reset mocks
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Responsive Detection', () => {
    it('should detect mobile breakpoint', () => {
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

    it('should detect tablet breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it('should detect desktop breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it('should detect large desktop breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe('largeDesktop');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(true);
    });
  });

  describe('Breakpoint Comparisons', () => {
    it('should correctly identify less than tablet', () => {
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

    it('should correctly identify greater than mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isGreaterThanMobile).toBe(true);
      expect(result.current.isGreaterThanTablet).toBe(true);
      expect(result.current.isGreaterThanDesktop).toBe(false);
    });
  });

  describe('Window Resize Handling', () => {
    it('should update breakpoint on window resize', () => {
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

    it('should add and remove event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useResponsive());

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Custom Breakpoints', () => {
    it('should work with custom breakpoints', () => {
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
});

describe('useResponsiveValue Hook', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('should return value for current breakpoint', () => {
    const values = {
      mobile: 'mobile-value',
      tablet: 'tablet-value',
      desktop: 'desktop-value',
      largeDesktop: 'large-desktop-value',
    };

    const { result } = renderHook(() => useResponsiveValue(values, 'default'));

    expect(result.current).toBe('desktop-value');
  });

  it('should fallback to smaller breakpoint if current not defined', () => {
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

  it('should return default value if no breakpoint values defined', () => {
    const values = {};

    const { result } = renderHook(() => useResponsiveValue(values, 'default'));

    expect(result.current).toBe('default');
  });

  it('should update value on breakpoint change', () => {
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

describe('useBreakpoint Hook', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('should return true for current breakpoint', () => {
    const { result } = renderHook(() => useBreakpoint('tablet'));

    expect(result.current).toBe(true);
  });

  it('should return false for different breakpoint', () => {
    const { result } = renderHook(() => useBreakpoint('mobile'));

    expect(result.current).toBe(false);
  });

  it('should update on breakpoint change', () => {
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

describe('useBreakpointUp Hook', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('should return true for mobile or larger', () => {
    const { result } = renderHook(() => useBreakpointUp('mobile'));

    expect(result.current).toBe(true);
  });

  it('should return true for tablet or larger', () => {
    const { result } = renderHook(() => useBreakpointUp('tablet'));

    expect(result.current).toBe(true);
  });

  it('should return false for desktop or larger', () => {
    const { result } = renderHook(() => useBreakpointUp('desktop'));

    expect(result.current).toBe(false);
  });

  it('should update on breakpoint change', () => {
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

describe('useBreakpointDown Hook', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('should return true for less than tablet', () => {
    const { result } = renderHook(() => useBreakpointDown('tablet'));

    expect(result.current).toBe(false); // 768 is not less than 768
  });

  it('should return true for less than desktop', () => {
    const { result } = renderHook(() => useBreakpointDown('desktop'));

    expect(result.current).toBe(true); // 768 is less than 1024
  });

  it('should return false for less than large desktop', () => {
    const { result } = renderHook(() => useBreakpointDown('largeDesktop'));

    expect(result.current).toBe(true); // 768 is less than 1440
  });

  it('should update on breakpoint change', () => {
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

describe('Edge Cases', () => {
  it('should handle very small screen sizes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 200,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
  });

  it('should handle very large screen sizes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe('largeDesktop');
    expect(result.current.isLargeDesktop).toBe(true);
  });

  it('should handle exact breakpoint values', () => {
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
