"use client";

import React from 'react';
import { TimetableSlot } from '@/types/timetable';
import { formatDayOfWeek, formatTimeRange } from '@/lib/utils';
import useTimetableStore from '@/store/timetableStore';

/**
 * UnplacedSubjects component
 * Displays subjects that couldn't be placed due to conflicts
 */
export default function UnplacedSubjects() {
  const { unplacedSlots, timetableSlots, placeSubject, removeUnplacedSubject } = useTimetableStore();

  if (unplacedSlots.length === 0) {
    return null;
  }

  // Helper function to get conflicts for a specific slot
  const getConflictsForSlot = (slotId: string): TimetableSlot[] => {
    const unplacedSlot = unplacedSlots.find(slot => slot.id === slotId);
    if (!unplacedSlot) return [];

    // Find placed slots that conflict with this unplaced slot
    return timetableSlots.filter(placedSlot => 
      placedSlot.day_of_week === unplacedSlot.day_of_week &&
      // Check for time overlap
      (unplacedSlot.start_time < placedSlot.end_time && 
       unplacedSlot.end_time > placedSlot.start_time)
    );
  };

  // Handle placing a subject (with or without replacement)
  const handlePlaceSubject = (slotId: string, action: 'place' | 'replace', conflictingSlotId?: string) => {
    if (action === 'place') {
      placeSubject(slotId, 'place');
    } else if (action === 'replace' && conflictingSlotId) {
      placeSubject(slotId, 'replace', conflictingSlotId);
    }
  };

  // Handle removing a subject
  const handleRemoveSubject = (slotId: string) => {
    removeUnplacedSubject(slotId);
  };

  return (
    <div className="mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Subjects Awaiting Placement
            </h3>
            <span className="ml-auto text-sm text-amber-600 dark:text-amber-400 font-medium">
              {unplacedSlots.length} subject{unplacedSlots.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
            These subjects couldn&apos;t be automatically placed due to scheduling conflicts. Please choose how to handle each one.
          </p>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4">
          {unplacedSlots.map((slot) => {
            const conflictingSlots = getConflictsForSlot(slot.id);
            
            return (
              <div 
                key={slot.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Subject Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: slot.color || '#6b7280' }}
                      ></div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {slot.subject_code} - {slot.subject_name}
                      </h4>
                      <span className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                        {slot.type}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {formatDayOfWeek(slot.day_of_week)} • {formatTimeRange(slot.start_time, slot.end_time)} • {slot.venue}
                    </div>
                    
                    {/* Conflict Information */}
                    {conflictingSlots.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                          Conflicts with:
                        </p>
                        <div className="space-y-1">
                          {conflictingSlots.map((conflictingSlot) => (
                            <div 
                              key={conflictingSlot.id}
                              className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded"
                            >
                              <span className="font-medium">
                                {conflictingSlot.subject_code}
                              </span>
                              {" - "}
                              {formatDayOfWeek(conflictingSlot.day_of_week)} • {formatTimeRange(conflictingSlot.start_time, conflictingSlot.end_time)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {conflictingSlots.map((conflictingSlot) => (
                      <button
                        key={`replace-${conflictingSlot.id}`}
                        onClick={() => handlePlaceSubject(slot.id, 'replace', conflictingSlot.id)}
                        className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Replace {conflictingSlot.subject_code}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePlaceSubject(slot.id, 'place')}
                      className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      Place Anyway
                    </button>
                    
                    <button
                      onClick={() => handleRemoveSubject(slot.id)}
                      className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bulk Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => {
                unplacedSlots.forEach(slot => handlePlaceSubject(slot.id, 'place'));
              }}
              className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-medium"
            >
              Place All Subjects
            </button>
            
            <button
              onClick={() => {
                unplacedSlots.forEach(slot => handleRemoveSubject(slot.id));
              }}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              Remove All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
