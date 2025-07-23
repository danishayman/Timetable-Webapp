"use client";

import Image from "next/image";
import Link from "next/link";
import { testConnection } from "@/src/lib/supabase";

export default function Home() {
  // Test Supabase connection on client-side
  const handleTestConnection = async () => {
    const result = await testConnection();
    console.log('Connection test result:', result);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Student Timetable App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Create and manage your class schedule with ease
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Browse Subjects</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Search and explore available courses and their schedules.
          </p>
          <Link 
            href="/subjects" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            View Subjects
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create Timetable</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Select your subjects and generate a conflict-free timetable.
          </p>
          <Link 
            href="/timetable" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Build Timetable
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Manage subjects, schedules, and tutorial groups.
          </p>
          <Link 
            href="/admin" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Admin Access
          </Link>
        </div>
      </div>

      <button 
        onClick={handleTestConnection}
        className="mt-8 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded"
      >
        Test Supabase Connection
      </button>
    </div>
  );
}
