/**
 * Logging utility that respects __DEV__ flag
 * Prevents verbose logs in production builds
 */

/**
 * Check if running in development mode
 * In React Native, __DEV__ is a global boolean
 */
const isDevelopment = (): boolean => {
  return typeof __DEV__ !== 'undefined' && __DEV__;
};

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Logger class with development-only verbose logging
 */
class Logger {
  constructor(private prefix: string) {}

  /**
   * Log debug message (development only)
   */
  debug(...args: unknown[]): void {
    if (isDevelopment()) {
      console.log(`[${this.prefix}]`, ...args);
    }
  }

  /**
   * Log info message (development only)
   */
  info(...args: unknown[]): void {
    if (isDevelopment()) {
      console.log(`[${this.prefix}]`, ...args);
    }
  }

  /**
   * Log warning (always logged)
   */
  warn(...args: unknown[]): void {
    console.warn(`[${this.prefix}]`, ...args);
  }

  /**
   * Log error (always logged, but sanitized in production)
   */
  error(message: string, error?: unknown): void {
    if (isDevelopment()) {
      console.error(`[${this.prefix}]`, message, error);
    } else {
      // In production, only log the message without details
      console.error(`[${this.prefix}]`, message);
    }
  }
}

/**
 * Create a logger instance for a module
 *
 * @param moduleName - Name of the module (e.g., 'StandardContext', 'SchedulerInit')
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger('MyModule');
 * logger.info('Initialized'); // Only logs in dev
 * logger.error('Failed', error); // Logs in prod (sanitized)
 * ```
 */
export function createLogger(moduleName: string): Logger {
  return new Logger(moduleName);
}
