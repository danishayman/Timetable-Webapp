"use client";

import { useEffect } from 'react';
import useSubjectStore from '@/src/store/subjectStore';
import SubjectCard from './SubjectCard';
import { LoadingSpinner, PageLoading } from '../common/Loading';
import { SubjectListSkeleton } from '../common/SkeletonLoaders';
import ErrorMessage from '../common/ErrorMessage';
import { Subject, SubjectFilters } from '@/src/types/subject';
import { EmptyStateValidator, DataBoundaryValidator } from '@/src/lib/inputValidation';

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
    isInitializing,
    isSaving,
    error,
    loadingOperation,
    fetchSubjects,
    selectSubject,
    unselectSubject
  } = useSubjectStore();

  // Fetch subjects on component mount with optional filters
  useEffect(() => {
    fetchSubjects(filters);
  }, [filters]); // Only depend on filters since Zustand functions are stable

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
        // Check data boundaries before selection
        const boundaryResult = DataBoundaryValidator.validateDataBoundaries(
          selectedSubjects.length + 1, // Adding one more subject
          'subjects'
        );
        
        if (!boundaryResult.isValid) {
          console.warn('Selection boundary exceeded:', boundaryResult.errors);
          return;
        }
        
        selectSubject(subject);
      }
    }
  };

  // Filter subjects if maxItems is provided
  const displaySubjects = maxItems ? availableSubjects.slice(0, maxItems) : availableSubjects;

  // Check empty state
  const emptyStateResult = EmptyStateValidator.checkEmptyState(availableSubjects, 'subjects');

  // Get selected subjects data
  const getSelectedSubjectsWithData = () => {
    return selectedSubjects
      .map(selected => {
        const subject = availableSubjects.find(s => s.id === selected.subject_id);
        return subject ? { subject, selected } : null;
      })
      .filter(Boolean);
  };

  if (isInitializing) {
    return <PageLoading message="Initializing subjects..." />;
  }

  if (isLoading && !availableSubjects.length) {
    return <SubjectListSkeleton count={6} />;
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
    <div className="relative">
      {/* Loading overlay for operations */}
      {(isLoading || isSaving) && loadingOperation && (
        <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-75 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center py-4">
          <LoadingSpinner size="medium" message={loadingOperation} />
        </div>
      )}

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
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {emptyStateResult.isEmpty ? emptyStateResult.message : emptyMessage}
            </p>
            {emptyStateResult.isEmpty && (
              <button 
                onClick={() => fetchSubjects()}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Refresh
              </button>
            )}
          </div>
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