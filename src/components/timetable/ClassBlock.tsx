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
  
  // Determine the color for the block - using purple theme
  const blockColor = slot.color || 
    (slot.type && CLASS_TYPES[slot.type]?.color) || 
    '#8B5CF6'; // purple-500 as fallback instead of gray
  
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
        rounded-lg shadow-md overflow-hidden flex flex-col h-full w-full
        transition-all duration-200 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5
        ${borderStyle}
        ${showDetails ? 'z-50 shadow-xl ring-2 ring-purple-300 dark:ring-purple-600' : ''}
      `}
      style={{ 
        backgroundColor: blockColor,
        color: textColor,
        maxWidth: '100%' // Ensure it doesn't exceed its container width
      }}
      onClick={handleClick}
    >
      {/* Header: Subject code and type */}
      <div className="flex justify-between items-start px-3 pt-3">
        <div className="font-semibold text-sm truncate">
          {slot.subject_code}
        </div>
        <div className="text-xs bg-white/25 px-2 py-1 rounded-md font-medium">
          {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
        </div>
      </div>
      
      {/* Subject name */}
      <div className="text-xs truncate mt-2 px-3 opacity-90 font-medium">
        {slot.subject_name}
        {isClashing && (
          <span className="inline-block ml-1" title="Clash detected">⚠️</span>
        )}
      </div>
      
      {/* Venue (always visible) */}
      <div className="text-xs opacity-80 truncate mt-auto px-3 pb-3 font-medium">
        📍 {slot.venue}
      </div>
      
      {/* Expanded details (visible on click) */}
      {showDetails && (
        <div className="mt-2 pt-3 border-t border-white/25 text-xs space-y-2 animate-fade-in px-3 pb-3 bg-black/10 rounded-b-lg">
          <div className="flex items-center">
            <span className="opacity-80 font-medium">🕒 Time:</span> 
            <span className="ml-2">{formatTimeRange(slot.start_time, slot.end_time)}</span>
          </div>
          
          {slot.instructor && (
            <div className="flex items-center">
              <span className="opacity-80 font-medium">👨‍🏫 Instructor:</span> 
              <span className="ml-2">{slot.instructor}</span>
            </div>
          )}
          
          {isClashing && (
            <div className="text-red-200 font-medium flex items-center">
              ⚠️ <span className="ml-1">Clash detected</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 