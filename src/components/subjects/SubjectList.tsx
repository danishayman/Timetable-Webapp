"use client";

import { useEffect } from 'react';
import useSubjectStore from '@/src/store/subjectStore';
import SubjectCard from './SubjectCard';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { Subject, SubjectFilters } from '@/src/types/subject';

interface SubjectListProps {
  showFilters?: boolean;
  showSearch?: boolean;
  onSubjectClick?: (subject: Subject) => void;
  maxItems?: number;
  filters?: SubjectFilters;
  showSelectedSubjects?: boolean;
  emptyMessage?: string;
}

/**
 * SubjectList component
 * Displays a list of subjects from the subject store
 */
export default function SubjectList({
  showFilters = false,
  showSearch = false,
  onSubjectClick,
  maxItems,
  filters,
  showSelectedSubjects = false,
  emptyMessage = "No subjects found."
}: SubjectListProps) {
  // Get state and actions from the store
  const {
    availableSubjects,
    selectedSubjects,
    isLoading,
    error,
    fetchSubjects,
    selectSubject,
    unselectSubject
  } = useSubjectStore();

  // Fetch subjects on component mount with optional filters
  useEffect(() => {
    fetchSubjects(filters);
  }, [fetchSubjects, filters]);

  // Handle subject click based on props or default behavior
  const handleSubjectClick = (subject: Subject) => {
    if (onSubjectClick) {
      onSubjectClick(subject);
    } else {
      // Default behavior: toggle selection
      const isSelected = selectedSubjects.some(s => s.subject_id === subject.id);
      
      if (isSelected) {
        unselectSubject(subject.id);
      } else {
        selectSubject(subject);
      }
    }
  };

  // Filter subjects if maxItems is provided
  const displaySubjects = maxItems ? availableSubjects.slice(0, maxItems) : availableSubjects;

  // Get selected subjects data
  const getSelectedSubjectsWithData = () => {
    return selectedSubjects
      .map(selected => {
        const subject = availableSubjects.find(s => s.id === selected.subject_id);
        return subject ? { subject, selected } : null;
      })
      .filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        retry={() => fetchSubjects(filters)}
      />
    );
  }

  return (
    <div>
      {/* Selected subjects section */}
      {showSelectedSubjects && selectedSubjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Selected Subjects ({selectedSubjects.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSelectedSubjectsWithData().map(item => {
              if (!item) return null;
              
              return (
                <SubjectCard
                  key={item.selected.subject_id}
                  subject={item.subject}
                  isSelected={true}
                  onClick={handleSubjectClick}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Available subjects */}
      <div className="mb-8">
        {displaySubjects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-4">{emptyMessage}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySubjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedSubjects.some(s => s.subject_id === subject.id)}
                onClick={handleSubjectClick}
                showDetails={selectedSubjects.some(s => s.subject_id === subject.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 