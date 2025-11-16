import { PersonName } from '../types';

/**
 * Person name formatting styles
 */
export enum PersonNameStyle {
  /** Full name with all components (e.g., "Dr. Leland Stanford Jr.") */
  Long = 'long',
  /** Medium format with prefix, given, family, suffix (e.g., "Dr. Leland Stanford Jr.") */
  Medium = 'medium',
  /** Short format with given and family name only (e.g., "Leland Stanford") */
  Short = 'short',
  /** Abbreviated format (e.g., "L. Stanford") */
  Abbreviated = 'abbreviated',
}

/**
 * Format a PersonName into a display string
 *
 * @param name - The PersonName object to format
 * @param style - The formatting style to use (default: Short)
 * @returns Formatted name string
 *
 * @example
 * ```ts
 * const name: PersonName = {
 *   givenName: 'Leland',
 *   familyName: 'Stanford',
 *   namePrefix: 'Dr.',
 *   nameSuffix: 'Jr.'
 * };
 *
 * formatPersonName(name, PersonNameStyle.Long)
 * // Returns: "Dr. Leland Stanford Jr."
 *
 * formatPersonName(name, PersonNameStyle.Short)
 * // Returns: "Leland Stanford"
 * ```
 */
export function formatPersonName(
  name: PersonName | undefined | null,
  style: PersonNameStyle = PersonNameStyle.Short
): string {
  if (!name) {
    return '';
  }

  const { givenName, familyName, middleName, namePrefix, nameSuffix, nickname } = name;

  // If no components are present, return empty string
  if (!givenName && !familyName && !middleName && !nickname) {
    return '';
  }

  switch (style) {
    case PersonNameStyle.Long:
      return [
        namePrefix,
        givenName,
        middleName,
        familyName,
        nameSuffix
      ].filter(Boolean).join(' ');

    case PersonNameStyle.Medium:
      return [
        namePrefix,
        givenName,
        familyName,
        nameSuffix
      ].filter(Boolean).join(' ');

    case PersonNameStyle.Short:
      return [
        givenName,
        familyName
      ].filter(Boolean).join(' ');

    case PersonNameStyle.Abbreviated:
      const abbreviated = givenName ? `${givenName.charAt(0)}.` : '';
      return [abbreviated, familyName].filter(Boolean).join(' ');

    default:
      return [givenName, familyName].filter(Boolean).join(' ');
  }
}

/**
 * Parse a simple name string into PersonName components
 *
 * This is a basic parser that splits on spaces and assumes:
 * - First word is given name
 * - Last word is family name
 * - Middle words are middle names
 *
 * For more complex names, create PersonName objects directly.
 *
 * @param nameString - The name string to parse
 * @returns PersonName object
 *
 * @example
 * ```ts
 * parsePersonName('Leland Stanford')
 * // Returns: { givenName: 'Leland', familyName: 'Stanford' }
 *
 * parsePersonName('John Paul Stanford')
 * // Returns: { givenName: 'John', middleName: 'Paul', familyName: 'Stanford' }
 * ```
 */
export function parsePersonName(nameString: string | undefined | null): PersonName | undefined {
  if (!nameString || typeof nameString !== 'string') {
    return undefined;
  }

  const trimmed = nameString.trim();
  if (!trimmed) {
    return undefined;
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 0) {
    return undefined;
  }

  if (parts.length === 1) {
    return { givenName: parts[0] };
  }

  if (parts.length === 2) {
    return {
      givenName: parts[0],
      familyName: parts[1]
    };
  }

  // 3 or more parts: first is given, last is family, middle parts are middle name
  return {
    givenName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    familyName: parts[parts.length - 1]
  };
}

/**
 * Normalize a name input - accepts either PersonName or string
 *
 * @param name - PersonName object or string
 * @returns PersonName object
 */
export function normalizePersonName(name: PersonName | string | undefined | null): PersonName | undefined {
  if (!name) {
    return undefined;
  }

  if (typeof name === 'string') {
    return parsePersonName(name);
  }

  return name;
}

/**
 * Check if a PersonName has any components
 *
 * @param name - The PersonName to check
 * @returns true if at least one name component exists
 */
export function isPersonNameEmpty(name: PersonName | undefined | null): boolean {
  if (!name) {
    return true;
  }

  const { givenName, familyName, middleName, namePrefix, nameSuffix, nickname } = name;
  return !givenName && !familyName && !middleName && !namePrefix && !nameSuffix && !nickname;
}

/**
 * Get initials from a PersonName
 *
 * @param name - The PersonName object
 * @returns Initials (e.g., "LS" for Leland Stanford)
 */
export function getPersonNameInitials(name: PersonName | undefined | null): string {
  if (!name) {
    return '';
  }

  const { givenName, familyName } = name;
  const givenInitial = givenName ? givenName.charAt(0).toUpperCase() : '';
  const familyInitial = familyName ? familyName.charAt(0).toUpperCase() : '';

  return `${givenInitial}${familyInitial}`;
}
