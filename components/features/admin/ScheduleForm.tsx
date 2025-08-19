'use client';

import React, { useState, useEffect } from 'react';
import { ClassSchedule, CreateClassScheduleData, UpdateClassScheduleData } from '@/types/classSchedule';
import { Subject } from '@/types/subject';
import { DAYS_OF_WEEK, CLASS_TYPES } from '@/constants';
import { FormValidator } from '@/lib/inputValidation';
import { X, Save, ArrowLeft, Clock, MapPin, Users, BookOpen, Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react';

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

interface ScheduleFormData {
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
  const [formData, setFormData] = useState<ScheduleFormData>({
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});

  const totalSteps = 3;

  // Pre-populate form when editing existing schedule
  useEffect(() => {
    if (schedule) {
      const newFormData = {
        subject_id: schedule.subject_id,
        type: schedule.type,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        venue: schedule.venue,
        instructor: schedule.instructor || '',
        max_capacity: schedule.max_capacity,
      };
      setFormData(newFormData);
      setHasUnsavedChanges(false);
    }
  }, [schedule]);

  // Track changes for unsaved changes detection
  useEffect(() => {
    if (!schedule) return; // Don't track changes for new schedules until first input
    
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({
      subject_id: schedule.subject_id,
      type: schedule.type,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      venue: schedule.venue,
      instructor: schedule.instructor || '',
      max_capacity: schedule.max_capacity,
    });
    
    setHasUnsavedChanges(hasChanges);
  }, [formData, schedule]);

  // Form validation
  const validateForm = (): boolean => {
    try {
      // Use comprehensive form validator for schedule data
      const validationResult = FormValidator.validateScheduleForm(formData as unknown as Record<string, unknown>, {
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
        setFormData(prev => ({ ...prev, ...(validationResult.sanitizedData as Partial<ScheduleFormData>) }));
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
  const handleInputChange = (field: keyof ScheduleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Mark field as touched
    setFieldTouched(prev => ({ ...prev, [field]: true }));

    // Set hasUnsavedChanges for new schedules on first input
    if (!schedule && !hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }

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

  // Handle cancel with confirmation if there are unsaved changes
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onCancel();
    }
  };

  const confirmCancel = () => {
    setShowConfirmDialog(false);
    onCancel();
  };

  const cancelConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  // Helper functions for step validation
  const isStep1Valid = () => {
    return formData.subject_id && formData.type && !errors.subject_id && !errors.type;
  };

  const isStep2Valid = () => {
    return formData.day_of_week !== undefined && formData.start_time && formData.end_time && 
           !errors.day_of_week && !errors.start_time && !errors.end_time;
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Subject & Type';
      case 2: return 'Schedule & Timing';
      case 3: return 'Venue & Details';
      default: return '';
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return BookOpen;
      case 2: return Clock;
      case 3: return MapPin;
      default: return BookOpen;
    }
  };

  const isFormDisabled = isLoading || isSubmitting;
  const selectedSubject = subjects.find(s => s.id === formData.subject_id);
  const duration = formData.start_time && formData.end_time 
    ? Math.round((timeToMinutes(formData.end_time) - timeToMinutes(formData.start_time)) / 30) * 0.5
    : 0;

  return (
    <>
      {/* Main Form Container */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {schedule ? 'Edit Class Schedule' : 'Create New Class Schedule'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {schedule ? 'Update the schedule details below' : 'Set up a new class schedule with timing, venue, and other important details'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-center">
              <nav className="flex space-x-4" aria-label="Progress">
                {[1, 2, 3].map((step) => {
                  const StepIcon = getStepIcon(step);
                  const isActive = currentStep === step;
                  const isCompleted = currentStep > step;
                  const isAccessible = step === 1 || (step === 2 && isStep1Valid()) || (step === 3 && isStep1Valid() && isStep2Valid());
                  
                  return (
                    <div
                      key={step}
                      className={`flex items-center ${step < 3 ? 'pr-8 sm:pr-20' : ''} relative`}
                    >
                      {step < 3 && (
                        <div
                          className={`hidden sm:block absolute top-4 left-8 w-full h-0.5 ${
                            isCompleted ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        />
                      )}
                      <button
                        onClick={() => isAccessible && setCurrentStep(step)}
                        disabled={!isAccessible}
                        className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          isActive
                            ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                            : isCompleted
                            ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                            : isAccessible
                            ? 'border-gray-300 bg-white hover:border-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-400'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed dark:border-gray-700 dark:bg-gray-900'
                        } transition-colors duration-200`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <StepIcon className={`w-4 h-4 ${
                            isActive ? 'text-white' : isAccessible ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
                          }`} />
                        )}
                      </button>
                      <span className={`ml-2 text-sm font-medium ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-blue-600 dark:text-blue-400' : isAccessible ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {getStepTitle(step)}
                      </span>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700">
            <form onSubmit={handleSubmit}>
              {/* Form Content */}
              <div className="p-8 sm:p-10">
                {/* Step 1: Subject & Type */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Subject & Class Type</h3>
                      <p className="text-gray-600 dark:text-gray-300">Select the subject and type of class you want to schedule</p>
                    </div>

                    {/* Subject Selection */}
                    <div>
                      <label htmlFor="subject_id" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Subject *
                      </label>
                      <select
                        id="subject_id"
                        value={formData.subject_id}
                        onChange={(e) => handleInputChange('subject_id', e.target.value)}
                        disabled={isFormDisabled}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.subject_id 
                            ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                            : fieldTouched.subject_id && formData.subject_id
                            ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                            : 'border-gray-300 bg-white hover:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400'
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
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{errors.subject_id}</span>
                        </div>
                      )}
                      {selectedSubject && (
                        <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {selectedSubject.credits} {selectedSubject.credits === 1 ? 'Credit' : 'Credits'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Class Type */}
                    <div>
                      <label htmlFor="type" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Class Type *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(CLASS_TYPES).filter(([key]) => key !== 'custom').map(([key, value]) => (
                          <label
                            key={key}
                            className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              formData.type === key
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:text-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="type"
                              value={key}
                              checked={formData.type === key}
                              onChange={(e) => handleInputChange('type', e.target.value)}
                              disabled={isFormDisabled}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <div className="text-sm font-medium">{value.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {key === 'lecture' ? '90 min' : '60 min'} typical
                              </div>
                            </div>
                            {formData.type === key && (
                              <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </label>
                        ))}
                      </div>
                      {errors.type && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{errors.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Schedule & Timing */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Schedule & Timing</h3>
                      <p className="text-gray-600 dark:text-gray-300">Choose the day and time for your class</p>
                    </div>

                    {/* Day of Week */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Day of Week *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                        {DAYS_OF_WEEK.map((day, index) => (
                          <label
                            key={index}
                            className={`relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              formData.day_of_week === index
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:text-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="day_of_week"
                              value={index}
                              checked={formData.day_of_week === index}
                              onChange={(e) => handleInputChange('day_of_week', parseInt(e.target.value))}
                              disabled={isFormDisabled}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <div className="text-xs font-medium">{day}</div>
                            </div>
                            {formData.day_of_week === index && (
                              <CheckCircle className="absolute top-1 right-1 w-3 h-3 text-blue-600 dark:text-blue-400" />
                            )}
                          </label>
                        ))}
                      </div>
                      {errors.day_of_week && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{errors.day_of_week}</span>
                        </div>
                      )}
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Time */}
                      <div>
                        <label htmlFor="start_time" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Start Time *
                        </label>
                        <select
                          id="start_time"
                          value={formData.start_time}
                          onChange={(e) => handleInputChange('start_time', e.target.value)}
                          disabled={isFormDisabled}
                          className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.start_time 
                              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                              : 'border-gray-300 bg-white hover:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400'
                          }`}
                        >
                          {TIME_OPTIONS.map(time => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        {errors.start_time && (
                          <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="text-sm">{errors.start_time}</span>
                          </div>
                        )}
                      </div>

                      {/* End Time */}
                      <div>
                        <label htmlFor="end_time" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          End Time *
                        </label>
                        <select
                          id="end_time"
                          value={formData.end_time}
                          onChange={(e) => handleInputChange('end_time', e.target.value)}
                          disabled={isFormDisabled}
                          className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.end_time 
                              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                              : 'border-gray-300 bg-white hover:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400'
                          }`}
                        >
                          {TIME_OPTIONS.map(time => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        {errors.end_time && (
                          <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="text-sm">{errors.end_time}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Duration Display */}
                    {duration > 0 && (
                      <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 rounded-xl p-4">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              Duration: {duration} {duration === 1 ? 'hour' : 'hours'}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              {DAYS_OF_WEEK[formData.day_of_week]} from {formData.start_time} to {formData.end_time}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Venue & Details */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Venue & Details</h3>
                      <p className="text-gray-600 dark:text-gray-300">Add venue, instructor, and capacity information</p>
                    </div>

                    {/* Venue */}
                    <div>
                      <label htmlFor="venue" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Venue *
                      </label>
                      <input
                        id="venue"
                        type="text"
                        value={formData.venue}
                        onChange={(e) => handleInputChange('venue', e.target.value)}
                        disabled={isFormDisabled}
                        placeholder="e.g., Room A101, Computer Lab 1, Main Auditorium"
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.venue 
                            ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                            : fieldTouched.venue && formData.venue
                            ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                            : 'border-gray-300 bg-white hover:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400'
                        }`}
                      />
                      {errors.venue && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{errors.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* Instructor */}
                    <div>
                      <label htmlFor="instructor" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Instructor <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="instructor"
                        type="text"
                        value={formData.instructor}
                        onChange={(e) => handleInputChange('instructor', e.target.value)}
                        disabled={isFormDisabled}
                        placeholder="e.g., Dr. Smith, Prof. Johnson"
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.instructor 
                            ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                            : fieldTouched.instructor && formData.instructor
                            ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                            : 'border-gray-300 bg-white hover:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400'
                        }`}
                      />
                      {errors.instructor && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{errors.instructor}</span>
                        </div>
                      )}
                    </div>

                    {/* Max Capacity */}
                    <div>
                      <label htmlFor="max_capacity" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
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
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.max_capacity 
                            ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                            : 'border-gray-300 bg-white hover:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400'
                        }`}
                      />
                      {errors.max_capacity && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">{errors.max_capacity}</span>
                        </div>
                      )}
                      <div className="mt-2 flex items-center text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">Number of students that can attend this class</span>
                      </div>
                    </div>

                    {/* Schedule Summary */}
                    <div className="bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Schedule Summary</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          <span>
                            {selectedSubject ? `${selectedSubject.code} - ${selectedSubject.name}` : 'No subject selected'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{DAYS_OF_WEEK[formData.day_of_week]} from {formData.start_time} to {formData.end_time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{formData.venue || 'No venue specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Capacity: {formData.max_capacity} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Error */}
                {errors.submit && (
                  <div className="mt-6 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700 rounded-xl p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                      <span className="text-sm text-red-800 dark:text-red-300">{errors.submit}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="bg-gray-50 dark:bg-gray-700 px-8 py-6 sm:px-10 sm:py-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 border-t dark:border-gray-600">
                {/* Back/Cancel Button */}
                <button
                  type="button"
                  onClick={currentStep === 1 ? handleCancel : () => setCurrentStep(currentStep - 1)}
                  disabled={isFormDisabled}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>

                {/* Progress Indicator */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full ${
                          step <= currentStep ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Next/Submit Button */}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={isFormDisabled || (currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next Step
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isFormDisabled}
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent rounded-xl text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {schedule ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {schedule ? 'Update Schedule' : 'Create Schedule'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full border dark:border-gray-700">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You have unsaved changes. Are you sure you want to leave without saving?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={cancelConfirmDialog}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-colors duration-200"
              >
                Continue Editing
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-2 border border-transparent rounded-xl text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
