/**
 * Test file for utility functions
 * This file is not meant to be used in production
 * It's just for manual testing during development
 */

import {
  formatTime,
  getDayName,
  getDayNumber,
  timeToMinutes,
  minutesToTime,
  calculateDuration,
  calculateRowSpan,
  calculateRowIndex,
  isValidTimeFormat,
  generateRandomColor,
  formatDate,
  getCurrentSemester
} from './utils';

import { DAYS_OF_WEEK, TIME_SLOTS } from './constants';

import {
  doTimesOverlap,
  findTimeClashes,
  findVenueClashes,
  findAllClashes,
  suggestResolutions
} from '@/src/services/clashDetection';

// Define TimetableSlot type directly to avoid import issues
interface TimetableSlot {
  id: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  type: 'lecture' | 'tutorial' | 'lab' | 'practical' | 'custom';
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string;
  instructor: string | null;
  color?: string;
  isCustom: boolean;
}

// Test formatTime function
console.log('--- formatTime ---');
console.log('09:00 ->', formatTime('09:00')); // Should output "9:00 AM"
console.log('13:30 ->', formatTime('13:30')); // Should output "1:30 PM"
console.log('00:00 ->', formatTime('00:00')); // Should output "12:00 AM"
console.log('23:59 ->', formatTime('23:59')); // Should output "11:59 PM"

// Test getDayName function
console.log('\n--- getDayName ---');
console.log('0 ->', getDayName(0)); // Should output "Sunday"
console.log('1 ->', getDayName(1)); // Should output "Monday"
console.log('6 ->', getDayName(6)); // Should output "Saturday"
console.log('3, true ->', getDayName(3, true)); // Should output "Wed"

// Test getDayNumber function
console.log('\n--- getDayNumber ---');
console.log('"Sunday" ->', getDayNumber('Sunday')); // Should output 0
console.log('"monday" ->', getDayNumber('monday')); // Should output 1
console.log('"Sat" ->', getDayNumber('Sat')); // Should output 6

// Test timeToMinutes function
console.log('\n--- timeToMinutes ---');
console.log('09:00 ->', timeToMinutes('09:00')); // Should output 540
console.log('13:30 ->', timeToMinutes('13:30')); // Should output 810
console.log('00:00 ->', timeToMinutes('00:00')); // Should output 0
console.log('23:59 ->', timeToMinutes('23:59')); // Should output 1439

// Test minutesToTime function
console.log('\n--- minutesToTime ---');
console.log('540 ->', minutesToTime(540)); // Should output "09:00"
console.log('810 ->', minutesToTime(810)); // Should output "13:30"
console.log('0 ->', minutesToTime(0)); // Should output "00:00"
console.log('1439 ->', minutesToTime(1439)); // Should output "23:59"

// Test calculateDuration function
console.log('\n--- calculateDuration ---');
console.log('09:00, 10:30 ->', calculateDuration('09:00', '10:30')); // Should output 90
console.log('13:00, 14:30 ->', calculateDuration('13:00', '14:30')); // Should output 90
console.log('23:00, 23:30 ->', calculateDuration('23:00', '23:30')); // Should output 30

// Test calculateRowSpan function
console.log('\n--- calculateRowSpan ---');
console.log('09:00, 10:30 ->', calculateRowSpan('09:00', '10:30')); // Should output 3
console.log('13:00, 14:00 ->', calculateRowSpan('13:00', '14:00')); // Should output 2
console.log('23:00, 23:30 ->', calculateRowSpan('23:00', '23:30')); // Should output 1

// Test calculateRowIndex function
console.log('\n--- calculateRowIndex ---');
console.log('09:00 ->', calculateRowIndex('09:00')); // Should output the index of '09:00' in TIME_SLOTS
console.log('13:30 ->', calculateRowIndex('13:30')); // Should output the index of '13:30' in TIME_SLOTS
console.log('09:15 ->', calculateRowIndex('09:15')); // Should output the index of the closest time slot

