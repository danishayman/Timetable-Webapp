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
  
  type: z.enum(['lecture', 'tutorial', 'lab', 'practical'], {
    errorMap: () => ({ message: 'Invalid class type' })
  }),
  
  day_of_week: z.number()
    .int('Day must be an integer')
    .min(0, 'Day must be between 0 and 6')
    .max(6, 'Day must be between 0 and 6'),
  
  start_time: z.string()
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)'),
  
  end_time: z.string()
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)')
    .refine((endTime, ctx) => {
      const { start_time } = ctx.parent as { start_time: string };
      if (!start_time || !isValidTimeFormat(start_time)) return true;
      
      const [startHours, startMinutes] = start_time.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;
      
      return endTotal > startTotal;
    }, 'End time must be after start time'),
  
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
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)')
    .refine((endTime, ctx) => {
      const { start_time } = ctx.parent as { start_time: string };
      if (!start_time || !isValidTimeFormat(start_time)) return true;
      
      const [startHours, startMinutes] = start_time.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;
      
      return endTotal > startTotal;
    }, 'End time must be after start time'),
  
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
    .refine(isValidTimeFormat, 'Invalid time format (HH:MM)')
    .refine((endTime, ctx) => {
      const { start_time } = ctx.parent as { start_time: string };
      if (!start_time || !isValidTimeFormat(start_time)) return true;
      
      const [startHours, startMinutes] = start_time.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;
      
      return endTotal > startTotal;
    }, 'End time must be after start time'),
  
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