import type { Breakpoint } from '@hooks/useResponsive';
import { useResponsive, useResponsiveValue } from '@hooks/useResponsive';
import React, { ReactNode } from 'react';

interface ResponsiveWrapperProps {
  children: ReactNode;
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
  largeDesktop?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  breakpoint?: Breakpoint;
  hideOn?: Breakpoint[];
  showOn?: Breakpoint[];
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  mobile,
  tablet,
  desktop,
  largeDesktop,
  className = '',
  style,
  breakpoint,
  hideOn = [],
  showOn = [],
}) => {
  const { breakpoint: currentBreakpoint, isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  // Get responsive content
  const responsiveContent = useResponsiveValue(
    {
      mobile: mobile ?? children,
      tablet: tablet ?? children,
      desktop: desktop ?? children,
      largeDesktop: largeDesktop ?? children,
    },
    children
  );

  // Check if should hide on current breakpoint
  const shouldHide = hideOn.includes(currentBreakpoint);
  
  // Check if should show only on specific breakpoints
  const shouldShow = showOn.length === 0 || showOn.includes(currentBreakpoint);

  // Don't render if hidden or not in show list
  if (shouldHide || !shouldShow) {
    return null;
  }

  // Apply breakpoint-specific class
  const breakpointClass = breakpoint ? `responsive-${breakpoint}` : '';
  
  // Apply responsive classes
  const responsiveClasses = [
    'responsive-wrapper',
    breakpointClass,
    isMobile ? 'mobile' : '',
    isTablet ? 'tablet' : '',
    isDesktop ? 'desktop' : '',
    isLargeDesktop ? 'large-desktop' : '',
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={`${responsiveClasses} ${className}`}
      style={style}
      data-breakpoint={currentBreakpoint}
    >
      {responsiveContent}
    </div>
  );
};

export default ResponsiveWrapper;
