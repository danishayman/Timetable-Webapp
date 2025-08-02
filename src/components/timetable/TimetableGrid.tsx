"use client";

import React from 'react';
import { DAYS_OF_WEEK, SHORT_DAYS, TIME_SLOTS } from '@/src/lib/constants';
import { formatTime } from '@/src/lib/utils';
import { TimetableGridSkeleton } from '../common/SkeletonLoaders';
import { LoadingOverlay } from '../common/Loading';
import { useIsMobile } from '@/src/hooks/useResponsive';
import { EmptyStateValidator } from '@/src/lib/inputValidation';

interface TimetableGridProps {
  children?: React.ReactNode;
  showWeekends?: boolean;
  isLoading?: boolean;
  isGenerating?: boolean;
  loadingMessage?: string;
  compactMode?: boolean; // New prop for mobile compact view
}

/**
 * TimetableGrid component
 * Displays a 7-column (days) x time-row layout for the timetable
 */
export default function TimetableGrid({ 
  children, 
  showWeekends = false,
  isLoading = false,
  isGenerating = false,
  loadingMessage = 'Loading timetable...',
  compactMode = false
}: TimetableGridProps) {
  // Show skeleton during initial load
  if (isLoading && !children) {
    return <TimetableGridSkeleton />;
  }

  // Check for empty state
  const hasContent = children && React.Children.count(children) > 0;
  const emptyStateResult = EmptyStateValidator.checkEmptyState(!hasContent ? [] : [1], 'schedules');
  
  // Show empty state if no content
  if (!hasContent && !isLoading && !isGenerating) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Classes Scheduled
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {emptyStateResult.message}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Select subjects from the subject list to generate your timetable.
          </p>
        </div>
      </div>
    );
  }
  
  // Filter days to show (exclude weekends if showWeekends is false)
  const daysToShow = showWeekends
    ? DAYS_OF_WEEK
    : DAYS_OF_WEEK.filter((_, index) => index > 0 && index < 6); // Monday to Friday

  // Get short names for days to show
  const shortDaysToShow = showWeekends
    ? SHORT_DAYS
    : SHORT_DAYS.filter((_, index) => index > 0 && index < 6); // Monday to Friday

  // Mobile view: Show only current day or allow swiping between days
  const [currentDayIndex, setCurrentDayIndex] = React.useState(0);
  const isMobile = useIsMobile();
  
  if (isMobile || compactMode) {
    return (
      <div className="w-full">
        {/* Mobile Day Selector */}
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-hide">
            {daysToShow.map((day, index) => (
              <button
                key={day}
                onClick={() => setCurrentDayIndex(index)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  currentDayIndex === index
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="block">{shortDaysToShow[index]}</span>
                <span className="block text-xs mt-1 opacity-75">{day}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Timetable for Selected Day */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {daysToShow[currentDayIndex]}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {TIME_SLOTS.map((time, timeIndex) => (
              <div key={time} className="flex min-h-[4rem] hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {/* Time column */}
                <div className="w-20 flex-shrink-0 p-3 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                  {formatTime(time)}
                </div>
                
                {/* Content area */}
                <div className="flex-1 p-3 relative">
                  {/* Children will be positioned here based on grid coordinates */}
                  {React.Children.map(children, (child) => {
                    // Filter children to show only current day's events
                    // This would need to be implemented based on the child component structure
                    return child;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows for mobile */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
            disabled={currentDayIndex === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentDayIndex + 1} of {daysToShow.length}
          </span>
          
          <button
            onClick={() => setCurrentDayIndex(Math.min(daysToShow.length - 1, currentDayIndex + 1))}
            disabled={currentDayIndex === daysToShow.length - 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Loading overlay for generating timetable */}
        <LoadingOverlay 
          show={isGenerating} 
          message={loadingMessage}
          backdrop={false}
        />
      </div>
    );
  }

  // Desktop/tablet view (existing grid layout)
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] md:min-w-[768px]">
        {/* Timetable Header */}
        <div className="grid grid-cols-[60px_1fr] bg-white dark:bg-gray-800 rounded-t-lg shadow">
          {/* Empty cell for time column */}
          <div className="p-2 border-b border-r border-gray-200 dark:border-gray-700"></div>
          
          {/* Day columns */}
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)`,
              minWidth: 0 // Prevent grid from expanding beyond container
            }}
          >
            {daysToShow.map((day, index) => (
              <div 
                key={day} 
                className="p-2 text-center font-semibold border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700"
              >
                <span className="hidden md:inline">{day}</span>
                <span className="md:hidden">{shortDaysToShow[index]}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Timetable Body */}
        <div className="grid grid-cols-[60px_1fr] bg-white dark:bg-gray-800 rounded-b-lg shadow">
          {/* Time slots */}
          <div className="flex flex-col">
            {TIME_SLOTS.map((time, index) => (
              <div 
                key={time} 
                className={`
                  p-1 h-12 flex items-center justify-center text-xs border-b border-r 
                  border-gray-200 dark:border-gray-700
                  ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-750' : ''}
                `}
              >
                {formatTime(time)}
              </div>
            ))}
          </div>
          
          {/* Grid cells */}
          <div 
            className="relative"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)`,
              gridTemplateRows: `repeat(${TIME_SLOTS.length}, 3rem)`, // 3rem = h-12
              minWidth: 0, // Prevent grid from expanding beyond container
              overflow: 'hidden' // Prevent content from spilling out
            }}
          >
            {/* Grid lines */}
            {daysToShow.map((_, dayIndex) => (
              <React.Fragment key={`col-${dayIndex}`}>
                {TIME_SLOTS.map((_, timeIndex) => (
                  <div 
                    key={`cell-${dayIndex}-${timeIndex}`} 
                    className={`
                      border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700
                      ${timeIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-750' : ''}
                    `}
                    style={{
                      gridColumn: dayIndex + 1,
                      gridRow: timeIndex + 1
                    }}
                  ></div>
                ))}
              </React.Fragment>
            ))}
            
            {/* Children (class blocks, etc.) */}
            {children}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 p-2 bg-white dark:bg-gray-800 rounded shadow text-sm">
        <div className="flex items-center">
          <span className="font-medium mr-2">Time Format:</span>
          <span>30-minute time slots from 8:00 AM to 9:30 PM</span>
        </div>
      </div>

      {/* Loading overlay for generating timetable */}
      <LoadingOverlay 
        show={isGenerating} 
        message={loadingMessage}
        backdrop={false}
      />
    </div>
  );
} 