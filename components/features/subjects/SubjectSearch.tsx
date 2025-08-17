"use client";

import { useState } from 'react';
import useSubjectStore from '@/store/subjectStore';
import { SubjectFilters } from '@/types/subject';

interface SubjectSearchProps {
  showSchoolFilter?: boolean;
  showSemesterFilter?: boolean;
  showCreditsFilter?: boolean;
  onSearch?: () => void;
  className?: string;
}

/**
 * SubjectSearch component
 * Provides search and filter controls for subjects
 */
export default function SubjectSearch({
  showSchoolFilter = true,
  showSemesterFilter = true,
  showCreditsFilter = false,
  onSearch,
  className = ''
}: SubjectSearchProps) {
  // Get actions from the store
  const { setSearchQuery, setFilters, clearFilters } = useSubjectStore();

  // Local state for form inputs
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [semester, setSemester] = useState('');
  const [credits, setCredits] = useState<string>('');

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    
    if (onSearch) {
      onSearch();
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    const filters: SubjectFilters = {};
    
    if (schoolId) filters.school_id = schoolId;
    if (semester) filters.semester = semester;
    if (credits) filters.credits = parseInt(credits, 10);
    
    setFilters(filters);
    
    if (onSearch) {
      onSearch();
    }
  };

  // Reset all filters and search
  const handleResetFilters = () => {
    setSearchTerm('');
    setSchoolId('');
    setSemester('');
    setCredits('');
    setSearchQuery('');
    clearFilters();
    
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${className}`}>
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            placeholder="Search subjects..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {showSchoolFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              School
            </label>
            <input
              type="text"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. School of Engineering"
            />
          </div>
        )}
        
        {showSemesterFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Semester
            </label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. Fall 2024"
            />
          </div>
        )}
        
        {showCreditsFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Credits
            </label>
            <select
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
        )}
        
        <div className={`flex items-end space-x-2 ${
          (!showDepartmentFilter && !showSemesterFilter && !showCreditsFilter) 
            ? 'col-span-3' 
            : ''
        }`}>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
} 