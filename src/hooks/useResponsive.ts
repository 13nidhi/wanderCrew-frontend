import { useEffect, useState } from 'react';

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Hook to get current breakpoint
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('mobile');
  const [isMobile, setIsMobile] = useState(true);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLargeDesktop, setIsLargeDesktop] = useState(false);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= BREAKPOINTS.largeDesktop) {
        setBreakpoint('largeDesktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
        setIsLargeDesktop(true);
      } else if (width >= BREAKPOINTS.desktop) {
        setBreakpoint('desktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
        setIsLargeDesktop(false);
      } else if (width >= BREAKPOINTS.tablet) {
        setBreakpoint('tablet');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
        setIsLargeDesktop(false);
      } else {
        setBreakpoint('mobile');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
        setIsLargeDesktop(false);
      }
    };

    // Initial check
    updateBreakpoint();

    // Add event listener
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  };
};

// Hook to check if current breakpoint matches
export const useBreakpoint = (targetBreakpoint: Breakpoint) => {
  const { breakpoint } = useResponsive();
  return breakpoint === targetBreakpoint;
};

// Hook to check if current breakpoint is above target
export const useBreakpointUp = (targetBreakpoint: Breakpoint) => {
  const { breakpoint } = useResponsive();
  return BREAKPOINTS[breakpoint] >= BREAKPOINTS[targetBreakpoint];
};

// Hook to check if current breakpoint is below target
export const useBreakpointDown = (targetBreakpoint: Breakpoint) => {
  const { breakpoint } = useResponsive();
  return BREAKPOINTS[breakpoint] < BREAKPOINTS[targetBreakpoint];
};

// Hook to get responsive values based on breakpoint
export const useResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T => {
  const { breakpoint } = useResponsive();
  return values[breakpoint] ?? defaultValue;
};

// Hook to get responsive styles
export const useResponsiveStyles = (styles: Partial<Record<Breakpoint, React.CSSProperties>>) => {
  const { breakpoint } = useResponsive();
  return styles[breakpoint] ?? {};
};

// Hook to detect device type
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS.desktop) {
        setDeviceType('desktop');
      } else if (width >= BREAKPOINTS.tablet) {
        setDeviceType('tablet');
      } else {
        setDeviceType('mobile');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
};

// Hook to detect orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  return orientation;
};

// Hook to detect if device supports touch
export const useTouchSupport = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchSupport = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouchSupport();
  }, []);

  return isTouchDevice;
};

// Hook to get viewport dimensions
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};

// Hook to detect if element is in viewport
export const useInViewport = (ref: React.RefObject<HTMLElement>, threshold = 0.1) => {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return isInViewport;
};

// Hook to get responsive class names
export const useResponsiveClasses = (baseClass: string, responsiveClasses: Partial<Record<Breakpoint, string>>) => {
  const { breakpoint } = useResponsive();
  const responsiveClass = responsiveClasses[breakpoint];
  
  return responsiveClass ? `${baseClass} ${responsiveClass}` : baseClass;
};
