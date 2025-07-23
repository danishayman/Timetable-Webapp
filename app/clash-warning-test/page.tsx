"use client";

import { useState } from 'react';
import ClashWarning from '@/src/components/timetable/ClashWarning';
import { Clash, TimetableSlot } from '@/src/types/timetable';
import { CLASS_TYPES } from '@/src/lib/constants';
import { generateId } from '@/src/lib/utils';

export default function ClashWarningTestPage() {
  const [clashes, setClashes] = useState<Clash[]>(generateSampleClashes());
  
  // Handle resolving a clash
  const handleResolveClash = (clashId: string, action: 'remove' | 'ignore', slotId?: string) => {
    if (action === 'ignore') {
      // Remove the clash from the list
      setClashes(clashes.filter(clash => clash.id !== clashId));
    } else if (action === 'remove' && slotId) {
      // Remove the clash from the list
      setClashes(clashes.filter(clash => clash.id !== clashId));
      
      // In a real app, we would also remove the slot from the timetable
      console.log(`Removed slot ${slotId}`);
    }
  };
  
  // Reset clashes to initial state
  const resetClashes = () => {
    setClashes(generateSampleClashes());
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Clash Warning Component Test</h1>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Clash Warnings ({clashes.length})</h2>
          <button
            onClick={resetClashes}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Reset Examples
          </button>
        </div>
        
        {clashes.length === 0 ? (
          <p className="text-green-500">No clashes to display. Click "Reset Examples" to show sample clashes.</p>
        ) : (
          <div className="space-y-4">
            {clashes.map(clash => (
              <ClashWarning 
                key={clash.id} 
                clash={clash}
                onResolve={handleResolveClash}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Component Features</h2>
        
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Visual Indicators:</strong> Different colors for different severity levels</li>
          <li><strong>Expandable Details:</strong> Click on a warning to see more information</li>
          <li><strong>Resolution Options:</strong> Buttons to resolve clashes in different ways</li>
          <li><strong>Responsive Layout:</strong> Adapts to different screen sizes</li>
        </ul>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Types of Clashes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Time Clash (Error)</h3>
            <p className="text-sm">Major overlap between two classes at the same time.</p>
          </div>
          
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h3 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">Time Clash (Warning)</h3>
            <p className="text-sm">Minor overlap (less than 30 minutes) between classes.</p>
          </div>
          
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Venue Clash (Error)</h3>
            <p className="text-sm">Two classes scheduled in the same room at the same time.</p>
          </div>
          
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <h3 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">Venue Clash (Warning)</h3>
            <p className="text-sm">Brief room conflict that might be resolvable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate sample clashes for testing
function generateSampleClashes(): Clash[] {
  // Create some sample timetable slots
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
  
  const slot2: TimetableSlot = {
    id: generateId(),
    subject_id: 'subject2',
    subject_code: 'MATH201',
    subject_name: 'Calculus I',
    type: 'lecture',
    day_of_week: 1, // Monday
    start_time: '10:00', // Major overlap with slot1
    end_time: '11:30',
    venue: 'Room B201',
    instructor: 'Prof. Williams',
    color: CLASS_TYPES.lecture.color,
    isCustom: false
  };
  
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
  
  const slot5: TimetableSlot = {
    id: generateId(),
    subject_id: 'subject5',
    subject_code: 'BIO101',
    subject_name: 'Biology I',
    type: 'lecture',
    day_of_week: 3, // Wednesday
    start_time: '10:15', // Minor overlap with slot4
    end_time: '11:45',
    venue: 'Room D401',
    instructor: 'Dr. Davis',
    color: CLASS_TYPES.lecture.color,
    isCustom: false
  };
  
  const slot6: TimetableSlot = {
    id: generateId(),
    subject_id: 'subject6',
    subject_code: 'ENG101',
    subject_name: 'English Composition',
    type: 'tutorial',
    day_of_week: 4, // Thursday
    start_time: '14:00',
    end_time: '15:30',
    venue: 'Room C301', // Same venue as slot4
    instructor: 'Prof. Wilson',
    color: CLASS_TYPES.tutorial.color,
    isCustom: false
  };
  
  const slot7: TimetableSlot = {
    id: generateId(),
    subject_id: 'subject7',
    subject_code: 'HIST101',
    subject_name: 'World History',
    type: 'tutorial',
    day_of_week: 4, // Thursday
    start_time: '15:15', // Minor overlap with slot6
    end_time: '16:45',
    venue: 'Room C301', // Same venue as slot6
    instructor: 'Dr. Taylor',
    color: CLASS_TYPES.tutorial.color,
    isCustom: false
  };
  
  // Create sample clashes
  return [
    // Time clash (error) - Major overlap
    {
      id: generateId(),
      slot1,
      slot2,
      type: 'time',
      severity: 'error',
      message: `${slot1.subject_code} (${slot1.type}) and ${slot2.subject_code} (${slot2.type}) overlap by 30 minutes.`
    },
    
    // Time clash (warning) - Minor overlap
    {
      id: generateId(),
      slot1: slot4,
      slot2: slot5,
      type: 'time',
      severity: 'warning',
      message: `${slot4.subject_code} (${slot4.type}) and ${slot5.subject_code} (${slot5.type}) overlap by 15 minutes.`
    },
    
    // Venue clash (error) - Same venue, major overlap
    {
      id: generateId(),
      slot1: slot6,
      slot2: slot7,
      type: 'venue',
      severity: 'error',
      message: `${slot6.subject_code} (${slot6.type}) and ${slot7.subject_code} (${slot7.type}) clash in venue ${slot6.venue} for 15 minutes.`
    },
    
    // Venue clash (warning) - Same venue, different days
    {
      id: generateId(),
      slot1: slot1,
      slot2: slot3,
      type: 'venue',
      severity: 'warning',
      message: `${slot1.subject_code} and ${slot3.subject_code} are scheduled in the same venue (${slot1.venue}) on different days.`
    }
  ];
} 