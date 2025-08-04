"use client";

import React from 'react';
import { TimetableSlot, Clash } from '@/src/types/timetable';
import { formatDayOfWeek, formatTimeRange } from '@/src/lib/utils';

interface ConflictGroup {
  id: string;
  subjects: Array<{
    subject_code: string;
    subject_name: string;
    slots: TimetableSlot[];
  }>;
  conflictInfo: {
    day: string;
    time: string;
    type: 'time' | 'venue';
    venue?: string;
  };
  isMultiSubjectOverlap: boolean;
}

interface ConflictingSubjectsListProps {
  clashes: Clash[];
  unplacedSlots: TimetableSlot[];
  allSlots: TimetableSlot[];
  className?: string;
}

/**
 * ConflictingSubjectsList component
 * Displays all subjects that have scheduling conflicts in a clean, organized format
 * Avoids duplicate entries and groups overlapping subjects intelligently
 * Shows partial conflict information (e.g., "1 of 3 classes excluded")
 */
export default function ConflictingSubjectsList({ 
  clashes, 
  unplacedSlots, 
  allSlots,
  className = "" 
}: ConflictingSubjectsListProps) {
  
  // Get all conflicting slot IDs
  const getConflictingSlotIds = (): Set<string> => {
    const conflictingSlotIds = new Set<string>();
    
    // Add slots from direct clashes
    clashes.forEach(clash => {
      conflictingSlotIds.add(clash.slot1.id);
      conflictingSlotIds.add(clash.slot2.id);
    });
    
    // Add all unplaced slots
    unplacedSlots.forEach(slot => {
      conflictingSlotIds.add(slot.id);
    });
    
    return conflictingSlotIds;
  };

  // Get subject statistics (total vs conflicting sessions)
  const getSubjectStats = () => {
    const conflictingSlotIds = getConflictingSlotIds();
    const stats = new Map<string, { 
      total: number; 
      conflicting: number; 
      nonConflicting: number;
      subjectName: string;
    }>();
    
    // Group all slots by subject to get complete picture
    allSlots.forEach(slot => {
      if (!stats.has(slot.subject_code)) {
        stats.set(slot.subject_code, { 
          total: 0, 
          conflicting: 0, 
          nonConflicting: 0,
          subjectName: slot.subject_name
        });
      }
      
      const subjectStats = stats.get(slot.subject_code)!;
      subjectStats.total++;
      
      if (conflictingSlotIds.has(slot.id)) {
        subjectStats.conflicting++;
      } else {
        subjectStats.nonConflicting++;
      }
    });
    
    // Filter to only subjects that have conflicts
    const conflictingStats = new Map();
    stats.forEach((stat, subjectCode) => {
      if (stat.conflicting > 0) {
        conflictingStats.set(subjectCode, stat);
      }
    });
    
    return conflictingStats;
  };

  // Group conflicts to avoid duplicates and handle multi-subject overlaps
  const getConflictGroups = (): ConflictGroup[] => {
    const conflictGroups: ConflictGroup[] = [];
    const processedClashes = new Set<string>();
    const conflictingSlotIds = getConflictingSlotIds();
    
    // Group clashes by time and location to detect multi-subject overlaps
    const clashGroups = new Map<string, Clash[]>();
    
    clashes.forEach(clash => {
      const key = `${clash.slot1.day_of_week}-${clash.slot1.start_time}-${clash.slot1.end_time}`;
      if (!clashGroups.has(key)) {
        clashGroups.set(key, []);
      }
      clashGroups.get(key)!.push(clash);
    });
    
    // Process each clash group
    clashGroups.forEach((clashGroup, timeKey) => {
      if (clashGroup.length === 0) return;
      
      // Get all unique subjects in this time slot
      const subjectsInGroup = new Map<string, {
        subject_code: string;
        subject_name: string;
        slots: TimetableSlot[];
      }>();
      
      let conflictType: 'time' | 'venue' = 'time';
      let conflictDay = '';
      let conflictTime = '';
      let conflictVenue = '';
      
      clashGroup.forEach(clash => {
        // Mark this clash as processed
        processedClashes.add(clash.id);
        
        // Add both subjects from the clash
        [clash.slot1, clash.slot2].forEach(slot => {
          if (!subjectsInGroup.has(slot.subject_code)) {
            subjectsInGroup.set(slot.subject_code, {
              subject_code: slot.subject_code,
              subject_name: slot.subject_name,
              slots: []
            });
          }
          
          const subject = subjectsInGroup.get(slot.subject_code)!;
          // Only add the specific conflicting slot
          if (!subject.slots.some(s => s.id === slot.id)) {
            subject.slots.push(slot);
          }
        });
        
        // Set conflict info from first clash in group
        if (!conflictDay) {
          conflictDay = formatDayOfWeek(clash.slot1.day_of_week);
          conflictTime = formatTimeRange(clash.slot1.start_time, clash.slot1.end_time);
          conflictType = clash.type;
          conflictVenue = clash.slot1.venue;
        }
      });
      
      // Create conflict group
      const subjects = Array.from(subjectsInGroup.values()).sort((a, b) => 
        a.subject_code.localeCompare(b.subject_code)
      );
      
      conflictGroups.push({
        id: timeKey,
        subjects,
        conflictInfo: {
          day: conflictDay,
          time: conflictTime,
          type: conflictType,
          venue: conflictVenue
        },
        isMultiSubjectOverlap: subjects.length > 2
      });
    });
    
    // Handle unplaced slots (subjects that couldn't be placed at all)
    const unplacedSubjects = new Map<string, {
      subject_code: string;
      subject_name: string;
      slots: TimetableSlot[];
    }>();
    
    unplacedSlots.forEach(slot => {
      if (!unplacedSubjects.has(slot.subject_code)) {
        unplacedSubjects.set(slot.subject_code, {
          subject_code: slot.subject_code,
          subject_name: slot.subject_name,
          slots: []
        });
      }
      unplacedSubjects.get(slot.subject_code)!.slots.push(slot);
    });
    
    // Add unplaced subjects as individual conflict groups if they're not already in clashes
    unplacedSubjects.forEach((subject, subjectCode) => {
      // Only add if this subject is not already in any clash group
      const alreadyInClash = conflictGroups.some(group => 
        group.subjects.some(s => s.subject_code === subjectCode)
      );
      
      if (!alreadyInClash) {
        conflictGroups.push({
          id: `unplaced-${subjectCode}`,
          subjects: [subject],
          conflictInfo: {
            day: 'Multiple',
            time: 'time slots',
            type: 'time'
          },
          isMultiSubjectOverlap: false
        });
      }
    });
    
    return conflictGroups.sort((a, b) => {
      // Sort by primary subject code
      const aPrimary = a.subjects[0]?.subject_code || '';
      const bPrimary = b.subjects[0]?.subject_code || '';
      return aPrimary.localeCompare(bPrimary);
    });
  };
  
  const conflictGroups = getConflictGroups();
  const subjectStats = getSubjectStats();
  
  if (conflictGroups.length === 0) {
    return null;
  }
  
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 sm:p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full mr-3">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
            Conflicting Sessions
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400">
            {Array.from(subjectStats.values()).reduce((total, stat) => total + stat.conflicting, 0)} session{Array.from(subjectStats.values()).reduce((total, stat) => total + stat.conflicting, 0) !== 1 ? 's' : ''} from {subjectStats.size} subject{subjectStats.size !== 1 ? 's' : ''} excluded
          </p>
        </div>
      </div>
      
      <p className="text-red-700 dark:text-red-300 mb-6 text-sm leading-relaxed">
        The following sessions have conflicting schedules and have been excluded from your timetable. 
        Other sessions from these subjects that don't conflict are still included in your schedule.
      </p>
      
      <div className="space-y-4">
        {conflictGroups.map((group) => (
          <div 
            key={group.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-700 p-4 shadow-sm"
          >
            {/* Conflict Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                  {group.conflictInfo.type === 'time' ? 'Time' : 'Venue'} clash
                </span>
                {group.isMultiSubjectOverlap && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300">
                    Multi-subject overlap
                  </span>
                )}
              </div>
              
              {group.isMultiSubjectOverlap ? (
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  {group.subjects.map(s => s.subject_code).join(', ')} all overlap
                </h4>
              ) : (
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  {group.subjects[0]?.subject_code} conflicts with {group.subjects[1]?.subject_code}
                </h4>
              )}
              
              <p className="text-red-600 dark:text-red-400 font-medium">
                {group.conflictInfo.day} • {group.conflictInfo.time}
                {group.conflictInfo.venue && group.conflictInfo.type === 'venue' && (
                  <span> • {group.conflictInfo.venue}</span>
                )}
              </p>
            </div>

            {/* Subject Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {group.subjects.map((subject, index) => {
                const stats = subjectStats.get(subject.subject_code);
                return (
                  <div key={subject.subject_code} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {subject.subject_code}
                      </h5>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                      {subject.subject_name}
                    </p>
                    
                    {/* Conflict Statistics */}
                    {stats && (
                      <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <p className="text-xs font-medium text-red-700 dark:text-red-400">
                          {stats.conflicting} of {stats.total} session{stats.total !== 1 ? 's' : ''} excluded due to conflicts
                        </p>
                        {stats.nonConflicting > 0 && (
                          <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                            {stats.nonConflicting} session{stats.nonConflicting !== 1 ? 's' : ''} still included in timetable
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Conflicting Sessions Only */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Conflicting Sessions ({subject.slots.length}):
                      </p>
                      <div className="space-y-1">
                        {subject.slots.map((slot) => (
                          <div key={slot.id} className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded">
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-1">
                              • {formatDayOfWeek(slot.day_of_week)} • {formatTimeRange(slot.start_time, slot.end_time)} • {slot.venue}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="mt-3">
                      <button
                        disabled
                        className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed transition-colors text-sm"
                        title="Feature coming soon"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Timetable (Coming Soon)
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
              How to resolve conflicts:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
              <li>• Choose different tutorial groups for conflicting subjects</li>
              <li>• Remove one of the conflicting subjects from your selection</li>
              <li>• Check if alternative class times are available</li>
              <li>• Note: Non-conflicting sessions from these subjects remain in your timetable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
