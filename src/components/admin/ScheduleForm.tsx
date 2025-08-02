'use client';

import React, { useState, useEffect } from 'react';
import { ClassSchedule, CreateClassScheduleData, UpdateClassScheduleData } from '@/src/types/classSchedule';
import { Subject } from '@/src/types/subject';
import { DAYS_OF_WEEK, CLASS_TYPES } from '@/src/lib/constants';
import { FormValidator } from '@/src/lib/inputValidation';

interface ScheduleFormProps {
  /** Schedule to edit (undefined for creating new schedule) */
  schedule?: ClassSchedule;
  /** Subject ID if creating a new schedule for a specific subject */
  defaultSubjectId?: string;
  /** List of available subjects for selection */
  subjects: Subject[];
  /** Called when form is submitted successfully */
  onSuccess: () => void;
  /** Called when form is cancelled */
  onCancel: () => void;
  /** Loading state for external operations */
  isLoading?: boolean;
}

interface FormData {
  subject_id: string;
  type: 'lecture' | 'tutorial' | 'lab' | 'practical';
  day_of_week: number;
  start_time: string;
  end_time: string;
  venue: string;
  instructor: string;
  max_capacity: number;
}

interface FormErrors {
  subject_id?: string;
  type?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  instructor?: string;
  max_capacity?: string;
  submit?: string;
}

