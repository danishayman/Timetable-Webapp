"use client";

import React from 'react';
import { useScreenSize, useIsMobile, useIsTablet, useIsDesktop, useBreakpoint, useOrientation, useIsTouchDevice } from '@/src/hooks/useResponsive';

export default function ResponsiveTestPage() {
  const screenSize = useScreenSize();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const breakpoint = useBreakpoint();
  const orientation = useOrientation();
  const isTouchDevice = useIsTouchDevice();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Mobile Responsiveness Test
        </h1>

        {/* Device Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Screen Size</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Width:</strong> {screenSize.width}px</p>
              <p><strong>Height:</strong> {screenSize.height}px</p>
              <p><strong>Orientation:</strong> {orientation}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Device Type</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Mobile:</strong> {isMobile ? '✅' : '❌'}</p>
              <p><strong>Tablet:</strong> {isTablet ? '✅' : '❌'}</p>
              <p><strong>Desktop:</strong> {isDesktop ? '✅' : '❌'}</p>
              <p><strong>Touch Device:</strong> {isTouchDevice ? '✅' : '❌'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Breakpoints</h2>
            <div className="space-y-2 text-sm">
              <p><strong>XS (&lt;480px):</strong> {breakpoint.xs ? '✅' : '❌'}</p>
              <p><strong>SM (≥480px):</strong> {breakpoint.sm ? '✅' : '❌'}</p>
              <p><strong>MD (≥768px):</strong> {breakpoint.md ? '✅' : '❌'}</p>
              <p><strong>LG (≥1024px):</strong> {breakpoint.lg ? '✅' : '❌'}</p>
              <p><strong>XL (≥1280px):</strong> {breakpoint.xl ? '✅' : '❌'}</p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mobile Navigation Test</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This should show different layouts based on screen size:
          </p>
          
          <div className="block lg:hidden">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Mobile/Tablet View</h3>
              <p className="text-blue-800 dark:text-blue-200">You're seeing the mobile-optimized layout!</p>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100">Desktop View</h3>
              <p className="text-green-800 dark:text-green-200">You're seeing the desktop layout!</p>
            </div>
          </div>
        </div>

        {/* Touch Target Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Touch Target Test</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            These buttons should be appropriately sized for touch interaction:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation">
              Primary Action
            </button>
            <button className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation">
              Secondary Action
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation">
              Success Action
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation">
              Danger Action
            </button>
          </div>
        </div>

        {/* Responsive Grid Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Responsive Grid Test</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Grid should adapt: 1 column on mobile, 2 on tablet, 3 on desktop:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Card {num}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Responsive card content</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Input Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mobile Form Test</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Form inputs should be appropriately sized for mobile interaction:
          </p>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Input
              </label>
              <input
                type="text"
                placeholder="Should be 44px tall on mobile"
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Dropdown
              </label>
              <select className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base sm:text-sm">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Textarea
              </label>
              <textarea
                rows={4}
                placeholder="Should be appropriately sized for touch"
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base sm:text-sm resize-vertical"
              />
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation"
            >
              Submit Form
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
