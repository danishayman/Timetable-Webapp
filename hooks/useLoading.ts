/**
 * Custom hooks for loading states and UX polish
 */
'use client';

import { useEffect, useState } from 'react';

/**
 * Hook for managing async operations with loading states
 */
export function useAsyncOperation<T = unknown>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (asyncFn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  return { isLoading, error, data, execute, reset };
}

/**
 * Hook for managing loading timeouts
 */
export function useLoadingTimeout(timeout: number = 30000) {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const startTimeout = () => {
    setIsTimedOut(false);
    const id = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);
    setTimeoutId(id);
  };

  const clearTimeout = () => {
    if (timeoutId) {
      global.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsTimedOut(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        global.clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return { isTimedOut, startTimeout, clearTimeout };
}

/**
 * Hook for progressive loading states
 */
export function useProgressiveLoading(steps: string[], stepDuration: number = 2000) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, stepDuration);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentStep, steps.length, stepDuration]);

  const reset = () => {
    setCurrentStep(0);
    setIsComplete(false);
  };

  const skip = () => {
    setCurrentStep(steps.length - 1);
    setIsComplete(true);
  };

  return {
    currentStep,
    currentMessage: steps[currentStep],
    isComplete,
    progress: ((currentStep + 1) / steps.length) * 100,
    reset,
    skip
  };
}

/**
 * Hook for managing retry attempts
 */
export function useRetry(maxRetries: number = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = async <T>(
    asyncFn: () => Promise<T>,
    onRetry?: (attempt: number) => void
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          setRetryCount(attempt);
          onRetry?.(attempt);
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }

        const result = await asyncFn();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw lastError;
        }
      }
    }

    throw lastError!;
  };

  const reset = () => {
    setRetryCount(0);
    setIsRetrying(false);
  };

  return {
    retryCount,
    isRetrying,
    maxRetries,
    executeWithRetry,
    reset
  };
}

/**
 * Hook for debounced loading states
 */
export function useDebouncedLoading(delay: number = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setDebouncedLoading(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setDebouncedLoading(false);
    }
  }, [isLoading, delay]);

  return {
    isLoading,
    debouncedLoading,
    setIsLoading
  };
}

/**
 * Hook for managing multiple loading states
 */
export function useMultipleLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  };

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const isLoading = (key: string) => loadingStates[key] || false;

  const resetAll = () => {
    setLoadingStates({});
  };

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    resetAll
  };
}

/**
 * Hook for optimistic updates with loading states
 */
export function useOptimisticUpdate<T>() {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [isReverting, setIsReverting] = useState(false);

  const applyOptimisticUpdate = (data: T) => {
    setOptimisticData(data);
  };

  const revertOptimisticUpdate = () => {
    setIsReverting(true);
    setTimeout(() => {
      setOptimisticData(null);
      setIsReverting(false);
    }, 300); // Smooth animation time
  };

  const confirmOptimisticUpdate = () => {
    setOptimisticData(null);
  };

  return {
    optimisticData,
    isReverting,
    applyOptimisticUpdate,
    revertOptimisticUpdate,
    confirmOptimisticUpdate
  };
}
