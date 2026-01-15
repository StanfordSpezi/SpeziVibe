/**
 * Source resolver for template files
 * Handles both local development (files in repo) and npm install (download from GitHub)
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { downloadTemplate } from 'giget';
import { spin } from './pretty.js';
import type { SourcePaths } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub repo for downloading templates
const GITHUB_REPO = 'github:StanfordSpezi/SpeziVibe';

// Cache directory for downloaded templates
const CACHE_DIR = path.join(os.homedir(), '.cache', 'spezivibe');

export type { SourcePaths };

/**
 * Check if we're running from the local repo (development mode)
 */
async function isLocalRepo(): Promise<boolean> {
  // When running from repo: cli/dist/source.js -> cli/dist -> cli -> repo root
  const repoRoot = path.join(__dirname, '..', '..');
  const templateDir = path.join(repoRoot, 'template');
  return fs.pathExists(templateDir);
}

/**
 * Get paths when running from local repo
 */
function getLocalPaths(): SourcePaths {
  const repoRoot = path.join(__dirname, '..', '..');
  return {
    templateDir: path.join(repoRoot, 'template'),
    featuresDir: path.join(repoRoot, 'features'),
    packagesDir: path.join(repoRoot, 'packages'),
  };
}

/**
 * Download template from GitHub using giget
 */
async function downloadFromGitHub(): Promise<SourcePaths> {
  const spinner = spin('Downloading template from GitHub...');

  // Use a timestamped cache dir to ensure fresh downloads
  // But also check if we have a recent cache (within 1 hour)
  const cacheMarker = path.join(CACHE_DIR, '.cache-time');
  let useCache = false;

  if (await fs.pathExists(cacheMarker)) {
    const cacheTime = await fs.readFile(cacheMarker, 'utf-8');
    const cacheAge = Date.now() - parseInt(cacheTime, 10);
    const oneHour = 60 * 60 * 1000;
    useCache = cacheAge < oneHour;
  }

  if (useCache && await fs.pathExists(path.join(CACHE_DIR, 'template'))) {
    spinner.succeed('Using cached template');
    return {
      templateDir: path.join(CACHE_DIR, 'template'),
      featuresDir: path.join(CACHE_DIR, 'features'),
      packagesDir: path.join(CACHE_DIR, 'packages'),
    };
  }

  // Clear old cache
  await fs.remove(CACHE_DIR);
  await fs.ensureDir(CACHE_DIR);

  try {
    // Download template directory
    await downloadTemplate(`${GITHUB_REPO}/template`, {
      dir: path.join(CACHE_DIR, 'template'),
      force: true,
    });

    // Download features directory
    await downloadTemplate(`${GITHUB_REPO}/features`, {
      dir: path.join(CACHE_DIR, 'features'),
      force: true,
    });

    // Download packages directory
    await downloadTemplate(`${GITHUB_REPO}/packages`, {
      dir: path.join(CACHE_DIR, 'packages'),
      force: true,
    });

    // Write cache timestamp
    await fs.writeFile(cacheMarker, Date.now().toString());

    spinner.succeed('Downloaded template from GitHub');

    return {
      templateDir: path.join(CACHE_DIR, 'template'),
      featuresDir: path.join(CACHE_DIR, 'features'),
      packagesDir: path.join(CACHE_DIR, 'packages'),
    };
  } catch (error) {
    spinner.fail('Failed to download template');
    throw new Error(
      `Failed to download template from GitHub. Please check your internet connection.\n${error}`
    );
  }
}

/**
 * Resolve source paths - uses local files if available, otherwise downloads from GitHub
 */
export async function resolveSourcePaths(): Promise<SourcePaths> {
  if (await isLocalRepo()) {
    return getLocalPaths();
  }

  return downloadFromGitHub();
}

/**
 * Clear the template cache
 */
export async function clearCache(): Promise<void> {
  await fs.remove(CACHE_DIR);
}
