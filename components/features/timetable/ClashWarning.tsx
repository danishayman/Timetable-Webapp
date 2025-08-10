"use client";

import React, { useState } from 'react';
import { Clash } from '@/src/types/timetable';
import { formatDayOfWeek, formatTimeRange } from '@/src/lib/utils';

interface ClashWarningProps {
  clash: Clash;
  onResolve?: (clashId: string, action: 'remove' | 'ignore', slotId?: string) => void;
}

/**
 * ClashWarning component
 * Displays a warning for clashing timetable slots with options to resolve
 */
export default function ClashWarning({ clash, onResolve }: ClashWarningProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Determine styling based on clash severity
  const isError = clash.severity === 'error';
  const isTimeClash = clash.type === 'time';
  
  // Handle click on the warning
  const handleClick = () => {
    setShowDetails(!showDetails);
  };
  
  // Handle resolving the clash
  const handleResolve = (action: 'remove' | 'ignore', slotId?: string) => {
    if (onResolve) {
      onResolve(clash.id, action, slotId);
    }
  };
  
  return (
    <div 
      className={`p-3 rounded-lg border-l-4 mb-3 cursor-pointer transition-all duration-200 ${
        isError 
          ? 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-400' 
          : 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-400'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            {isError ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <p className={`font-medium ${
              isError ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
            }`}>
              {isTimeClash ? 'Time Clash' : 'Venue Clash'} - {isError ? 'Major' : 'Minor'}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{clash.message}</p>
        </div>
        
        <button 
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
        >
          {showDetails ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-3 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
              <p className="font-medium text-sm">{clash.slot1.subject_code} - {clash.slot1.subject_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDayOfWeek(clash.slot1.day_of_week)} • {formatTimeRange(clash.slot1.start_time, clash.slot1.end_time)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Venue: {clash.slot1.venue}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
              <p className="font-medium text-sm">{clash.slot2.subject_code} - {clash.slot2.subject_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDayOfWeek(clash.slot2.day_of_week)} • {formatTimeRange(clash.slot2.start_time, clash.slot2.end_time)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Venue: {clash.slot2.venue}</p>
            </div>
          </div>
          
          {onResolve && (
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResolve('remove', clash.slot1.id);
                }}
                className="px-3 py-1 bg-white text-sm border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Remove {clash.slot1.subject_code}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResolve('remove', clash.slot2.id);
                }}
                className="px-3 py-1 bg-white text-sm border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Remove {clash.slot2.subject_code}
              </button>
              
              {clash.type === 'venue' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResolve('ignore');
                  }}
                  className="px-3 py-1 bg-white text-sm border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Ignore venue clash
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 