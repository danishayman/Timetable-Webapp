"use client";
import { useState, useEffect } from 'react';
import useAdminAuthStore from '@/src/store/adminAuthStore';
import { CreateSubjectData, UpdateSubjectData, Subject, ApiResponse } from '@/src/types';
import Loading from '@/src/components/common/Loading';
import ErrorMessage from '@/src/components/common/ErrorMessage';

export default function AdminSubjectsAPITestPage() {
  const { isAuthenticated, admin, checkAuth, isLoading } = useAdminAuthStore();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Test form data
  const [createData, setCreateData] = useState<CreateSubjectData>({
    code: 'TEST101',
    name: 'Test Subject',
    credits: 3,
    description: 'A test subject for API testing',
    semester: 'Fall 2024',
    department: 'Computer Science'
  });

  const [updateData, setUpdateData] = useState<UpdateSubjectData>({
    name: 'Updated Test Subject',
    description: 'Updated description',
    credits: 4
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Helper to add test results
  const addTestResult = (message: string, isError: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const status = isError ? 'ERROR' : 'SUCCESS';
    const fullMessage = `[${timestamp}] ${status}: ${message}`;
    setTestResults(prev => [...prev, fullMessage]);
    console.log(`[Admin Subjects API Test] ${fullMessage}`);
  };

  // Get auth token for API calls
  const getAuthToken = async (): Promise<string | null> => {
    try {
      // For testing purposes, we'll use a mock token
      // In a real implementation, you would get the actual session token from Supabase
      // This is just for API structure testing
      addTestResult('Note: Using mock token for API structure testing');
      return 'mock-token-for-testing';
    } catch (error) {
      addTestResult('Failed to get auth token', true);
      return null;
    }
  };

  // Make authenticated API request
  const makeApiRequest = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token available');
    }

    return fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

  // Test GET /api/admin/subjects
  const testGetSubjects = async () => {
    try {
      addTestResult('Testing GET /api/admin/subjects...');
      const response = await makeApiRequest('/api/admin/subjects');
      const result: ApiResponse<Subject[]> = await response.json();

      if (response.ok && result.data) {
        setSubjects(result.data);
        addTestResult(`GET successful: Retrieved ${result.data.length} subjects`);
      } else {
        addTestResult(`GET failed: ${result.error}`, true);
      }
    } catch (error) {
      addTestResult(`GET error: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    }
  };

  // Test POST /api/admin/subjects
  const testCreateSubject = async () => {
    try {
      addTestResult('Testing POST /api/admin/subjects...');
      const response = await makeApiRequest('/api/admin/subjects', {
        method: 'POST',
        body: JSON.stringify(createData),
      });

      const result: ApiResponse<Subject> = await response.json();

      if (response.ok && result.data) {
        addTestResult(`POST successful: Created subject ${result.data.code}`);
        setSelectedSubjectId(result.data.id);
        // Refresh subjects list
        await testGetSubjects();
      } else {
        addTestResult(`POST failed: ${result.error}`, true);
      }
    } catch (error) {
      addTestResult(`POST error: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    }
  };

  // Test PUT /api/admin/subjects
  const testUpdateSubject = async () => {
    if (!selectedSubjectId) {
      addTestResult('No subject selected for update', true);
      return;
    }

    try {
      addTestResult('Testing PUT /api/admin/subjects...');
      const response = await makeApiRequest('/api/admin/subjects', {
        method: 'PUT',
        body: JSON.stringify({ id: selectedSubjectId, ...updateData }),
      });

      const result: ApiResponse<Subject> = await response.json();

      if (response.ok && result.data) {
        addTestResult(`PUT successful: Updated subject ${result.data.code}`);
        // Refresh subjects list
        await testGetSubjects();
      } else {
        addTestResult(`PUT failed: ${result.error}`, true);
      }
    } catch (error) {
      addTestResult(`PUT error: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    }
  };

  // Test DELETE /api/admin/subjects
  const testDeleteSubject = async () => {
    if (!selectedSubjectId) {
      addTestResult('No subject selected for deletion', true);
      return;
    }

    try {
      addTestResult('Testing DELETE /api/admin/subjects...');
      const response = await makeApiRequest(`/api/admin/subjects?id=${selectedSubjectId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (response.ok) {
        addTestResult('DELETE successful: Subject deleted');
        setSelectedSubjectId('');
        // Refresh subjects list
        await testGetSubjects();
      } else {
        addTestResult(`DELETE failed: ${result.error}`, true);
      }
    } catch (error) {
      addTestResult(`DELETE error: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    }
  };

  // Run full CRUD test sequence
  const runFullCRUDTest = async () => {
    setIsTestRunning(true);
    setTestResults([]);
    addTestResult('Starting full CRUD test sequence...');

    try {
      // Test GET (initial)
      await testGetSubjects();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test CREATE
      await testCreateSubject();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test UPDATE
      await testUpdateSubject();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test DELETE
      await testDeleteSubject();
      await new Promise(resolve => setTimeout(resolve, 1000));

      addTestResult('Full CRUD test sequence completed!');
    } catch (error) {
      addTestResult(`Test sequence failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    } finally {
      setIsTestRunning(false);
    }
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  // Show loading if checking auth
  if (isLoading) {
    return <Loading />;
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <h1 className="text-xl font-bold text-red-800 mb-2">Authentication Required</h1>
          <p className="text-red-700">
            You must be logged in as an admin to test the Admin Subjects API.
          </p>
          <a 
            href="/admin/login" 
            className="mt-3 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">
          Admin Subjects API Test
        </h1>
        <p className="text-blue-700">
          Test the CRUD operations for the admin subjects API endpoints.
        </p>
        <div className="mt-3 text-sm text-blue-600">
          <p><strong>Authenticated as:</strong> {admin?.email}</p>
          <p><strong>Endpoint:</strong> /api/admin/subjects</p>
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Tests */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Individual Tests</h2>
          <div className="space-y-3">
            <button
              onClick={testGetSubjects}
              disabled={isTestRunning}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test GET (Fetch Subjects)
            </button>
            <button
              onClick={testCreateSubject}
              disabled={isTestRunning}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test POST (Create Subject)
            </button>
            <button
              onClick={testUpdateSubject}
              disabled={isTestRunning || !selectedSubjectId}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Test PUT (Update Subject)
            </button>
            <button
              onClick={testDeleteSubject}
              disabled={isTestRunning || !selectedSubjectId}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Test DELETE (Delete Subject)
            </button>
          </div>

          <div className="mt-4 pt-4 border-t">
            <button
              onClick={runFullCRUDTest}
              disabled={isTestRunning}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {isTestRunning ? 'Running Full Test...' : 'Run Full CRUD Test'}
            </button>
          </div>
        </div>

        {/* Test Data Configuration */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Data</h2>
          
          {/* Create Data */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Create Subject Data:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <label className="block text-gray-600">Code:</label>
                <input
                  type="text"
                  value={createData.code}
                  onChange={(e) => setCreateData(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600">Name:</label>
                <input
                  type="text"
                  value={createData.name}
                  onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600">Credits:</label>
                <input
                  type="number"
                  value={createData.credits}
                  onChange={(e) => setCreateData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Update Data */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Update Subject Data:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <label className="block text-gray-600">Name:</label>
                <input
                  type="text"
                  value={updateData.name || ''}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600">Credits:</label>
                <input
                  type="number"
                  value={updateData.credits || ''}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Selected Subject */}
          {selectedSubjectId && (
            <div className="text-sm">
              <p className="text-green-600">
                <strong>Selected Subject ID:</strong> {selectedSubjectId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Subjects</h2>
          <button
            onClick={testGetSubjects}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
        {subjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Credits</th>
                  <th className="text-left p-2">Department</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b">
                    <td className="p-2 font-mono">{subject.code}</td>
                    <td className="p-2">{subject.name}</td>
                    <td className="p-2">{subject.credits}</td>
                    <td className="p-2">{subject.department}</td>
                    <td className="p-2">
                      <button
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedSubjectId === subject.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No subjects found. Click "Test GET" to fetch subjects.</p>
        )}
      </div>

      {/* Test Results */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          <button
            onClick={clearResults}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
          {testResults.length > 0 ? (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-sm font-mono ${
                    result.includes('ERROR') ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No test results yet. Run a test to see results here.</p>
          )}
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-green-600">GET</strong> /api/admin/subjects
            <p className="text-gray-600 ml-4">Fetch all subjects (with optional filters)</p>
          </div>
          <div>
            <strong className="text-blue-600">POST</strong> /api/admin/subjects
            <p className="text-gray-600 ml-4">Create a new subject</p>
          </div>
          <div>
            <strong className="text-yellow-600">PUT</strong> /api/admin/subjects
            <p className="text-gray-600 ml-4">Update an existing subject</p>
          </div>
          <div>
            <strong className="text-red-600">DELETE</strong> /api/admin/subjects?id={'{id}'}
            <p className="text-gray-600 ml-4">Delete a subject by ID</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> All endpoints require admin authentication via Bearer token in Authorization header.
          </p>
        </div>
      </div>
    </div>
  );
}