// Test isValidTimeFormat function
console.log('\n--- isValidTimeFormat ---');
console.log('09:00 ->', isValidTimeFormat('09:00')); // Should output true
console.log('13:30 ->', isValidTimeFormat('13:30')); // Should output true
console.log('9:00 ->', isValidTimeFormat('9:00')); // Should output true
console.log('24:00 ->', isValidTimeFormat('24:00')); // Should output false
console.log('13:60 ->', isValidTimeFormat('13:60')); // Should output false
console.log('abc ->', isValidTimeFormat('abc')); // Should output false

// Test generateRandomColor function
console.log('\n--- generateRandomColor ---');
console.log(generateRandomColor()); // Should output a random hex color
console.log(generateRandomColor()); // Should output a different random hex color

// Test formatDate function
console.log('\n--- formatDate ---');
console.log('2024-01-01T00:00:00Z ->', formatDate('2024-01-01T00:00:00Z')); // Should output "Jan 1, 2024"
console.log('2023-12-25T00:00:00Z ->', formatDate('2023-12-25T00:00:00Z')); // Should output "Dec 25, 2023"

// Test getCurrentSemester function
console.log('\n--- getCurrentSemester ---');
console.log(getCurrentSemester()); // Should output the current semester based on the current date

// Test clash detection functions
console.log('\n--- Clash Detection ---');

// Sample timetable slots for testing
const slot1: TimetableSlot = {
  id: '1',
  subject_id: '1',
  subject_code: 'CS101',
  subject_name: 'Introduction to Programming',
  type: 'lecture',
  day_of_week: 1, // Monday
  start_time: '09:00',
  end_time: '10:30',
  venue: 'Room A101',
  instructor: 'Dr. Smith',
  isCustom: false
};

const slot2: TimetableSlot = {
  id: '2',
  subject_id: '2',
  subject_code: 'MATH201',
  subject_name: 'Calculus I',
  type: 'lecture',
  day_of_week: 1, // Monday
  start_time: '10:00', // Overlaps with slot1
  end_time: '11:30',
  venue: 'Room B201',
  instructor: 'Prof. Williams',
  isCustom: false
};

const slot3: TimetableSlot = {
  id: '3',
  subject_id: '3',
  subject_code: 'ENG105',
  subject_name: 'Academic Writing',
  type: 'lecture',
  day_of_week: 2, // Tuesday
  start_time: '09:00',
  end_time: '10:30',
  venue: 'Room A101', // Same venue as slot1
  instructor: 'Dr. Brown',
  isCustom: false
};

// Test doTimesOverlap function
console.log('\n--- doTimesOverlap ---');
console.log('09:00, 10:30, 10:00, 11:30 ->', doTimesOverlap('09:00', '10:30', '10:00', '11:30')); // Should output true
console.log('09:00, 10:30, 10:30, 12:00 ->', doTimesOverlap('09:00', '10:30', '10:30', '12:00')); // Should output false
console.log('09:00, 10:30, 08:00, 09:00 ->', doTimesOverlap('09:00', '10:30', '08:00', '09:00')); // Should output false

// Test findTimeClashes function
console.log('\n--- findTimeClashes ---');
const timeClashes = findTimeClashes([slot1, slot2, slot3]);
console.log('Time clashes found:', timeClashes.length); // Should output 1
console.log('Time clash details:', timeClashes[0]?.message);

// Test findVenueClashes function
console.log('\n--- findVenueClashes ---');
const venueClashes = findVenueClashes([slot1, slot2, slot3]);
console.log('Venue clashes found:', venueClashes.length); // Should output 0 (different days)

// Test findAllClashes function
console.log('\n--- findAllClashes ---');
const allClashes = findAllClashes([slot1, slot2, slot3]);
console.log('All clashes found:', allClashes.length); // Should output 1

// Test suggestResolutions function
console.log('\n--- suggestResolutions ---');
const resolutions = suggestResolutions(allClashes);
console.log('Resolutions:', resolutions.length); // Should output 1
console.log('Resolution options:', resolutions[0]?.options.length); // Should output 2
console.log('Resolution details:', resolutions[0]?.options.map(o => o.description)); 