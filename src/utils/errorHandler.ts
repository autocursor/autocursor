import { logger } from './logger';

/**
 * Custom Error Types
 */
export class AutoCursorError extends Error {
  constructor(
    message: string,
    public code: string,
    public category: string,
    public recoverable: boolean = true,
    public context?: any
  ) {
    super(message);
    this.name = 'AutoCursorError';
  }
}

export class AgentError extends AutoCursorError {
  constructor(message: string, public agentName: string, context?: any) {
    super(message, 'AGENT_ERROR', 'agent', true, context);
    this.name = 'AgentError';
  }
}

export class WorkflowError extends AutoCursorError {
  constructor(message: string, public phase: string, context?: any) {
    super(message, 'WORKFLOW_ERROR', 'workflow', true, context);
    this.name = 'WorkflowError';
  }
}

export class ValidationError extends AutoCursorError {
  constructor(message: string, context?: any) {
    super(message, 'VALIDATION_ERROR', 'validation', false, context);
    this.name = 'ValidationError';
  }
}

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 2,
};

/**
 * Error Handler
 */
export class ErrorHandler {
  /**
   * Handle error with logging and categorization
   */
  static handle(error: Error, context?: any): void {
    if (error instanceof AutoCursorError) {
      logger.error(
        error.category,
        `[${error.code}] ${error.message}`,
        { ...error.context, ...context }
      );
    } else {
      logger.error(
        'system',
        error.message,
        { stack: error.stack, ...context }
      );
    }
  }

  /**
   * Retry async function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const { maxAttempts, delay, backoff, onRetry } = {
      ...defaultRetryConfig,
      ...config,
    };

    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxAttempts) {
          const retryDelay = delay * Math.pow(backoff, attempt - 1);
          
          logger.warn(
            'retry',
            `Attempt ${attempt}/${maxAttempts} failed, retrying in ${retryDelay}ms`,
            { error: lastError.message }
          );
          
          onRetry?.(attempt, lastError);
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Wrap async function with error handling
   */
  static wrap<T>(
    fn: () => Promise<T>,
    errorMessage: string,
    category: string = 'system'
  ): Promise<T> {
    return fn().catch((error) => {
      this.handle(error, { category, operation: errorMessage });
      throw error;
    });
  }

  /**
   * Safe execution with fallback
   */
  static async safe<T>(
    fn: () => Promise<T>,
    fallback: T,
    logError: boolean = true
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (logError) {
        this.handle(error as Error);
      }
      return fallback;
    }
  }

  /**
   * Aggregate multiple errors
   */
  static aggregate(errors: Error[], message: string): Error {
    const errorMessages = errors.map(e => e.message).join('; ');
    return new AutoCursorError(
      `${message}: ${errorMessages}`,
      'AGGREGATE_ERROR',
      'system',
      false,
      { errors }
    );
  }
}

/**
 * Try-catch helper
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  onError: (error: Error) => T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    return onError(error as Error);
  }
}

