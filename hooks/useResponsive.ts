/**
 * Custom hooks for responsive design and mobile detection
 */
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect screen size and device type
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Initial update
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

/**
 * Hook to detect if user is on a mobile device
 */
export function useIsMobile() {
  const { isMobile } = useScreenSize();
  return isMobile;
}

/**
 * Hook to detect if user is on a tablet device
 */
export function useIsTablet() {
  const { isTablet } = useScreenSize();
  return isTablet;
}

/**
 * Hook to detect if user is on a desktop device
 */
export function useIsDesktop() {
  const { isDesktop } = useScreenSize();
  return isDesktop;
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.maxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  return isTouchDevice;
}

/**
 * Hook for responsive breakpoints
 */
export function useBreakpoint() {
  const { width } = useScreenSize();

  return {
    xs: width < 480,      // Extra small devices
    sm: width >= 480,     // Small devices
    md: width >= 768,     // Medium devices (tablets)
    lg: width >= 1024,    // Large devices (desktops)
    xl: width >= 1280,    // Extra large devices
    '2xl': width >= 1536, // 2X large devices
  };
}

/**
 * Hook to handle orientation changes
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    // Initial update
    updateOrientation();

    // Add event listener
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect user's preferred reduced motion setting
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect if the user is using a keyboard for navigation
 */
export function useKeyboardNavigation() {
  const [isUsingKeyboard, setIsUsingKeyboard] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsUsingKeyboard(true);
      }
    };

    const handleMouseDown = () => {
      setIsUsingKeyboard(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isUsingKeyboard;
}

/**
 * Hook for responsive grid columns
 */
export function useResponsiveColumns(options: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}) {
  const breakpoint = useBreakpoint();

  if (breakpoint['2xl'] && options.xl) return options.xl;
  if (breakpoint.xl && options.xl) return options.xl;
  if (breakpoint.lg && options.lg) return options.lg;
  if (breakpoint.md && options.md) return options.md;
  if (breakpoint.sm && options.sm) return options.sm;
  return options.xs || 1;
}
