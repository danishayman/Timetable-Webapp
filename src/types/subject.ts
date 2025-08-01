/**
 * Subject type definition
 * Matches the subjects table in the database
 */
export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string | null;
  semester: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subject creation data
 * Used when creating a new subject
 */
export interface CreateSubjectData {
  code: string;
  name: string;
  credits?: number;
  description?: string;
  semester?: string;
  department?: string;
}

/**
 * Subject update data
 * Used when updating an existing subject
 */
export interface UpdateSubjectData {
  code?: string;
  name?: string;
  credits?: number;
  description?: string;
  semester?: string;
  department?: string;
}

/**
 * Subject filters
 * Used for filtering subjects in search
 */
export interface SubjectFilters {
  department?: string;
  semester?: string;
  credits?: number;
} 