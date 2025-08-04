/**
 * Centralized error handling utilities
 * Provides consistent error handling patterns across the application
 */

export interface AppError {
  message: string;
  code: string;
  status?: number;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface ErrorHandlerOptions {
  showToUser?: boolean;
  logToConsole?: boolean;
  retryable?: boolean;
  context?: Record<string, unknown>;
}

/**
 * Error codes for consistent error identification
 */
export const ERROR_CODES = {
  // Network & API errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Authentication errors
  AUTH_ERROR: 'AUTH_ERROR',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Application errors
  TIMETABLE_GENERATION_ERROR: 'TIMETABLE_GENERATION_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection and try again.',
  [ERROR_CODES.API_ERROR]: 'A server error occurred. Please try again later.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'The request timed out. Please try again.',
  [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action. Please log in again.',
  [ERROR_CODES.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.CONFLICT]: 'There was a conflict with your request. Please refresh and try again.',
  [ERROR_CODES.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ERROR_CODES.CONNECTION_ERROR]: 'Unable to connect to the database. Please try again later.',
  [ERROR_CODES.AUTH_ERROR]: 'Authentication failed. Please check your credentials.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ERROR_CODES.TIMETABLE_GENERATION_ERROR]: 'Failed to generate timetable. Please try again.',
  [ERROR_CODES.EXPORT_ERROR]: 'Failed to export timetable. Please try again.',
  [ERROR_CODES.STORAGE_ERROR]: 'Failed to save data locally. Please try again.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Creates a standardized AppError
 */
export function createAppError(
  message: string,
  code: string = ERROR_CODES.UNKNOWN_ERROR,
  status?: number,
  context?: Record<string, unknown>
): AppError {
  return {
    message,
    code,
    status,
    timestamp: new Date(),
    context,
  };
}

/**
 * Maps HTTP status codes to error codes
 */
export function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 408:
    case 504:
      return ERROR_CODES.TIMEOUT_ERROR;
    case 500:
    case 502:
    case 503:
      return ERROR_CODES.API_ERROR;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

/**
 * Extracts error information from various error types
 */
export function extractErrorInfo(error: unknown): { message: string; code: string; status?: number } {
  // Handle AppError
  if (error && typeof error === 'object' && 'code' in error) {
    const appError = error as AppError;
    return {
      message: appError.message,
      code: appError.code,
      status: appError.status,
    };
  }
  
  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      code: ERROR_CODES.NETWORK_ERROR,
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      code: ERROR_CODES.UNKNOWN_ERROR,
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      code: ERROR_CODES.UNKNOWN_ERROR,
    };
  }
  
  // Fallback for unknown error types
  return {
    message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    code: ERROR_CODES.UNKNOWN_ERROR,
  };
}

/**
 * Central error handler function
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): AppError {
  const {
    logToConsole = true,
    retryable = false,
    context = {},
  } = options;
  
  const { message, code, status } = extractErrorInfo(error);
  
  const appError = createAppError(message, code, status, {
    ...context,
    retryable,
    originalError: error,
  });
  
  // Log to console if enabled
  if (logToConsole) {
    console.error('Error handled:', {
      message: appError.message,
      code: appError.code,
      status: appError.status,
      timestamp: appError.timestamp,
      context: appError.context,
    });
  }
  
  return appError;
}

/**
 * Retry mechanism for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status === 400 || status === 401 || status === 403 || status === 404) {
          throw error;
        }
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoffMultiplier, attempt - 1)));
    }
  }
  
  throw handleError(lastError, {
    context: { attempts: maxRetries },
  });
}

/**
 * Validates API response and throws appropriate errors
 */
export function validateApiResponse<T>(response: { data: T | null; error: string | null; status: number }): T {
  if (response.error) {
    const errorCode = getErrorCodeFromStatus(response.status);
    const userMessage = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || response.error;
    
    throw createAppError(userMessage, errorCode, response.status, {
      originalError: response.error,
    });
  }
  
  if (response.data === null) {
    throw createAppError(
      ERROR_MESSAGES[ERROR_CODES.API_ERROR],
      ERROR_CODES.API_ERROR,
      response.status
    );
  }
  
  return response.data;
}

/**
 * Wraps async operations with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: ErrorHandlerOptions = {}
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, options);
    }
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    console.warn('Failed to parse JSON');
    return fallback;
  }
}

/**
 * Safe localStorage operations with error handling
 */
export const safeStorage = {
  getItem: (key: string, fallback: unknown = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? safeJsonParse(item, fallback) : fallback;
    } catch {
      console.warn(`Failed to get item from localStorage: ${key}`);
      return fallback;
    }
  },
  
  setItem: (key: string, value: unknown): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      console.error(`Failed to set item in localStorage: ${key}`);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      console.error(`Failed to remove item from localStorage: ${key}`);
      return false;
    }
  },
};
