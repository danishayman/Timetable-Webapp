'use client';

import React, { useState, useEffect } from 'react';
import { Subject, CreateSubjectData, UpdateSubjectData } from '@/types';
import { FormValidator } from '@/lib/inputValidation';


interface SubjectFormProps {
  /** Subject to edit (undefined for creating new subject) */
  subject?: Subject;
  /** Called when form is submitted successfully */
  onSuccess: () => void;
  /** Called when form is cancelled */
  onCancel: () => void;
  /** Loading state for external operations */
  isLoading?: boolean;
}

interface SubjectFormData {
  code: string;
  name: string;
  credits: number;
  description: string;
  semester: string;
  department: string;
}

interface FormErrors {
  code?: string;
  name?: string;
  credits?: string;
  description?: string;
  semester?: string;
  department?: string;
  submit?: string;
}

export default function SubjectForm({ subject, onSuccess, onCancel, isLoading = false }: SubjectFormProps) {
  const [formData, setFormData] = useState<SubjectFormData>({
    code: '',
    name: '',
    credits: 3,
    description: '',
    semester: '',
    department: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate form when editing existing subject
  useEffect(() => {
    if (subject) {
      setFormData({
        code: subject.code || '',
        name: subject.name || '',
        credits: subject.credits || 3,
        description: subject.description || '',
        semester: subject.semester || '',
        department: subject.department || '',
      });
    }
  }, [subject]);

  // Enhanced form validation using the new validation utilities
  const validateForm = (): boolean => {
    // Use the comprehensive FormValidator
    const validationResult = FormValidator.validateSubjectForm(formData as unknown as Record<string, unknown>, {
      sanitize: true,
      checkEdgeCases: true
    });

    if (!validationResult.isValid) {
      // Convert validation errors to form error format
      const newErrors: FormErrors = {};
      validationResult.errors.forEach(error => {
        if (error.includes('code')) {
          newErrors.code = error;
        } else if (error.includes('name')) {
          newErrors.name = error;
        } else if (error.includes('credits')) {
          newErrors.credits = error;
        } else if (error.includes('description')) {
          newErrors.description = error;
        } else if (error.includes('semester')) {
          newErrors.semester = error;
        } else if (error.includes('department')) {
          newErrors.department = error;
        }
      });
      
      setErrors(newErrors);
      return false;
    }

    // If validation passed, update form data with sanitized values
    if (validationResult.sanitizedData) {
      setFormData(validationResult.sanitizedData as SubjectFormData);
    }

    setErrors({});
    return true;
  };

  // Handle input changes
  const handleInputChange = (field: keyof SubjectFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

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
      const url = '/api/admin/subjects';
      const method = subject ? 'PUT' : 'POST';
      
      const requestData = subject 
        ? { id: subject.id, ...formData } as { id: string } & UpdateSubjectData
        : formData as CreateSubjectData;

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
        throw new Error(result.error || 'Failed to save subject');
      }

      console.log('Subject saved successfully:', result.data);
      onSuccess();
    } catch (error) {
      console.error('Error saving subject:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred while saving the subject'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {subject ? 'Edit Subject' : 'Create New Subject'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Subject Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Subject Code *
          </label>
          <input
            id="code"
            type="text"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
            disabled={isFormDisabled}
            placeholder="e.g., CS101, MATH201"
            className={`w-full px-3 py-3 sm:py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-base sm:text-sm ${
              errors.code ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code}</p>
          )}
        </div>

        {/* Subject Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Subject Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isFormDisabled}
            placeholder="e.g., Introduction to Computer Science"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Credits */}
        <div>
          <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
            Credits *
          </label>
          <select
            id="credits"
            value={formData.credits}
            onChange={(e) => handleInputChange('credits', parseInt(e.target.value))}
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.credits ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(credit => (
              <option key={credit} value={credit}>
                {credit} {credit === 1 ? 'Credit' : 'Credits'}
              </option>
            ))}
          </select>
          {errors.credits && (
            <p className="mt-1 text-sm text-red-600">{errors.credits}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <input
            id="department"
            type="text"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            disabled={isFormDisabled}
            placeholder="e.g., Computer Science, Mathematics"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.department ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.department && (
            <p className="mt-1 text-sm text-red-600">{errors.department}</p>
          )}
        </div>

        {/* Semester */}
        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
            Semester
          </label>
          <input
            id="semester"
            type="text"
            value={formData.semester}
            onChange={(e) => handleInputChange('semester', e.target.value)}
            disabled={isFormDisabled}
            placeholder="e.g., Fall 2024, Spring 2025"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.semester ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.semester && (
            <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={isFormDisabled}
            placeholder="Brief description of the subject..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/1000 characters
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
                {subject ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              subject ? 'Update Subject' : 'Create Subject'
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
