/**
 * School type definition
 * Matches the schools table in the database
 */
export interface School {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * School creation data
 * Used when creating a new school
 */
export interface CreateSchoolData {
  name: string;
  description?: string;
}

/**
 * School update data
 * Used when updating an existing school
 */
export interface UpdateSchoolData {
  name?: string;
  description?: string;
}

/**
 * School with subject count
 * Used for displaying schools with their subject counts
 */
export interface SchoolWithSubjectCount extends School {
  subject_count: number;
}

