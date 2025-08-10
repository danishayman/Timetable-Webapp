import { z } from 'zod';
import { isValidTimeFormat } from './utils';

/**
 * Subject validation schema
 */
export const subjectSchema = z.object({
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(10, 'Code must be at most 10 characters')
    .regex(/^[A-Z0-9]+$/i, 'Code must contain only letters and numbers'),
  
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  
  credits: z.number()
    .int('Credits must be an integer')
    .min(1, 'Credits must be at least 1')
    .max(6, 'Credits must be at most 6'),
  
  description: z.string().optional(),
  
  semester: z.string().optional(),
  
  department: z.string().optional()
});

/**
 * Class schedule validation schema
 */
export const classScheduleSchema = z.object({
  subject_id: z.string().uuid('Invalid subject ID'),
  
  type: z.enum(['lecture', 'tutorial', 'lab', 'practical']),
  
  day_of_week: z.number()
    .int('Day must be an integer')
    .min(0, 'Day must be between 0 and 6')
    .max(6, 'Day must be between 0 and 6'),
  
  start_time: z.string()
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)'),
  
  end_time: z.string()
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)'),
  
  venue: z.string()
    .min(1, 'Venue is required'),
  
  instructor: z.string().optional(),
  
  max_capacity: z.number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .optional()
});

/**
 * Tutorial group validation schema
 */
export const tutorialGroupSchema = z.object({
  subject_id: z.string().uuid('Invalid subject ID'),
  
  group_name: z.string()
    .min(1, 'Group name is required'),
  
  day_of_week: z.number()
    .int('Day must be an integer')
    .min(0, 'Day must be between 0 and 6')
    .max(6, 'Day must be between 0 and 6'),
  
  start_time: z.string()
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)'),
  
  end_time: z.string()
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)'),
  
  venue: z.string()
    .min(1, 'Venue is required'),
  
  instructor: z.string().optional(),
  
  max_capacity: z.number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .optional()
});

/**
 * Custom slot validation schema
 */
export const customSlotSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  
  day_of_week: z.number()
    .int('Day must be an integer')
    .min(0, 'Day must be between 0 and 6')
    .max(6, 'Day must be between 0 and 6'),
  
  start_time: z.string()
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)'),
  
  end_time: z.string()
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)'),
  
  venue: z.string().optional(),
  
  description: z.string().optional(),
  
  color: z.string().optional()
});

/**
 * Admin login validation schema
 */
export const adminLoginSchema = z.object({
  email: z.string()
    .email('Invalid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
});

/**
 * Timetable name validation schema
 */
export const timetableNameSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters')
});

/**
 * Search and filter validation schemas
 */
export const searchQuerySchema = z.object({
  query: z.string()
    .max(100, 'Search query must be at most 100 characters')
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      'Search query contains invalid characters'
    )
    .optional()
});

export const subjectFiltersSchema = z.object({
  department: z.string()
    .max(100, 'Department name too long')
    .optional(),
  semester: z.string()
    .max(50, 'Semester name too long')
    .optional(),
  credits: z.number()
    .int('Credits must be an integer')
    .min(1, 'Credits must be at least 1')
    .max(12, 'Credits must be at most 12')
    .optional(),
  search: z.string()
    .max(100, 'Search term too long')
    .optional()
});

/**
 * API pagination validation schema
 */
export const paginationSchema = z.object({
  page: z.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .max(1000, 'Page number too large')
    .optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset must be at least 0')
    .optional()
});

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name too long')
    .refine(
      (val) => !/[<>:"|?*\\\/]/.test(val),
      'File name contains invalid characters'
    ),
  fileSize: z.number()
    .int('File size must be an integer')
    .min(1, 'File must not be empty')
    .max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB limit
  fileType: z.string()
    .refine(
      (val) => ['application/pdf', 'text/calendar', 'image/png', 'image/jpeg'].includes(val),
      'Invalid file type'
    )
});

/**
 * Utility functions for validation
 */
