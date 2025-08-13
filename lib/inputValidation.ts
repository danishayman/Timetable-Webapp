/**
 * Enhanced Input Validation Utilities
 * Comprehensive validation functions for forms, API inputs, and edge cases
 */

import { z } from 'zod';
import { 
  subjectSchema, 
  subjectFiltersSchema,
  validationPatterns,
  sanitizeInput,
  edgeCaseValidation 
} from './validations';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: unknown;
}

export interface ValidationOptions {
  sanitize?: boolean;
  checkEdgeCases?: boolean;
  maxSize?: number;
}

/**
 * Comprehensive form validation with sanitization and edge case handling
 */
export class FormValidator {
  /**
   * Validate subject form data
   */
  static validateSubjectForm(data: Record<string, unknown>, options: ValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    const sanitizedData = { ...data };

    try {
      // Sanitize input if requested
      if (options.sanitize) {
        if (typeof sanitizedData.code === 'string') {
          sanitizedData.code = sanitizeInput.string(sanitizedData.code).toUpperCase();
        }
        if (typeof sanitizedData.name === 'string') {
          sanitizedData.name = sanitizeInput.string(sanitizedData.name);
        }
        if (typeof sanitizedData.description === 'string') {
          sanitizedData.description = sanitizeInput.string(sanitizedData.description);
        }
      }

      // Check for edge cases
      if (options.checkEdgeCases) {
        // Check for empty/whitespace fields
        if (typeof sanitizedData.code === 'string' && edgeCaseValidation.isEmptyOrWhitespace(sanitizedData.code)) {
          errors.push('Subject code cannot be empty or whitespace only');
        }
        
        // Check for problematic Unicode
        if (typeof sanitizedData.name === 'string' && edgeCaseValidation.hasProblematicUnicode(sanitizedData.name)) {
          errors.push('Subject name contains invalid characters');
        }
        
        // Check for excessive number values
        if (typeof sanitizedData.credits === 'number' && edgeCaseValidation.isExcessiveNumber(sanitizedData.credits)) {
          errors.push('Credits value is too large');
        }
      }

      // Apply Zod validation
      const result = subjectSchema.safeParse(sanitizedData);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          errors.push(issue.message);
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined
      };
    } catch {
      errors.push('Validation failed due to unexpected error');
      return { isValid: false, errors };
    }
  }

  /**
   * Validate schedule form data
   */
  static validateScheduleForm(data: Record<string, unknown>, options: ValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    const sanitizedData = { ...data };

    try {
      // Sanitize input
      if (options.sanitize) {
        if (typeof sanitizedData.venue === 'string') {
          sanitizedData.venue = sanitizeInput.string(sanitizedData.venue);
        }
        if (typeof sanitizedData.instructor === 'string') {
          sanitizedData.instructor = sanitizeInput.string(sanitizedData.instructor);
        }
      }

      // Check edge cases
      if (options.checkEdgeCases) {
        // Validate time sequence
        if (typeof sanitizedData.start_time === 'string' && typeof sanitizedData.end_time === 'string') {
          const startValid = validationPatterns.time24Hour.test(sanitizedData.start_time);
          const endValid = validationPatterns.time24Hour.test(sanitizedData.end_time);
          
          if (startValid && endValid) {
            const [startHours, startMinutes] = sanitizedData.start_time.split(':').map(Number);
            const [endHours, endMinutes] = sanitizedData.end_time.split(':').map(Number);
            
            const startTotal = startHours * 60 + startMinutes;
            const endTotal = endHours * 60 + endMinutes;
            
            if (endTotal <= startTotal) {
              errors.push('End time must be after start time');
            }
            
            const duration = endTotal - startTotal;
            if (duration < 30) {
              errors.push('Class duration must be at least 30 minutes');
            }
            if (duration > 240) {
              errors.push('Class duration cannot exceed 4 hours');
            }
          }
        }
      }

      // Apply Zod validation (excluding cross-field validation which we handle above)
      const scheduleSchemaSimple = z.object({
        subject_id: z.string().uuid('Invalid subject ID'),
        type: z.enum(['lecture', 'tutorial', 'lab', 'practical']),
        day_of_week: z.number().int().min(0).max(6),
        start_time: z.string().refine(val => validationPatterns.time24Hour.test(val), 'Invalid time format'),
        end_time: z.string().refine(val => validationPatterns.time24Hour.test(val), 'Invalid time format'),
        venue: z.string().min(1, 'Venue is required'),
        instructor: z.string().optional(),
        max_capacity: z.number().int().min(1).optional()
      });

      const result = scheduleSchemaSimple.safeParse(sanitizedData);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          errors.push(issue.message);
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined
      };
    } catch {
      errors.push('Schedule validation failed due to unexpected error');
      return { isValid: false, errors };
    }
  }

  /**
   * Validate search and filter inputs
   */
  static validateSearchFilters(data: Record<string, unknown>, options: ValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    const sanitizedData = { ...data };

    try {
      // Sanitize search queries
      if (options.sanitize) {
        if (typeof sanitizedData.search === 'string') {
          sanitizedData.search = sanitizeInput.searchQuery(sanitizedData.search);
        }
        if (typeof sanitizedData.department === 'string') {
          sanitizedData.department = sanitizeInput.string(sanitizedData.department);
        }
        if (typeof sanitizedData.semester === 'string') {
          sanitizedData.semester = sanitizeInput.string(sanitizedData.semester);
        }
      }

      // Check for edge cases
      if (options.checkEdgeCases) {
        // Prevent overly broad searches
        if (typeof sanitizedData.search === 'string' && sanitizedData.search.length === 1) {
          errors.push('Search term must be at least 2 characters');
        }
        
        // Check for injection attempts
        const dangerousPatterns = [
          /script/i, /javascript/i, /vbscript/i, /<.*>/i, /union.*select/i
        ];
        
        Object.values(sanitizedData).forEach(value => {
          if (typeof value === 'string') {
            dangerousPatterns.forEach(pattern => {
              if (pattern.test(value)) {
                errors.push('Search contains potentially dangerous content');
              }
            });
          }
        });
      }

      // Apply Zod validation
      const result = subjectFiltersSchema.safeParse(sanitizedData);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          errors.push(issue.message);
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined
      };
    } catch {
      errors.push('Search filter validation failed');
      return { isValid: false, errors };
    }
  }
}

