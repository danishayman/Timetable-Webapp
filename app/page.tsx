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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50 dark:from-slate-900 dark:via-purple-950/20 dark:to-indigo-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/10 dark:bg-purple-600/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-200/10 dark:bg-indigo-600/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-300/10 dark:bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-violet-200/10 dark:bg-violet-600/10 rounded-full blur-xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-8 shadow-lg">
              <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Smart Timetable
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Effortlessly organize your academic schedule with intelligent clash detection and seamless subject management
            </p>
          </div>

      {/* Timetable Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Schedule</h2>
            {selectedSubjects.length > 0 && (
              <p className="text-purple-600 dark:text-purple-400 mt-2 font-medium">
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={handleOpenSubjectModal}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Subjects
            </button>
            <label className="flex items-center space-x-3 cursor-pointer text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showWeekends}
                onChange={(e) => setShowWeekends(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="font-medium">Show Weekends</span>
            </label>
          </div>
        </div>

        {/* Selected Subjects Display */}
        {selectedSubjects.length > 0 && (
          <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Selected Subjects
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedSubjects.map((subject) => (
                    <span
                      key={subject.subject_id}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    >
                      {subject.subject_code}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleOpenSubjectModal}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        )}

        {/* Timetable Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {isGenerating ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
                <span className="text-gray-600 dark:text-gray-300 font-medium text-lg">Updating timetable...</span>
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
          <div className="text-center mt-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-6">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {selectedSubjects.length === 0 
                ? "Ready to build your schedule?" 
                : "No classes scheduled"
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {selectedSubjects.length === 0 
                ? "Start by selecting your subjects to create a personalized timetable."
                : "No class schedules are available for your selected subjects at the moment."
              }
            </p>
            <button
              onClick={handleOpenSubjectModal}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {selectedSubjects.length === 0 ? "Browse Subjects" : "Manage Subjects"}
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Browse Subjects</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Explore our comprehensive catalog of courses and find the perfect subjects for your academic journey.
          </p>
          <button
            onClick={handleOpenSubjectModal}
            className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-800 dark:hover:text-purple-200 flex items-center gap-2 group-hover:gap-3 transition-all"
          >
            Explore Subjects
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Manage Timetable</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            View and organize your complete schedule with intelligent clash detection and easy modifications.
          </p>
          <Link 
            href="/timetable" 
            className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-800 dark:hover:text-purple-200 flex items-center gap-2 group-hover:gap-3 transition-all"
          >
            Open Timetable
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Admin Panel</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Administrative access to manage subjects, schedules, and tutorial groups across the system.
          </p>
          <Link 
            href="/admin" 
            className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-800 dark:hover:text-purple-200 flex items-center gap-2 group-hover:gap-3 transition-all"
          >
            Admin Access
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Debug Section */}
      <div className="text-center">
        <button 
          onClick={handleTestConnection}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl transition-colors border border-gray-300 dark:border-gray-600"
        >
          Test Database Connection
        </button>
      </div>
      </div>
      </div>

      {/* Subject Selection Modal */}
      <SubjectSelectionModal
        isOpen={isSubjectModalOpen}
        onClose={handleCloseSubjectModal}
      />
    </div>
  );
}
