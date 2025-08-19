'use client';

import React, { useState, useEffect } from 'react';
import { Subject, CreateSubjectData, UpdateSubjectData, School } from '@/types';
import { FormValidator } from '@/lib/inputValidation';
import { BookOpen, Building2, GraduationCap, FileText, Calendar, Hash } from 'lucide-react';

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
  school_id: string;
  credits: number;
  description: string;
  semester: string;
}

interface FormErrors {
  code?: string;
  name?: string;
  school_id?: string;
  credits?: string;
  description?: string;
  semester?: string;
  submit?: string;
}

export default function SubjectForm({ subject, onSuccess, onCancel, isLoading = false }: SubjectFormProps) {
  const [formData, setFormData] = useState<SubjectFormData>({
    code: '',
    name: '',
    school_id: '',
    credits: 3,
    description: '',
    semester: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/admin/schools', {
          headers: {
            'Authorization': 'Bearer mock-token-for-testing', // TODO: Replace with real auth token
          },
        });

        if (response.ok) {
          const result = await response.json();
          setSchools(result.data || []);
        } else {
          console.error('Failed to fetch schools');
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  // Pre-populate form when editing existing subject
  useEffect(() => {
    if (subject) {
      setFormData({
        code: subject.code || '',
        name: subject.name || '',
        school_id: subject.school_id || '',
        credits: subject.credits || 3,
        description: subject.description || '',
        semester: subject.semester || '',
      });
    }
  }, [subject]);

  // Enhanced form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    if (!formData.code.trim()) {
      newErrors.code = 'Subject code is required';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Subject code must be at least 2 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Subject name must be at least 3 characters';
    }

    if (!formData.school_id) {
      newErrors.school_id = 'Please select a school';
    }

    if (formData.credits < 1 || formData.credits > 12) {
      newErrors.credits = 'Credits must be between 1 and 12';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
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

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Enhanced cancel handler with unsaved changes check
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmed) return;
    }
    onCancel();
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
      setHasUnsavedChanges(false); // Reset unsaved changes flag
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {subject ? 'Edit Subject' : 'Create New Subject'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {subject 
              ? 'Update the subject information below' 
              : 'Fill in the details to create a new subject'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden animate-scale-in">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Basic Information Section */}
            <div className="mb-8 animate-slide-in-up">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-3 animate-float">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Basic Information
                </h2>
                <div className="ml-auto">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    formData.code && formData.name ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Code */}
                <div className="space-y-2">
                  <label htmlFor="code" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Hash className="h-4 w-4 mr-2 text-gray-500" />
                    Subject Code
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    disabled={isFormDisabled}
                    placeholder="e.g., CS101, MATH201"
                    className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                      errors.code 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                    }`}
                    aria-describedby={errors.code ? "code-error" : "code-help"}
                  />
                  {errors.code && (
                    <p id="code-error" className="text-sm text-red-600 flex items-center mt-1 animate-fade-in">
                      <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2 text-xs">!</span>
                      {errors.code}
                    </p>
                  )}
                  {!errors.code && formData.code && (
                    <p className="text-sm text-green-600 flex items-center mt-1 animate-fade-in">
                      <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2 text-xs">✓</span>
                      Subject code looks good
                    </p>
                  )}
                </div>

                {/* Subject Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                    Subject Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isFormDisabled}
                    placeholder="e.g., Introduction to Computer Science"
                    className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                      errors.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                    }`}
                    aria-describedby={errors.name ? "name-error" : "name-help"}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-red-600 flex items-center mt-1 animate-fade-in">
                      <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2 text-xs">!</span>
                      {errors.name}
                    </p>
                  )}
                  {!errors.name && formData.name && formData.name.length >= 3 && (
                    <p className="text-sm text-green-600 flex items-center mt-1 animate-fade-in">
                      <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2 text-xs">✓</span>
                      Subject name looks good
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Details Section */}
            <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-8 animate-slide-in-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center mb-6">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mr-3 animate-float" style={{animationDelay: '0.5s'}}>
                  <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Academic Details
                </h2>
                <div className="ml-auto">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    formData.school_id && formData.credits ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* School Selection */}
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="school_id" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                    School
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  {loadingSchools ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-gray-500">Loading schools...</span>
                    </div>
                  ) : (
                    <select
                      id="school_id"
                      value={formData.school_id}
                      onChange={(e) => handleInputChange('school_id', e.target.value)}
                      disabled={isFormDisabled}
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.school_id 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">Select a school...</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.school_id && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">!</span>
                      {errors.school_id}
                    </p>
                  )}
                  {!loadingSchools && schools.length === 0 && (
                    <p className="text-sm text-yellow-600 flex items-center mt-1">
                      <span className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center mr-2">!</span>
                      No schools available. Please create a school first.
                    </p>
                  )}
                </div>

                {/* Credits */}
                <div className="space-y-2">
                  <label htmlFor="credits" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Hash className="h-4 w-4 mr-2 text-gray-500" />
                    Credits
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="credits"
                    value={formData.credits}
                    onChange={(e) => handleInputChange('credits', parseInt(e.target.value))}
                    disabled={isFormDisabled}
                    className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.credits 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(credit => (
                      <option key={credit} value={credit}>
                        {credit} {credit === 1 ? 'Credit' : 'Credits'}
                      </option>
                    ))}
                  </select>
                  {errors.credits && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">!</span>
                      {errors.credits}
                    </p>
                  )}
                </div>
              </div>

              {/* Semester */}
              <div className="mt-6 space-y-2">
                <label htmlFor="semester" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Semester
                  <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
                </label>
                <input
                  id="semester"
                  type="text"
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', e.target.value)}
                  disabled={isFormDisabled}
                  placeholder="e.g., Fall 2024, Spring 2025"
                  className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                    errors.semester 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.semester && (
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">!</span>
                    {errors.semester}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-8 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mr-3 animate-float" style={{animationDelay: '1s'}}>
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Additional Information
                </h2>
                <div className="ml-auto">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    formData.description ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  Description
                  <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isFormDisabled}
                  placeholder="Brief description of the subject, learning objectives, or any additional notes..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none ${
                    errors.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">!</span>
                    {errors.description}
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Optional: Add a brief description of the subject</span>
                  <span className={formData.description.length > 900 ? 'text-red-500' : formData.description.length > 800 ? 'text-yellow-500' : ''}>
                    {formData.description.length}/1000
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <p className="text-red-700 dark:text-red-400 font-medium">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isFormDisabled}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {subject ? 'Updating Subject...' : 'Creating Subject...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {subject ? 'Update Subject' : 'Create Subject'}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isFormDisabled}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 text-center animate-fade-in">
          <div className="inline-flex items-center bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  formData.code && formData.name 
                    ? 'bg-green-500 scale-110 shadow-lg shadow-green-500/30' 
                    : 'bg-gray-300'
                }`}></div>
                <span className={`font-medium transition-colors duration-300 ${
                  formData.code && formData.name 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-gray-500'
                }`}>
                  Basic Info
                </span>
              </div>
              <div className={`w-8 h-0.5 transition-colors duration-300 ${
                formData.code && formData.name && formData.school_id 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`}></div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  formData.school_id && formData.credits 
                    ? 'bg-green-500 scale-110 shadow-lg shadow-green-500/30' 
                    : formData.code && formData.name 
                      ? 'bg-blue-400 animate-pulse' 
                      : 'bg-gray-300'
                }`}></div>
                <span className={`font-medium transition-colors duration-300 ${
                  formData.school_id && formData.credits 
                    ? 'text-green-700 dark:text-green-400' 
                    : formData.code && formData.name 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500'
                }`}>
                  Academic Details
                </span>
              </div>
              <div className={`w-8 h-0.5 transition-colors duration-300 ${
                formData.school_id && formData.credits && formData.description 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`}></div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  formData.description 
                    ? 'bg-green-500 scale-110 shadow-lg shadow-green-500/30' 
                    : formData.school_id && formData.credits 
                      ? 'bg-purple-400 animate-pulse' 
                      : 'bg-gray-300'
                }`}></div>
                <span className={`font-medium transition-colors duration-300 ${
                  formData.description 
                    ? 'text-green-700 dark:text-green-400' 
                    : formData.school_id && formData.credits 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-500'
                }`}>
                  Additional Info
                </span>
                <span className="text-xs text-gray-400 ml-1">(Optional)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
