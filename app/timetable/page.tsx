'use client';

import { useState, useEffect } from 'react';
import TimetableGrid from '@/src/components/timetable/TimetableGrid';
import TimetablePositioner from '@/src/components/timetable/TimetablePositioner';
import ClassBlock from '@/src/components/timetable/ClassBlock';
import ClashWarning from '@/src/components/timetable/ClashWarning';
import Loading from '@/src/components/common/Loading';
import ErrorMessage from '@/src/components/common/ErrorMessage';
import useSubjectStore from '@/src/store/subjectStore';
import useTimetableStore from '@/src/store/timetableStore';
import { Clash, TimetableSlot } from '@/src/types/timetable';

export default function TimetablePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWeekends, setShowWeekends] = useState(false);
  
  const { selectedSubjects } = useSubjectStore();
  const { 
    timetableSlots, 
    unplacedSlots,
    clashes, 
    generateTimetable,
    resetTimetable
  } = useTimetableStore();

  useEffect(() => {
    // Load any existing timetable data
    const loadExistingTimetable = async () => {
      try {
        // If we have selected subjects but no timetable slots, generate the timetable
        if (selectedSubjects.length > 0 && timetableSlots.length === 0) {
          await generateTimetable();
        }
      } catch (err) {
        console.error('Error loading timetable:', err);
      }
    };
    
    loadExistingTimetable();
  }, [selectedSubjects, timetableSlots.length, generateTimetable]);

  const handleGenerateTimetable = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await generateTimetable();
    } catch (err) {
      setError('Failed to generate timetable. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a slot has clashes
  const hasClash = (slotId: string): boolean => {
    return clashes.some(clash => 
      clash.slot1.id === slotId || clash.slot2.id === slotId
    );
  };

  // Get all slot IDs that are involved in clashes
  const clashingSlotIds = new Set<string>();
  
  // Add slots from direct clashes
  clashes.forEach(clash => {
    clashingSlotIds.add(clash.slot1.id);
    clashingSlotIds.add(clash.slot2.id);
  });

  // Add all unplaced slots to the clashing set
  unplacedSlots.forEach(slot => {
    clashingSlotIds.add(slot.id);
  });

  // Get all subject codes that have conflicts (from clashes and unplaced slots)
  const conflictingSubjects = new Set<string>();
  
  // Add subjects from direct clashes - ensure BOTH subjects in each clash are marked as conflicting
  clashes.forEach(clash => {
    conflictingSubjects.add(clash.slot1.subject_code);
    conflictingSubjects.add(clash.slot2.subject_code);
  });
  
  // Add subjects from unplaced slots
  unplacedSlots.forEach(slot => {
    conflictingSubjects.add(slot.subject_code);
  });

  // Enhanced filtering: Remove ALL slots from ANY subject that has ANY conflict
  // This ensures that if any slot of a subject conflicts, ALL slots of that subject are removed
  const nonClashingSlots = timetableSlots.filter(slot => {
    // Exclude if slot ID is directly involved in a clash
    if (clashingSlotIds.has(slot.id)) return false;
    
    // Exclude if the subject code has ANY conflicts anywhere
    if (conflictingSubjects.has(slot.subject_code)) return false;
    
    // Additional check: ensure no other slot from this subject is in unplaced or clashing
    const hasConflictingSlotFromSameSubject = timetableSlots.some(otherSlot => 
      otherSlot.subject_code === slot.subject_code && 
      (clashingSlotIds.has(otherSlot.id) || conflictingSubjects.has(otherSlot.subject_code))
    );
    
    return !hasConflictingSlotFromSameSubject;
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Your Timetable</h1>
      
      {error && <ErrorMessage message={error} />}
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={handleGenerateTimetable}
              disabled={selectedSubjects.length === 0 || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {isLoading ? 'Generating...' : 'Generate Timetable'}
            </button>
            <span className="ml-4 text-sm text-gray-500">
              {selectedSubjects.length} subject(s) selected
            </span>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWeekends}
                onChange={(e) => setShowWeekends(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              <span>Show Weekends</span>
            </label>
            
            {(clashes.length > 0 || unplacedSlots.length > 0) && (
              <div className="ml-4 text-amber-600 font-medium">
                {clashes.length + (unplacedSlots.length > 0 ? 1 : 0)} conflict{(clashes.length + (unplacedSlots.length > 0 ? 1 : 0)) !== 1 ? 's' : ''} - {timetableSlots.length - nonClashingSlots.length + unplacedSlots.length} classes excluded
              </div>
            )}
          </div>
        </div>
      </div>

      {(clashes.length > 0 || unplacedSlots.length > 0) && (
        <div className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-red-700">
                Schedule Conflicts Detected
              </h3>
            </div>
            <p className="text-red-600 mb-4">
              The following subjects have conflicting schedules and have been excluded from your timetable. 
              Please resolve these conflicts by selecting different tutorial groups or removing one of the conflicting subjects.
            </p>
            <div className="space-y-3">
              {clashes.map((clash: Clash, index: number) => (
                <div key={index} className="bg-white border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-800">
                      Conflict #{index + 1}: {clash.type === 'time' ? 'Time Clash' : 'Venue Clash'}
                    </span>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                      {clash.severity === 'error' ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded p-2 bg-gray-50">
                      <p className="font-medium text-gray-800">
                        {clash.slot1.subject_code} - {clash.slot1.subject_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][clash.slot1.day_of_week]} 
                        • {clash.slot1.start_time} - {clash.slot1.end_time}
                      </p>
                      <p className="text-sm text-gray-600">
                        {clash.slot1.type.charAt(0).toUpperCase() + clash.slot1.type.slice(1)} • Venue: {clash.slot1.venue}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded p-2 bg-gray-50">
                      <p className="font-medium text-gray-800">
                        {clash.slot2.subject_code} - {clash.slot2.subject_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][clash.slot2.day_of_week]} 
                        • {clash.slot2.start_time} - {clash.slot2.end_time}
                      </p>
                      <p className="text-sm text-gray-600">
                        {clash.slot2.type.charAt(0).toUpperCase() + clash.slot2.type.slice(1)} • Venue: {clash.slot2.venue}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {unplacedSlots.length > 0 && (
                <div className="bg-white border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-800">
                      Additional Conflicting Subjects
                    </span>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                      Unable to Place
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {unplacedSlots.map((slot: TimetableSlot) => (
                      <div key={slot.id} className="border border-gray-200 rounded p-2 bg-gray-50">
                        <p className="font-medium text-gray-800">
                          {slot.subject_code} - {slot.subject_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][slot.day_of_week]} 
                          • {slot.start_time} - {slot.end_time}
                        </p>
                        <p className="text-sm text-gray-600">
                          {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)} • Venue: {slot.venue}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
          <TimetableGrid showWeekends={showWeekends}>
            {nonClashingSlots.map((slot: TimetableSlot) => (
              <TimetablePositioner
                key={slot.id}
                dayOfWeek={slot.day_of_week}
                startTime={slot.start_time}
                endTime={slot.end_time}
                showWeekends={showWeekends}
              >
                <ClassBlock 
                  slot={slot}
                  isClashing={false}
                />
              </TimetablePositioner>
            ))}
          </TimetableGrid>
        </div>
      )}

      {timetableSlots.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {selectedSubjects.length === 0 
              ? 'Please select subjects to generate a timetable' 
              : 'Click "Generate Timetable" to create your schedule'}
          </p>
        </div>
      )}

      {timetableSlots.length > 0 && nonClashingSlots.length === 0 && (clashes.length > 0 || unplacedSlots.length > 0) && !isLoading && (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-yellow-700 font-medium">All classes have schedule conflicts</p>
          <p className="text-yellow-600 mt-2">
            Please resolve the conflicts above to display your timetable
          </p>
        </div>
      )}
    </div>
  );
} 