export const validateBoundaries = {
  /**
   * Validate that a number is within acceptable bounds
   */
  number: (value: number, min: number, max: number, fieldName: string) => {
    if (isNaN(value)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }
    if (value < min || value > max) {
      return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
    }
    return { isValid: true };
  },

  /**
   * Validate string length
   */
  string: (value: string, minLength: number, maxLength: number, fieldName: string) => {
    if (typeof value !== 'string') {
      return { isValid: false, error: `${fieldName} must be a string` };
    }
    if (value.length < minLength) {
      return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
    }
    if (value.length > maxLength) {
      return { isValid: false, error: `${fieldName} must be at most ${maxLength} characters` };
    }
    return { isValid: true };
  },

  /**
   * Validate array length
   */
  array: (value: unknown[], minLength: number, maxLength: number, fieldName: string) => {
    if (!Array.isArray(value)) {
      return { isValid: false, error: `${fieldName} must be an array` };
    }
    if (value.length < minLength) {
      return { isValid: false, error: `${fieldName} must have at least ${minLength} items` };
    }
    if (value.length > maxLength) {
      return { isValid: false, error: `${fieldName} must have at most ${maxLength} items` };
    }
    return { isValid: true };
  }
};

/**
 * Sanitization utilities
 */
export const sanitizeInput = {
  /**
   * Remove potentially dangerous characters from strings
   */
  string: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/data:/gi, '') // Remove data: URLs
      .replace(/vbscript:/gi, '') // Remove vbscript: URLs
      .trim();
  },

  /**
   * Sanitize search queries
   */
  searchQuery: (query: string): string => {
    if (typeof query !== 'string') return '';
    return query
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .slice(0, 100) // Limit length
      .trim();
  },

  /**
   * Sanitize file names
   */
  fileName: (fileName: string): string => {
    if (typeof fileName !== 'string') return '';
    return fileName
      .replace(/[<>:"|?*\\\/]/g, '') // Remove invalid file name characters
      .slice(0, 255) // Limit length
      .trim();
  }
};

/**
 * Advanced validation patterns
 */
export const validationPatterns = {
  // Safe HTML content (basic)
  safeHtml: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  
  // Subject code pattern (letters and numbers only)
  subjectCode: /^[A-Z0-9]+$/i,
  
  // Time pattern (HH:MM format)
  time24Hour: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // Venue/room pattern
  venue: /^[a-zA-Z0-9\s\-_.,()]+$/,
  
  // Instructor name pattern
  instructorName: /^[a-zA-Z\s\-.']+$/,
  
  // Safe search pattern (no special characters that could cause issues)
  safeSearch: /^[a-zA-Z0-9\s\-_.,()]+$/
};

/**
 * Edge case validation utilities
 */
export const edgeCaseValidation = {
  /**
   * Check for empty or whitespace-only strings
   */
  isEmptyOrWhitespace: (value: string): boolean => {
    return typeof value !== 'string' || value.trim().length === 0;
  },

  /**
   * Check for very large numbers that might cause issues
   */
  isExcessiveNumber: (value: number): boolean => {
    return value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER;
  },

  /**
   * Check for potentially problematic Unicode characters
   */
  hasProblematicUnicode: (value: string): boolean => {
    // Check for control characters, private use characters, etc.
    return /[\u0000-\u001F\u007F-\u009F\uE000-\uF8FF\uFFF0-\uFFFF]/.test(value);
  },

  /**
   * Check for excessively nested objects (for JSON inputs)
   */
  isExcessivelyNested: (obj: unknown, maxDepth = 10): boolean => {
    const checkDepth = (item: unknown, depth: number): boolean => {
      if (depth > maxDepth) return true;
      if (typeof item === 'object' && item !== null) {
        const objItem = item as Record<string, unknown>;
        for (const key in objItem) {
          if (checkDepth(objItem[key], depth + 1)) return true;
        }
      }
      return false;
    };
    return checkDepth(obj, 0);
  }
}; 