/**
 * API Input Validator
 * Validates incoming API requests with comprehensive error handling
 */
export class ApiValidator {
  /**
   * Validate and sanitize API request body
   */
  static validateRequestBody(
    body: unknown, 
    schema: z.ZodSchema, 
    options: ValidationOptions = {}
  ): ValidationResult {
    const errors: string[] = [];

    try {
      // Check for null/undefined body
      if (!body) {
        return { isValid: false, errors: ['Request body is required'] };
      }

      // Check for excessively large payloads
      if (options.maxSize) {
        const bodySize = JSON.stringify(body).length;
        if (bodySize > options.maxSize) {
          return { 
            isValid: false, 
            errors: [`Request body too large (${bodySize} bytes, max ${options.maxSize})`]
          };
        }
      }

      // Check for excessively nested objects
      if (options.checkEdgeCases && edgeCaseValidation.isExcessivelyNested(body)) {
        return { 
          isValid: false, 
          errors: ['Request body is too deeply nested'] 
        };
      }

      // Apply schema validation
      const result = schema.safeParse(body);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          errors.push(`${issue.path.join('.')}: ${issue.message}`);
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: result.success ? result.data : undefined
      };
    } catch {
      return { 
        isValid: false, 
        errors: ['Failed to validate request body'] 
      };
    }
  }

  /**
   * Validate query parameters
   */
  static validateQueryParams(
    params: URLSearchParams | Record<string, string>, 
    allowedParams: string[] = []
  ): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: Record<string, string> = {};

    try {
      const paramEntries = params instanceof URLSearchParams 
        ? Array.from(params.entries())
        : Object.entries(params);

      paramEntries.forEach(([key, value]) => {
        // Check if parameter is allowed
        if (allowedParams.length > 0 && !allowedParams.includes(key)) {
          errors.push(`Unknown parameter: ${key}`);
          return;
        }

        // Sanitize parameter value
        const sanitizedValue = sanitizeInput.string(value);
        
        // Check for edge cases
        if (sanitizedValue.length > 1000) {
          errors.push(`Parameter ${key} is too long`);
        } else if (edgeCaseValidation.hasProblematicUnicode(sanitizedValue)) {
          errors.push(`Parameter ${key} contains invalid characters`);
        } else {
          sanitizedData[key] = sanitizedValue;
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined
      };
    } catch {
      return { 
        isValid: false, 
        errors: ['Failed to validate query parameters'] 
      };
    }
  }
}

