"use client";

import { useState } from 'react';
import ClassBlock from '@/src/components/timetable/ClassBlock';
import TimetableGrid from '@/src/components/timetable/TimetableGrid';
import TimetablePositioner from '@/src/components/timetable/TimetablePositioner';
import { CLASS_TYPES } from '@/src/lib/constants';
import { TimetableSlot } from '@/src/types/timetable';

// Sample class data
const SAMPLE_SLOTS: TimetableSlot[] = [
  {
    id: '1',
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
    id: '2',
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
  },
  {
    id: '3',
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
    id: '4',
    subject_id: 'subject3',
    subject_code: 'PHYS101',
    subject_name: 'Physics I',
    type: 'tutorial',
    day_of_week: 4, // Thursday
    start_time: '15:30',
    end_time: '17:00',
    venue: 'Room C301',
    instructor: 'Dr. Brown',
    color: CLASS_TYPES.tutorial.color,
    isCustom: false
  },
  {
    id: '5',
    subject_id: 'subject4',
    subject_code: 'ENG101',
    subject_name: 'English Composition',
    type: 'lecture',
    day_of_week: 5, // Friday
    start_time: '10:00',
    end_time: '11:30',
    venue: 'Room D401',
    instructor: 'Prof. Davis',
    color: CLASS_TYPES.lecture.color,
    isCustom: false
  },
  {
    id: '6',
    subject_id: 'custom1',
    subject_code: '',
    subject_name: 'Study Group',
    type: 'custom',
    day_of_week: 3, // Wednesday
    start_time: '10:00',
    end_time: '11:30',
    venue: 'Library',
    instructor: null,
    color: CLASS_TYPES.custom.color,
    isCustom: true
  },
  // Clashing slot for demonstration
  {
    id: '7',
    subject_id: 'subject5',
    subject_code: 'CHEM101',
    subject_name: 'Chemistry I',
    type: 'practical',
    day_of_week: 4, // Thursday
    start_time: '15:00', // Overlaps with PHYS101
    end_time: '17:00',
    venue: 'Chemistry Lab',
    instructor: 'Dr. Wilson',
    color: CLASS_TYPES.practical.color,
    isCustom: false
  },
];

export default function ClassBlockTestPage() {
  const [showWeekends, setShowWeekends] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  
  // Handle click on a class block
  const handleClassBlockClick = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
  };
  
  // Check if two slots clash (simplified version)
  const doSlotsClash = (slot1: TimetableSlot, slot2: TimetableSlot): boolean => {
    if (slot1.day_of_week !== slot2.day_of_week) return false;
    
    const start1 = slot1.start_time;
    const end1 = slot1.end_time;
    const start2 = slot2.start_time;
    const end2 = slot2.end_time;
    
    // Check if one slot ends before the other starts
    if (end1 <= start2 || end2 <= start1) {
      return false;
    }
    
    return true;
  };
  
  // Check if a slot clashes with any other slot
  const hasClash = (slot: TimetableSlot): boolean => {
    return SAMPLE_SLOTS.some(
      otherSlot => slot.id !== otherSlot.id && doSlotsClash(slot, otherSlot)
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Class Block Component Test</h1>
      
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
      
      {/* Timetable Grid with Class Blocks */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Timetable with Class Blocks</h2>
        <TimetableGrid showWeekends={showWeekends}>
          {/* Class blocks */}
          {SAMPLE_SLOTS.map(slot => (
            <TimetablePositioner
              key={slot.id}
              dayOfWeek={slot.day_of_week}
              startTime={slot.start_time}
              endTime={slot.end_time}
              showWeekends={showWeekends}
            >
              <ClassBlock 
                slot={slot}
                isClashing={hasClash(slot)}
                onClick={handleClassBlockClick}
              />
            </TimetablePositioner>
          ))}
        </TimetableGrid>
      </div>
      
      {/* Selected Class Details */}
      {selectedSlot && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Selected Class Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Subject Information</h3>
              <ul className="mt-2 space-y-1">
                <li><span className="font-medium">Code:</span> {selectedSlot.subject_code || 'N/A'}</li>
                <li><span className="font-medium">Name:</span> {selectedSlot.subject_name}</li>
                <li><span className="font-medium">Type:</span> {selectedSlot.type.charAt(0).toUpperCase() + selectedSlot.type.slice(1)}</li>
                <li><span className="font-medium">Custom:</span> {selectedSlot.isCustom ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Schedule Information</h3>
              <ul className="mt-2 space-y-1">
                <li><span className="font-medium">Day:</span> {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedSlot.day_of_week]}</li>
                <li><span className="font-medium">Time:</span> {selectedSlot.start_time} - {selectedSlot.end_time}</li>
                <li><span className="font-medium">Venue:</span> {selectedSlot.venue}</li>
                <li><span className="font-medium">Instructor:</span> {selectedSlot.instructor || 'N/A'}</li>
                <li><span className="font-medium">Has Clash:</span> {hasClash(selectedSlot) ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Class Block Examples */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Class Block Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CLASS_TYPES).map(([type, { name, color }]) => {
            // Create a sample slot for each class type
            const sampleSlot: TimetableSlot = {
              id: `sample-${type}`,
              subject_id: `sample-${type}`,
              subject_code: 'SAMPLE101',
              subject_name: `Sample ${name}`,
              type: type as any,
              day_of_week: 1,
              start_time: '09:00',
              end_time: '10:30',
              venue: 'Sample Room',
              instructor: 'Sample Instructor',
              color,
              isCustom: type === 'custom'
            };
            
            return (
              <div key={type} className="h-32">
                <ClassBlock 
                  slot={sampleSlot}
                  onClick={handleClassBlockClick}
                />
              </div>
            );
          })}
          
          {/* Example with clash */}
          <div className="h-32">
            <ClassBlock 
              slot={{
                id: 'sample-clash',
                subject_id: 'sample-clash',
                subject_code: 'CLASH101',
                subject_name: 'Sample Clash',
                type: 'lecture',
                day_of_week: 1,
                start_time: '09:00',
                end_time: '10:30',
                venue: 'Clash Room',
                instructor: 'Dr. Clash',
                color: CLASS_TYPES.lecture.color,
                isCustom: false
              }}
              isClashing={true}
              onClick={handleClassBlockClick}
            />
          </div>
        </div>
      </div>
      
      {/* Implementation Notes */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Interactive:</strong> Click on any class block to see more details
          </li>
          <li>
            <strong>Expandable:</strong> Class blocks show additional information when clicked
          </li>
          <li>
            <strong>Clash Detection:</strong> Blocks with time conflicts are highlighted with a red border
          </li>
          <li>
            <strong>Color Coding:</strong> Different class types have different colors for easy identification
          </li>
          <li>
            <strong>Responsive:</strong> Class blocks adapt to their container size
          </li>
          <li>
            <strong>Truncation:</strong> Long text is truncated to fit within the block
          </li>
        </ul>
      </div>
    </div>
  );
} 