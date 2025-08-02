"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { testConnection } from "@/src/lib/supabase";
import TimetableGrid from "@/src/components/timetable/TimetableGrid";
import TimetablePositioner from "@/src/components/timetable/TimetablePositioner";
import ClassBlock from "@/src/components/timetable/ClassBlock";
import SubjectSelectionModal from "@/src/components/common/SubjectSelectionModal";
import useTimetableStore from "@/src/store/timetableStore";
import useSubjectStore from "@/src/store/subjectStore";

export default function Home() {
  const [showWeekends, setShowWeekends] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const { timetableSlots, initializeStore, generateTimetable, isGenerating } = useTimetableStore();
  const { selectedSubjects, initializeStore: initializeSubjectStore } = useSubjectStore();

  // Initialize both stores when component mounts
  useEffect(() => {
    initializeStore();
    initializeSubjectStore();
  }, []); // Empty dependency array since Zustand functions are stable

  // Automatically regenerate timetable when selected subjects change
  useEffect(() => {
    const regenerateTimetable = async () => {
      try {
        if (selectedSubjects.length > 0) {
          await generateTimetable();
        } else {
          // Clear timetable if no subjects selected
          // Use the setTimetableSlots method directly to avoid error message
          const { setTimetableSlots } = useTimetableStore.getState();
          setTimetableSlots([]);
        }
      } catch (error) {
        console.error('Failed to regenerate timetable:', error);
      }
    };

    regenerateTimetable();
  }, [selectedSubjects, generateTimetable]);

  // Test Supabase connection on client-side
  const handleTestConnection = async () => {
    const result = await testConnection();
    console.log('Connection test result:', result);
  };

  const handleOpenSubjectModal = () => {
    setIsSubjectModalOpen(true);
  };

  const handleCloseSubjectModal = () => {
    setIsSubjectModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Student Timetable App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Create and manage your class schedule with ease
        </p>
      </div>

      {/* Timetable Preview Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Timetable</h2>
            {selectedSubjects.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleOpenSubjectModal}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Subjects
            </button>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWeekends}
                onChange={(e) => setShowWeekends(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span className="text-sm">Show Weekends</span>
            </label>
          </div>
        </div>

        {/* Selected Subjects List */}
        {selectedSubjects.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Selected Subjects:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((subject) => (
                    <span
                      key={subject.subject_id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                    >
                      {subject.subject_code}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleOpenSubjectModal}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
              >
                Manage
              </button>
            </div>
          </div>
        )}

        {/* Timetable Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-300">Updating timetable...</span>
              </div>
            </div>
          ) : (
            <TimetableGrid showWeekends={showWeekends}>
              {timetableSlots.map((slot) => (
                <TimetablePositioner
                  key={slot.id}
                  dayOfWeek={slot.day_of_week}
                  startTime={slot.start_time}
                  endTime={slot.end_time}
                  showWeekends={showWeekends}
                >
                  <ClassBlock slot={slot} />
                </TimetablePositioner>
              ))}
            </TimetableGrid>
          )}
        </div>

        {!isGenerating && timetableSlots.length === 0 && (
          <div className="text-center mt-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {selectedSubjects.length === 0 
                ? "Your timetable is empty. Start by adding subjects to create your schedule."
                : "No class schedules available for your selected subjects."
              }
            </p>
            <button
              onClick={handleOpenSubjectModal}
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {selectedSubjects.length === 0 ? "Browse and Add Subjects" : "Manage Subjects"}
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Browse Subjects</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Search and explore available courses and their schedules.
          </p>
          <button
            onClick={handleOpenSubjectModal}
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            View Subjects
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Manage Timetable</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            View and edit your complete timetable with clash detection.
          </p>
          <Link 
            href="/timetable" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Open Timetable
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Admin Panel</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Manage subjects, schedules, and tutorial groups.
          </p>
          <Link 
            href="/admin" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Admin Access
          </Link>
        </div>
      </div>

      {/* Debug Section */}
      <div className="text-center">
        <button 
          onClick={handleTestConnection}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Test Supabase Connection
        </button>
      </div>

      {/* Subject Selection Modal */}
      <SubjectSelectionModal
        isOpen={isSubjectModalOpen}
        onClose={handleCloseSubjectModal}
      />
    </div>
  );
}
