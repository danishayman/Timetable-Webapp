import { Subject } from './subject';
import { ClassSchedule } from './classSchedule';
import { TutorialGroup } from './tutorial';
import { TimetableSlot, Clash } from './timetable';

/**
 * API response structure
 * Generic response structure for all API endpoints
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Subject with schedules response
 * Used when fetching a subject with its class schedules
 */
export interface SubjectWithSchedulesResponse {
  subject: Subject;
  schedules: ClassSchedule[];
}

/**
 * Subject with tutorials response
 * Used when fetching a subject with its tutorial groups
 */
export interface SubjectWithTutorialsResponse {
  subject: Subject;
  tutorials: TutorialGroup[];
}

/**
 * Subject complete data response
 * Used when fetching a subject with all related data
 */
export interface SubjectCompleteResponse {
  subject: Subject;
  schedules: ClassSchedule[];
  tutorials: TutorialGroup[];
}

/**
 * Timetable generation response
 * Used when generating a timetable
 */
export interface TimetableGenerationResponse {
  timetableSlots: TimetableSlot[];
  clashes: Clash[];
}

/**
 * Clash check response
 * Used when checking for clashes
 */
export interface ClashCheckResponse {
  hasClashes: boolean;
  clashes: Clash[];
}

/**
 * Export response
 * Used when exporting a timetable
 */
export interface ExportResponse {
  url: string;
  filename: string;
  mimeType: string;
} 