"use client";

import { useEffect, useState } from 'react';
import useAdminAuthStore, { adminAuthActions } from '@/src/store/adminAuthStore';
import { AdminSignInCredentials } from '@/src/types/admin';
import Loading from '@/src/components/common/Loading';
import ErrorMessage from '@/src/components/common/ErrorMessage';

export default function AdminAuthStoreTestPage() {
  // Get state and actions from the store
  const {
    admin,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signOut,
    checkAuth,
    clearError
  } = useAdminAuthStore();

  // Local state for login form
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  // Check auth status on component mount
  useEffect(() => {
    addTestResult('Component mounted, checking authentication status...');
    checkAuth();
  }, [checkAuth]);

  // Log state changes
  useEffect(() => {
    addTestResult(`State updated - isAuthenticated: ${isAuthenticated}, admin: ${admin?.email || 'null'}, isLoading: ${isLoading}, error: ${error || 'null'}`);
  }, [admin, isAuthenticated, isLoading, error]);

  // Helper to add test results
  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[AdminAuthStore Test] ${message}`);
  };

  // Handle sign in
  const handleSignIn = async () => {
    if (!email || !password) {
      addTestResult('Please enter both email and password');
      return;
    }

    const credentials: AdminSignInCredentials = { email, password };
    
    try {
      addTestResult(`Attempting sign in with email: ${email}`);
      await signIn(credentials);
      addTestResult('Sign in completed (check state above for success/failure)');
    } catch (error) {
      addTestResult(`Sign in error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      addTestResult('Attempting sign out...');
      await signOut();
      addTestResult('Sign out completed');
    } catch (error) {
      addTestResult(`Sign out error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle check auth
  const handleCheckAuth = async () => {
    try {
      addTestResult('Manually checking authentication...');
      await checkAuth();
      addTestResult('Auth check completed');
    } catch (error) {
      addTestResult(`Auth check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle clear error
  const handleClearError = () => {
    addTestResult('Clearing error state...');
    clearError();
  };

  // Test store actions directly
  const testStoreActions = async () => {
    addTestResult('Testing store actions directly...');
    
    try {
      addTestResult('Testing adminAuthActions.checkAuth()...');
      await adminAuthActions.checkAuth();
      addTestResult('Direct checkAuth completed');
    } catch (error) {
      addTestResult(`Direct checkAuth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Clear test results
  const clearTestResults = () => {
    setTestResults([]);
    console.clear();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Auth Store Test</h1>
      
      {/* Current State Display */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Store State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Is Authenticated:</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
              {isAuthenticated ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <strong>Is Loading:</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${isLoading ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
              {isLoading ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <strong>Admin Email:</strong> 
            <span className="ml-2">{admin?.email || 'Not signed in'}</span>
          </div>
          <div>
            <strong>Admin Name:</strong> 
            <span className="ml-2">{admin?.full_name || 'N/A'}</span>
          </div>
        </div>
        
        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} />
            <button 
              onClick={handleClearError}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Error
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="mt-4">
            <Loading />
          </div>
        )}
      </div>

      {/* Authentication Actions */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Actions</h2>
        
        {!isAuthenticated ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter password"
              />
            </div>
            
            <button
              onClick={handleSignIn}
              disabled={isLoading || !email || !password}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600 font-medium">
              Signed in as: {admin?.email}
            </p>
            
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        )}
      </div>

      {/* Test Actions */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="space-y-2">
          <button
            onClick={handleCheckAuth}
            disabled={isLoading}
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Check Auth Status
          </button>
          
          <button
            onClick={testStoreActions}
            disabled={isLoading}
            className="mr-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Direct Store Actions
          </button>
          
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
        <h2 className="text-xl font-semibold mb-4">Test Results & Console Logs</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p>No test results yet. Perform actions above to see logs.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
        <p className="text-gray-600 text-sm mt-2">
          Check the browser console for detailed console.log outputs.
        </p>
      </div>
    </div>
  );
}