// Generate time options in 30-minute intervals from 08:00 to 21:30
const generateTimeOptions = (): string[] => {
  const times = [];
  for (let hour = 8; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export default function ScheduleForm({ 
  schedule, 
  defaultSubjectId,
  subjects,
  onSuccess, 
  onCancel, 
  isLoading = false 
}: ScheduleFormProps) {
  const [formData, setFormData] = useState<FormData>({
    subject_id: defaultSubjectId || '',
    type: 'lecture',
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '10:30',
    venue: '',
    instructor: '',
    max_capacity: 30,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate form when editing existing schedule
  useEffect(() => {
    if (schedule) {
      setFormData({
        subject_id: schedule.subject_id,
        type: schedule.type,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        venue: schedule.venue,
        instructor: schedule.instructor || '',
        max_capacity: schedule.max_capacity,
      });
    }
  }, [schedule]);

  // Form validation
  const validateForm = (): boolean => {
    try {
      // Use comprehensive form validator for schedule data
      const validationResult = FormValidator.validateScheduleForm(formData, {
        sanitize: true,
        checkEdgeCases: true
      });

      if (!validationResult.isValid) {
        const newErrors: FormErrors = {};
        
        validationResult.errors.forEach(error => {
          // Map validation errors to form fields
          if (error.includes('Subject') || error.includes('subject_id')) {
            newErrors.subject_id = error;
          } else if (error.includes('Type') || error.includes('type')) {
            newErrors.type = error;
          } else if (error.includes('Day') || error.includes('day_of_week')) {
            newErrors.day_of_week = error;
          } else if (error.includes('Start time') || error.includes('start_time')) {
            newErrors.start_time = error;
          } else if (error.includes('End time') || error.includes('end_time')) {
            newErrors.end_time = error;
          } else if (error.includes('Venue') || error.includes('venue')) {
            newErrors.venue = error;
          } else if (error.includes('Instructor') || error.includes('instructor')) {
            newErrors.instructor = error;
          } else if (error.includes('Capacity') || error.includes('max_capacity')) {
            newErrors.max_capacity = error;
          } else {
            newErrors.submit = error;
          }
        });

        setErrors(newErrors);
        return false;
      }

      // Update form data with sanitized values if available
      if (validationResult.sanitizedData) {
        setFormData(prev => ({ ...prev, ...validationResult.sanitizedData }));
      }

      setErrors({});
      return true;
    } catch (error) {
      console.error('Form validation error:', error);
      setErrors({ submit: 'Validation failed. Please check your inputs.' });
      return false;
    }
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert minutes to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate end time when start time changes (1.5 hour default for lectures, 1 hour for others)
    if (field === 'start_time' && typeof value === 'string') {
      const startMinutes = timeToMinutes(value);
      const defaultDuration = formData.type === 'lecture' ? 90 : 60; // 90 min for lectures, 60 for others
      const endMinutes = startMinutes + defaultDuration;
      
      // Make sure end time doesn't go beyond 22:00
      const maxEndMinutes = timeToMinutes('22:00');
      const calculatedEnd = Math.min(endMinutes, maxEndMinutes);
      
      setFormData(prev => ({
        ...prev,
        [field]: value,
        end_time: minutesToTime(calculatedEnd)
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const url = schedule 
        ? `/api/admin/schedules/${schedule.id}`
        : '/api/admin/schedules';
      const method = schedule ? 'PUT' : 'POST';
      
      const requestData = schedule 
        ? formData as UpdateClassScheduleData
        : formData as CreateClassScheduleData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token-for-testing', // TODO: Replace with real auth token
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Schedule conflicts with existing class for this subject');
        }
        throw new Error(result.error || 'Failed to save schedule');
      }

      console.log('Schedule saved successfully:', result.data);
      onSuccess();
    } catch (error) {
      console.error('Error saving schedule:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred while saving the schedule'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;
  const selectedSubject = subjects.find(s => s.id === formData.subject_id);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {schedule ? 'Edit Class Schedule' : 'Create New Class Schedule'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Selection */}
        <div>
          <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            id="subject_id"
            value={formData.subject_id}
            onChange={(e) => handleInputChange('subject_id', e.target.value)}
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.subject_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a subject...</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>
          {errors.subject_id && (
            <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
          )}
          {selectedSubject && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedSubject.department && `${selectedSubject.department} • `}
              {selectedSubject.credits} {selectedSubject.credits === 1 ? 'Credit' : 'Credits'}
            </p>
          )}
        </div>

        {/* Class Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Class Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.entries(CLASS_TYPES).filter(([key]) => key !== 'custom').map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        {/* Day of Week */}
        <div>
          <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-2">
            Day of Week *
          </label>
          <select
            id="day_of_week"
            value={formData.day_of_week}
            onChange={(e) => handleInputChange('day_of_week', parseInt(e.target.value))}
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.day_of_week ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {DAYS_OF_WEEK.map((day, index) => (
              <option key={index} value={index}>
                {day}
              </option>
            ))}
          </select>
          {errors.day_of_week && (
            <p className="mt-1 text-sm text-red-600">{errors.day_of_week}</p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <select
              id="start_time"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              disabled={isFormDisabled}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.start_time ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.start_time && (
              <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <select
              id="end_time"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              disabled={isFormDisabled}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.end_time ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.end_time && (
              <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
            )}
          </div>
        </div>

        {/* Duration Display */}
        {formData.start_time && formData.end_time && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Duration:</span> {
                Math.round((timeToMinutes(formData.end_time) - timeToMinutes(formData.start_time)) / 30) * 0.5
              } hours
            </p>
          </div>
        )}

        {/* Venue */}
        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
            Venue *
          </label>
          <input
            id="venue"
            type="text"
            value={formData.venue}
            onChange={(e) => handleInputChange('venue', e.target.value)}
            disabled={isFormDisabled}
            placeholder="e.g., Room A101, Computer Lab 1, Main Auditorium"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.venue ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.venue && (
            <p className="mt-1 text-sm text-red-600">{errors.venue}</p>
          )}
        </div>

        {/* Instructor */}
        <div>
          <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-2">
            Instructor
          </label>
          <input
            id="instructor"
            type="text"
            value={formData.instructor}
            onChange={(e) => handleInputChange('instructor', e.target.value)}
            disabled={isFormDisabled}
            placeholder="e.g., Dr. Smith, Prof. Johnson"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.instructor ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.instructor && (
            <p className="mt-1 text-sm text-red-600">{errors.instructor}</p>
          )}
        </div>

        {/* Max Capacity */}
        <div>
          <label htmlFor="max_capacity" className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Capacity
          </label>
          <input
            id="max_capacity"
            type="number"
            min="1"
            max="500"
            value={formData.max_capacity}
            onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value) || 1)}
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.max_capacity ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.max_capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.max_capacity}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Number of students that can attend this class
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isFormDisabled}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {schedule ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              schedule ? 'Update Schedule' : 'Create Schedule'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isFormDisabled}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
