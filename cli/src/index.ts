#!/usr/bin/env node

import path from 'path';
import pc from 'picocolors';
import { runPrompts, askInstallDependencies, askLaunchApp, askBuildForIOS } from './prompts.js';
import { generateProject, printNextSteps } from './generator.js';
import { checkDependencies, runNpmInstall, verifyProject, launchApp, buildIOSApp } from './utils.js';
import { blank, p, spin, note } from './pretty.js';

const BANNER = `
  ${pc.bold(pc.red('███████╗'))}${pc.bold(pc.magenta('██████╗ '))}${pc.bold(pc.red('███████╗'))}${pc.bold(pc.magenta('███████╗'))}${pc.bold(pc.red('██╗'))}${pc.bold(pc.magenta('██╗   ██╗'))}${pc.bold(pc.red('██╗'))}${pc.bold(pc.magenta('██████╗ '))}${pc.bold(pc.red('███████╗'))}
  ${pc.bold(pc.red('██╔════╝'))}${pc.bold(pc.magenta('██╔══██╗'))}${pc.bold(pc.red('██╔════╝'))}${pc.bold(pc.magenta('╚══███╔╝'))}${pc.bold(pc.red('██║'))}${pc.bold(pc.magenta('██║   ██║'))}${pc.bold(pc.red('██║'))}${pc.bold(pc.magenta('██╔══██╗'))}${pc.bold(pc.red('██╔════╝'))}
  ${pc.bold(pc.red('███████╗'))}${pc.bold(pc.magenta('██████╔╝'))}${pc.bold(pc.red('█████╗  '))}${pc.bold(pc.magenta('  ███╔╝ '))}${pc.bold(pc.red('██║'))}${pc.bold(pc.magenta('██║   ██║'))}${pc.bold(pc.red('██║'))}${pc.bold(pc.magenta('██████╔╝'))}${pc.bold(pc.red('█████╗  '))}
  ${pc.bold(pc.red('╚════██║'))}${pc.bold(pc.magenta('██╔═══╝ '))}${pc.bold(pc.red('██╔══╝  '))}${pc.bold(pc.magenta(' ███╔╝  '))}${pc.bold(pc.red('██║'))}${pc.bold(pc.magenta('╚██╗ ██╔╝'))}${pc.bold(pc.red('██║'))}${pc.bold(pc.magenta('██╔══██╗'))}${pc.bold(pc.red('██╔══╝  '))}
  ${pc.bold(pc.red('███████║'))}${pc.bold(pc.magenta('██║     '))}${pc.bold(pc.red('███████╗'))}${pc.bold(pc.magenta('███████╗'))}${pc.bold(pc.red('██║'))}${pc.bold(pc.magenta(' ╚████╔╝ '))}${pc.bold(pc.red('██║'))}${pc.bold(pc.magenta('██████╔╝'))}${pc.bold(pc.red('███████╗'))}
  ${pc.bold(pc.red('╚══════╝'))}${pc.bold(pc.magenta('╚═╝     '))}${pc.bold(pc.red('╚══════╝'))}${pc.bold(pc.magenta('╚══════╝'))}${pc.bold(pc.red('╚═╝'))}${pc.bold(pc.magenta('  ╚═══╝  '))}${pc.bold(pc.red('╚═╝'))}${pc.bold(pc.magenta('╚═════╝ '))}${pc.bold(pc.red('╚══════╝'))}

  ${pc.bold('Digital Health App Template Generator')} ${pc.dim('powered by Stanford Spezi')}
`;

async function main(): Promise<void> {
  console.log(BANNER);

  // Get project name from CLI args
  const args = process.argv.slice(2);
  const projectName = args[0];

  // Handle help flag
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  // Check for skip-install flag
  const skipInstall = args.includes('--skip-install');

  // Check dependencies first
  if (!checkDependencies()) {
    process.exit(1);
  }

  try {
    // Run interactive prompts (includes platform selection)
    const { options, platformId } = await runPrompts(projectName);

    // Generate project using selected platform
    await generateProject(options, platformId);

    // Post-generation flow: npm install, verification, and Expo launch/build
    // only apply to React Native projects
    if (platformId === 'react-native') {
      // Ask to install dependencies (unless skipped via flag)
      const projectDir = path.resolve(options.outputDir);
      let dependenciesInstalled = false;
      if (!skipInstall) {
        const shouldInstall = await askInstallDependencies();
        if (shouldInstall) {
          dependenciesInstalled = await runNpmInstall(projectDir);

          // Verify project compiles after npm install
          if (dependenciesInstalled) {
            const spinner = spin('Verifying project...');
            const verification = await verifyProject(projectDir);
            if (verification.success) {
              spinner.succeed('Project compiles successfully');
            } else {
              spinner.warn('TypeScript verification had issues');
              for (const err of verification.errors.slice(0, 5)) {
                note(err);
              }
              if (verification.errors.length > 5) {
                note(`... and ${verification.errors.length - 5} more`);
              }
            }
          }
        }
      }

      // Check if HealthKit was selected - offer to build for iOS
      const hasHealthKit = options.features.includes('healthkit');
      let iOSBuildStarted = false;

      if (hasHealthKit && dependenciesInstalled) {
        blank();
        note('HealthKit requires a custom iOS build (it won\'t work in Expo Go)');

        const buildChoice = await askBuildForIOS();
        if (buildChoice !== 'skip') {
          iOSBuildStarted = true;
          await buildIOSApp(projectDir, buildChoice);
          // After iOS build, we're done - the app should be running
          return;
        }
      }

      // Ask to launch app (only if dependencies were installed and not building iOS)
      if (dependenciesInstalled && !iOSBuildStarted) {
        const shouldLaunch = await askLaunchApp();
        if (shouldLaunch) {
          if (hasHealthKit) {
            // Warn that Expo Go won't work with HealthKit
            note('Note: HealthKit won\'t work in Expo Go. Use "npx expo run:ios" for HealthKit testing.');
          }
          launchApp(projectDir);
          return; // Don't print next steps, we're launching
        }
      }

      // Print next steps
      printNextSteps(options, dependenciesInstalled, platformId);
    } else {
      // Non-React-Native platforms (e.g., Swift): skip straight to next steps
      printNextSteps(options, false, platformId);
    }
  } catch (err) {
    if (err instanceof Error) {
      // Handle user cancellation (Ctrl+C)
      if (err.message.includes('User force closed')) {
        blank();
        p(pc.yellow('Cancelled.'));
        process.exit(0);
      }

      p(pc.red(`Error: ${err.message}`));
      process.exit(1);
    }
    throw err;
  }
}

function printHelp(): void {
  console.log(`
${pc.bold('Usage:')}
  npx create-spezivibe-app [project-name] [options]

${pc.bold('Options:')}
  -h, --help        Show this help message
  --skip-install    Skip automatic dependency installation

${pc.bold('Examples:')}
  npx create-spezivibe-app my-health-app
  npx create-spezivibe-app my-health-app --skip-install
  npx create-spezivibe-app

${pc.bold('Features:')}
  - Select platform: React Native (Expo), iOS (Swift + Spezi)
  - Choose your backend (Firebase, Medplum, or Local AsyncStorage)
  - Select features: Chat, Scheduler, Questionnaires, HealthKit
  - Pick LLM providers: OpenAI, Anthropic, Google
`);
}

main();
