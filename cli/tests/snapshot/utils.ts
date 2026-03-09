import fs from 'fs-extra';
import path from 'path';
import os from 'os';

/**
 * Recursively get all files in a directory
 */
async function getAllFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    // Skip node_modules and .git
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, baseDir)));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
}

/**
 * Create a snapshot of a generated project
 * Returns a deterministic representation of the project structure and key files
 */
export async function createProjectSnapshot(projectDir: string): Promise<ProjectSnapshot> {
  const files = await getAllFiles(projectDir);

  // Read content of key files for detailed comparison
  const keyFiles = [
    'package.json',
    'app.config.js',
    'app/_layout.tsx',
    'app/(tabs)/_layout.tsx',
    '.env.example',
    'HIPAA_CHECKLIST.md',
    'firestore.rules',
  ];

  const fileContents: Record<string, string> = {};

  for (const file of keyFiles) {
    const filePath = path.join(projectDir, file);
    if (await fs.pathExists(filePath)) {
      let content = await fs.readFile(filePath, 'utf-8');
      // Normalize for snapshot comparison
      content = normalizeContent(content);
      fileContents[file] = content;
    }
  }

  // Get list of packages
  const packagesDir = path.join(projectDir, 'packages');
  let packages: string[] = [];
  if (await fs.pathExists(packagesDir)) {
    packages = (await fs.readdir(packagesDir)).sort();
  }

  // Get list of tabs
  const tabsDir = path.join(projectDir, 'app', '(tabs)');
  let tabs: string[] = [];
  if (await fs.pathExists(tabsDir)) {
    tabs = (await fs.readdir(tabsDir))
      .filter((f) => f.endsWith('.tsx') && f !== '_layout.tsx')
      .map((f) => f.replace('.tsx', ''))
      .sort();
  }

  // Get list of route groups
  const appDir = path.join(projectDir, 'app');
  let routeGroups: string[] = [];
  if (await fs.pathExists(appDir)) {
    routeGroups = (await fs.readdir(appDir, { withFileTypes: true }))
      .filter((d) => d.isDirectory() && d.name.startsWith('('))
      .map((d) => d.name)
      .sort();
  }

  return {
    fileCount: files.length,
    files,
    packages,
    tabs,
    routeGroups,
    keyFiles: fileContents,
  };
}

/**
 * Normalize content for deterministic comparison
 */
function normalizeContent(content: string): string {
  return content
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    // Remove trailing whitespace
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Create a unique temp directory for test output
 */
export function createTempDir(testName: string): string {
  return path.join(os.tmpdir(), `spezivibe-test-${testName}-${Date.now()}`);
}

/**
 * Clean up a temp directory
 */
export async function cleanupTempDir(dir: string): Promise<void> {
  if (await fs.pathExists(dir)) {
    await fs.remove(dir);
  }
}

export interface ProjectSnapshot {
  fileCount: number;
  files: string[];
  packages: string[];
  tabs: string[];
  routeGroups: string[];
  keyFiles: Record<string, string>;
}
