"use client";

import { useEffect, useState } from 'react';
import useTimetableStore from '@/src/store/timetableStore';
import useSubjectStore from '@/src/store/subjectStore';
import { generateId } from '@/src/lib/utils';
import { CLASS_TYPES } from '@/src/lib/constants';
import { TimetableSlot, CustomSlot } from '@/src/types/timetable';
import { SessionManager } from '@/src/lib/sessionManager';

export default function TimetablePersistenceTestPage() {
  const [testResults, setTestResults] = useState<{
    status: 'pending' | 'success' | 'error';
    message: string;
  }>({
    status: 'pending',
    message: 'Running tests...'
  });
  
  const {
    sessionId,
    timetableSlots,
    customSlots,
    timetableName,
    setTimetableSlots,
    addCustomSlot,
    saveToSession,
    loadFromSession,
    resetTimetable,
    generateNewSession
  } = useTimetableStore();
  
  const { selectedSubjects } = useSubjectStore();
  
  // Run tests on component mount
  useEffect(() => {
    const runTests = async () => {
      try {
        // Step 1: Reset everything to start fresh
        resetTimetable();
        
        // Step 2: Create sample timetable data
        const sampleSlots: TimetableSlot[] = [
          {
            id: generateId(),
            subject_id: 'subject1',
            subject_code: 'CS101',
            subject_name: 'Introduction to Programming',
            type: 'lecture',
            day_of_week: 1, // Monday
            start_time: '09:00',
            end_time: '10:30',
            venue: 'Room A101',
            instructor: 'Dr. Smith',
            color: CLASS_TYPES.lecture.color,
            isCustom: false
          },
          {
            id: generateId(),
            subject_id: 'subject2',
            subject_code: 'MATH201',
            subject_name: 'Calculus I',
            type: 'lecture',
            day_of_week: 2, // Tuesday
            start_time: '11:00',
            end_time: '12:30',
            venue: 'Room B201',
            instructor: 'Prof. Williams',
            color: CLASS_TYPES.lecture.color,
            isCustom: false
          }
        ];
        
        // Step 3: Set timetable slots
        setTimetableSlots(sampleSlots);
        
        // Step 4: Add a custom slot
        addCustomSlot({
          title: 'Study Group',
          day_of_week: 4, // Thursday
          start_time: '16:00',
          end_time: '18:00',
          venue: 'Library',
          description: 'Weekly study group for CS101',
          color: CLASS_TYPES.custom.color
        });
        
        // Step 5: Save to session
        saveToSession();
        
        // Step 6: Clear the store
        resetTimetable();
        
        // Step 7: Load from session
        const loadedSlots = loadFromSession();
        
        // Step 8: Verify data loaded correctly
        if (loadedSlots.length !== 3) { // 2 regular slots + 1 custom slot
          throw new Error(`Expected 3 slots, but got ${loadedSlots.length}`);
        }
        
        // Step 9: Test session expiration
        // Simulate an expired session by manually setting an old expiration date
        if (typeof window !== 'undefined') {
          const oldDate = new Date();
          oldDate.setDate(oldDate.getDate() - 31); // 31 days ago (past the 30-day limit)
          localStorage.setItem('timetable_expiration', oldDate.toISOString());
          
          // Try to clear expired session
          SessionManager.clearExpiredSession();
          
          // Check if data was cleared
          const shouldBeNull = SessionManager.loadTimetableData();
          if (shouldBeNull !== null) {
            throw new Error('Session expiration test failed: data was not cleared');
          }
          
          // Reset expiration date for further testing
          SessionManager.updateExpirationDate();
        }
        
        // Step 10: Generate new sample data for further testing
        const newSampleSlots: TimetableSlot[] = [
          {
            id: generateId(),
            subject_id: 'subject3',
            subject_code: 'PHYS101',
            subject_name: 'Introduction to Physics',
            type: 'lecture',
            day_of_week: 3, // Wednesday
            start_time: '14:00',
            end_time: '15:30',
            venue: 'Room C301',
            instructor: 'Dr. Johnson',
            color: CLASS_TYPES.lecture.color,
            isCustom: false
          }
        ];
        
        // Step 11: Set new timetable slots
        setTimetableSlots(newSampleSlots);
        
        // Step 12: Save to session again
        saveToSession();
        
        // Step 13: Simulate browser refresh by reloading from session
        const refreshedSlots = loadFromSession();
        
        // Step 14: Verify data persisted through "refresh"
        if (refreshedSlots.length !== 1) {
          throw new Error(`Expected 1 slot after refresh, but got ${refreshedSlots.length}`);
        }
        
        // All tests passed
        setTestResults({
          status: 'success',
          message: 'All persistence tests passed successfully!'
        });
      } catch (error) {
        console.error('Test failed:', error);
        setTestResults({
          status: 'error',
          message: `Test failed: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    };
    
    runTests();
  }, [
    resetTimetable, 
    setTimetableSlots, 
    addCustomSlot, 
    saveToSession, 
    loadFromSession
  ]);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Timetable Persistence Test</h1>
      
      {/* Test Results */}
      <div className={`p-4 mb-8 rounded-lg ${
        testResults.status === 'success' ? 'bg-green-100 text-green-800' :
        testResults.status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        <h2 className="text-lg font-semibold mb-2">Test Results</h2>
        <p>{testResults.message}</p>
      </div>
      
      {/* Current Store State */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Store State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Session ID:</p>
            <p className="font-mono">{sessionId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Timetable Name:</p>
            <p>{timetableName}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Timetable Slots: {timetableSlots.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Custom Slots: {customSlots.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Selected Subjects: {selectedSubjects.length}</p>
        </div>
      </div>
      
      {/* Manual Test Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Manual Test Controls</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              resetTimetable();
              setTestResults({
                status: 'pending',
                message: 'Store reset. Check localStorage and reload page to test persistence.'
              });
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Reset Timetable
          </button>
          
          <button
            onClick={() => {
              const sampleSlots: TimetableSlot[] = [
                {
                  id: generateId(),
                  subject_id: 'subject1',
                  subject_code: 'CS101',
                  subject_name: 'Introduction to Programming',
                  type: 'lecture',
                  day_of_week: 1,
                  start_time: '09:00',
                  end_time: '10:30',
                  venue: 'Room A101',
                  instructor: 'Dr. Smith',
                  color: CLASS_TYPES.lecture.color,
                  isCustom: false
                }
              ];
              setTimetableSlots(sampleSlots);
              setTestResults({
                status: 'pending',
                message: 'Sample data created. Reload page to test persistence.'
              });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Sample Data
          </button>
          
          <button
            onClick={() => {
              saveToSession();
              setTestResults({
                status: 'pending',
                message: 'Data saved to session. Reload page to test persistence.'
              });
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save to Session
          </button>
          
          <button
            onClick={() => {
              loadFromSession();
              setTestResults({
                status: 'pending',
                message: 'Data loaded from session.'
              });
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Load from Session
          </button>
          
          <button
            onClick={() => {
              generateNewSession();
              setTestResults({
                status: 'pending',
                message: 'New session generated. Previous data should be inaccessible.'
              });
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            New Session
          </button>
        </div>
      </div>
      
      {/* LocalStorage Inspector */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">LocalStorage Contents</h3>
        <pre className="text-xs overflow-auto p-2 bg-white dark:bg-gray-900 rounded h-64">
          {typeof window !== 'undefined' ? 
            JSON.stringify({
              session_id: localStorage.getItem('timetable_session_id'),
              expiration: localStorage.getItem('timetable_expiration'),
              timetable_data: localStorage.getItem('timetable_data') ? 
                '(Data exists - too large to display)' : '(No data)',
              selected_subjects: localStorage.getItem('timetable_selected_subjects') ?
                '(Data exists)' : '(No data)',
            }, null, 2) : 
            'LocalStorage not available during server rendering'
          }
        </pre>
      </div>
    </div>
  );
} 