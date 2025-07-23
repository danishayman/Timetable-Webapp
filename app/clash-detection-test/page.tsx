"use client";

import { useState, useEffect } from 'react';
import useTimetableStore from '@/src/store/timetableStore';
import useSubjectStore from '@/src/store/subjectStore';
import { TimetableSlot, Clash, CustomSlot } from '@/src/types/timetable';
import { formatDayOfWeek, formatTimeRange, generateId } from '@/src/lib/utils';
import { CLASS_TYPES } from '@/src/lib/constants';

export default function ClashDetectionTestPage() {
  // Get state and actions from the stores
  const { 
    timetableSlots, 
    customSlots,
    clashes,
    isGenerating,
    error: timetableError,
    generateTimetable,
    resetTimetable,
    addTimetableSlot,
    addCustomSlot
  } = useTimetableStore();
  
  const {
    selectedSubjects,
    availableSubjects,
    isLoading: subjectsLoading,
    error: subjectsError,
    fetchSubjects,
    selectSubject,
    unselectSubject
  } = useSubjectStore();
  
  // Local state for form inputs
  const [newSlotName, setNewSlotName] = useState<string>('Test Subject');
  const [newSlotCode, setNewSlotCode] = useState<string>('TEST101');
  const [newSlotDay, setNewSlotDay] = useState<string>('1');
  const [newSlotStart, setNewSlotStart] = useState<string>('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState<string>('10:30');
  const [newSlotVenue, setNewSlotVenue] = useState<string>('Room A101');
  const [newSlotType, setNewSlotType] = useState<string>('lecture');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
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
  
  // Handle adding a test slot that will cause clashes
  const handleAddTestSlot = () => {
    const newSlot: TimetableSlot = {
      id: generateId(),
      subject_id: generateId(),
      subject_code: newSlotCode,
      subject_name: newSlotName,
      type: newSlotType as 'lecture' | 'tutorial' | 'lab' | 'practical' | 'custom',
      day_of_week: parseInt(newSlotDay, 10),
      start_time: newSlotStart,
      end_time: newSlotEnd,
      venue: newSlotVenue,
      instructor: 'Test Instructor',
      color: CLASS_TYPES[newSlotType as keyof typeof CLASS_TYPES]?.color || '#000000',
      isCustom: false
    };
    
    addTimetableSlot(newSlot);
  };
  
  // Handle adding a custom slot
  const handleAddCustomSlot = () => {
    const newSlot: Omit<CustomSlot, 'id'> = {
      title: newSlotName,
      day_of_week: parseInt(newSlotDay, 10),
      start_time: newSlotStart,
      end_time: newSlotEnd,
      venue: newSlotVenue,
      description: 'Test custom slot',
      color: CLASS_TYPES.custom.color
    };
    
    addCustomSlot(newSlot);
  };
  
  // Generate clashing slots for testing
  const generateClashingSlots = () => {
    // Reset first
    resetTimetable();
    
    // Add first slot
    const slot1: TimetableSlot = {
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
    };
    
    // Add second slot that overlaps with the first
    const slot2: TimetableSlot = {
      id: generateId(),
      subject_id: 'subject2',
      subject_code: 'MATH201',
      subject_name: 'Calculus I',
      type: 'lecture',
      day_of_week: 1, // Monday
      start_time: '10:00', // Overlaps with slot1
      end_time: '11:30',
      venue: 'Room B201',
      instructor: 'Prof. Williams',
      color: CLASS_TYPES.lecture.color,
      isCustom: false
    };
    
    // Add third slot with venue clash
    const slot3: TimetableSlot = {
      id: generateId(),
      subject_id: 'subject3',
      subject_code: 'PHYS101',
      subject_name: 'Physics I',
      type: 'lecture',
      day_of_week: 2, // Tuesday
      start_time: '09:00',
      end_time: '10:30',
      venue: 'Room A101', // Same venue as slot1
      instructor: 'Dr. Johnson',
      color: CLASS_TYPES.lecture.color,
      isCustom: false
    };
    
    // Add fourth slot with no clash
    const slot4: TimetableSlot = {
      id: generateId(),
      subject_id: 'subject4',
      subject_code: 'CHEM101',
      subject_name: 'Chemistry I',
      type: 'lecture',
      day_of_week: 3, // Wednesday
      start_time: '09:00',
      end_time: '10:30',
      venue: 'Room C301',
      instructor: 'Dr. Brown',
      color: CLASS_TYPES.lecture.color,
      isCustom: false
    };
    
    // Add slots to timetable
    addTimetableSlot(slot1);
    addTimetableSlot(slot2);
    addTimetableSlot(slot3);
    addTimetableSlot(slot4);
    
    // Add a custom slot that clashes
    const customSlot: Omit<CustomSlot, 'id'> = {
      title: 'Study Group',
      day_of_week: 3, // Wednesday
      start_time: '09:30', // Overlaps with slot4
      end_time: '11:00',
      venue: 'Library',
      description: 'Weekly study group',
      color: CLASS_TYPES.custom.color
    };
    
    addCustomSlot(customSlot);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Clash Detection Test</h1>
      
      {/* Test Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={generateClashingSlots}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Generate Clashing Slots
          </button>
          
          <button
            onClick={resetTimetable}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Timetable
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject Name
            </label>
            <input
              type="text"
              value={newSlotName}
              onChange={(e) => setNewSlotName(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject Code
            </label>
            <input
              type="text"
              value={newSlotCode}
              onChange={(e) => setNewSlotCode(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Day of Week
            </label>
            <select
              value={newSlotDay}
              onChange={(e) => setNewSlotDay(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={newSlotStart}
              onChange={(e) => setNewSlotStart(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={newSlotEnd}
              onChange={(e) => setNewSlotEnd(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Venue
            </label>
            <input
              type="text"
              value={newSlotVenue}
              onChange={(e) => setNewSlotVenue(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={newSlotType}
              onChange={(e) => setNewSlotType(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="lecture">Lecture</option>
              <option value="tutorial">Tutorial</option>
              <option value="lab">Lab</option>
              <option value="practical">Practical</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleAddTestSlot}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Test Slot
          </button>
          
          <button
            onClick={handleAddCustomSlot}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            Add Custom Slot
          </button>
        </div>
      </div>
      
      {/* Detected Clashes */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Detected Clashes ({clashes.length})</h2>
        
        {clashes.length === 0 ? (
          <p className="text-green-500">No clashes detected.</p>
        ) : (
          <div className="space-y-4">
            {clashes.map(clash => (
              <div 
                key={clash.id} 
                className={`p-3 rounded-lg border-l-4 ${
                  clash.severity === 'error' 
                    ? 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-400' 
                    : 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${
                      clash.severity === 'error' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {clash.type === 'time' ? 'Time Clash' : 'Venue Clash'} - {clash.severity === 'error' ? 'Major' : 'Minor'}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{clash.message}</p>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
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
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Current Timetable Slots */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Timetable Slots ({timetableSlots.length})</h2>
        
        {timetableSlots.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No timetable slots added</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Day</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Venue</th>
                  <th className="px-4 py-2 text-left">Custom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {timetableSlots.map(slot => (
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
                      {formatDayOfWeek(slot.day_of_week)}
                    </td>
                    <td className="px-4 py-2">
                      {formatTimeRange(slot.start_time, slot.end_time)}
                    </td>
                    <td className="px-4 py-2">{slot.venue}</td>
                    <td className="px-4 py-2">
                      {slot.isCustom ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 