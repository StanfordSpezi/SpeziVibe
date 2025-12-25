/**
 * Validation utilities for account forms
 * Provides consistent validation logic across all components
 */

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate email address format
 *
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateEmail('test@example.com');
 * if (!result.valid) {
 *   showError(result.message);
 * }
 * ```
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  if (!trimmedEmail.includes('@')) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Validate password meets minimum requirements
 *
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validatePassword('MyPass123');
 * if (!result.valid) {
 *   showError(result.message);
 * }
 * ```
 */
export function validatePassword(
  password: string,
  minLength: number = 8
): ValidationResult {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < minLength) {
    return {
      valid: false,
      message: `Password must be at least ${minLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate password strength (uppercase, lowercase, number)
 *
 * @param password - Password to validate
 * @returns Validation result with specific error message
 *
 * @example
 * ```typescript
 * const result = validatePasswordStrength('weakpass');
 * if (!result.valid) {
 *   showError(result.message); // "Password must contain an uppercase letter"
 * }
 * ```
 */
export function validatePasswordStrength(password: string): ValidationResult {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }

  return { valid: true };
}

/**
 * Validate that two passwords match
 *
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result with error message if they don't match
 *
 * @example
 * ```typescript
 * const result = validatePasswordMatch('pass123', 'pass456');
 * if (!result.valid) {
 *   showError(result.message); // "Passwords do not match"
 * }
 * ```
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }

  return { valid: true };
}

/**
 * Sanitize text input by trimming whitespace and removing dangerous characters
 *
 * @param input - Text to sanitize
 * @returns Sanitized text
 *
 * @example
 * ```typescript
 * const clean = sanitizeInput('  test@example.com  ');
 * // Returns: "test@example.com"
 * ```
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Normalize email address (trim and lowercase)
 *
 * @param email - Email to normalize
 * @returns Normalized email
 *
 * @example
 * ```typescript
 * const normalized = normalizeEmail('  Test@Example.COM  ');
 * // Returns: "test@example.com"
 * ```
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
