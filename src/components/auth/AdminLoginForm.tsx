"use client";

import { useState } from 'react';
import { z } from 'zod';
import useAdminAuthStore from '@/src/store/adminAuthStore';
import ErrorMessage from '@/src/components/common/ErrorMessage';

/**
 * Admin login form validation schema
 */
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

interface AdminLoginFormProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
  className?: string;
  showTitle?: boolean;
}

/**
 * AdminLoginForm component
 * Provides email/password form with validation connected to admin auth store
 */
export default function AdminLoginForm({
  onLoginSuccess,
  onLoginError,
  className = '',
  showTitle = true
}: AdminLoginFormProps) {
  // Get state and actions from admin auth store
  const { isLoading, error, signIn, clearError } = useAdminAuthStore();

  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Form interaction state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear store error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('AdminLoginForm: Attempting sign in...');
      
      await signIn({
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('AdminLoginForm: Sign in successful');
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // Clear form on success
      setFormData({ email: '', password: '' });
      
    } catch (error) {
      console.error('AdminLoginForm: Sign in failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Call error callback
      if (onLoginError) {
        onLoginError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Admin Login
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
            Sign in to access the admin dashboard
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label 
            htmlFor="admin-email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="admin-email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="admin@example.com"
            disabled={isFormLoading}
            autoComplete="email"
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label 
            htmlFor="admin-password" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="admin-password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              disabled={isFormLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              disabled={isFormLoading}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L4.05 4.05m5.828 5.828L14.121 14.121M9.878 9.878l4.242 4.242" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isFormLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFormLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Signing In...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Development Helper */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Development Mode:</strong> Make sure you have created an admin user in your Supabase database.
          </p>
        </div>
      )}
    </div>
  );
}
