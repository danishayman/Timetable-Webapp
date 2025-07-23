"use client";

import { useEffect, useState } from 'react';
import useSubjectStore from '@/src/store/subjectStore';
import { Subject } from '@/src/types/subject';
import SubjectCard from '@/src/components/subjects/SubjectCard';
import Loading from '@/src/components/common/Loading';
import ErrorMessage from '@/src/components/common/ErrorMessage';

export default function StoreTestPage() {
  // Get state and actions from the store
  const {
    availableSubjects,
    selectedSubjects,
    isLoading,
    error,
    fetchSubjects,
    selectSubject,
    unselectSubject,
    clearSelectedSubjects,
    setFilters,
    clearFilters
  } = useSubjectStore();

  // Local state for filters
  const [department, setDepartment] = useState<string>('');
  const [semester, setSemester] = useState<string>('');

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Handle subject selection
  const handleSubjectClick = (subject: Subject) => {
    const isSelected = selectedSubjects.some(s => s.subject_id === subject.id);
    
    if (isSelected) {
      unselectSubject(subject.id);
    } else {
      selectSubject(subject);
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    const filters = {
      ...(department ? { department } : {}),
      ...(semester ? { semester } : {})
    };
    
    setFilters(filters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setDepartment('');
    setSemester('');
    clearFilters();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Subject Store Test</h1>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. Computer Science"
            />
          </div>
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
          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <ErrorMessage 
          message={error}
          retry={() => fetchSubjects()}
        />
      )}
      
      {/* Selected Subjects */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Selected Subjects ({selectedSubjects.length})</h2>
          {selectedSubjects.length > 0 && (
            <button
              onClick={clearSelectedSubjects}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All
            </button>
          )}
        </div>
        
        {selectedSubjects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No subjects selected</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedSubjects.map(selected => {
              const subject = availableSubjects.find(s => s.id === selected.subject_id);
              if (!subject) return null;
              
              return (
                <SubjectCard
                  key={selected.subject_id}
                  subject={subject}
                  isSelected={true}
                  onClick={handleSubjectClick}
                />
              );
            })}
          </div>
        )}
      </div>
      
      {/* Available Subjects */}
      <h2 className="text-xl font-semibold mb-4">Available Subjects ({availableSubjects.length})</h2>
      
      {isLoading ? (
        <div className="py-12">
          <Loading size="large" />
        </div>
      ) : (
        <>
          {availableSubjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">No subjects found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSubjects.map(subject => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  isSelected={selectedSubjects.some(s => s.subject_id === subject.id)}
                  onClick={handleSubjectClick}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Store State Debug */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Store State</h3>
        <pre className="text-xs overflow-auto p-2 bg-white dark:bg-gray-900 rounded">
          {JSON.stringify(
            {
              availableSubjects: availableSubjects.length,
              selectedSubjects,
              isLoading,
              error
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
} 