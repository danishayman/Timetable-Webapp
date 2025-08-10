"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminLoginForm from '@/components/features/auth/AdminLoginForm';
import useAdminAuthStore from '@/store/adminAuthStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading } = useAdminAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Admin already authenticated, redirecting to admin dashboard...');
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  // Handle successful login
  const handleLoginSuccess = () => {
    console.log('Login successful, redirecting to admin dashboard...');
    router.push('/admin');
  };

  // Handle login error
  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (prevents flash before redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Timetable Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Access the admin dashboard to manage subjects and schedules
          </p>
        </div>

        {/* Login Form */}
        <AdminLoginForm
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
          className="bg-white dark:bg-gray-800 shadow-lg"
        />

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            ← Back to Student Portal
          </button>
          
          {/* Development Helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Development Info
              </h3>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Login URL:</strong> /admin/login</p>
                <p><strong>Redirect on success:</strong> /admin</p>
                <p><strong>Test Pages:</strong></p>
                <ul className="list-disc list-inside ml-2">
                  <li><a href="/admin-auth-store-test" className="underline">Auth Store Test</a></li>
                  <li><a href="/admin-login-form-test" className="underline">Login Form Test</a></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
