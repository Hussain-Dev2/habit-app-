/**
 * Custom React Hooks for Performance
 * 
 * Reusable hooks for:
 * - Data fetching with caching
 * - Debounced state
 * - Async operations with error handling
 * - Lifecycle management
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from '@/lib/performance-utils';

/**
 * Hook for debounced state
 */
export function useDebouncedState<T>(initialValue: T, delay: number = 500) {
  const [state, setState] = useState<T>(initialValue);
  const [debouncedState, setDebouncedState] = useState<T>(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedState(state);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state, delay]);

  return [debouncedState, setState] as const;
}

/**
 * Hook for safe async operations with automatic cleanup
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  );
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  // Use the callback hook to remember the async function
  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}

/**
 * Hook for API fetching with caching and error handling
 */
export function useFetch<T>(
  url: string,
  options?: RequestInit
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const cacheRef = useRef(new Map<string, T>());

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cacheRef.current.has(url)) {
      setState({
        data: cacheRef.current.get(url) || null,
        loading: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      cacheRef.current.set(url, data);

      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cacheRef.current.delete(url);
    fetchData();
  }, [url, fetchData]);

  return { ...state, refetch };
}

/**
 * Hook for managing component lifecycle
 */
export function useLifecycle() {
  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component unmounted');
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden');
      } else {
        console.log('Page visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

/**
 * Hook for tracking previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook for local storage with type safety
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * Hook for debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const debouncedRef = useRef(debounce(callback, delay));

  useEffect(() => {
    debouncedRef.current = debounce(callback, delay);
  }, [callback, delay]);

  return debouncedRef.current;
}

/**
 * Hook for request deduplication
 */
export function useRequestCache<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const cacheRef = useRef(new Map<string, T>());

  useEffect(() => {
    const fetchData = async () => {
      if (cacheRef.current.has(key)) {
        setState({
          data: cacheRef.current.get(key) || null,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        const data = await fetcher();
        cacheRef.current.set(key, data);
        setState({
          data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    };

    fetchData();
  }, [key, fetcher]);

  return state;
}
