"use client";

import { useState, useEffect } from 'react';
import TutorialSelector from '@/src/components/subjects/TutorialSelector';
import useSubjectStore from '@/src/store/subjectStore';
import SubjectCard from '@/src/components/subjects/SubjectCard';
import Loading from '@/src/components/common/Loading';
import ErrorMessage from '@/src/components/common/ErrorMessage';

export default function TutorialSelectorTestPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get state from the store
  const { availableSubjects, selectedSubjects, fetchSubjects, selectSubject, unselectSubject } = useSubjectStore();

  // Fetch subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await fetchSubjects();
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSubjects();
  }, [fetchSubjects]);

  // Handle subject selection
  const handleSubjectClick = (subject) => {
    const isSelected = selectedSubjects.some(s => s.subject_id === subject.id);
    
    if (isSelected) {
      unselectSubject(subject.id);
      if (selectedSubjectId === subject.id) {
        setSelectedSubjectId(null);
      }
    } else {
      selectSubject(subject);
      setSelectedSubjectId(subject.id);
    }
  };

  // Handle tutorial selection
  const handleTutorialSelect = (tutorialId: string | null) => {
    console.log(`Selected tutorial: ${tutorialId} for subject: ${selectedSubjectId}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <ErrorMessage message={error} retry={() => fetchSubjects()} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tutorial Selector Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Subject selection */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a Subject</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Click on a subject to view its tutorial groups
          </p>
          
          <div className="space-y-4">
            {availableSubjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedSubjectId === subject.id}
                onClick={handleSubjectClick}
                showDetails={selectedSubjectId === subject.id}
              />
            ))}
          </div>
          
          {availableSubjects.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 py-4">No subjects available.</p>
          )}
        </div>
        
        {/* Right column: Tutorial selector */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tutorial Groups</h2>
          {selectedSubjectId ? (
            <TutorialSelector
              subjectId={selectedSubjectId}
              onSelect={handleTutorialSelect}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">
                Select a subject to view available tutorial groups.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Selected Subjects State</h3>
        <pre className="text-xs overflow-auto p-2 bg-white dark:bg-gray-900 rounded">
          {JSON.stringify(selectedSubjects, null, 2)}
        </pre>
      </div>
    </div>
  );
} 