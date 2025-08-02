/**
 * Application constants
 */

/**
 * Days of the week
 * Starting from Sunday (0) to Saturday (6)
 */
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Short names for days of the week
 */
export const SHORT_DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

/**
 * Time slots for the timetable
 * Each slot is 30 minutes
 */
export const TIME_SLOTS = [
  '08:00', '08:30',
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00', '20:30',
  '21:00', '21:30'
];

/**
 * Class types with their display names and colors - Purple theme
 */
export const CLASS_TYPES = {
  lecture: {
    name: 'Lecture',
    color: '#8B5CF6' // purple-500
  },
  tutorial: {
    name: 'Tutorial',
    color: '#A855F7' // purple-600
  },
  lab: {
    name: 'Lab',
    color: '#9333EA' // violet-600
  },
  practical: {
    name: 'Practical',
    color: '#7C3AED' // violet-500
  },
  custom: {
    name: 'Custom',
    color: '#6D28D9' // violet-700
  }
};

/**
 * Default timetable name
 */
export const DEFAULT_TIMETABLE_NAME = 'My Timetable';

/**
 * Session storage keys
 */
export const STORAGE_KEYS = {
  SESSION_ID: 'timetable_session_id',
  SELECTED_SUBJECTS: 'timetable_selected_subjects',
  TIMETABLE_DATA: 'timetable_data',
  CUSTOM_SLOTS: 'timetable_custom_slots',
  EXPIRATION: 'timetable_expiration'
};

/**
 * Session expiration time in milliseconds (30 days)
 */
export const SESSION_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

/**
 * Department options for filtering
 */
export const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Business',
  'Economics',
  'Engineering'
];

/**
 * Semester options for filtering
 */
export const SEMESTERS = [
  'Fall 2024',
  'Spring 2025',
  'Summer 2025',
  'Fall 2025'
];

/**
 * Credit options for filtering
 */
export const CREDITS = [1, 2, 3, 4, 5]; 