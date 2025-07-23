/**
 * This file is just for testing type imports
 * It's not meant to be used in the actual application
 */

import {
  // Admin types
  AdminUser,
  AdminAuthState,
  AdminSignInCredentials,
  
  // API types
  ApiResponse,
  SubjectWithSchedulesResponse,
  SubjectWithTutorialsResponse,
  SubjectCompleteResponse,
  TimetableGenerationResponse,
  ClashCheckResponse,
  ExportResponse,
  
  // ClassSchedule types
  ClassSchedule,
  CreateClassScheduleData,
  UpdateClassScheduleData,
  SubjectWithSchedules,
  
  // Database types
  Database,
  
  // Store types
  SubjectState,
  TimetableState,
  AdminState,
  
  // Subject types
  Subject,
  CreateSubjectData,
  UpdateSubjectData,
  SubjectFilters,
  
  // Timetable types
  TimetableSlot,
  CustomSlot,
  Clash,
  ClashResolution,
  SelectedSubject,
  TimetableData,
  
  // Tutorial types
  TutorialGroup,
  CreateTutorialGroupData,
  UpdateTutorialGroupData,
  SubjectWithTutorials,
  SelectedTutorial
} from './index';

// Test function to verify type imports
function testTypes(): void {
  // Create a sample subject
  const subject: Subject = {
    id: '1',
    code: 'CS101',
    name: 'Introduction to Programming',
    credits: 3,
    description: 'Fundamentals of programming using Python',
    semester: 'Fall 2024',
    department: 'Computer Science',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('Subject:', subject);
  
  // Create a sample class schedule
  const classSchedule: ClassSchedule = {
    id: '1',
    subject_id: '1',
    type: 'lecture',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:30',
    venue: 'Room A101',
    instructor: 'Dr. Smith',
    max_capacity: 30,
    created_at: new Date().toISOString()
  };
  
  console.log('Class Schedule:', classSchedule);
  
  // Create a sample timetable slot
  const timetableSlot: TimetableSlot = {
    id: '1',
    subject_id: '1',
    subject_code: 'CS101',
    subject_name: 'Introduction to Programming',
    type: 'lecture',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:30',
    venue: 'Room A101',
    instructor: 'Dr. Smith',
    isCustom: false
  };
  
  console.log('Timetable Slot:', timetableSlot);
  
  // Create a sample API response
  const apiResponse: ApiResponse<Subject> = {
    data: subject,
    error: null,
    status: 200
  };
  
  console.log('API Response:', apiResponse);
}

// This file is just for type checking, not for execution 