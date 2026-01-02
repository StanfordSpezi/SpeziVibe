/**
 * File operations helper module
 * Centralizes all file copy/move operations for consistency
 */

import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';

// ============================================================================
// Constants
// ============================================================================

/** Files/directories to exclude from all copy operations */
const DEFAULT_EXCLUDES = ['node_modules', '.gitkeep'];

/** Default copy filter that excludes node_modules and .gitkeep */
export function defaultCopyFilter(src: string): boolean {
  const basename = path.basename(src);
  return !DEFAULT_EXCLUDES.includes(basename);
}

// ============================================================================
// Core Copy Operations
// ============================================================================

export interface CopyOptions {
  /** Whether to overwrite existing files (default: true) */
  overwrite?: boolean;
  /** Custom filter function */
  filter?: (src: string) => boolean;
}

/**
 * Copy a file or directory from source to destination
 * Automatically creates parent directories and applies default exclusions
 */
export async function copyPath(
  src: string,
  dest: string,
  options: CopyOptions = {}
): Promise<boolean> {
  const { overwrite = true, filter = defaultCopyFilter } = options;

  if (!(await fs.pathExists(src))) {
    return false;
  }

  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest, { overwrite, filter });
  return true;
}

/**
 * Copy multiple files/directories with the same options
 * Returns the number of successful copies
 */
export async function copyPaths(
  items: Array<{ src: string; dest: string }>,
  options: CopyOptions = {}
): Promise<number> {
  let copied = 0;
  for (const { src, dest } of items) {
    if (await copyPath(src, dest, options)) {
      copied++;
    }
  }
  return copied;
}

// ============================================================================
// Feature-Specific Operations
// ============================================================================

export interface FeatureCopyContext {
  /** The feature's source directory */
  featureDir: string;
  /** The target project directory */
  projectDir: string;
  /** The selected backend (for picking backend-specific file variants) */
  backend?: string;
}

/**
 * Get backend-specific file path if it exists
 * e.g., "schedule.tsx" -> "schedule.firebase.tsx" when backend is "firebase"
 */
function getBackendSpecificPath(filePath: string, backend: string): string {
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  return `${base}.${backend}${ext}`;
}

/**
 * Copy a file or directory from a feature to the project
 * If backend is specified, checks for backend-specific version first
 * e.g., with backend="firebase", looks for "file.firebase.tsx" before "file.tsx"
 * @param ctx - Feature copy context
 * @param relativePath - Path relative to both feature and project directories
 * @param options - Copy options
 */
export async function copyFromFeature(
  ctx: FeatureCopyContext,
  relativePath: string,
  options: CopyOptions = {}
): Promise<boolean> {
  let src = path.join(ctx.featureDir, relativePath);
  const dest = path.join(ctx.projectDir, relativePath);

  // Check for backend-specific version (e.g., file.firebase.tsx)
  if (ctx.backend && ctx.backend !== 'local') {
    const backendPath = getBackendSpecificPath(relativePath, ctx.backend);
    const backendSrc = path.join(ctx.featureDir, backendPath);
    if (await fs.pathExists(backendSrc)) {
      src = backendSrc;
    }
  }

  return copyPath(src, dest, options);
}

/**
 * Copy a file from a source directory to a destination path in the project
 * Used for combination overrides where source file name differs from dest
 * @param ctx - Feature copy context
 * @param sourceDir - Directory containing the source file
 * @param destPath - Destination path relative to project
 */
export async function copyFileToProject(
  sourceDir: string,
  fileName: string,
  projectDir: string,
  destPath: string,
  options: CopyOptions = {}
): Promise<boolean> {
  const src = path.join(sourceDir, fileName);
  const dest = path.join(projectDir, destPath);
  return copyPath(src, dest, options);
}

/**
 * Copy multiple files from a feature to the project
 * @param ctx - Feature copy context
 * @param relativePaths - Paths relative to both feature and project directories
 * @param options - Copy options (overwrite defaults based on operation type)
 */
export async function copyFilesFromFeature(
  ctx: FeatureCopyContext,
  relativePaths: string[],
  options: CopyOptions = {}
): Promise<number> {
  let copied = 0;
  for (const relativePath of relativePaths) {
    if (await copyFromFeature(ctx, relativePath, options)) {
      copied++;
    }
  }
  return copied;
}

// ============================================================================
// Package Operations
// ============================================================================

/**
 * Copy a package from the packages directory to the project
 */
export async function copyPackageToProject(
  packagesDir: string,
  packageName: string,
  projectDir: string
): Promise<boolean> {
  const src = path.join(packagesDir, packageName);
  const dest = path.join(projectDir, 'packages', packageName);

  if (!(await fs.pathExists(src))) {
    console.warn(pc.yellow(`  Warning: Package ${packageName} not found at ${src}`));
    return false;
  }

  await fs.copy(src, dest, {
    filter: (srcPath) => !srcPath.includes('node_modules'),
  });
  return true;
}

// ============================================================================
// Template Operations
// ============================================================================

/**
 * Copy the base template to the project directory
 */
export async function copyTemplate(
  templateDir: string,
  projectDir: string
): Promise<void> {
  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`Template not found at ${templateDir}`);
  }

  await fs.copy(templateDir, projectDir, {
    filter: defaultCopyFilter,
  });
}
