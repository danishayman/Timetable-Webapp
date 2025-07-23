"use client";

import { useState, useEffect } from 'react';
import { TutorialGroup } from '@/src/types/tutorial';
import { Subject } from '@/src/types/subject';
import useSubjectStore from '@/src/store/subjectStore';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { formatDayOfWeek, formatTimeRange } from '@/src/lib/utils';

interface TutorialSelectorProps {
  subjectId: string;
  onSelect?: (tutorialId: string | null) => void;
  className?: string;
}

/**
 * TutorialSelector component
 * Displays available tutorial groups for a subject and allows selection
 */
export default function TutorialSelector({
  subjectId,
  onSelect,
  className = ''
}: TutorialSelectorProps) {
  // State for tutorials and loading
  const [tutorials, setTutorials] = useState<TutorialGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  // Get selected subjects and selection action from store
  const { selectedSubjects, selectTutorialGroup } = useSubjectStore();
  
  // Find the selected subject
  const selectedSubject = selectedSubjects.find(s => s.subject_id === subjectId);
  
  // Fetch tutorials for this subject
  useEffect(() => {
    const fetchTutorials = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch subject details with tutorials
        const response = await fetch(`/api/subjects/${subjectId}`);
        const result = await response.json();
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        if (result.data) {
          setTutorials(result.data.tutorials || []);
          setSubject(result.data.subject || null);
        }
      } catch (err) {
        console.error('Error fetching tutorials:', err);
        setError('Failed to load tutorial groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorials();
  }, [subjectId]);
  
  // Handle tutorial selection
  const handleTutorialSelect = (tutorialId: string) => {
    // Update the store
    selectTutorialGroup(subjectId, tutorialId);
    
    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect(tutorialId);
    }
  };
  
  // Handle tutorial deselection
  const handleTutorialDeselect = () => {
    // Update the store
    selectTutorialGroup(subjectId, null);
    
    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect(null);
    }
  };
  
  // If loading, show spinner
  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <Loading size="small" />
      </div>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <div className={className}>
        <ErrorMessage message={error} />
      </div>
    );
  }
  
  // If no tutorials, show message
  if (tutorials.length === 0) {
    return (
      <div className={`p-4 text-gray-500 dark:text-gray-400 ${className}`}>
        No tutorial groups available for this subject.
      </div>
    );
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {subject?.code} Tutorial Groups
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a tutorial group for this subject
        </p>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          {/* Option to select no tutorial */}
          <div className="flex items-center">
            <input
              type="radio"
              id="no-tutorial"
              name={`tutorial-${subjectId}`}
              checked={selectedSubject?.tutorial_group_id === null}
              onChange={() => handleTutorialDeselect()}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor="no-tutorial"
              className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              No tutorial (skip tutorial selection)
            </label>
          </div>
          
          {/* Tutorial options */}
          {tutorials.map(tutorial => (
            <div key={tutorial.id} className="flex items-center">
              <input
                type="radio"
                id={tutorial.id}
                name={`tutorial-${subjectId}`}
                checked={selectedSubject?.tutorial_group_id === tutorial.id}
                onChange={() => handleTutorialSelect(tutorial.id)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor={tutorial.id}
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <span className="font-semibold">{tutorial.group_name}</span>
                <span className="ml-2">
                  {formatDayOfWeek(tutorial.day_of_week)}, {formatTimeRange(tutorial.start_time, tutorial.end_time)}
                </span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {tutorial.venue}
                </span>
                {tutorial.instructor && (
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    ({tutorial.instructor})
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 