/**
 * Tutorial Group type definition
 * Matches the tutorial_groups table in the database
 */
export interface TutorialGroup {
  id: string;
  subject_id: string;
  group_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string;
  instructor: string | null;
  max_capacity: number;
  created_at: string;
}

/**
 * Tutorial Group creation data
 * Used when creating a new tutorial group
 */
export interface CreateTutorialGroupData {
  subject_id: string;
  group_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string;
  instructor?: string;
  max_capacity?: number;
}

/**
 * Tutorial Group update data
 * Used when updating an existing tutorial group
 */
export interface UpdateTutorialGroupData {
  subject_id?: string;
  group_name?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  venue?: string;
  instructor?: string | null;
  max_capacity?: number;
}

/**
 * Subject with tutorial groups
 * Used when fetching a subject with its tutorial groups
 */
export interface SubjectWithTutorials {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string | null;
  semester: string | null;
  department: string | null;
  tutorials: TutorialGroup[];
}

/**
 * Selected tutorial group
 * Used when a student selects a tutorial group for a subject
 */
export interface SelectedTutorial {
  subject_id: string;
  tutorial_id: string;
} 