"use client";

import { useState } from 'react';
import TimetableGrid from '@/src/components/timetable/TimetableGrid';
import TimetablePositioner from '@/src/components/timetable/TimetablePositioner';
import { CLASS_TYPES } from '@/src/lib/constants';

// Sample class data
const SAMPLE_CLASSES = [
  {
    id: '1',
    subject_code: 'CS101',
    subject_name: 'Introduction to Programming',
    type: 'lecture',
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '10:30',
    venue: 'Room A101',
    instructor: 'Dr. Smith',
    color: CLASS_TYPES.lecture.color,
  },
  {
    id: '2',
    subject_code: 'MATH201',
    subject_name: 'Calculus I',
    type: 'lecture',
    day_of_week: 2, // Tuesday
    start_time: '11:00',
    end_time: '12:30',
    venue: 'Room B201',
    instructor: 'Prof. Williams',
    color: CLASS_TYPES.lecture.color,
  },
  {
    id: '3',
    subject_code: 'CS101',
    subject_name: 'Introduction to Programming',
    type: 'lab',
    day_of_week: 3, // Wednesday
    start_time: '14:00',
    end_time: '16:00',
    venue: 'Computer Lab 1',
    instructor: 'Dr. Johnson',
    color: CLASS_TYPES.lab.color,
  },
  {
    id: '4',
    subject_code: 'PHYS101',
    subject_name: 'Physics I',
    type: 'tutorial',
    day_of_week: 4, // Thursday
    start_time: '15:30',
    end_time: '17:00',
    venue: 'Room C301',
    instructor: 'Dr. Brown',
    color: CLASS_TYPES.tutorial.color,
  },
  {
    id: '5',
    subject_code: 'ENG101',
    subject_name: 'English Composition',
    type: 'lecture',
    day_of_week: 5, // Friday
    start_time: '10:00',
    end_time: '11:30',
    venue: 'Room D401',
    instructor: 'Prof. Davis',
    color: CLASS_TYPES.lecture.color,
  },
  {
    id: '6',
    subject_code: 'CHEM101',
    subject_name: 'Chemistry I',
    type: 'practical',
    day_of_week: 6, // Saturday
    start_time: '09:00',
    end_time: '11:00',
    venue: 'Chemistry Lab',
    instructor: 'Dr. Wilson',
    color: CLASS_TYPES.practical.color,
  },
  {
    id: '7',
    subject_code: 'BIO101',
    subject_name: 'Biology I',
    type: 'lecture',
    day_of_week: 0, // Sunday
    start_time: '13:00',
    end_time: '14:30',
    venue: 'Room E501',
    instructor: 'Dr. Taylor',
    color: CLASS_TYPES.lecture.color,
  },
];

export default function TimetableGridTestPage() {
  const [showWeekends, setShowWeekends] = useState(false);
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Timetable Grid Component Test</h1>
      
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Display Options</h2>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showWeekends}
              onChange={(e) => setShowWeekends(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-500"
            />
            <span>Show Weekends</span>
          </label>
        </div>
      </div>
      
      {/* Timetable Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Timetable Grid with Sample Classes</h2>
        <TimetableGrid showWeekends={showWeekends}>
          {/* Sample class blocks */}
          {SAMPLE_CLASSES.map(classItem => (
            <TimetablePositioner
              key={classItem.id}
              dayOfWeek={classItem.day_of_week}
              startTime={classItem.start_time}
              endTime={classItem.end_time}
              showWeekends={showWeekends}
            >
              <div 
                className="m-1 p-2 rounded shadow-sm overflow-hidden flex flex-col h-full"
                style={{ backgroundColor: classItem.color }}
              >
                <div className="text-white font-medium text-sm truncate">
                  {classItem.subject_code}
                </div>
                <div className="text-white text-xs truncate">
                  {classItem.subject_name}
                </div>
                <div className="text-white/80 text-xs mt-auto truncate">
                  {classItem.venue}
                </div>
              </div>
            </TimetablePositioner>
          ))}
        </TimetableGrid>
      </div>
      
      {/* Class Legend */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Class Types</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(CLASS_TYPES).map(([type, { name, color }]) => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: color }}
              ></div>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Responsive Information */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Responsive Behavior</h2>
        
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Large screens:</strong> Full day names are displayed in the header
          </li>
          <li>
            <strong>Small screens:</strong> Abbreviated day names are shown (e.g., "Mon" instead of "Monday")
          </li>
          <li>
            <strong>Horizontal scrolling:</strong> Enabled for small screens to ensure all days are visible
          </li>
          <li>
            <strong>Minimum width:</strong> 768px to ensure readability
          </li>
        </ul>
      </div>
      
      {/* Implementation Notes */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>CSS Grid:</strong> Used for the main layout with responsive columns
          </li>
          <li>
            <strong>Time slots:</strong> 30-minute intervals from 8:00 AM to 9:30 PM
          </li>
          <li>
            <strong>Children prop:</strong> The grid accepts children to render class blocks inside the grid
          </li>
          <li>
            <strong>Alternating colors:</strong> Even rows have a slightly different background for better readability
          </li>
          <li>
            <strong>Weekend toggle:</strong> Option to show or hide weekend days (Saturday and Sunday)
          </li>
          <li>
            <strong>TimetablePositioner:</strong> Helper component for positioning class blocks within the grid
          </li>
        </ul>
      </div>
    </div>
  );
} 