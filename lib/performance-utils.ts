/**
 * Performance Utilities
 * 
 * Utility functions to optimize performance:
 * - Debouncing
 * - Request deduplication
 * - Memory efficient caching
 */

/**
 * Debounce function to delay execution until user stops interacting
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function to limit execution frequency
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request cache to deduplicate identical requests
 */
class RequestCache {
  private cache = new Map<string, Promise<any>>();
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private ttl = 5 * 60 * 1000; // 5 minutes default

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Return cached result if available
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Create new request
    const promise = fetcher();
    this.cache.set(key, promise);

    // Set auto-expiry
    const timeout = setTimeout(
      () => {
        this.cache.delete(key);
        this.timeouts.delete(key);
      },
      ttl || this.ttl
    );

    this.timeouts.set(key, timeout);

    return promise;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
      const timeout = this.timeouts.get(key);
      if (timeout) clearTimeout(timeout);
      this.timeouts.delete(key);
    } else {
      this.cache.clear();
      this.timeouts.forEach((timeout) => clearTimeout(timeout));
      this.timeouts.clear();
    }
  }
}

export const requestCache = new RequestCache();

/**
 * Batch operations to reduce renders
 */
export class BatchQueue<T> {
  private queue: T[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private callback: (items: T[]) => void;
  private delay: number;

  constructor(callback: (items: T[]) => void, delay: number = 100) {
    this.callback = callback;
    this.delay = delay;
  }

  add(item: T) {
    this.queue.push(item);
    this.schedule();
  }

  private schedule() {
    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      if (this.queue.length > 0) {
        this.callback([...this.queue]);
        this.queue = [];
      }
      this.timer = null;
    }, this.delay);
  }

  flush() {
    if (this.timer) clearTimeout(this.timer);
    if (this.queue.length > 0) {
      this.callback([...this.queue]);
      this.queue = [];
    }
  }
}

/**
 * Intersection Observer helper for lazy loading
 */
export function observeElements(
  elements: Element[],
  callback: (element: Element, isVisible: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      callback(entry.target, entry.isIntersecting);
    });
  }, defaultOptions);

  elements.forEach((el) => observer.observe(el));

  return observer;
}

/**
 * Measure performance metrics
 */
export function measurePerformance(label: string) {
  const startTime = performance.now();

  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      return duration;
    },
  };
}
