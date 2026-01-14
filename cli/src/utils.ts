import { execSync, spawn } from 'child_process';
import pc from 'picocolors';
import { DEPENDENCY_REQUIREMENTS, type DependencyRequirement } from './config.js';

/**
 * Compare semantic versions
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }
  return 0;
}

/**
 * Check if a command exists and get its version
 */
function checkCommand(dep: DependencyRequirement): { exists: boolean; version?: string; meetsMinVersion?: boolean } {
  try {
    const output = execSync(`${dep.command} ${dep.versionArg}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const version = dep.extractVersion ? dep.extractVersion(output) : output.trim();
    const meetsMinVersion = dep.minVersion
      ? compareVersions(version, dep.minVersion) >= 0
      : true;

    return { exists: true, version, meetsMinVersion };
  } catch {
    return { exists: false };
  }
}

/**
 * Check all required dependencies before running the CLI
 * Returns true if all required dependencies are met
 */
export function checkDependencies(): boolean {
  console.log(pc.dim('Checking dependencies...\n'));

  let allPassed = true;
  const warnings: string[] = [];

  for (const dep of DEPENDENCY_REQUIREMENTS) {
    const result = checkCommand(dep);

    if (!result.exists) {
      if (dep.required) {
        console.log(`  ${pc.red('✗')} ${dep.name} - ${pc.red('not found')}`);
        allPassed = false;
      } else {
        console.log(`  ${pc.yellow('○')} ${dep.name} - ${pc.yellow('not found (optional)')}`);
        warnings.push(`${dep.name} is not installed. Some features may not work.`);
      }
    } else if (dep.minVersion && !result.meetsMinVersion) {
      if (dep.required) {
        console.log(
          `  ${pc.red('✗')} ${dep.name} ${pc.dim(`v${result.version}`)} - ${pc.red(`requires v${dep.minVersion}+`)}`
        );
        allPassed = false;
      } else {
        console.log(
          `  ${pc.yellow('○')} ${dep.name} ${pc.dim(`v${result.version}`)} - ${pc.yellow(`recommend v${dep.minVersion}+`)}`
        );
      }
    } else {
      console.log(`  ${pc.green('✓')} ${dep.name} ${pc.dim(`v${result.version}`)}`);
    }
  }

  console.log('');

  if (!allPassed) {
    console.log(pc.red('Missing required dependencies. Please install them and try again.\n'));
    console.log(pc.dim('Installation instructions:'));
    console.log(pc.dim('  Node.js & npm: https://nodejs.org/'));
    console.log('');
    return false;
  }

  if (warnings.length > 0) {
    for (const warning of warnings) {
      console.log(pc.yellow(`Warning: ${warning}`));
    }
    console.log('');
  }

  return true;
}

/**
 * Verify the generated project compiles without errors
 */
export async function verifyProject(projectDir: string): Promise<{ success: boolean; errors: string[] }> {
  return new Promise((resolve) => {
    const errors: string[] = [];

    // Run TypeScript compiler in noEmit mode
    const tscProcess = spawn('npx', ['tsc', '--noEmit', '--skipLibCheck'], {
      cwd: projectDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    tscProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString().trim();
      if (output) {
        errors.push(output);
      }
    });

    tscProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString().trim();
      if (output && !output.includes('npm warn')) {
        errors.push(output);
      }
    });

    tscProcess.on('close', (code) => {
      resolve({
        success: code === 0,
        errors,
      });
    });

    tscProcess.on('error', (err) => {
      errors.push(`Failed to run tsc: ${err.message}`);
      resolve({ success: false, errors });
    });
  });
}

/**
 * Check if git is configured with user name and email
 */
export function checkGitConfig(): { configured: boolean; missing: string[] } {
  const missing: string[] = [];

  try {
    execSync('git config user.name', { stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    missing.push('user.name');
  }

  try {
    execSync('git config user.email', { stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    missing.push('user.email');
  }

  return {
    configured: missing.length === 0,
    missing,
  };
}

/**
 * Run npm install in the project directory with full output
 */
export async function runNpmInstall(projectDir: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('');
    console.log(pc.magenta('Installing dependencies...'));
    console.log(pc.dim('This may take a few minutes.\n'));

    const npmProcess = spawn('npm', ['install'], {
      cwd: projectDir,
      stdio: 'inherit', // Show all npm output directly
      shell: true,
    });

    npmProcess.on('close', (code) => {
      console.log('');

      if (code === 0) {
        console.log(`  ${pc.green('✓')} Dependencies installed successfully`);
        resolve(true);
      } else {
        console.log(`  ${pc.red('✗')} Failed to install dependencies (exit code: ${code})`);
        console.log('');
        console.log(pc.yellow('Troubleshooting tips:'));
        console.log(pc.dim('  1. Check that you have a valid npm registry connection'));
        console.log(pc.dim('  2. Try running "npm install" manually to see full errors'));
        console.log(pc.dim('  3. Check for any npm authentication issues'));
        resolve(false);
      }
    });

    npmProcess.on('error', (err) => {
      console.log(`  ${pc.red('✗')} Failed to start npm: ${err.message}`);
      console.log(pc.dim('  Make sure npm is installed and in your PATH.'));
      resolve(false);
    });
  });
}

/**
 * Launch the app with npm start
 * This hands off control to the Expo dev server
 */
export function launchApp(projectDir: string): void {
  console.log('');
  console.log(pc.magenta('Launching app...'));
  console.log('');

  const npmProcess = spawn('npm', ['start'], {
    cwd: projectDir,
    stdio: 'inherit',
    shell: true,
  });

  npmProcess.on('error', (err) => {
    console.log(`  ${pc.red('✗')} Failed to launch app: ${err.message}`);
  });
}

/**
 * Build iOS app for HealthKit support
 * Runs expo prebuild and expo run:ios
 */
export async function buildIOSApp(
  projectDir: string,
  target: 'simulator' | 'device'
): Promise<boolean> {
  console.log('');
  console.log(pc.magenta('Building iOS app...'));
  console.log(pc.dim('This may take several minutes on first build.\n'));

  // Step 1: Run expo prebuild
  console.log(pc.cyan('Step 1/2: Creating native iOS project...'));
  const prebuildSuccess = await runCommand(projectDir, 'npx', ['expo', 'prebuild', '--platform', 'ios']);

  if (!prebuildSuccess) {
    console.log(`  ${pc.red('✗')} Failed to create native iOS project`);
    console.log(pc.dim('  Try running manually: npx expo prebuild --platform ios'));
    return false;
  }
  console.log(`  ${pc.green('✓')} Native iOS project created`);

  // Step 2: Run expo run:ios
  console.log('');
  console.log(pc.cyan('Step 2/2: Building and running iOS app...'));

  const runArgs = ['expo', 'run:ios'];
  if (target === 'device') {
    runArgs.push('--device');
  }

  // This hands off to the build process
  console.log(pc.dim(`  Running: npx ${runArgs.join(' ')}\n`));

  const buildProcess = spawn('npx', runArgs, {
    cwd: projectDir,
    stdio: 'inherit',
    shell: true,
  });

  return new Promise((resolve) => {
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('');
        console.log(`  ${pc.green('✓')} iOS build complete`);
        resolve(true);
      } else {
        console.log('');
        console.log(`  ${pc.yellow('!')} Build process exited with code ${code}`);
        console.log(pc.dim('  This may be normal if you cancelled the build.'));
        resolve(false);
      }
    });

    buildProcess.on('error', (err) => {
      console.log(`  ${pc.red('✗')} Failed to start build: ${err.message}`);
      resolve(false);
    });
  });
}

/**
 * Helper to run a command and wait for completion
 */
function runCommand(cwd: string, command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}
