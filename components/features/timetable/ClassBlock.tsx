"use client";

import React, { useState } from 'react';
import { TimetableSlot } from '@/types/timetable';
import { CLASS_TYPES } from '@/constants';
import { formatTimeRange } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useResponsive';

interface ClassBlockProps {
  slot: TimetableSlot;
  isClashing?: boolean;
  onClick?: (slot: TimetableSlot) => void;
  compactMode?: boolean; // For mobile week view
}

/**
 * ClassBlock component
 * Displays subject information in a colored block within the timetable grid
 */
export default function ClassBlock({ 
  slot, 
  isClashing = false,
  onClick,
  compactMode = false
}: ClassBlockProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isMobile = useIsMobile();
  
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

  // Ultra-compact mode for mobile week view - only show subject code
  if (compactMode) {
    return (
      <div 
        className={`
          rounded-md shadow-sm overflow-hidden flex items-center justify-center h-full w-full
          transition-all duration-200 cursor-pointer hover:shadow-md
          ${borderStyle}
        `}
        style={{ 
          backgroundColor: blockColor,
          color: textColor,
          maxWidth: '100%',
          minWidth: 0,
          fontSize: '10px', // Very small font for mobile
          padding: '2px'
        }}
        onClick={handleClick}
        title={isClashing 
          ? `⚠️ CLASH DETECTED - ${slot.subject_code} - ${slot.subject_name}\n${formatTimeRange(slot.start_time, slot.end_time)}\n${slot.venue}`
          : `${slot.subject_code} - ${slot.subject_name}\n${formatTimeRange(slot.start_time, slot.end_time)}\n${slot.venue}`
        }
      >
        <div className="text-center leading-tight">
          <div className="font-bold text-xs truncate">
            {slot.subject_code}
          </div>
          {isClashing && (
            <div className="text-xs">⚠️</div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`
        rounded-lg shadow-md overflow-hidden flex flex-col h-full w-full
        transition-all duration-200 cursor-pointer hover:shadow-lg 
        sm:transform sm:hover:-translate-y-0.5
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
      title={isClashing 
        ? `⚠️ CLASH DETECTED - ${slot.subject_code} - ${slot.subject_name}`
        : `${slot.subject_code} - ${slot.subject_name}`
      }
    >
      {isClashing ? (
        // Simplified layout for clashing slots - only show subject code
        <div className="flex flex-col items-center justify-center h-full px-2 py-2 text-center">
          <div className="font-bold text-xs sm:text-sm truncate">
            {slot.subject_code}
          </div>
          <div className="text-xs opacity-80 mt-1">
            ⚠️
          </div>
        </div>
      ) : (
        // Full layout for non-clashing slots
        <>
          {/* Header: Subject code and type */}
          <div className="flex justify-between items-start px-2 sm:px-3 pt-2 sm:pt-3 min-w-0">
            <div className="font-semibold text-xs sm:text-sm truncate flex-1 min-w-0 mr-2">
              {slot.subject_code}
            </div>
            {/* Only show type indicator on desktop */}
            {!isMobile && (
              <div className="text-xs bg-white/25 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium flex-shrink-0">
                {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
              </div>
            )}
          </div>
          
          {/* Subject name - with word wrapping for long names */}
          <div className="px-2 sm:px-3 mt-1 sm:mt-2 flex-1 min-h-0 overflow-hidden">
            <div 
              className="text-xs opacity-90 font-medium leading-tight"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: showDetails ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                hyphens: 'auto'
              }}
              title={slot.subject_name} // Show full name on hover
            >
              {slot.subject_name}
            </div>
          </div>
        </>
      )}

      {/* Expanded details (visible on click) */}
      {showDetails && (
        <div className="mt-1 sm:mt-2 pt-2 sm:pt-3 border-t border-white/25 text-xs space-y-1 sm:space-y-2 animate-fade-in px-2 sm:px-3 pb-2 sm:pb-3 bg-black/10 rounded-b-lg overflow-hidden">
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