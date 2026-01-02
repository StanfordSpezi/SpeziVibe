# AI Development Guide for SpeziVibe

This guide is for AI development assistants (Claude, Copilot, Cursor, etc.) working on the SpeziVibe codebase.

## Quick Context

SpeziVibe is a **digital health app template** with a CLI tool for project scaffolding. It consists of:

- **CLI Tool** (`cli/`) - Generates customized projects from templates
- **Package Library** (`packages/`) - Reusable npm packages (`@spezivibe/*`)
- **Base Template** (`template/`) - Core app structure copied to new projects
- **Feature Overlays** (`features/`) - Optional features merged during generation

## Before Making Changes

1. **Read relevant files first** - Don't propose changes to code you haven't read
2. **Run tests** - `npm test` to verify current state
3. **Understand the architecture** - See `ARCHITECTURE.md` for system design
4. **Check existing patterns** - See `.cursorrules` for code conventions

## Testing Requirements

**All changes must pass 423 tests** before committing:

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=@spezivibe/account

# Update CLI snapshots after intentional changes
npm run test:update --workspace=create-spezivibe-app
```

## CLI Tool Development

### How the CLI Works

1. User runs `npx create-spezivibe-app my-app`
2. CLI discovers available backends from `features/*/manifest.json` (where `category: "backend"`)
3. CLI prompts for backend type, features, and (if applicable) backend credentials
4. Generator copies `template/` to output directory
5. Feature manifests apply code transforms, dependencies, scripts, and files
6. Selected packages copied from `packages/`
7. `.env` and `.env.example` files generated with user-provided values
8. Verification ensures generated app is complete

### Plugin-Based Backend System

Backends are **discovered automatically** from feature manifests with `category: "backend"`:

```json
{
  "name": "firebase",
  "category": "backend",
  "description": "Cloud auth + storage with Firebase",
  "autoIncludes": ["onboarding"],
  "corePackages": ["account"],
  "dependencies": { "firebase": "^12.7.0" },
  "scripts": { "emulators": "firebase emulators:start" },
  "copyFiles": ["firebase.json", ".firebaserc", "firestore.rules"],
  "envVars": {
    "EXPO_PUBLIC_FIREBASE_API_KEY": "",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID": ""
  }
}
```

**Adding a new backend requires no CLI code changes** - just create a feature directory with the right manifest fields.

### Feature Manifest Fields

| Field | Purpose |
|-------|---------|
| `name` | Feature identifier |
| `description` | Human-readable description |
| `category` | `"backend"` for backends, `"feature"` (default) for regular features |
| `autoIncludes` | Features to automatically add when this is selected |
| `corePackages` | Packages to copy before other features |
| `dependencies` | NPM dependencies to add to package.json |
| `scripts` | NPM scripts to add to package.json |
| `workspaces` | Workspace paths to add |
| `copyDirs` | Directories to copy |
| `copyFiles` | Files to copy (won't overwrite) |
| `replaceFiles` | Files to replace (will overwrite) |
| `transforms` | Code transforms with injection markers |
| `envVars` | Environment variables (empty string = prompt user) |

### Backend-Specific Files

Features can provide different file versions for different backends:

```
features/scheduler/
├── app/(tabs)/schedule.tsx           # Default (local)
├── app/(tabs)/schedule.firebase.tsx  # Used when Firebase selected
```

The generator picks `file.{backend}.tsx` when that backend is selected, otherwise uses `file.tsx`.

### Injection Markers

Template files contain markers where feature code is injected:

- `{/* __INJECT_TABS__ */}` - Tab screen entries in tabs layout
- `{/* __INJECT_STACK_SCREENS__ */}` - Stack screens in root layout

### After CLI Changes

Always run snapshot tests:
```bash
npm test --workspace=create-spezivibe-app
```

If changes are intentional, update snapshots:
```bash
npm run test:update --workspace=create-spezivibe-app
```

## Package Development

### Package Structure

Each package in `packages/` follows this structure:

```
packages/<name>/
├── src/
│   ├── index.ts          # Public exports
│   ├── types.ts          # TypeScript definitions
│   ├── components/       # React components
│   ├── services/         # Business logic
│   ├── hooks/            # React hooks
│   └── __tests__/        # Jest tests
├── package.json
└── tsconfig.json
```

### Creating Tests

Use Jest with React Native Testing Library:

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

For account-related tests, use `InMemoryAccountService`:

```typescript
import { InMemoryAccountService } from '../services/in-memory-account-service';

const service = new InMemoryAccountService({ startUnauthenticated: true });
await service.initialize();
await service.login({ email: 'test@example.com', password: 'password' });
```

## Architecture Patterns

### The Standard Pattern

All data flows through the Standard orchestrator:

```
StandardProvider → Backend + AccountService
    ↓
 SchedulerProvider → Uses backend from Standard
    ↓
AccountProvider → Wraps accountService for React
    ↓
App Components → Access via useStandard(), useScheduler(), useAccount()
```

**Never import backends directly** - always use `useStandard()`.

### Separation of Concerns

- **AccountService** - Authentication ONLY (login, register, logout, profile)
- **BackendService** - Data storage ONLY (tasks, outcomes, responses)
- **Standard** - Coordinates by syncing user ID between them

### Code Patterns

See `.cursorrules` for detailed patterns. Key ones:

1. **Cancellation tokens** in async effects
2. **Memoization** for context values
3. **Declarative redirects** for auth guards (not `router.replace()`)
4. **Cleanup functions** for subscriptions

## Common Tasks

### Adding a New Package Feature

1. Add types to `packages/<pkg>/src/types.ts`
2. Implement logic in `packages/<pkg>/src/services/`
3. Add tests in `packages/<pkg>/src/__tests__/`
4. Export from `packages/<pkg>/src/index.ts`
5. Run `npm test --workspace=@spezivibe/<pkg>`

### Adding a New CLI Feature

1. Add feature directory: `features/<name>/`
2. Create `manifest.json` with dependencies, scripts, and transforms
3. Add any app files to `features/<name>/app/`
4. Add injection marker to template files if needed
5. Run `npm run test:update --workspace=create-spezivibe-app`

### Adding a New Backend

1. Create feature directory: `features/<backend-name>/`
2. Create `manifest.json` with `category: "backend"`
3. Add `autoIncludes`, `corePackages`, `envVars` as needed
4. Add required files (config, app overrides)
5. CLI will auto-discover it - no code changes needed!

### Fixing a Bug

1. Read the relevant code first
2. Write a failing test that reproduces the bug
3. Fix the bug
4. Verify test passes: `npm test`
5. Run all tests to check for regressions

## Files to Know

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | System design and patterns |
| `.cursorrules` | Code style and conventions |
| `cli/src/generator.ts` | Project generation logic |
| `cli/src/config.ts` | Backend discovery, feature configuration |
| `cli/src/types.ts` | CLI type definitions (including FeatureManifest) |
| `template/app/_layout.tsx` | Root app layout with providers |
| `template/lib/services/standard-context.tsx` | Standard pattern implementation |

## What NOT to Do

- Don't add tests without running them
- Don't modify `.cursorrules` without discussion
- Don't add dependencies without checking bundle size impact
- Don't bypass the Standard pattern for data access
- Don't use imperative navigation for auth guards
- Don't duplicate constants - import from `lib/constants.ts`
- Don't mix authentication and data storage concerns
- Don't hardcode backend types - use the plugin system

## Commit Guidelines

When asked to commit:

1. Run `npm test` to verify all tests pass
2. Use clear commit messages describing the "why"
3. Don't push unless explicitly asked
4. Don't use `--force` flags unless explicitly asked
