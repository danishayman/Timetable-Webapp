'use client';

import React, { useState } from 'react';
import SubjectForm from '@/src/components/admin/SubjectForm';
import { Subject } from '@/src/types';

export default function SubjectFormTestPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Sample subject for testing edit functionality
  const sampleSubject: Subject = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    credits: 3,
    description: 'A foundational course in computer science principles.',
    semester: 'Fall 2024',
    department: 'Computer Science',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${result}`, ...prev]);
  };

  const handleSuccess = () => {
    addTestResult('SUCCESS: Form submitted successfully!');
    setIsFormVisible(false);
    setEditingSubject(undefined);
  };

  const handleCancel = () => {
    addTestResult('INFO: Form cancelled');
    setIsFormVisible(false);
    setEditingSubject(undefined);
  };

  const showCreateForm = () => {
    addTestResult('INFO: Opening create form');
    setEditingSubject(undefined);
    setIsFormVisible(true);
  };

  const showEditForm = () => {
    addTestResult('INFO: Opening edit form with sample subject');
    setEditingSubject(sampleSubject);
    setIsFormVisible(true);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Subject Form Component Test
            </h1>
            <p className="text-gray-600 mt-2">
              Task 11.2: Testing the SubjectForm component for creating and editing subjects
            </p>
          </div>

          <div className="p-6">
            {!isFormVisible ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={showCreateForm}
                    className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Test Create New Subject
                  </button>
                  <button
                    onClick={showEditForm}
                    className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Test Edit Existing Subject
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Test Instructions</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Click "Test Create New Subject" to test form validation and creation</li>
                    <li>• Click "Test Edit Existing Subject" to test form pre-population and updates</li>
                    <li>• Try submitting with invalid data to test validation</li>
                    <li>• Check the test results below to see API responses</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
                    <button
                      onClick={clearResults}
                      className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {testResults.length === 0 ? (
                      <p className="text-gray-500 text-sm">No test results yet. Try using the form above.</p>
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

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-yellow-900 mb-2">Sample Subject Data</h3>
                  <pre className="text-sm text-yellow-800 bg-yellow-100 p-3 rounded overflow-x-auto">
{JSON.stringify(sampleSubject, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <SubjectForm
                subject={editingSubject}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
