# create-spezivibe-app

Create a customized SpeziVibe health app template with the features you need.

## Usage

```bash
npx create-spezivibe-app my-health-app
```

Or run without a project name to be prompted:

```bash
npx create-spezivibe-app
```

## Features

The CLI will prompt you to choose:

### Backend
- **Firebase** - Cloud storage with Firestore and Firebase Authentication
- **Local AsyncStorage** - Offline-first, no server required

When you select Firebase, you'll be prompted to enter your Firebase credentials. Leave them blank to use the Firebase Emulator for local development.

### Features
- **Chat** - LLM-powered chat with AI providers (OpenAI, Anthropic, Google)
- **Scheduler** - Recurring tasks and reminders with local storage
- **Questionnaires** - FHIR R4-compliant dynamic forms

### LLM Providers (if Chat enabled)
- OpenAI (GPT-4o, o1)
- Anthropic (Claude)
- Google (Gemini)

## What You Get

A customized Expo + React Native app with:
- Only the packages and features you selected
- Pre-configured `.env.example` and `.env` files
- Firebase Emulator configuration (if Firebase selected)
- Clean git history
- Ready to run with `npm install && npm start`

### Firebase Emulator Mode

When you select Firebase without providing credentials, the app automatically uses the Firebase Emulator:

```bash
cd my-health-app
npm install
npm run emulators  # Start Firebase Emulator (Terminal 1)
npm start          # Start Expo (Terminal 2)
```

No Firebase console setup needed for local development!

## How It Works

The CLI uses a **plugin-based architecture** with discoverable features:

1. **Base Template** (`template/`) - Core app structure with injection markers
2. **Feature Manifests** (`features/*/manifest.json`) - Declarative configuration for each feature
3. **Backend Plugins** - Features with `category: "backend"` are auto-discovered as backend options
4. **Package Copying** - Relevant `@spezivibe/*` packages from `packages/`

### Feature Manifest Schema

Each feature manifest can declare:

```json
{
  "name": "feature-name",
  "description": "Human-readable description",
  "category": "backend",           // "backend" or "feature" (default)
  "autoIncludes": ["onboarding"],  // Features to auto-add when selected
  "corePackages": ["account"],     // Packages to copy before other features
  "dependencies": {},              // NPM dependencies to add
  "scripts": {},                   // NPM scripts to add
  "workspaces": [],                // Workspace paths to add
  "copyDirs": [],                  // Directories to copy
  "copyFiles": [],                 // Files to copy (won't overwrite)
  "replaceFiles": [],              // Files to replace (will overwrite)
  "transforms": [],                // Code transforms with markers
  "envVars": {}                    // Environment variables
}
```

### Backend-Specific Files

Features can provide different versions of files for different backends:

```
features/scheduler/
├── app/(tabs)/schedule.tsx           # Default (local backend)
├── app/(tabs)/schedule.firebase.tsx  # Used when Firebase is selected
```

The generator picks `file.{backend}.tsx` when that backend is selected, falling back to `file.tsx` otherwise.

### Adding a New Backend

To add a new backend (e.g., Medplum), just create `features/medplum/`:

```json
{
  "name": "medplum",
  "category": "backend",
  "description": "FHIR-based healthcare backend",
  "autoIncludes": ["onboarding"],
  "corePackages": ["account"],
  "dependencies": { "@medplum/core": "^3.0.0" },
  "copyDirs": ["packages/medplum"],
  "envVars": { "EXPO_PUBLIC_MEDPLUM_BASE_URL": "" }
}
```

No CLI code changes needed - it's auto-discovered!

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/index.js my-test-app

# Run tests
npm test

# Update snapshots after intentional changes
npm run test:update
```

## Testing

The CLI uses snapshot testing to catch regressions in generated projects:

- **30 snapshot tests** covering 6 feature combinations
- Tests verify file structure and key file contents
- Run `npm run test:update` after making intentional changes to update snapshots

## Project Structure

```
cli/
├── src/
│   ├── index.ts        # CLI entry point
│   ├── generator.ts    # Project generation orchestrator
│   ├── prompts.ts      # Interactive prompts
│   ├── config.ts       # Feature discovery and configuration
│   ├── types.ts        # TypeScript definitions
│   └── utils.ts        # Dependency checking, verification
└── tests/
    └── snapshot/       # Snapshot tests
        ├── generator.snapshot.test.ts
        └── utils.ts
```

## License

MIT
