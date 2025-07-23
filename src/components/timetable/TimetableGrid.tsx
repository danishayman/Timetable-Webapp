"use client";

import React from 'react';
import { DAYS_OF_WEEK, SHORT_DAYS, TIME_SLOTS } from '@/src/lib/constants';
import { formatTime } from '@/src/lib/utils';

interface TimetableGridProps {
  children?: React.ReactNode;
  showWeekends?: boolean;
}

/**
 * TimetableGrid component
 * Displays a 7-column (days) x time-row layout for the timetable
 */
export default function TimetableGrid({ 
  children, 
  showWeekends = false 
}: TimetableGridProps) {
  // Filter days to show (exclude weekends if showWeekends is false)
  const daysToShow = showWeekends
    ? DAYS_OF_WEEK
    : DAYS_OF_WEEK.filter((_, index) => index > 0 && index < 6); // Monday to Friday

  // Get short names for days to show
  const shortDaysToShow = showWeekends
    ? SHORT_DAYS
    : SHORT_DAYS.filter((_, index) => index > 0 && index < 6); // Monday to Friday

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[768px]">
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
    </div>
  );
} 