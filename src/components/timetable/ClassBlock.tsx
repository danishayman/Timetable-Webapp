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
        maxWidth: '100%', // Ensure it doesn't exceed its container width
        minWidth: 0, // Allow shrinking
        wordWrap: 'break-word', // Break long words
        overflow: 'hidden' // Hide any overflow
      }}
      onClick={handleClick}
    >
      {/* Header: Subject code and type */}
      <div className="flex justify-between items-start px-3 pt-3 min-w-0">
        <div className="font-semibold text-sm truncate flex-1 min-w-0 mr-2">
          {slot.subject_code}
        </div>
        <div className="text-xs bg-white/25 px-2 py-1 rounded-md font-medium flex-shrink-0">
          {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
        </div>
      </div>
      
      {/* Subject name - with word wrapping for long names */}
      <div className="px-3 mt-2 flex-1 min-h-0 overflow-hidden">
        <div 
          className="text-xs opacity-90 font-medium leading-tight"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: showDetails ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}
          title={slot.subject_name} // Show full name on hover
        >
          {slot.subject_name}
          {isClashing && (
            <span className="inline-block ml-1" title="Clash detected">⚠️</span>
          )}
        </div>
      </div>
      
      {/* Expanded details (visible on click) */}
      {showDetails && (
        <div className="mt-2 pt-3 border-t border-white/25 text-xs space-y-2 animate-fade-in px-3 pb-3 bg-black/10 rounded-b-lg overflow-hidden">
          <div className="flex items-start">
            <span className="opacity-80 font-medium flex-shrink-0">🕒 Time:</span> 
            <span className="ml-2 break-words">{formatTimeRange(slot.start_time, slot.end_time)}</span>
          </div>
          
          <div className="flex items-start">
            <span className="opacity-80 font-medium flex-shrink-0">📍 Venue:</span> 
            <span className="ml-2 break-words">{slot.venue}</span>
          </div>
          
          {slot.instructor && (
            <div className="flex items-start">
              <span className="opacity-80 font-medium flex-shrink-0">👨‍🏫 Instructor:</span> 
              <span className="ml-2 break-words">{slot.instructor}</span>
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