/**
 * Empty State Validator
 * Handles various empty state scenarios
 */
export class EmptyStateValidator {
  /**
   * Check if data represents an empty state and provide appropriate handling
   */
  static checkEmptyState(data: unknown, dataType: 'subjects' | 'schedules' | 'tutorials'): {
    isEmpty: boolean;
    message: string;
    fallbackData?: unknown;
  } {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      switch (dataType) {
        case 'subjects':
          return {
            isEmpty: true,
            message: 'No subjects found. Try adjusting your search criteria or check back later.',
            fallbackData: []
          };
        case 'schedules':
          return {
            isEmpty: true,
            message: 'No class schedules available for this subject.',
            fallbackData: []
          };
        case 'tutorials':
          return {
            isEmpty: true,
            message: 'No tutorial groups available for this subject.',
            fallbackData: []
          };
        default:
          return {
            isEmpty: true,
            message: 'No data available.',
            fallbackData: []
          };
      }
    }

    return { isEmpty: false, message: '' };
  }

  /**
   * Validate that required data dependencies exist
   */
  static validateDataDependencies(data: {
    selectedSubjects?: unknown[];
    availableSubjects?: unknown[];
    tutorials?: unknown[];
  }): ValidationResult {
    const errors: string[] = [];

    // Check if selected subjects exist in available subjects
    if (Array.isArray(data.selectedSubjects) && Array.isArray(data.availableSubjects)) {
      data.selectedSubjects.forEach((selected: unknown) => {
        const selectedSubject = selected as { subject_id?: string; subject_code?: string };
        const exists = data.availableSubjects?.some((subject: unknown) => {
          const subjectData = subject as { id?: string };
          return subjectData.id === selectedSubject.subject_id;
        });
        if (!exists) {
          errors.push(`Selected subject ${selectedSubject.subject_code || 'unknown'} is no longer available`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Data Boundary Validator
 * Handles maximum data loads and performance considerations
 */
export class DataBoundaryValidator {
  static readonly MAX_SUBJECTS = 1000;
  static readonly MAX_SCHEDULES_PER_SUBJECT = 50;
  static readonly MAX_SELECTED_SUBJECTS = 20;
  static readonly MAX_SEARCH_RESULTS = 100;

  /**
   * Validate data doesn't exceed reasonable boundaries
   */
  static validateDataBoundaries(data: unknown, dataType: string): ValidationResult {
    const errors: string[] = [];

    try {
      switch (dataType) {
        case 'subjects':
          if (Array.isArray(data) && data.length > this.MAX_SUBJECTS) {
            errors.push(`Too many subjects (${data.length}). Maximum allowed: ${this.MAX_SUBJECTS}`);
          }
          break;

        case 'schedules':
          if (Array.isArray(data) && data.length > this.MAX_SCHEDULES_PER_SUBJECT) {
            errors.push(`Too many schedules (${data.length}). Maximum allowed: ${this.MAX_SCHEDULES_PER_SUBJECT}`);
          }
          break;

        case 'selectedSubjects':
          if (Array.isArray(data) && data.length > this.MAX_SELECTED_SUBJECTS) {
            errors.push(`Too many selected subjects (${data.length}). Maximum allowed: ${this.MAX_SELECTED_SUBJECTS}`);
          }
          break;

        case 'searchResults':
          if (Array.isArray(data) && data.length > this.MAX_SEARCH_RESULTS) {
            // Truncate results instead of erroring
            data = data.slice(0, this.MAX_SEARCH_RESULTS);
          }
          break;
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: data
      };
    } catch {
      return {
        isValid: false,
        errors: ['Failed to validate data boundaries']
      };
    }
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page?: number, limit?: number): ValidationResult {
    const errors: string[] = [];
    
    const maxPage = 1000;
    const maxLimit = 100;
    const defaultLimit = 20;

    const validatedPage = page || 1;
    const validatedLimit = limit || defaultLimit;

    if (validatedPage < 1) {
      errors.push('Page must be at least 1');
    } else if (validatedPage > maxPage) {
      errors.push(`Page cannot exceed ${maxPage}`);
    }

    if (validatedLimit < 1) {
      errors.push('Limit must be at least 1');
    } else if (validatedLimit > maxLimit) {
      errors.push(`Limit cannot exceed ${maxLimit}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: { page: validatedPage, limit: validatedLimit }
    };
  }
}

// All classes are already exported above
