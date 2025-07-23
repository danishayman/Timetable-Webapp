// Simple test file to verify utility functions

// Import constants
const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const SHORT_DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

// Utility functions
function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getDayName(dayNumber, short = false) {
  if (dayNumber < 0 || dayNumber > 6) {
    throw new Error('Day number must be between 0 and 6');
  }
  return short ? SHORT_DAYS[dayNumber] : DAYS_OF_WEEK[dayNumber];
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function doTimesOverlap(start1, end1, start2, end2) {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  // Check if one range ends before the other starts
  if (end1Minutes <= start2Minutes || end2Minutes <= start1Minutes) {
    return false;
  }

  return true;
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

// Test timeToMinutes function
console.log('\n--- timeToMinutes ---');
console.log('09:00 ->', timeToMinutes('09:00')); // Should output 540
console.log('13:30 ->', timeToMinutes('13:30')); // Should output 810
console.log('00:00 ->', timeToMinutes('00:00')); // Should output 0
console.log('23:59 ->', timeToMinutes('23:59')); // Should output 1439

// Test doTimesOverlap function
console.log('\n--- doTimesOverlap ---');
console.log('09:00, 10:30, 10:00, 11:30 ->', doTimesOverlap('09:00', '10:30', '10:00', '11:30')); // Should output true
console.log('09:00, 10:30, 10:30, 12:00 ->', doTimesOverlap('09:00', '10:30', '10:30', '12:00')); // Should output false
console.log('09:00, 10:30, 08:00, 09:00 ->', doTimesOverlap('09:00', '10:30', '08:00', '09:00')); // Should output false 