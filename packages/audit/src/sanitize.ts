/**
 * PHI sanitization utility
 *
 * Strips Protected Health Information from objects before logging.
 * Follows the HIPAA Minimum Necessary principle.
 */

/**
 * Remove PHI fields from an object for safe logging.
 *
 * @param data - The object to sanitize
 * @param phiFields - Field names that contain PHI and should be redacted
 * @returns A new object with PHI fields replaced by '[REDACTED]'
 */
export function sanitizeForLog<T extends Record<string, unknown>>(
  data: T,
  phiFields: (keyof T)[]
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (phiFields.includes(key as keyof T)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/** Common PHI field names to redact by default */
export const DEFAULT_PHI_FIELDS = [
  'name',
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth',
  'dob',
  'ssn',
  'socialSecurityNumber',
  'address',
  'medicalRecordNumber',
  'mrn',
  'diagnosis',
  'medication',
  'healthPlan',
  'accountNumber',
  'biometric',
] as const;
