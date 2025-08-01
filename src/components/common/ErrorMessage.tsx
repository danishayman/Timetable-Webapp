/**
 * Error message component
 * Displays error messages with appropriate styling
 */
export default function ErrorMessage({ 
  message, 
  retry 
}: { 
  message: string; 
  retry?: () => void 
}) {
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 my-4 rounded">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {/* Error icon */}
          <svg 
            className="h-5 w-5 text-red-500" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700 dark:text-red-200">
            {message}
          </p>
          {retry && (
            <button 
              onClick={retry}
              className="mt-2 text-sm font-medium text-red-700 dark:text-red-200 hover:text-red-600 dark:hover:text-red-100"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 