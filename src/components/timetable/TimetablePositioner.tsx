"use client";

import React from 'react';
import { calculateRowIndex, calculateRowSpan } from '@/src/lib/utils';
import { TIME_SLOTS } from '@/src/lib/constants';

interface TimetablePositionerProps {
  children: React.ReactNode;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  showWeekends?: boolean;
}

/**
 * TimetablePositioner component
 * Positions a child element within the timetable grid based on day and time
 */
export default function TimetablePositioner({
  children,
  dayOfWeek,
  startTime,
  endTime,
  showWeekends = false
}: TimetablePositionerProps) {
  // If the day is not visible (weekend when showWeekends is false), don't render
  if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return null;
  }
  
  // Calculate column based on day of week
  let columnIndex;
  
  if (showWeekends) {
    // When showing all days, use the day_of_week directly (0-6)
    columnIndex = dayOfWeek;
  } else {
    // When hiding weekends, we need to map the day_of_week to the visible columns
    // Monday (1) -> column 0
    // Tuesday (2) -> column 1
    // Wednesday (3) -> column 2
    // Thursday (4) -> column 3
    // Friday (5) -> column 4
    columnIndex = dayOfWeek - 1;
  }
  
  // Calculate row start based on start time
  const rowStart = calculateRowIndex(startTime) + 1; // +1 because grid is 1-indexed
  
  // Calculate row span based on duration
  const rowSpan = calculateRowSpan(startTime, endTime);
  
  return (
    <div
      style={{
        gridColumn: `${columnIndex + 1} / span 1`, // Explicitly span only 1 column
        gridRow: `${rowStart} / span ${rowSpan}`,
        zIndex: 10, // Ensure it appears above grid lines
        position: 'relative', // Change from absolute to relative
        height: '100%',
        width: '100%'
      }}
      className="p-1" // Add padding instead of using inset-0
    >
      {children}
    </div>
  );
} 