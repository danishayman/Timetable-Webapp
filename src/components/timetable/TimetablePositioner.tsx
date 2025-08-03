"use client";

import React from 'react';
import { calculateRowIndex, calculateRowSpan, getClosestTimeSlot } from '@/src/lib/utils';
import { TIME_SLOTS } from '@/src/lib/constants';

interface TimetablePositionerProps {
  children: React.ReactNode;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  showWeekends?: boolean;
  compactMode?: boolean;
  clashIndex?: number; // Index of this slot among clashing slots
  clashTotal?: number; // Total number of clashing slots
  isClashing?: boolean; // Whether this slot is involved in a clash
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
  showWeekends = false,
  compactMode = false,
  clashIndex = 0,
  clashTotal = 1,
  isClashing = false
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
  
  // Calculate row start based on start time (use closest time slot for better alignment)
  const alignedStartTime = getClosestTimeSlot(startTime);
  const alignedEndTime = getClosestTimeSlot(endTime);
  
  const rowStart = calculateRowIndex(alignedStartTime) + 1; // +1 because grid is 1-indexed
  
  // Calculate row span based on duration
  const rowSpan = Math.max(1, calculateRowSpan(alignedStartTime, alignedEndTime)); // Ensure minimum span of 1

  // Calculate positioning for clashes - split horizontally
  let gridColumn, width, marginLeft;
  
  if (isClashing && clashTotal > 1) {
    // For clashing slots, divide the column width
    const slotWidth = 100 / clashTotal;
    const leftOffset = slotWidth * clashIndex;
    
    gridColumn = `${columnIndex + 1}`;
    width = `${slotWidth - 1}%`; // Slightly reduced to show gaps between clashing slots
    marginLeft = `${leftOffset}%`;
  } else {
    // Normal positioning
    gridColumn = `${columnIndex + 1} / span 1`;
    width = `calc(100% - ${compactMode ? '2px' : '4px'})`;
    marginLeft = '0';
  }
  
  return (
    <div
      style={{
        gridColumn,
        gridRow: `${rowStart} / span ${rowSpan}`,
        zIndex: isClashing ? 20 : 10, // Higher z-index for clashing slots
        margin: compactMode ? '1px' : '2px',
        height: `calc(100% - ${compactMode ? '2px' : '4px'})`,
        width,
        marginLeft,
        minWidth: 0,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {React.isValidElement(children) 
        ? React.cloneElement(children, { 
            compactMode,
            isClashing: isClashing || (React.Children.toArray(children).length > 0 && (children as any).props?.isClashing)
          } as any)
        : children
      }
    </div>
  );
} 