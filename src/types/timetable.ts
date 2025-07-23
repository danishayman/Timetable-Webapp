import { ClassSchedule } from './classSchedule';
import { TutorialGroup } from './tutorial';

/**
 * Timetable slot type
 * Represents a single slot in the timetable grid
 */
export interface TimetableSlot {
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

/**
 * Custom slot type
 * For user-added custom events in the timetable
 */
export interface CustomSlot {
  id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue?: string;
  description?: string;
  color?: string;
}

/**
 * Clash type
 * Represents a time or venue conflict between two slots
 */
export interface Clash {
  id: string;
  slot1: TimetableSlot;
  slot2: TimetableSlot;
  type: 'time' | 'venue';
  severity: 'warning' | 'error';
  message: string;
}

/**
 * Clash resolution type
 * Suggested ways to resolve a clash
 */
export interface ClashResolution {
  clashId: string;
  options: Array<{
    description: string;
    action: 'replace' | 'remove' | 'ignore';
    slotId?: string;
    replacementSlotId?: string;
  }>;
}

/**
 * Selected subject type
 * Used when a student selects a subject with optional tutorial
 */
export interface SelectedSubject {
  subject_id: string;
  subject_code?: string;
  subject_name?: string;
  tutorial_group_id?: string;
  color?: string;
}

/**
 * Timetable data type
 * Complete timetable data for saving/loading
 */
export interface TimetableData {
  id?: string;
  session_id: string;
  name: string;
  selected_subjects: SelectedSubject[];
  timetable_slots: TimetableSlot[];
  custom_slots: CustomSlot[];
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

/**
 * Convert a class schedule to a timetable slot
 */
export function classScheduleToTimetableSlot(
  schedule: ClassSchedule, 
  subject_code: string, 
  subject_name: string
): TimetableSlot {
  return {
    id: schedule.id,
    subject_id: schedule.subject_id,
    subject_code,
    subject_name,
    type: schedule.type,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    venue: schedule.venue,
    instructor: schedule.instructor,
    isCustom: false
  };
}

/**
 * Convert a tutorial group to a timetable slot
 */
export function tutorialGroupToTimetableSlot(
  tutorial: TutorialGroup, 
  subject_code: string, 
  subject_name: string
): TimetableSlot {
  return {
    id: tutorial.id,
    subject_id: tutorial.subject_id,
    subject_code,
    subject_name,
    type: 'tutorial',
    day_of_week: tutorial.day_of_week,
    start_time: tutorial.start_time,
    end_time: tutorial.end_time,
    venue: tutorial.venue,
    instructor: tutorial.instructor,
    isCustom: false
  };
}

/**
 * Convert a custom slot to a timetable slot
 */
export function customSlotToTimetableSlot(customSlot: CustomSlot): TimetableSlot {
  return {
    id: customSlot.id,
    subject_id: '',
    subject_code: '',
    subject_name: customSlot.title,
    type: 'custom',
    day_of_week: customSlot.day_of_week,
    start_time: customSlot.start_time,
    end_time: customSlot.end_time,
    venue: customSlot.venue || '',
    instructor: null,
    color: customSlot.color,
    isCustom: true
  };
} 