"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navbar component for site-wide navigation
 */
export default function Navbar() {
  const pathname = usePathname();
  
  // Check if the current path is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                Student Timetable
              </span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                href="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Home
              </Link>
              
              <Link 
                href="/timetable" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/timetable') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Timetable
              </Link>
              
              <Link 
                href="/subjects" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/subjects') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Subjects
              </Link>
              
              <Link 
                href="/admin" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname?.startsWith('/admin') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Admin
              </Link>
              
              <Link 
                href="/components-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/components-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Components
              </Link>
              
              <Link 
                href="/store-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/store-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Store
              </Link>
              
              <Link 
                href="/subject-list-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/subject-list-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                SubjectList
              </Link>
              
              <Link 
                href="/tutorial-selector-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/tutorial-selector-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Tutorials
              </Link>
              
              <Link 
                href="/timetable-store-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/timetable-store-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                TimetableStore
              </Link>
              
              <Link 
                href="/timetable-service-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/timetable-service-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                TimetableService
              </Link>
              
              <Link 
                href="/clash-detection-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/clash-detection-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                ClashDetection
              </Link>
              
              <Link 
                href="/timetable-grid-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/timetable-grid-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                TimetableGrid
              </Link>
              
              <Link 
                href="/class-block-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/class-block-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                ClassBlock
              </Link>
              
              <Link 
                href="/clash-warning-test" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/clash-warning-test') 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                ClashWarning
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button 
                type="button" 
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Menu icon */}
                <svg 
                  className="block h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="hidden md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Home
          </Link>
          
          <Link 
            href="/timetable" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/timetable') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Timetable
          </Link>
          
          <Link 
            href="/subjects" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/subjects') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Subjects
          </Link>
          
          <Link 
            href="/admin" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname?.startsWith('/admin') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Admin
          </Link>
          
          <Link 
            href="/components-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/components-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Components
          </Link>
          
          <Link 
            href="/store-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/store-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Store
          </Link>
          
          <Link 
            href="/subject-list-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/subject-list-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            SubjectList
          </Link>
          
          <Link 
            href="/tutorial-selector-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/tutorial-selector-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Tutorials
          </Link>
          
          <Link 
            href="/timetable-store-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/timetable-store-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            TimetableStore
          </Link>
          
          <Link 
            href="/timetable-service-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/timetable-service-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            TimetableService
          </Link>
          
          <Link 
            href="/clash-detection-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/clash-detection-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            ClashDetection
          </Link>
          
          <Link 
            href="/timetable-grid-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/timetable-grid-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            TimetableGrid
          </Link>
          
          <Link 
            href="/class-block-test" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/class-block-test') 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-800 dark:text-white' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            ClassBlock
          </Link>
        </div>
      </div>
    </nav>
  );
} 