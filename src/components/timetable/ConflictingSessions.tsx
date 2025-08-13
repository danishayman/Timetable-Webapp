"use client";

import React, { useState, useRef, useEffect } from 'react';
import { TimetableSlot, Clash } from '@/src/types/timetable';
import { formatDayOfWeek, formatTimeRange } from '@/src/lib/utils';

// SVG Icons components
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const InformationCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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
    duration?: string;
  };
  isMultiSubjectOverlap: boolean;
}

interface ConflictingSessionsProps {
  clashes: Clash[];
  unplacedSlots: TimetableSlot[];
  allSlots: TimetableSlot[];
  className?: string;
}

// Helper function to calculate overlap duration
const calculateOverlapDuration = (startTime: string, endTime: string): string => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours >= 1) {
    return `${Math.floor(diffHours)}h${diffHours % 1 ? ' 30m' : ''}`;
  } else {
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return `${diffMinutes}m`;
  }
};

/**
 * ConflictingSessions component
 * Displays scheduling conflicts in a compact, expandable format
 * Features:
 * - Compact summary view with subject codes, day, time, and overlap duration
 * - Expandable accordion for detailed conflict information
 * - Color-coded status indicators (red for clash, green for still included)
 * - Helpful tooltip for conflict resolution guidance
 * - Responsive design for desktop and mobile
 */
export default function ConflictingSessions({ 
  clashes, 
  unplacedSlots, 
  allSlots,
  className = "" 
}: ConflictingSessionsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const helpTooltipRef = useRef<HTMLDivElement>(null);

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Handle click outside to close help tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpTooltipRef.current && !helpTooltipRef.current.contains(event.target as Node)) {
        setShowHelpTooltip(false);
      }
    };

    if (showHelpTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHelpTooltip]);
  
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
          venue: conflictVenue,
          duration: clashGroup.length > 0 ? calculateOverlapDuration(clashGroup[0].slot1.start_time, clashGroup[0].slot1.end_time) : undefined
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
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 lg:p-6 ${className}`}>
      {/* Header with help tooltip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 mr-2 sm:mr-3 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-300">
              Schedule Conflicts
            </h3>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 break-words">
              {Array.from(subjectStats.values()).reduce((total, stat) => total + stat.conflicting, 0)} session{Array.from(subjectStats.values()).reduce((total, stat) => total + stat.conflicting, 0) !== 1 ? 's' : ''} from {subjectStats.size} subject{subjectStats.size !== 1 ? 's' : ''} excluded
            </p>
          </div>
        </div>
        
        {/* Help tooltip */}
        <div className="relative flex-shrink-0 self-start sm:self-auto" ref={helpTooltipRef}>
          <button
            onClick={() => setShowHelpTooltip(!showHelpTooltip)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors touch-manipulation"
            title="Help resolving conflicts"
          >
            <InformationCircleIcon className="w-5 h-5" />
          </button>
          
          {showHelpTooltip && (
            <div className="absolute top-full right-0 sm:right-0 mt-2 w-80 sm:w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 z-20">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">How to resolve conflicts:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Choose different tutorial groups</li>
                <li>• Remove conflicting subjects</li>
                <li>• Check alternative class times</li>
                <li>• Non-conflicting sessions remain included</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Compact conflict summary list */}
      <div className="space-y-3">
        {conflictGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const subjectCodes = group.subjects.map(s => s.subject_code);
          const hasOtherSessions = group.subjects.some(subject => {
            const stats = subjectStats.get(subject.subject_code);
            return stats && stats.nonConflicting > 0;
          });

          return (
            <div 
              key={group.id}
              className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg overflow-hidden"
            >
              {/* Compact summary header */}
              <div 
                className="flex items-start sm:items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors touch-manipulation"
                onClick={() => toggleGroupExpansion(group.id)}
              >
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-1">
                      <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white break-words">
                        {subjectCodes.join(', ')}
                      </span>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {group.isMultiSubjectOverlap && (
                          <span className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full flex-shrink-0">
                            Multi-overlap
                          </span>
                        )}
                        {hasOtherSessions && (
                          <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" title="Other sessions still included" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="break-words">{group.conflictInfo.day} {group.conflictInfo.time}</span>
                      {group.conflictInfo.duration && (
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="whitespace-nowrap">Overlap: {group.conflictInfo.duration}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-600 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/30">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {group.subjects.map((subject) => {
                      const stats = subjectStats.get(subject.subject_code);
                      return (
                        <div key={subject.subject_code} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 break-words">
                                {subject.subject_code}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 break-words">
                                {subject.subject_name}
                              </p>
                            </div>
                            
                            {stats && stats.nonConflicting > 0 && (
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded flex-shrink-0 self-start">
                                <CheckCircleIcon className="w-3 h-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{stats.nonConflicting} other session{stats.nonConflicting !== 1 ? 's' : ''} included</span>
                              </div>
                            )}
                          </div>

                          {/* Conflicting sessions */}
                          <div className="mb-3 sm:mb-4">
                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                              Conflicting Sessions ({subject.slots.length})
                            </h5>
                            <div className="space-y-2">
                              {subject.slots.map((slot) => (
                                <div key={slot.id} className="text-xs sm:text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded px-2 sm:px-3 py-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <span className="font-medium text-red-800 dark:text-red-300">
                                      {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
                                    </span>
                                    <span className="text-xs text-red-600 dark:text-red-400 break-words">
                                      {formatDayOfWeek(slot.day_of_week)} • {formatTimeRange(slot.start_time, slot.end_time)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-red-600 dark:text-red-400 mt-1 break-words">
                                    📍 {slot.venue}
                                    {slot.instructor && <span> • 👨‍🏫 {slot.instructor}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              disabled
                              className="flex-1 px-3 py-2.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed text-xs sm:text-sm font-medium transition-colors touch-manipulation"
                              title="Feature coming soon"
                            >
                              View Other Slots
                            </button>
                            <button
                              disabled
                              className="flex-1 px-3 py-2.5 sm:py-2 bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 rounded-lg cursor-not-allowed text-xs sm:text-sm font-medium transition-colors touch-manipulation"
                              title="Feature coming soon"
                            >
                              Remove Subject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
