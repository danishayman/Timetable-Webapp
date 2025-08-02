/**
 * Enhanced Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError, createAppError, ERROR_CODES } from '@/src/lib/errorHandler';
import { notifyError } from '@/src/lib/notifications';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showNotification?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = handleError(error, {
      context: {
        operation: 'react_error_boundary',
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show notification if enabled
    if (this.props.showNotification !== false) {
      notifyError(
        'Application Error',
        'Something went wrong. Please refresh the page or try again.',
        () => window.location.reload()
      );
    }

    // Log to console for debugging
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-8 max-w-md">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. This has been reported and we're working to fix it.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reload Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to create an error boundary programmatically
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showNotification?: boolean;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...options}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Component to manually trigger error boundary (useful for testing)
 */
export function ErrorTrigger({ children }: { children: ReactNode }) {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('Test error triggered by ErrorTrigger component');
  }

  return (
    <div>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShouldThrow(true)}
          className="mt-4 px-3 py-1 text-xs bg-red-600 text-white rounded"
        >
          Trigger Error (Dev Only)
        </button>
      )}
    </div>
  );
}

/**
 * HOC for async error handling in React components
 */
export function useAsyncError() {
  const [, setError] = React.useState();
  
  return React.useCallback((error: any) => {
    setError(() => {
      throw error;
    });
  }, [setError]);
}
