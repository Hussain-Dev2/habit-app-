/**
 * Error Handling & Code Quality Utilities
 * 
 * Provides:
 * - Centralized error handling
 * - Custom error types
 * - Error logging
 * - Safe API call wrapper
 */

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Custom Validation Error class
 */
export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string
  ) {
    super(`Validation error in ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

/**
 * Error logger with levels
 */
export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export class ErrorLogger {
  static log(
    level: ErrorLevel,
    message: string,
    error?: Error | any,
    context?: Record<string, any>
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      error: error?.message || error,
      stack: error?.stack,
      context,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console[level === ErrorLevel.FATAL ? 'error' : level](
        `[${timestamp}] ${message}`,
        error
      );
    }

    // In production, you could send to error tracking service
    if (process.env.NODE_ENV === 'production' && level === ErrorLevel.ERROR) {
      // Send to error tracking service (Sentry, etc.)
      console.error(logEntry);
    }
  }

  static debug(message: string, error?: Error, context?: Record<string, any>) {
    this.log(ErrorLevel.DEBUG, message, error, context);
  }

  static info(message: string, context?: Record<string, any>) {
    this.log(ErrorLevel.INFO, message, undefined, context);
  }

  static warn(message: string, error?: Error, context?: Record<string, any>) {
    this.log(ErrorLevel.WARN, message, error, context);
  }

  static error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(ErrorLevel.ERROR, message, error, context);
  }

  static fatal(message: string, error: Error, context?: Record<string, any>) {
    this.log(ErrorLevel.FATAL, message, error, context);
  }
}

/**
 * Safe API call wrapper with error handling
 */
export async function safeApiCall<T>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      ErrorLogger.warn(`API Error: ${response.status} ${url}`, undefined, {
        status: response.status,
        url,
        error: errorData,
      });

      return {
        success: false,
        data: null,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data, error: null };
  } catch (error) {
    ErrorLogger.error(`API Call Error: ${url}`, error instanceof Error ? error : new Error(String(error)), {
      url,
      method: options?.method,
    });

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Input validation helpers
 */
export const validators = {
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain an uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain a number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  username: (username: string): boolean => {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isPositiveNumber: (value: any): boolean => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  isInteger: (value: any): boolean => {
    return Number.isInteger(Number(value));
  },

  isString: (value: any): value is string => {
    return typeof value === 'string';
  },

  isEmpty: (value: any): boolean => {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  },
};

/**
 * Safe JSON parsing
 */
export function safeJsonParse<T = any>(
  json: string,
  fallback: T | null = null
): T | null {
  try {
    return JSON.parse(json);
  } catch (error) {
    ErrorLogger.warn('JSON parse error', error instanceof Error ? error : new Error(String(error)));
    return fallback;
  }
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      ErrorLogger.warn(
        `Operation failed, retrying (${attempt}/${maxRetries})`,
        error instanceof Error ? error : new Error(String(error))
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw new Error('Operation failed after all retries');
}

/**
 * Type-safe null/undefined check
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safe property access
 */
export function getProperty<T extends object, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined {
  if (!isDefined(obj) || !isDefined(obj[key])) {
    return defaultValue;
  }
  return obj[key];
}
