/**
 * React hooks for API calls with error handling and retry logic
 */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { handleError, withRetry, validateApiResponse, AppError } from '@/src/lib/errorHandler';
import { notifyError, notifyNetworkError } from '@/src/lib/notifications';

export interface UseApiOptions {
  retries?: number;
  showErrorNotification?: boolean;
  onError?: (error: AppError) => void;
  onSuccess?: () => void;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

/**
 * Hook for making API calls with automatic error handling and retry logic
 */
export function useApi<T = unknown>(options: UseApiOptions = {}) {
  const {
    retries = 3,
    showErrorNotification = true,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await withRetry(apiCall, retries, 1000);
      
      setState({
        data: result,
        loading: false,
        error: null,
      });

      onSuccess?.();
      return result;
    } catch (error) {
      const appError = handleError(error, {
        context: { operation: 'api_call', retries }
      });

      setState({
        data: null,
        loading: false,
        error: appError,
      });

      if (showErrorNotification) {
        if (appError.code === 'NETWORK_ERROR') {
          notifyNetworkError(() => execute(apiCall));
        } else {
          notifyError('Request Failed', appError.message);
        }
      }

      onError?.(appError);
      return null;
    }
  }, [retries, showErrorNotification, onError, onSuccess]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for making fetch requests with automatic response validation
 */
export function useFetch<T = unknown>(options: UseApiOptions = {}) {
  const api = useApi<T>(options);

  const fetchData = useCallback(async (url: string, fetchOptions?: RequestInit): Promise<T | null> => {
    return api.execute(async () => {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      return validateApiResponse<T>(apiResponse);
    });
  }, [api]);

  return {
    ...api,
    fetchData,
  };
}

/**
 * Hook for managing form submissions with error handling
 */
export function useFormSubmission<T = unknown>(options: UseApiOptions = {}) {
  const api = useApi<T>(options);

  const submit = useCallback(async (
    url: string,
    data: Record<string, unknown>,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST'
  ): Promise<T | null> => {
    return api.execute(async () => {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      return validateApiResponse<T>(apiResponse);
    });
  }, [api]);

  return {
    ...api,
    submit,
  };
}

/**
 * Hook for optimistic updates with rollback on error
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [previousData, setPreviousData] = useState<T>(initialData);
  const api = useApi<T>(options);

  const updateOptimistically = useCallback(async (
    optimisticUpdate: (current: T) => T,
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    // Store current state for rollback
    setPreviousData(data);
    
    // Apply optimistic update
    const optimisticData = optimisticUpdate(data);
    setData(optimisticData);

    try {
      const result = await api.execute(apiCall);
      if (result) {
        setData(result);
        return result;
      } else {
        // Rollback on error
        setData(previousData);
        return null;
      }
    } catch (error) {
      // Rollback on error
      setData(previousData);
      throw error;
    }
  }, [data, previousData, api]);

  return {
    data,
    setData,
    loading: api.loading,
    error: api.error,
    updateOptimistically,
    reset: api.reset,
  };
}

/**
 * Hook for pagination with error handling
 */
export interface UsePaginationOptions extends UseApiOptions {
  pageSize?: number;
  initialPage?: number;
}

export function usePagination<T = unknown>(options: UsePaginationOptions = {}) {
  const { pageSize = 10, initialPage = 1, ...apiOptions } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  const api = useApi<{ items: T[]; total: number; page: number; pageSize: number }>(apiOptions);

  const fetchPage = useCallback(async (
    url: string,
    page: number = currentPage,
    size: number = pageSize
  ): Promise<{ items: T[]; total: number; page: number; pageSize: number } | null> => {
    const result = await api.execute(async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
      });
      
      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      return validateApiResponse<{ items: T[]; total: number; page: number; pageSize: number }>(apiResponse);
    });

    if (result) {
      setCurrentPage(result.page);
      setTotalItems(result.total);
      setTotalPages(Math.ceil(result.total / result.pageSize));
    }

    return result;
  }, [api, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return {
    data: api.data?.items || [],
    loading: api.loading,
    error: api.error,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    fetchPage,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    reset: api.reset,
  };
}
