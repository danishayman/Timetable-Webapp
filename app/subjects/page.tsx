"use client";

import { useState } from 'react';
import SubjectList from '@/components/features/subjects/SubjectList';
import SubjectSearch from '@/components/features/subjects/SubjectSearch';
import TutorialSelector from '@/components/features/subjects/TutorialSelector';
import useSubjectStore from '@/store/subjectStore';

export default function SubjectsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSubjectForTutorial, setSelectedSubjectForTutorial] = useState<string | null>(null);

  // Get selected subjects from the store
  const { selectedSubjects } = useSubjectStore();

  // Refresh the subject list when search/filters change
  const handleSearch = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle subject selection for tutorial
  const handleSelectSubjectForTutorial = (subjectId: string) => {
    setSelectedSubjectForTutorial(subjectId === selectedSubjectForTutorial ? null : subjectId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Subjects</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Browse and select subjects for your timetable.
      </p>

      {/* Search and filters */}
      <SubjectSearch
        onSearch={handleSearch}
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Subject list - takes 2/3 of the space */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Subjects</h2>
          <SubjectList
            key={refreshKey}
            showSelectedSubjects={true}
          />
        </div>

        {/* Tutorial selector - takes 1/3 of the space */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tutorial Selection</h2>

          {selectedSubjects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">
                Select a subject first to view available tutorial groups.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subject selection for tutorials */}
              {selectedSubjects.length > 1 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                  <h3 className="text-md font-medium mb-2">Select a subject:</h3>
                  <div className="space-y-2">
                    {selectedSubjects.map(subject => (
                      <div
                        key={subject.subject_id}
                        className={`p-2 rounded cursor-pointer ${selectedSubjectForTutorial === subject.subject_id
                          ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        onClick={() => handleSelectSubjectForTutorial(subject.subject_id)}
                      >
                        <div className="font-medium">{subject.subject_code}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{subject.subject_name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show tutorial selector for the selected subject */}
              {selectedSubjectForTutorial ? (
                <TutorialSelector subjectId={selectedSubjectForTutorial} />
              ) : selectedSubjects.length === 1 ? (
                <TutorialSelector subjectId={selectedSubjects[0].subject_id} />
              ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a subject from the list to view its tutorial groups.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 