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

### Platform
- **React Native (Expo)** - Cross-platform mobile app (default)
- **iOS (Swift + Spezi)** - Native iOS app

### Backend
- **Firebase** - Cloud storage with Firestore and Firebase Authentication
- **Medplum** - FHIR R4-compliant healthcare backend with [Medplum](https://medplum.com)
- **Local AsyncStorage** - Offline-first, no server required

When you select Firebase, you'll be prompted to enter your Firebase credentials. Leave them blank to use the Firebase Emulator for local development.

When you select Medplum, configure your `.env` file with your Medplum project credentials (see [Medplum Setup](#medplum-setup)).

### Features
- **Chat** - LLM-powered chat with AI providers (OpenAI, Anthropic, Google)
- **Scheduler** - Recurring tasks and reminders with local storage
- **Questionnaires** - FHIR R4-compliant dynamic forms

### LLM Providers (if Chat enabled)
- OpenAI (GPT-4o, o1)
- Anthropic (Claude)
- Google (Gemini)

## What You Get

When you select React Native (Expo), you get a customized app with:
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

### Medplum Setup

When you select the Medplum backend, configure your app for FHIR R4-compliant healthcare data:

1. Create a Medplum project at [app.medplum.com](https://app.medplum.com)
2. Create a Client Application (Project Admin → Clients)
3. Configure your `.env` file:

```bash
EXPO_PUBLIC_BACKEND_TYPE=medplum
EXPO_PUBLIC_MEDPLUM_BASE_URL=https://api.medplum.com/
EXPO_PUBLIC_MEDPLUM_CLIENT_ID=your-client-id
EXPO_PUBLIC_MEDPLUM_PROJECT_ID=your-project-id
```

See [`@spezivibe/medplum`](../packages/medplum/README.md) for full documentation.

## How It Works

The CLI uses a **plugin-based architecture** with discoverable features:

0. **Platform Generator** (`src/platforms/`) - Selects the target platform and runs its generator
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
  "dependencies": {},              // NPM dependencies (@spezivibe/* auto-copied)
  "scripts": {},                   // NPM scripts to add
  "copyDirs": [],                  // App-level directories to copy
  "copyFiles": [],                 // Files to copy (won't overwrite)
  "replaceFiles": [],              // Files to replace (will overwrite)
  "transforms": [],                // Code transforms with markers
  "envVars": {}                    // Environment variables
}
```

**Package Auto-Inference**: Dependencies starting with `@spezivibe/*` are automatically copied from `packages/` and added to workspaces. For example, `"@spezivibe/chat": "*"` will copy `packages/chat` to the generated project.

### Backend-Specific Files

Features can provide different versions of files for different backends:

```
features/scheduler/
├── app/(tabs)/schedule.tsx           # Default (local backend)
├── app/(tabs)/schedule.firebase.tsx  # Used when Firebase is selected
```

The generator picks `file.{backend}.tsx` when that backend is selected, falling back to `file.tsx` otherwise.

### Adding a New Backend

To add a new backend (e.g., Supabase), create `features/supabase/manifest.json`:

```json
{
  "name": "supabase",
  "category": "backend",
  "description": "PostgreSQL backend with Supabase",
  "autoIncludes": ["onboarding"],
  "dependencies": {
    "@spezivibe/account": "*",
    "@supabase/supabase-js": "^2.0.0"
  },
  "envVars": { "EXPO_PUBLIC_SUPABASE_URL": "", "EXPO_PUBLIC_SUPABASE_ANON_KEY": "" }
}
```

No CLI code changes needed - it's auto-discovered! The `@spezivibe/*` packages are automatically copied from `packages/`.

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
│   ├── platforms/      # Platform generators (React Native, Swift)
│   ├── types.ts        # TypeScript definitions
│   └── utils.ts        # Dependency checking, verification
└── tests/
    └── snapshot/       # Snapshot tests
        ├── generator.snapshot.test.ts
        └── utils.ts
```

## License

MIT
