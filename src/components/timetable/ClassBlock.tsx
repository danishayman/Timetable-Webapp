"use client";

import React, { useState } from 'react';
import { TimetableSlot } from '@/src/types/timetable';
import { CLASS_TYPES } from '@/src/lib/constants';
import { formatTimeRange } from '@/src/lib/utils';

interface ClassBlockProps {
  slot: TimetableSlot;
  isClashing?: boolean;
  onClick?: (slot: TimetableSlot) => void;
}

/**
 * ClassBlock component
 * Displays subject information in a colored block within the timetable grid
 */
export default function ClassBlock({ 
  slot, 
  isClashing = false,
  onClick 
}: ClassBlockProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Determine the color for the block
  const blockColor = slot.color || 
    (slot.type && CLASS_TYPES[slot.type]?.color) || 
    '#6b7280'; // gray-500 as fallback
  
  // Determine text color based on background color (always white for now)
  const textColor = 'white';
  
  // Handle click on the block
  const handleClick = () => {
    if (onClick) {
      onClick(slot);
    }
    setShowDetails(!showDetails);
  };
  
  // Determine border style for clashing blocks
  const borderStyle = isClashing 
    ? 'ring-2 ring-red-500 dark:ring-red-400 animate-pulse-slow' 
    : '';
  
  return (
    <div 
      className={`
        rounded shadow-sm overflow-hidden flex flex-col h-full w-full
        transition-all duration-200 cursor-pointer
        ${borderStyle}
        ${showDetails ? 'z-50 shadow-lg' : ''}
      `}
      style={{ 
        backgroundColor: blockColor,
        color: textColor,
        maxWidth: '100%' // Ensure it doesn't exceed its container width
      }}
      onClick={handleClick}
    >
      {/* Header: Subject code and type */}
      <div className="flex justify-between items-start px-2 pt-2">
        <div className="font-medium text-sm truncate">
          {slot.subject_code}
        </div>
        <div className="text-xs bg-white/20 px-1 rounded">
          {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
        </div>
      </div>
      
      {/* Subject name */}
      <div className="text-xs truncate mt-1 px-2">
        {slot.subject_name}
        {isClashing && (
          <span className="inline-block ml-1" title="Clash detected">⚠️</span>
        )}
      </div>
      
      {/* Venue (always visible) */}
      <div className="text-xs opacity-80 truncate mt-auto px-2 pb-2">
        {slot.venue}
      </div>
      
      {/* Expanded details (visible on click) */}
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-white/20 text-xs space-y-1 animate-fade-in px-2 pb-2">
          <div>
            <span className="opacity-80">Time:</span> {formatTimeRange(slot.start_time, slot.end_time)}
          </div>
          
          {slot.instructor && (
            <div>
              <span className="opacity-80">Instructor:</span> {slot.instructor}
            </div>
          )}
          
          {isClashing && (
            <div className="text-red-200 font-medium">
              ⚠️ Clash detected
            </div>
          )}
        </div>
      )}
    </div>
  );
} 