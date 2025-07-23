"use client";

import { useState, useEffect } from 'react';
import useTimetableStore from '@/src/store/timetableStore';
import useSubjectStore from '@/src/store/subjectStore';
import { TimetableSlot } from '@/src/types/timetable';
import { formatDayOfWeek, formatTimeRange } from '@/src/lib/utils';

export default function TimetableServiceTestPage() {
  // Get state and actions from the stores
  const { 
    timetableSlots, 
    customSlots,
    isGenerating,
    error: timetableError,
    generateTimetable,
    resetTimetable
  } = useTimetableStore();
  
  const {
    selectedSubjects,
    availableSubjects,
    isLoading: subjectsLoading,
    error: subjectsError,
    fetchSubjects,
    selectSubject,
    unselectSubject,
    selectTutorialGroup
  } = useSubjectStore();
  
  // Local state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [generationComplete, setGenerationComplete] = useState<boolean>(false);
  
  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);
  
  // Handle subject selection
  const handleSelectSubject = (subjectId: string) => {
    const subject = availableSubjects.find(s => s.id === subjectId);
    if (subject) {
      selectSubject(subject);
      setSelectedSubjectId('');
    }
  };
  
  // Handle timetable generation
  const handleGenerateTimetable = async () => {
    setGenerationComplete(false);
    await generateTimetable();
    setGenerationComplete(true);
  };
  
  // Group timetable slots by day
  const slotsByDay = timetableSlots.reduce<Record<number, TimetableSlot[]>>((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {});
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Timetable Generation Service Test</h1>
      
      {/* Subject Selection */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Subject Selection</h2>
        
        {subjectsLoading ? (
          <p>Loading subjects...</p>
        ) : subjectsError ? (
          <p className="text-red-500">{subjectsError}</p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select a subject...</option>
                {availableSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleSelectSubject(selectedSubjectId)}
                disabled={!selectedSubjectId}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Subject
              </button>
            </div>
            
            {/* Selected Subjects */}
            <div>
              <h3 className="text-lg font-medium mb-2">Selected Subjects ({selectedSubjects.length})</h3>
              {selectedSubjects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">No subjects selected</p>
              ) : (
                <ul className="space-y-2">
                  {selectedSubjects.map(subject => (
                    <li 
                      key={subject.subject_id} 
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span>
                        {availableSubjects.find(s => s.id === subject.subject_id)?.code || subject.subject_id} - 
                        {availableSubjects.find(s => s.id === subject.subject_id)?.name}
                        {subject.tutorial_id && <span className="ml-2 text-sm text-blue-500">(Tutorial selected)</span>}
                      </span>
                      <button
                        onClick={() => unselectSubject(subject.subject_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Timetable Generation */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Timetable Generation</h2>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleGenerateTimetable}
            disabled={selectedSubjects.length === 0 || isGenerating}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Timetable'}
          </button>
          <button
            onClick={resetTimetable}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Timetable
          </button>
        </div>
        
        {timetableError && (
          <p className="text-red-500 mb-4">{timetableError}</p>
        )}
        
        {generationComplete && timetableSlots.length === 0 && !timetableError && (
          <p className="text-yellow-500 mb-4">No timetable slots were generated. Make sure your selected subjects have schedules.</p>
        )}
      </div>
      
      {/* Generated Timetable */}
      {timetableSlots.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Generated Timetable ({timetableSlots.length} slots)</h2>
          
          {Object.entries(slotsByDay).map(([day, slots]) => (
            <div key={day} className="mb-6">
              <h3 className="text-lg font-medium mb-2">
                {formatDayOfWeek(parseInt(day))}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Venue</th>
                      <th className="px-4 py-2 text-left">Instructor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {slots.sort((a, b) => {
                      // Sort by start time
                      return a.start_time.localeCompare(b.start_time);
                    }).map(slot => (
                      <tr key={slot.id}>
                        <td className="px-4 py-2">
                          <div className="font-medium">{slot.subject_code}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{slot.subject_name}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span 
                            className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: slot.color }}
                          >
                            {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {formatTimeRange(slot.start_time, slot.end_time)}
                        </td>
                        <td className="px-4 py-2">{slot.venue}</td>
                        <td className="px-4 py-2">{slot.instructor || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          
          {/* Raw Data */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">Raw Timetable Data</h3>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
              <pre className="text-xs">
                {JSON.stringify(timetableSlots, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 