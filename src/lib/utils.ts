import { DAYS_OF_WEEK, SHORT_DAYS, TIME_SLOTS } from './constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID
 * @returns A UUID string
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Format a time string (HH:MM) to 12-hour format with AM/PM
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Formatted time string (e.g., "9:00 AM")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a time string (HH:MM) to short 12-hour format (e.g., "9 AM", "2 PM")
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Short formatted time string
 */
export function formatTimeShort(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  // Only show minutes if they're not 00
  if (minutes === 0) {
    return `${formattedHours} ${period}`;
  }
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a time range from start and end times
 * @param startTime Start time string (HH:MM)
 * @param endTime End time string (HH:MM)
 * @returns Formatted time range string (e.g., "9:00 AM - 10:30 AM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Convert a day number (0-6) to day name
 * @param dayNumber Day number (0 for Sunday, 6 for Saturday)
 * @param short Whether to return the short name
 * @returns Day name
 */
export function getDayName(dayNumber: number, short: boolean = false): string {
  if (dayNumber < 0 || dayNumber > 6) {
    throw new Error('Day number must be between 0 and 6');
  }
  return short ? SHORT_DAYS[dayNumber] : DAYS_OF_WEEK[dayNumber];
}

/**
 * Format a day of week number to a day name
 * @param dayOfWeek Day number (0 for Sunday, 6 for Saturday)
 * @param short Whether to return the short name
 * @returns Day name
 */
export function formatDayOfWeek(dayOfWeek: number, short: boolean = false): string {
  return getDayName(dayOfWeek, short);
}

/**
 * Convert a day name to day number (0-6)
 * @param dayName Day name (e.g., "Monday" or "Mon")
 * @returns Day number (0 for Sunday, 6 for Saturday)
 */
export function getDayNumber(dayName: string): number {
  const fullDay = DAYS_OF_WEEK.findIndex(day => 
    day.toLowerCase() === dayName.toLowerCase()
  );
  
  if (fullDay !== -1) return fullDay;
  
  const shortDay = SHORT_DAYS.findIndex(day => 
    day.toLowerCase() === dayName.toLowerCase()
  );
  
  if (shortDay !== -1) return shortDay;
  
  throw new Error(`Invalid day name: ${dayName}`);
}

/**
 * Parse a time string to minutes since midnight
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string
 * @param minutes Minutes since midnight
 * @returns Time string in 24-hour format (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate the duration between two times in minutes
 * @param startTime Start time string (HH:MM)
 * @param endTime End time string (HH:MM)
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Calculate the row span for a time slot in the timetable grid
 * @param startTime Start time string (HH:MM)
 * @param endTime End time string (HH:MM)
 * @returns Row span value
 */
export function calculateRowSpan(startTime: string, endTime: string): number {
  const duration = calculateDuration(startTime, endTime);
  // Each time slot is now 60 minutes (1 hour)
  return duration / 60;
}

/**
 * Calculate the row index for a time in the timetable grid
 * @param time Time string (HH:MM)
 * @returns Row index
 */
export function calculateRowIndex(time: string): number {
  const index = TIME_SLOTS.indexOf(time);
  if (index === -1) {
    // Find the closest time slot
    const minutes = timeToMinutes(time);
    const closestIndex = TIME_SLOTS.findIndex(slot => {
      return timeToMinutes(slot) >= minutes;
    });
    return closestIndex === -1 ? TIME_SLOTS.length - 1 : closestIndex;
  }
  return index;
}

/**
 * Check if a string is a valid time format (HH:MM)
 * @param time Time string to validate
 * @returns Whether the time string is valid
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Generate a random color
 * @returns Hex color string
 */
export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Format a date string to a readable format
 * @param dateString Date string
 * @returns Formatted date string (e.g., "Jan 1, 2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get the current semester based on the current date
 * @returns Current semester string (e.g., "Fall 2024")
 */
export function getCurrentSemester(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month >= 0 && month <= 4) {
    return `Spring ${year}`;
  } else if (month >= 5 && month <= 7) {
    return `Summer ${year}`;
  } else {
    return `Fall ${year}`;
  }
}

/**
 * Round a time to the nearest hour for better grid alignment
 * @param time Time string (HH:MM)
 * @returns Rounded time string
 */
export function roundTimeToNearestHour(time: string): string {
  const minutes = timeToMinutes(time);
  const hours = Math.round(minutes / 60);
  return minutesToTime(hours * 60);
}

/**
 * Get the closest time slot from TIME_SLOTS array
 * @param time Time string (HH:MM)
 * @returns Closest time slot
 */
export function getClosestTimeSlot(time: string): string {
  const timeMinutes = timeToMinutes(time);
  
  let closestSlot = TIME_SLOTS[0];
  let minDifference = Math.abs(timeToMinutes(closestSlot) - timeMinutes);
  
  for (const slot of TIME_SLOTS) {
    const difference = Math.abs(timeToMinutes(slot) - timeMinutes);
    if (difference < minDifference) {
      minDifference = difference;
      closestSlot = slot;
    }
  }
  
  return closestSlot;
} 