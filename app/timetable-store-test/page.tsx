"use client";

import { useState } from 'react';
import useTimetableStore from '@/src/store/timetableStore';
import { CustomSlot, TimetableSlot } from '@/src/types/timetable';
import { generateId } from '@/src/lib/utils';
import { CLASS_TYPES } from '@/src/lib/constants';

export default function TimetableStoreTestPage() {
  // Get state and actions from the store
  const {
    sessionId,
    timetableSlots,
    customSlots,
    clashes,
    timetableName,
    setTimetableSlots,
    addTimetableSlot,
    removeTimetableSlot,
    clearTimetableSlots,
    addCustomSlot,
    removeCustomSlot,
    clearCustomSlots,
    setTimetableName,
    resetTimetable,
    generateNewSession
  } = useTimetableStore();

  // Local state for form inputs
  const [newSlotName, setNewSlotName] = useState('');
  const [newSlotDay, setNewSlotDay] = useState('1');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:30');
  const [newSlotVenue, setNewSlotVenue] = useState('Room A101');
  const [newSlotType, setNewSlotType] = useState('lecture');
  const [newTimetableName, setNewTimetableName] = useState(timetableName);

  // Handle adding a new timetable slot
  const handleAddTimetableSlot = () => {
    const newSlot: TimetableSlot = {
      id: generateId(),
      subject_id: generateId(), // Simulating a subject ID
      subject_code: 'TEST101',
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
    
    // Reset form
    setNewSlotName('');
  };

  // Handle adding a new custom slot
  const handleAddCustomSlot = () => {
    const newSlot: Omit<CustomSlot, 'id'> = {
      title: newSlotName,
      day_of_week: parseInt(newSlotDay, 10),
      start_time: newSlotStart,
      end_time: newSlotEnd,
      venue: newSlotVenue,
      description: 'Test custom slot',
      color: '#ec4899' // pink-500
    };
    
    addCustomSlot(newSlot);
    
    // Reset form
    setNewSlotName('');
  };

  // Handle updating timetable name
  const handleUpdateTimetableName = () => {
    setTimetableName(newTimetableName);
  };

  // Generate sample data
  const generateSampleData = () => {
    // Clear existing data
    clearTimetableSlots();
    clearCustomSlots();
    
    // Add sample timetable slots
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
        subject_id: 'subject1',
        subject_code: 'CS101',
        subject_name: 'Introduction to Programming',
        type: 'lab',
        day_of_week: 3, // Wednesday
        start_time: '14:00',
        end_time: '16:00',
        venue: 'Computer Lab 1',
        instructor: 'Dr. Johnson',
        color: CLASS_TYPES.lab.color,
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
    
    setTimetableSlots(sampleSlots);
    
    // Add sample custom slot
    addCustomSlot({
      title: 'Study Group',
      day_of_week: 4, // Thursday
      start_time: '16:00',
      end_time: '18:00',
      venue: 'Library',
      description: 'Weekly study group for CS101',
      color: CLASS_TYPES.custom.color
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Timetable Store Test</h1>
      
      {/* Session info */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Session ID:</p>
            <p className="font-mono">{sessionId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Timetable Name:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTimetableName}
                onChange={(e) => setNewTimetableName(e.target.value)}
                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={handleUpdateTimetableName}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={resetTimetable}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Reset Timetable
          </button>
          <button
            onClick={generateNewSession}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            New Session
          </button>
          <button
            onClick={generateSampleData}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Generate Sample Data
          </button>
        </div>
      </div>
      
      {/* Add new slot form */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Add New Slot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name/Title
            </label>
            <input
              type="text"
              value={newSlotName}
              onChange={(e) => setNewSlotName(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. Introduction to Programming"
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
              placeholder="e.g. Room A101"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddTimetableSlot}
            disabled={!newSlotName}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Timetable Slot
          </button>
          <button
            onClick={handleAddCustomSlot}
            disabled={!newSlotName}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Custom Slot
          </button>
        </div>
      </div>
      
      {/* Timetable slots */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Timetable Slots ({timetableSlots.length})</h2>
          {timetableSlots.length > 0 && (
            <button
              onClick={clearTimetableSlots}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All
            </button>
          )}
        </div>
        
        {timetableSlots.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No timetable slots added</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Subject</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Day</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Venue</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {timetableSlots.map(slot => (
                  <tr key={slot.id}>
                    <td className="py-2 px-4">
                      <div className="font-medium">{slot.subject_code}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{slot.subject_name}</div>
                    </td>
                    <td className="py-2 px-4">
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: slot.color, color: 'white' }}
                      >
                        {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day_of_week]}
                    </td>
                    <td className="py-2 px-4">
                      {slot.start_time} - {slot.end_time}
                    </td>
                    <td className="py-2 px-4">{slot.venue}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => removeTimetableSlot(slot.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Custom slots */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Custom Slots ({customSlots.length})</h2>
          {customSlots.length > 0 && (
            <button
              onClick={clearCustomSlots}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All
            </button>
          )}
        </div>
        
        {customSlots.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No custom slots added</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Day</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Venue</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customSlots.map(slot => (
                  <tr key={slot.id}>
                    <td className="py-2 px-4">
                      <div 
                        className="font-medium flex items-center"
                      >
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: slot.color }}
                        ></span>
                        {slot.title}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day_of_week]}
                    </td>
                    <td className="py-2 px-4">
                      {slot.start_time} - {slot.end_time}
                    </td>
                    <td className="py-2 px-4">{slot.venue || '-'}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => removeCustomSlot(slot.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Store state */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Store State</h3>
        <pre className="text-xs overflow-auto p-2 bg-white dark:bg-gray-900 rounded">
          {JSON.stringify(
            {
              sessionId,
              timetableName,
              timetableSlots: timetableSlots.length,
              customSlots: customSlots.length,
              clashes: clashes.length
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
} 