"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAdminAuthStore from '@/src/store/adminAuthStore';

export default function AdminLoginPageTestPage() {
  const router = useRouter();
  const { isAuthenticated, admin, signOut } = useAdminAuthStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  // Helper to add test results
  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Admin Login Page Test] ${message}`);
  };

  // Test navigation to login page
  const testNavigateToLogin = () => {
    addTestResult('Navigating to /admin/login...');
    router.push('/admin/login');
  };

  // Test navigation to admin dashboard
  const testNavigateToAdmin = () => {
    addTestResult('Navigating to /admin...');
    router.push('/admin');
  };

  // Test sign out
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
      <h1 className="text-3xl font-bold mb-8">Admin Login Page Test</h1>
      
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

      {/* Test Scenarios */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Test Scenarios</h2>
        <div className="text-blue-700 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Scenario 1: Unauthenticated User</h3>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Make sure you're signed out (use button above if needed)</li>
              <li>Click "Navigate to /admin/login" below</li>
              <li>Should show login form without redirect</li>
              <li>Try logging in with valid credentials</li>
              <li>Should redirect to /admin after successful login</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Scenario 2: Authenticated User</h3>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Make sure you're signed in (complete Scenario 1 first)</li>
              <li>Click "Navigate to /admin/login" below</li>
              <li>Should redirect to /admin dashboard immediately</li>
              <li>Try clicking "Navigate to /admin" below</li>
              <li>Should show admin dashboard with your info</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Scenario 3: Admin Dashboard Protection</h3>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Sign out using the button above</li>
              <li>Click "Navigate to /admin" below</li>
              <li>Should redirect to /admin/login automatically</li>
              <li>Complete login, should redirect back to /admin</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Navigation Test Actions */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Navigation Test Actions</h2>
        <div className="space-y-4">
          <div>
            <button
              onClick={testNavigateToLogin}
              className="mr-4 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Navigate to /admin/login
            </button>
            <span className="text-gray-600">Test login page access and redirect behavior</span>
          </div>
          
          <div>
            <button
              onClick={testNavigateToAdmin}
              className="mr-4 px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Navigate to /admin
            </button>
            <span className="text-gray-600">Test admin dashboard access and protection</span>
          </div>
          
          <div>
            <button
              onClick={clearTestResults}
              className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Test Results
            </button>
          </div>
        </div>
      </div>

      {/* Expected Behaviors */}
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-green-800">Expected Behaviors</h2>
        <div className="text-green-700 space-y-2">
          <h3 className="font-semibold">When NOT authenticated:</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Visiting /admin/login → Shows login form</li>
            <li>Visiting /admin → Redirects to /admin/login</li>
            <li>Successful login → Redirects to /admin</li>
          </ul>
          
          <h3 className="font-semibold mt-4">When authenticated:</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Visiting /admin/login → Redirects to /admin</li>
            <li>Visiting /admin → Shows admin dashboard</li>
            <li>Sign out → Redirects to /admin/login</li>
          </ul>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Results & Navigation Logs</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p>No test results yet. Use the navigation buttons above to test the login flow.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
        <p className="text-gray-600 text-sm mt-2">
          Watch the URL bar and page content when navigating to verify redirect behavior.
        </p>
      </div>
    </div>
  );
}
