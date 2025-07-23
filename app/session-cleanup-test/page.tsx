"use client";

import { useState, useEffect } from 'react';
import { SessionManager } from '@/src/lib/sessionManager';
import { STORAGE_KEYS, SESSION_EXPIRATION } from '@/src/lib/constants';
import useTimetableStore from '@/src/store/timetableStore';
import useSubjectStore from '@/src/store/subjectStore';

export default function SessionCleanupTestPage() {
  const [testResults, setTestResults] = useState<{
    status: 'pending' | 'success' | 'error';
    message: string;
    details?: string[];
  }>({
    status: 'pending',
    message: 'Ready to run tests',
    details: []
  });

  const [sessionInfo, setSessionInfo] = useState<{
    sessionId: string | null;
    expiration: Date | null;
    hasTimetableData: boolean;
    hasSelectedSubjects: boolean;
  }>({
    sessionId: null,
    expiration: null,
    hasTimetableData: false,
    hasSelectedSubjects: false
  });

  const { resetTimetable, generateNewSession } = useTimetableStore();
  const { clearSelectedSubjects } = useSubjectStore();

  // Load session info when component mounts
  useEffect(() => {
    updateSessionInfo();
  }, []);

  // Helper function to update session info
  const updateSessionInfo = () => {
    if (typeof window !== 'undefined') {
      setSessionInfo({
        sessionId: localStorage.getItem(STORAGE_KEYS.SESSION_ID),
        expiration: getCurrentExpiration(),
        hasTimetableData: !!localStorage.getItem(STORAGE_KEYS.TIMETABLE_DATA),
        hasSelectedSubjects: !!localStorage.getItem(STORAGE_KEYS.SELECTED_SUBJECTS)
      });
    }
  };

  // Helper function to format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };

  // Helper function to get current expiration date
  const getCurrentExpiration = (): Date | null => {
    if (typeof window === 'undefined') return null;
    
    const expirationString = localStorage.getItem(STORAGE_KEYS.EXPIRATION);
    if (!expirationString) return null;
    
    return new Date(expirationString);
  };

  // Run the expiration test
  const runExpirationTest = async () => {
    setTestResults({
      status: 'pending',
      message: 'Running expiration tests...',
      details: []
    });

    try {
      const details: string[] = [];
      
      // Step 1: Clear any existing data
      resetTimetable();
      clearSelectedSubjects();
      SessionManager.clearAllData();
      details.push('✅ Cleared existing data');
      
      // Step 2: Create a new session
      generateNewSession();
      details.push('✅ Generated new session');
      
      // Step 3: Verify session ID and expiration date exist
      const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const initialExpiration = getCurrentExpiration();
      
      if (!sessionId) {
        throw new Error('Session ID not created');
      }
      details.push(`✅ Session ID created: ${sessionId}`);
      
      if (!initialExpiration) {
        throw new Error('Expiration date not set');
      }
      details.push(`✅ Expiration date set: ${formatDate(initialExpiration)}`);
      
      // Step 4: Simulate an expired session by setting expiration to the past
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 31); // 31 days ago
      localStorage.setItem(STORAGE_KEYS.EXPIRATION, pastDate.toISOString());
      details.push(`✅ Set expiration to past date: ${formatDate(pastDate)}`);
      
      // Step 5: Add some test data
      localStorage.setItem(STORAGE_KEYS.TIMETABLE_DATA, JSON.stringify({
        test: 'This is test data that should be removed'
      }));
      details.push('✅ Added test data to localStorage');
      
      // Step 6: Check if session has expired
      const hasExpired = SessionManager.hasSessionExpired();
      if (!hasExpired) {
        throw new Error('Session should be marked as expired but was not');
      }
      details.push('✅ Session correctly marked as expired');
      
      // Step 7: Clear expired session
      SessionManager.clearExpiredSession();
      details.push('✅ Ran clearExpiredSession()');
      
      // Step 8: Verify data was cleared
      const sessionIdAfter = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const expirationAfter = localStorage.getItem(STORAGE_KEYS.EXPIRATION);
      const timetableDataAfter = localStorage.getItem(STORAGE_KEYS.TIMETABLE_DATA);
      
      if (sessionIdAfter) {
        throw new Error('Session ID should have been removed but still exists');
      }
      details.push('✅ Session ID correctly removed');
      
      if (expirationAfter) {
        throw new Error('Expiration date should have been removed but still exists');
      }
      details.push('✅ Expiration date correctly removed');
      
      if (timetableDataAfter) {
        throw new Error('Timetable data should have been removed but still exists');
      }
      details.push('✅ Timetable data correctly removed');
      
      // Step 9: Create a new session with future expiration
      generateNewSession();
      const newSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const newExpiration = getCurrentExpiration();
      
      if (!newSessionId) {
        throw new Error('New session ID not created');
      }
      details.push(`✅ New session ID created: ${newSessionId}`);
      
      if (!newExpiration) {
        throw new Error('New expiration date not set');
      }
      details.push(`✅ New expiration date set: ${formatDate(newExpiration)}`);
      
      // Step 10: Verify the new expiration is in the future
      const now = new Date();
      if (newExpiration <= now) {
        throw new Error('New expiration should be in the future');
      }
      
      const daysUntilExpiration = Math.round((newExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      details.push(`✅ New expiration is ${daysUntilExpiration} days in the future`);
      
      // Update session info
      updateSessionInfo();
      
      // All tests passed
      setTestResults({
        status: 'success',
        message: 'All session expiration tests passed!',
        details
      });
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({
        status: 'error',
        message: `Test failed: ${error instanceof Error ? error.message : String(error)}`,
        details: testResults.details
      });
    }
  };

  // Run the automatic cleanup test
  const runAutoCleanupTest = async () => {
    setTestResults({
      status: 'pending',
      message: 'Running automatic cleanup tests...',
      details: []
    });

    try {
      const details: string[] = [];
      
      // Step 1: Clear any existing data
      resetTimetable();
      clearSelectedSubjects();
      SessionManager.clearAllData();
      details.push('✅ Cleared existing data');
      
      // Step 2: Create a new session
      generateNewSession();
      details.push('✅ Generated new session');
      
      // Step 3: Add test data
      localStorage.setItem(STORAGE_KEYS.TIMETABLE_DATA, JSON.stringify({
        test: 'This is test data that should be removed on load'
      }));
      details.push('✅ Added test data to localStorage');
      
      // Step 4: Set expiration to the past
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 31); // 31 days ago
      localStorage.setItem(STORAGE_KEYS.EXPIRATION, pastDate.toISOString());
      details.push(`✅ Set expiration to past date: ${formatDate(pastDate)}`);
      
      // Step 5: Simulate app initialization by calling loadTimetableData
      const loadedData = SessionManager.loadTimetableData();
      details.push('✅ Called loadTimetableData()');
      
      // Step 6: Verify data was automatically cleared
      if (loadedData !== null) {
        throw new Error('Timetable data should have been cleared but was returned');
      }
      details.push('✅ Timetable data correctly returned as null');
      
      const sessionIdAfter = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const expirationAfter = localStorage.getItem(STORAGE_KEYS.EXPIRATION);
      const timetableDataAfter = localStorage.getItem(STORAGE_KEYS.TIMETABLE_DATA);
      
      if (sessionIdAfter) {
        throw new Error('Session ID should have been removed but still exists');
      }
      details.push('✅ Session ID correctly removed');
      
      if (expirationAfter) {
        throw new Error('Expiration date should have been removed but still exists');
      }
      details.push('✅ Expiration date correctly removed');
      
      if (timetableDataAfter) {
        throw new Error('Timetable data should have been removed but still exists');
      }
      details.push('✅ Timetable data correctly removed');
      
      // Update session info
      updateSessionInfo();
      
      // All tests passed
      setTestResults({
        status: 'success',
        message: 'All automatic cleanup tests passed!',
        details
      });
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({
        status: 'error',
        message: `Test failed: ${error instanceof Error ? error.message : String(error)}`,
        details: testResults.details
      });
    }
  };

  // Run the expiration extension test
  const runExpirationExtensionTest = async () => {
    setTestResults({
      status: 'pending',
      message: 'Running expiration extension tests...',
      details: []
    });

    try {
      const details: string[] = [];
      
      // Step 1: Clear any existing data
      resetTimetable();
      clearSelectedSubjects();
      SessionManager.clearAllData();
      details.push('✅ Cleared existing data');
      
      // Step 2: Create a new session
      generateNewSession();
      details.push('✅ Generated new session');
      
      // Step 3: Get initial expiration
      const initialExpiration = getCurrentExpiration();
      if (!initialExpiration) {
        throw new Error('Initial expiration date not set');
      }
      details.push(`✅ Initial expiration date: ${formatDate(initialExpiration)}`);
      
      // Step 4: Set expiration to almost expired (1 day left)
      const almostExpiredDate = new Date();
      almostExpiredDate.setDate(almostExpiredDate.getDate() + 1); // 1 day in future
      localStorage.setItem(STORAGE_KEYS.EXPIRATION, almostExpiredDate.toISOString());
      details.push(`✅ Set expiration to almost expired: ${formatDate(almostExpiredDate)}`);
      
      // Step 5: Simulate user activity by loading data
      SessionManager.loadTimetableData();
      details.push('✅ Simulated user activity by calling loadTimetableData()');
      
      // Step 6: Verify expiration was extended
      const newExpiration = getCurrentExpiration();
      if (!newExpiration) {
        throw new Error('New expiration date not set');
      }
      details.push(`✅ New expiration date: ${formatDate(newExpiration)}`);
      
      // Step 7: Verify new expiration is later than the almost expired date
      if (newExpiration <= almostExpiredDate) {
        throw new Error('Expiration date should have been extended');
      }
      
      const daysExtended = Math.round((newExpiration.getTime() - almostExpiredDate.getTime()) / (1000 * 60 * 60 * 24));
      details.push(`✅ Expiration extended by approximately ${daysExtended} days`);
      
      // Update session info
      updateSessionInfo();
      
      // All tests passed
      setTestResults({
        status: 'success',
        message: 'All expiration extension tests passed!',
        details
      });
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({
        status: 'error',
        message: `Test failed: ${error instanceof Error ? error.message : String(error)}`,
        details: testResults.details
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Session Cleanup Test</h1>
      
      {/* Test Results */}
      <div className={`p-4 mb-8 rounded-lg ${
        testResults.status === 'success' ? 'bg-green-100 text-green-800' :
        testResults.status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        <h2 className="text-lg font-semibold mb-2">Test Results</h2>
        <p className="mb-4">{testResults.message}</p>
        
        {testResults.details && testResults.details.length > 0 && (
          <div className="mt-2 text-sm">
            <h3 className="font-medium mb-1">Details:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {testResults.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Test Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Session Expiration Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={runExpirationTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Expiration
          </button>
          
          <button
            onClick={runAutoCleanupTest}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Auto Cleanup
          </button>
          
          <button
            onClick={runExpirationExtensionTest}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Expiration Extension
          </button>
        </div>
      </div>
      
      {/* Current Session Info */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Session Info</h2>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Session ID: </span>
            <span className="font-mono">{sessionInfo.sessionId || 'None'}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Expiration Date: </span>
            <span>{sessionInfo.expiration ? formatDate(sessionInfo.expiration) : 'None'}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Time Until Expiration: </span>
            <span>
              {sessionInfo.expiration 
                ? `${Math.round((sessionInfo.expiration.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` 
                : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Has Timetable Data: </span>
            <span>{sessionInfo.hasTimetableData ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Has Selected Subjects: </span>
            <span>{sessionInfo.hasSelectedSubjects ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
      
      {/* Manual Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Manual Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                SessionManager.clearAllData();
                updateSessionInfo();
                setTestResults({
                  status: 'pending',
                  message: 'All session data cleared',
                  details: []
                });
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Session Data
          </button>
          
          <button
            onClick={() => {
              generateNewSession();
              updateSessionInfo();
              setTestResults({
                status: 'pending',
                message: 'New session generated',
                details: []
              });
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Generate New Session
          </button>
          
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                const pastDate = new Date();
                pastDate.setDate(pastDate.getDate() - 31);
                localStorage.setItem(STORAGE_KEYS.EXPIRATION, pastDate.toISOString());
                updateSessionInfo();
                setTestResults({
                  status: 'pending',
                  message: 'Expiration set to 31 days ago',
                  details: []
                });
              }
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Set Expiration to Past
          </button>
          
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                SessionManager.updateExpirationDate();
                updateSessionInfo();
                setTestResults({
                  status: 'pending',
                  message: 'Expiration extended by 30 days',
                  details: []
                });
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Extend Expiration
          </button>
        </div>
      </div>
    </div>
  );
} 