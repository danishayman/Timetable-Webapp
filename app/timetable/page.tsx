'use client';

import { useState, useEffect } from 'react';
import TimetableGrid from '@/src/components/timetable/TimetableGrid';
import TimetablePositioner from '@/src/components/timetable/TimetablePositioner';
import ClassBlock from '@/src/components/timetable/ClassBlock';
import ClashWarning from '@/src/components/timetable/ClashWarning';
import ConflictingSubjectsList from '@/src/components/timetable/ConflictingSubjects';
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
    resetTimetable,
    getNonConflictingSlots
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

  // Get non-conflicting slots for display
  const nonClashingSlots = getNonConflictingSlots();

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
                {clashes.length + (unplacedSlots.length > 0 ? 1 : 0)} conflict{(clashes.length + (unplacedSlots.length > 0 ? 1 : 0)) !== 1 ? 's' : ''} - {timetableSlots.length - nonClashingSlots.length} classes excluded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conflicting Subjects Section */}
      {(clashes.length > 0 || unplacedSlots.length > 0) && (
        <div className="mb-6">
          <ConflictingSubjectsList 
            clashes={clashes}
            unplacedSlots={unplacedSlots}
          />
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