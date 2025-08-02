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
  const [creditsFilter, setCreditsFilter] = useState('');

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
    const matchesCredits = !creditsFilter || subject.credits.toString() === creditsFilter;
    
    return matchesSearch && matchesDepartment && matchesCredits;
  });

  // Get unique departments for filter
  const departments = Array.from(new Set(
    availableSubjects
      .map(subject => subject.department)
      .filter(Boolean)
  )).sort() as string[];

  // Get unique credit values for filter
  const creditOptions = Array.from(new Set(
    availableSubjects.map(subject => subject.credits)
  )).sort((a, b) => a - b);

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
    setCreditsFilter('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Credits Filter */}
            <div>
              <select
                value={creditsFilter}
                onChange={(e) => setCreditsFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Credits</option>
                {creditOptions.map(credits => (
                  <option key={credits} value={credits}>{credits} Credit{credits !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || departmentFilter || creditsFilter) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Available Subjects List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
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
                  {searchQuery || departmentFilter || creditsFilter 
                    ? "No subjects match your search criteria" 
                    : "No subjects available"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubjects.map(subject => (
                  <div
                    key={subject.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSubjectSelected(subject.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-700'
                    }`}
                    onClick={() => handleSubjectToggle(subject)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isSubjectSelected(subject.id)
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {isSubjectSelected(subject.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {subject.code}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {subject.name}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {subject.department && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>{subject.department}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{subject.credits} Credit{subject.credits !== 1 ? 's' : ''}</span>
                          </div>
                          {subject.semester && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>{subject.semester}</span>
                            </div>
                          )}
                        </div>

                        {subject.description && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Subjects Sidebar */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Selected Subjects ({selectedSubjects.length})
            </h3>

            {selectedSubjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <Plus className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No subjects selected yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedSubjects.map(selectedSubject => {
                  const subject = availableSubjects.find(s => s.id === selectedSubject.subject_id);
                  if (!subject) return null;

                  return (
                    <div
                      key={selectedSubject.subject_id}
                      className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {subject.code}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            {subject.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{subject.credits} Credits</span>
                          </div>
                        </div>
                        <button
                          onClick={() => unselectSubject(selectedSubject.subject_id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
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
