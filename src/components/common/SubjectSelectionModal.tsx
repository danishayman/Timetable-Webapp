"use client";

import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, Clock, MapPin, User } from 'lucide-react';
import useSubjectStore from '@/src/store/subjectStore';
import { Subject } from '@/src/types/subject';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function SubjectSelectionModal({
  isOpen,
  onClose,
  title = "Add Subjects to Your Timetable"
}: SubjectSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const {
    availableSubjects,
    selectedSubjects,
    isLoading,
    error,
    fetchSubjects,
    selectSubject,
    unselectSubject,
    initializeStore
  } = useSubjectStore();

  // Initialize store and fetch subjects when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeStore();
      fetchSubjects({});
    }
  }, [isOpen]); // Remove functions from dependency array as Zustand functions are stable

  // Filter subjects based on search and filters
  const filteredSubjects = availableSubjects.filter(subject => {
    const matchesSearch = !searchQuery || 
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.department && subject.department.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDepartment = !departmentFilter || subject.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = Array.from(new Set(
    availableSubjects
      .map(subject => subject.department)
      .filter(Boolean)
  )).sort() as string[];

  // Check if subject is selected
  const isSubjectSelected = (subjectId: string): boolean => {
    return selectedSubjects.some(s => s.subject_id === subjectId);
  };

  // Handle subject toggle
  const handleSubjectToggle = (subject: Subject) => {
    if (isSubjectSelected(subject.id)) {
      unselectSubject(subject.id);
    } else {
      selectSubject(subject);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white pr-4">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {/* Department Filter and Search Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Department Filter */}
              <div className="sm:col-span-1">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="sm:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || departmentFilter) && (
            <div className="mt-3 sm:mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Available Subjects List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Available Subjects ({filteredSubjects.length})
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loading size="large" />
              </div>
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || departmentFilter 
                    ? "No subjects match your search criteria" 
                    : "No subjects available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">
                {filteredSubjects.map(subject => (
                  <div
                    key={subject.id}
                    className={`p-2 sm:p-4 border rounded-md sm:rounded-lg cursor-pointer transition-all duration-200 aspect-square relative flex flex-col justify-center items-center text-center ${
                      isSubjectSelected(subject.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-700'
                    }`}
                    onClick={() => handleSubjectToggle(subject)}
                  >
                    <div className={`absolute top-1 sm:top-2 left-1 sm:left-2 p-0.5 sm:p-1.5 rounded-md sm:rounded-lg ${
                      isSubjectSelected(subject.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {isSubjectSelected(subject.id) ? (
                        <Check className="h-2 w-2 sm:h-3 sm:w-3" />
                      ) : (
                        <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-[10px] sm:text-sm mb-0.5 sm:mb-1">
                      {subject.code}
                    </h4>
                    <p className="text-[8px] sm:text-xs leading-tight text-gray-600 dark:text-gray-300 px-0.5 sm:px-1">
                      {subject.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Subjects Sidebar */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 max-h-60 lg:max-h-none overflow-y-auto lg:overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Selected Subjects ({selectedSubjects.length})
            </h3>

            {selectedSubjects.length === 0 ? (
              <div className="text-center py-6 lg:py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <Plus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  No subjects selected yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2">
                {selectedSubjects.map(selectedSubject => {
                  const subject = availableSubjects.find(s => s.id === selectedSubject.subject_id);
                  if (!subject) return null;

                  return (
                    <div
                      key={selectedSubject.subject_id}
                      className="aspect-square bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 p-0.5 sm:p-2 relative flex flex-col justify-center items-center text-center"
                    >
                      <button
                        onClick={() => unselectSubject(selectedSubject.subject_id)}
                        className="absolute top-0 right-0 sm:top-1 sm:right-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <X className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 text-gray-400" />
                      </button>
                      <h4 className="font-medium text-gray-900 dark:text-white text-[8px] sm:text-xs leading-tight px-0.5">
                        {subject.code}
                      </h4>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
              {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
