# Platform Generators

The CLI supports multiple platforms through the `PlatformGenerator` interface. Each platform provides its own project generation logic, backend options, and feature sets.

## Architecture

```
platforms/
  types.ts              # PlatformGenerator interface
  registry.ts           # Platform discovery and registration
  react-native/
    index.ts            # ReactNativePlatformGenerator
    config.ts           # RN-specific features, LLM providers
    prompts.ts          # RN-specific prompts (LLM keys, env vars)
  swift/
    index.ts            # SwiftPlatformGenerator (stub)
```

## Adding a New Platform

1. Create a directory under `platforms/` (e.g., `platforms/android/`)

2. Implement the `PlatformGenerator` interface:

```typescript
// platforms/android/index.ts
import type { PlatformGenerator, GenerationOptions, GenerationResult, BackendOption, FeatureOption } from '../types.js';

export class AndroidPlatformGenerator implements PlatformGenerator {
  readonly id = 'android';
  readonly name = 'Android (Kotlin)';
  readonly description = 'Native Android app with Kotlin and Jetpack Compose';

  async getBackends(): Promise<BackendOption[]> {
    return [
      { value: 'local', name: 'Local (Room)', description: 'On-device persistence' },
    ];
  }

  async getFeatures(): Promise<FeatureOption[]> {
    return [
      { value: 'scheduler', name: 'Scheduler', description: 'Task scheduling', defaultChecked: true },
    ];
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    // Your generation logic here
    // Use shared utilities: file-ops.ts, source.ts, validation.ts, pretty.ts
  }

  getNextSteps(options: GenerationOptions): string[] {
    return [`cd ${options.outputDir}`, './gradlew build'];
  }
}
```

3. Register in `registry.ts`:

```typescript
import { AndroidPlatformGenerator } from './android/index.js';

const platforms: PlatformGenerator[] = [
  new ReactNativePlatformGenerator(),
  new SwiftPlatformGenerator(),
  new AndroidPlatformGenerator(),  // Add here
];
```

4. If the platform is not yet ready, filter it out in `getReadyPlatforms()`.

## Shared Utilities

Platform generators can reuse these shared modules:

| Module | Purpose |
|--------|---------|
| `file-ops.ts` | Copy files, directories, feature files |
| `source.ts` | Resolve template/feature paths (local or GitHub) |
| `validation.ts` | Validate feature manifests and selections |
| `pretty.ts` | Spinners, colored output, formatting |
| `config.ts` | Backend discovery, injection markers |
| `utils.ts` | Dependency checking, npm install, verification |

## Platform Selection Flow

The CLI automatically handles platform selection:

1. If only one platform is ready, it's auto-selected (no prompt)
2. If multiple platforms are ready, the user is prompted to choose
3. The selected platform's `getBackends()` and `getFeatures()` drive the remaining prompts
4. Generation delegates to the platform's `generate()` method
