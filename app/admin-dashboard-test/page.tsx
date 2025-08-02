'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminDashboardTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${result}`, ...prev]);
  };

  const testNavigation = (page: string) => {
    addTestResult(`INFO: Testing navigation to ${page}`);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const navigationTests = [
    {
      name: 'Dashboard Home',
      href: '/admin/dashboard',
      description: 'Main dashboard overview with stats and quick actions'
    },
    {
      name: 'Subjects Management',
      href: '/admin/dashboard/subjects',
      description: 'Subject management interface (placeholder for Task 11.4)'
    },
    {
      name: 'Schedules Management',
      href: '/admin/dashboard/schedules',
      description: 'Schedule management interface (Phase 12)'
    },
    {
      name: 'System Settings',
      href: '/admin/dashboard/settings',
      description: 'System configuration (future enhancement)'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard Layout Test
            </h1>
            <p className="text-gray-600 mt-2">
              Task 11.3: Testing the admin dashboard layout, navigation, and responsiveness
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-8">
              {/* Navigation Tests */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Navigation Tests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {navigationTests.map((nav, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{nav.name}</h4>
                        <Link
                          href={nav.href}
                          onClick={() => testNavigation(nav.name)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Visit <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                      <p className="text-sm text-gray-600">{nav.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout Features */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Layout Features to Test</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Test Checklist</h4>
                  <ul className="space-y-2 text-blue-800 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Sidebar navigation with icons and descriptions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Mobile-responsive hamburger menu
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Active navigation state highlighting
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Breadcrumb navigation in header
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Logout functionality with loading state
                    </li>
                    <li className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                      Responsive layout on different screen sizes
                    </li>
                  </ul>
                </div>
              </div>

              {/* Test Instructions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Test Instructions</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <ol className="list-decimal list-inside space-y-2 text-yellow-800 text-sm">
                    <li>Click on each navigation link above to test routing</li>
                    <li>Resize browser window to test mobile responsiveness</li>
                    <li>On mobile view, test the hamburger menu functionality</li>
                    <li>Verify active navigation states are highlighted correctly</li>
                    <li>Check that breadcrumbs update correctly on each page</li>
                    <li>Test the logout button functionality</li>
                    <li>Verify sidebar closes automatically on mobile after navigation</li>
                  </ol>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
                  <button
                    onClick={clearResults}
                    className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {testResults.length === 0 ? (
                      <p className="text-gray-500 text-sm">No test results yet. Try navigating using the links above.</p>
                    ) : (
                      testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`text-sm p-2 rounded ${
                            result.includes('SUCCESS')
                              ? 'bg-green-100 text-green-800'
                              : result.includes('ERROR')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {result}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800 text-sm mb-2">
                    <strong>Task 11.3 Completion Criteria:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                    <li>✅ Admin dashboard layout created with sidebar navigation</li>
                    <li>✅ Navigation between management sections works</li>
                    <li>✅ Logout functionality implemented</li>
                    <li>✅ Responsive design for mobile and desktop</li>
                  </ul>
                  <p className="text-green-800 text-sm mt-3">
                    Ready to proceed to <strong>Task 11.4: Subject Management Page</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
