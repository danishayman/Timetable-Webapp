/**
 * Class Schedule type definition
 * Matches the class_schedules table in the database
 */
export interface ClassSchedule {
  id: string;
  subject_id: string;
  type: 'lecture' | 'tutorial' | 'lab' | 'practical';
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string;
  instructor: string | null;
  max_capacity: number;
  created_at: string;
}

/**
 * Class Schedule creation data
 * Used when creating a new class schedule
 */
export interface CreateClassScheduleData {
  subject_id: string;
  type: 'lecture' | 'tutorial' | 'lab' | 'practical';
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string;
  instructor?: string;
  max_capacity?: number;
}

/**
 * Class Schedule update data
 * Used when updating an existing class schedule
 */
export interface UpdateClassScheduleData {
  subject_id?: string;
  type?: 'lecture' | 'tutorial' | 'lab' | 'practical';
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  venue?: string;
  instructor?: string | null;
  max_capacity?: number;
}

/**
 * Subject with class schedules
 * Used when fetching a subject with its schedules
 */
export interface SubjectWithSchedules {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string | null;
  semester: string | null;
  department: string | null;
  schedules: ClassSchedule[];
} 