import { ValidationError } from './errorHandler';

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validator Functions
 */
export class Validator {
  /**
   * Validate required fields
   */
  static required<T extends object>(
    obj: T,
    fields: Array<keyof T>
  ): ValidationResult {
    const errors: string[] = [];

    fields.forEach(field => {
      if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
        errors.push(`Field '${String(field)}' is required`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate string length
   */
  static stringLength(
    value: string,
    min?: number,
    max?: number,
    fieldName: string = 'value'
  ): ValidationResult {
    const errors: string[] = [];

    if (min !== undefined && value.length < min) {
      errors.push(`${fieldName} must be at least ${min} characters`);
    }

    if (max !== undefined && value.length > max) {
      errors.push(`${fieldName} must not exceed ${max} characters`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate number range
   */
  static numberRange(
    value: number,
    min?: number,
    max?: number,
    fieldName: string = 'value'
  ): ValidationResult {
    const errors: string[] = [];

    if (min !== undefined && value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
      errors.push(`${fieldName} must not exceed ${max}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate enum value
   */
  static enum<T>(
    value: T,
    allowedValues: T[],
    fieldName: string = 'value'
  ): ValidationResult {
    if (!allowedValues.includes(value)) {
      return {
        valid: false,
        errors: [`${fieldName} must be one of: ${allowedValues.join(', ')}`],
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate array
   */
  static array<T>(
    value: T[],
    minLength?: number,
    maxLength?: number,
    fieldName: string = 'array'
  ): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(value)) {
      return { valid: false, errors: [`${fieldName} must be an array`] };
    }

    if (minLength !== undefined && value.length < minLength) {
      errors.push(`${fieldName} must have at least ${minLength} items`);
    }

    if (maxLength !== undefined && value.length > maxLength) {
      errors.push(`${fieldName} must not exceed ${maxLength} items`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate object structure
   */
  static object<T extends object>(
    value: any,
    requiredKeys: Array<keyof T>,
    fieldName: string = 'object'
  ): ValidationResult {
    if (typeof value !== 'object' || value === null) {
      return { valid: false, errors: [`${fieldName} must be an object`] };
    }

    return this.required(value as T, requiredKeys);
  }

  /**
   * Combine multiple validation results
   */
  static combine(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(r => r.errors);
    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Throw if validation fails
   */
  static assert(result: ValidationResult, context?: any): void {
    if (!result.valid) {
      throw new ValidationError(
        `Validation failed: ${result.errors.join('; ')}`,
        context
      );
    }
  }
}

/**
 * Agent Input Validator
 */
export class AgentInputValidator {
  /**
   * Validate base agent input
   */
  static validateAgentInput(input: any): ValidationResult {
    const errors: string[] = [];

    if (!input || typeof input !== 'object') {
      errors.push('Input must be an object');
      return { valid: false, errors };
    }

    // Optional validations
    if (input.userMessage !== undefined && typeof input.userMessage !== 'string') {
      errors.push('userMessage must be a string');
    }

    if (input.metadata !== undefined && typeof input.metadata !== 'object') {
      errors.push('metadata must be an object');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate project context
   */
  static validateProjectContext(context: any): ValidationResult {
    if (!context) {
      return { valid: false, errors: ['Project context is required'] };
    }

    return Validator.required(context, ['id', 'purposeId', 'purposeName', 'techStack']);
  }
}

/**
 * Helper function for quick validation
 */
export function validate(result: ValidationResult, throwOnError: boolean = true): boolean {
  if (!result.valid && throwOnError) {
    Validator.assert(result);
  }
  return result.valid;
}

