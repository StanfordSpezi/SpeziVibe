/**
 * Manifest and feature validation module
 * Validates manifests, feature dependencies, and conflicts
 */

import type { FeatureManifest } from './types.js';
import { isValidMarker, MARKERS } from './config.js';

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  feature?: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// Manifest Validation
// ============================================================================

/**
 * Validate a single feature manifest
 */
export function validateManifest(
  manifest: FeatureManifest,
  featureName: string
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!manifest.name) {
    errors.push({
      type: 'error',
      message: 'Missing required field: name',
      feature: featureName,
      field: 'name',
    });
  }

  if (!manifest.description) {
    warnings.push({
      type: 'warning',
      message: 'Missing description field',
      feature: featureName,
      field: 'description',
    });
  }

  // Validate name matches directory
  if (manifest.name && manifest.name !== featureName) {
    warnings.push({
      type: 'warning',
      message: `Manifest name "${manifest.name}" does not match directory "${featureName}"`,
      feature: featureName,
      field: 'name',
    });
  }

  // Validate transforms reference known markers
  if (manifest.transforms) {
    for (const transform of manifest.transforms) {
      if (!isValidMarker(transform.marker)) {
        warnings.push({
          type: 'warning',
          message: `Transform references unknown marker "${transform.marker}". Known markers: ${MARKERS.map(m => m.name).join(', ')}`,
          feature: featureName,
          field: 'transforms',
        });
      }

      if (!transform.file) {
        errors.push({
          type: 'error',
          message: 'Transform missing required field: file',
          feature: featureName,
          field: 'transforms',
        });
      }

      if (!transform.content) {
        errors.push({
          type: 'error',
          message: 'Transform missing required field: content',
          feature: featureName,
          field: 'transforms',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Feature Dependency Validation
// ============================================================================

/**
 * Validate feature dependencies and conflicts
 * Returns missing dependencies and conflicting features
 */
export function validateFeatureSelection(
  selectedFeatures: string[],
  manifests: Map<string, FeatureManifest>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const featureSet = new Set(selectedFeatures);

  for (const featureName of selectedFeatures) {
    const manifest = manifests.get(featureName);
    if (!manifest) continue;

    // Check required features
    if (manifest.requires) {
      for (const required of manifest.requires) {
        if (!featureSet.has(required)) {
          errors.push({
            type: 'error',
            message: `Feature "${featureName}" requires "${required}" which is not selected`,
            feature: featureName,
            field: 'requires',
          });
        }
      }
    }

    // Check conflicting features
    if (manifest.conflicts) {
      for (const conflict of manifest.conflicts) {
        if (featureSet.has(conflict)) {
          errors.push({
            type: 'error',
            message: `Feature "${featureName}" conflicts with "${conflict}"`,
            feature: featureName,
            field: 'conflicts',
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get missing dependencies for selected features
 * Returns features that should be auto-added
 */
export function getMissingDependencies(
  selectedFeatures: string[],
  manifests: Map<string, FeatureManifest>
): string[] {
  const featureSet = new Set(selectedFeatures);
  const missing: string[] = [];

  for (const featureName of selectedFeatures) {
    const manifest = manifests.get(featureName);
    if (!manifest?.requires) continue;

    for (const required of manifest.requires) {
      if (!featureSet.has(required) && !missing.includes(required)) {
        missing.push(required);
      }
    }
  }

  return missing;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Format validation results for console output
 */
export function formatValidationResults(results: ValidationResult[]): string[] {
  const lines: string[] = [];

  for (const result of results) {
    for (const error of result.errors) {
      lines.push(`ERROR: ${error.message}${error.feature ? ` (${error.feature})` : ''}`);
    }
    for (const warning of result.warnings) {
      lines.push(`WARNING: ${warning.message}${warning.feature ? ` (${warning.feature})` : ''}`);
    }
  }

  return lines;
}

/**
 * Combine multiple validation results
 */
export function combineResults(...results: ValidationResult[]): ValidationResult {
  return {
    valid: results.every((r) => r.valid),
    errors: results.flatMap((r) => r.errors),
    warnings: results.flatMap((r) => r.warnings),
  };
}
