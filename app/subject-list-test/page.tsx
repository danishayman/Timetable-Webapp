"use client";

import { useState } from 'react';
import SubjectList from '@/src/components/subjects/SubjectList';
import SubjectSearch from '@/src/components/subjects/SubjectSearch';
import { Subject, SubjectFilters } from '@/src/types/subject';
import useSubjectStore from '@/src/store/subjectStore';

export default function SubjectListTestPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<SubjectFilters>({});
  const [maxItems, setMaxItems] = useState<number | undefined>(undefined);
  const [showSelected, setShowSelected] = useState(true);
  
  // Get state from the store for display
  const { availableSubjects, selectedSubjects } = useSubjectStore();

  // Handle search/filter changes
  const handleSearch = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Custom subject click handler for demonstration
  const handleSubjectClick = (subject: Subject) => {
    console.log('Subject clicked:', subject);
    // Use default behavior from the store
    const store = useSubjectStore.getState();
    const isSelected = store.selectedSubjects.some(s => s.subject_id === subject.id);
    
    if (isSelected) {
      store.unselectSubject(subject.id);
    } else {
      store.selectSubject(subject);
    }
  };

  // Update filters for demonstration
  const updateFilters = (newFilters: SubjectFilters) => {
    setFilters(newFilters);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SubjectList Component Test</h1>
      
      {/* Controls for testing */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Items to Display
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={maxItems || ''}
                onChange={(e) => setMaxItems(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="Leave empty for all"
              />
              <button
                onClick={() => setMaxItems(undefined)}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department Filter
            </label>
            <div className="flex gap-2">
              <select
                value={filters.department || ''}
                onChange={(e) => updateFilters({ ...filters, department: e.target.value || undefined })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Any Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Physics">Physics</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-selected"
              checked={showSelected}
              onChange={(e) => setShowSelected(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="show-selected" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Selected Subjects
            </label>
          </div>
        </div>
      </div>
      
      {/* SubjectSearch component */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">SubjectSearch Component</h2>
        <SubjectSearch 
          onSearch={handleSearch}
          showCreditsFilter={true}
        />
      </div>
      
      {/* SubjectList component */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          SubjectList Component 
          {maxItems ? ` (Limited to ${maxItems})` : ''}
          {filters.department ? ` (Filtered by ${filters.department})` : ''}
        </h2>
        
        <SubjectList 
          key={refreshKey}
          maxItems={maxItems}
          filters={filters}
          showSelectedSubjects={showSelected}
          onSubjectClick={handleSubjectClick}
        />
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Component State</h3>
        <pre className="text-xs overflow-auto p-2 bg-white dark:bg-gray-900 rounded">
          {JSON.stringify(
            {
              availableSubjects: availableSubjects.length,
              selectedSubjects: selectedSubjects.length,
              filters,
              maxItems,
              showSelected,
              refreshKey
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
} 