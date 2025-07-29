"use client";

import { useState } from 'react';
import AdminLoginForm from '@/src/components/auth/AdminLoginForm';
import useAdminAuthStore from '@/src/store/adminAuthStore';

export default function AdminLoginFormTestPage() {
  const { admin, isAuthenticated, signOut } = useAdminAuthStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  // Helper to add test results
  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[AdminLoginForm Test] ${message}`);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    addTestResult('✅ Login success callback triggered');
  };

  // Handle login error
  const handleLoginError = (error: string) => {
    addTestResult(`❌ Login error callback triggered: ${error}`);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      addTestResult('Attempting sign out...');
      await signOut();
      addTestResult('✅ Sign out successful');
    } catch (error) {
      addTestResult(`❌ Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Clear test results
  const clearTestResults = () => {
    setTestResults([]);
    console.clear();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Login Form Test</h1>
      
      {/* Current Authentication Status */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Authentication Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Is Authenticated:</strong>
            <span className={`ml-2 px-2 py-1 rounded ${isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
              {isAuthenticated ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <strong>Admin Email:</strong>
            <span className="ml-2">{admin?.email || 'Not signed in'}</span>
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="mt-4">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Login Form Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Standard Login Form */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Standard Login Form</h2>
          <AdminLoginForm
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
          />
        </div>

        {/* Compact Login Form (no title) */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Compact Login Form (No Title)</h2>
          <AdminLoginForm
            showTitle={false}
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
            className="border-0 shadow-none p-0"
          />
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Test Instructions</h2>
        <div className="text-blue-700">
          <h3 className="font-semibold mb-2">Validation Tests:</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Try submitting with empty fields (should show validation errors)</li>
            <li>Try invalid email format (should show email validation error)</li>
            <li>Try password less than 6 characters (should show password validation error)</li>
            <li>Validation errors should clear when you start typing</li>
          </ul>
          
          <h3 className="font-semibold mb-2">Authentication Tests:</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Try with invalid credentials (should show authentication error)</li>
            <li>Try with valid admin credentials (should authenticate successfully)</li>
            <li>Check that form clears after successful login</li>
            <li>Check that callbacks are triggered correctly</li>
          </ul>
          
          <h3 className="font-semibold mb-2">UI Tests:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Test password visibility toggle (eye icon)</li>
            <li>Check loading states during submission</li>
            <li>Verify form is disabled during loading</li>
            <li>Test responsive layout on different screen sizes</li>
          </ul>
        </div>
      </div>

      {/* Test Actions */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="space-y-2">
          <button
            onClick={clearTestResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Test Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Results & Callback Logs</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p>No test results yet. Try logging in to see callback results.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
        <p className="text-gray-600 text-sm mt-2">
          Check the browser console for detailed logs from the AdminLoginForm and AdminAuthStore.
        </p>
      </div>
    </div>
  );
}
