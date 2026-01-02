/**
 * CLI output formatting utilities
 * Inspired by Ignite CLI's pretty.ts
 */

import pc from 'picocolors';

// Terminal width for horizontal rules
const TERMINAL_WIDTH = Math.min(process.stdout.columns || 80, 80);

// Spinner frames for progress indication
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Print a blank line
 */
export function blank(): void {
  console.log('');
}

/**
 * Print an indented paragraph
 */
export function p(message = ''): void {
  console.log(`  ${message}`);
}

/**
 * Print a horizontal rule
 */
export function hr(): void {
  console.log(pc.dim('─'.repeat(TERMINAL_WIDTH)));
}

/**
 * Print a heading
 */
export function heading(text: string): void {
  console.log(pc.bold(pc.magenta(text)));
}

/**
 * Print a success message with checkmark
 */
export function success(message: string): void {
  console.log(`  ${pc.green('✓')} ${message}`);
}

/**
 * Print a warning message
 */
export function warning(message: string): void {
  console.log(`  ${pc.yellow('○')} ${message}`);
}

/**
 * Print an error message
 */
export function error(message: string): void {
  console.log(`  ${pc.red('✗')} ${message}`);
}

/**
 * Print a note (dimmed)
 */
export function note(message: string): void {
  console.log(`    ${pc.dim(message)}`);
}

/**
 * Print a command to run
 */
export function command(cmd: string, description?: string): void {
  if (description) {
    console.log(`  ${pc.cyan(cmd)}  ${pc.dim(description)}`);
  } else {
    console.log(`  ${pc.cyan(cmd)}`);
  }
}

/**
 * Format duration in human-readable form
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const mins = Math.floor(ms / 60000);
    const secs = Math.round((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }
}

/**
 * Print performance stats
 */
export function stats(label: string, duration: number): void {
  console.log(`  ${pc.dim(label)} ${pc.bold(formatDuration(duration))}`);
}

/**
 * Spinner class for showing progress
 */
export class Spinner {
  private message: string;
  private frameIndex = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private stream = process.stdout;

  constructor(message: string) {
    this.message = message;
  }

  start(): this {
    // Hide cursor
    this.stream.write('\x1B[?25l');
    this.render();
    this.intervalId = setInterval(() => this.render(), 80);
    return this;
  }

  private render(): void {
    const frame = SPINNER_FRAMES[this.frameIndex];
    this.stream.write(`\r  ${pc.magenta(frame)} ${this.message}`);
    this.frameIndex = (this.frameIndex + 1) % SPINNER_FRAMES.length;
  }

  private clear(): void {
    this.stream.write('\r' + ' '.repeat(this.message.length + 10) + '\r');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.clear();
    // Show cursor
    this.stream.write('\x1B[?25h');
  }

  succeed(message?: string): void {
    this.stop();
    success(message || this.message);
  }

  warn(message?: string): void {
    this.stop();
    warning(message || this.message);
  }

  fail(message?: string): void {
    this.stop();
    error(message || this.message);
  }

  update(message: string): void {
    this.message = message;
  }
}

/**
 * Create and start a spinner
 */
export function spin(message: string): Spinner {
  return new Spinner(message).start();
}

/**
 * Print the CLI name/version header
 */
export function cliHeader(name: string, version: string): void {
  console.log(`  ${pc.bold(name)} ${pc.dim(`v${version}`)}`);
}

/**
 * Print the reproducible CLI command
 */
export function printCommand(args: {
  projectName: string;
  backend: string;
  features: string[];
}): void {
  const parts = ['npx create-spezivibe-app', args.projectName];

  // Could add flags here for non-interactive mode in the future

  blank();
  p(pc.dim('To recreate this project:'));
  p(pc.cyan(parts.join(' ')));
}
