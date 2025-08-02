"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useAdminAuthStore from '@/src/store/adminAuthStore';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, admin, checkAuth, signOut, isLoading } = useAdminAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login...');
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (prevents flash before redirect)
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with admin info */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {admin?.full_name || admin?.email}
          </p>
        </div>
        
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Admin info card */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <div>
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Admin Access Granted
            </h2>
            <p className="text-green-700 dark:text-green-300">
              You are signed in as: <strong>{admin?.email}</strong>
            </p>
            {admin?.full_name && (
              <p className="text-green-700 dark:text-green-300">
                Full name: <strong>{admin.full_name}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Subjects Management */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Subjects</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage course subjects and their details
          </p>
          <button 
            onClick={() => router.push('/admin/subjects')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Manage Subjects
          </button>
        </div>

        {/* Schedules Management */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Schedules</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage class schedules and time slots
          </p>
          <button 
            onClick={() => alert('Schedule management coming soon!')}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Manage Schedules
          </button>
        </div>

        {/* Tutorial Groups */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Tutorial Groups</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage tutorial groups and assignments
          </p>
          <button 
            onClick={() => alert('Tutorial management coming soon!')}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Manage Tutorials
          </button>
        </div>
      </div>

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            Development Mode
          </h3>
          <div className="text-yellow-700 dark:text-yellow-300 space-y-2">
            <p>This is the protected admin dashboard page.</p>
            <p><strong>Current route:</strong> /admin</p>
            <p><strong>Authentication status:</strong> ✅ Authenticated</p>
            <p><strong>Admin user:</strong> {admin?.email}</p>
            <div className="mt-4">
              <p className="font-medium mb-2">Quick Actions:</p>
              <div className="space-x-2">
                <button
                  onClick={() => router.push('/admin/login')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Go to Login Page
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Student Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 