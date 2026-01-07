# Claude Code Instructions for SpeziVibe

## Project Summary

SpeziVibe is a **digital health app toolkit** for React Native/Expo with a CLI for project scaffolding. It consists of:

- **CLI** (`cli/`) - Generates customized Expo apps from templates
- **Packages** (`packages/`) - Reusable npm packages (`@spezivibe/*`)
- **Template** (`template/`) - Base app structure
- **Features** (`features/`) - Optional features merged during generation

## Quick Reference

```bash
# Run all tests (478 tests across 26 suites)
npm test

# Run tests for specific package
npm test --workspace=@spezivibe/account

# Update CLI snapshots
npm run test:update --workspace=create-spezivibe-app

# Generate a test app
cd cli && npm run build && node dist/index.js ../test-app
```

## Critical Patterns

### 1. Standard Pattern (ALWAYS follow this)

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

**Rules:**
- NEVER import backends directly - use `useStandard()`
- AccountService = authentication ONLY
- BackendService = data storage ONLY
- Standard syncs user ID between them automatically

### 2. Async Effects (ALWAYS use cancellation tokens)

```typescript
useEffect(() => {
  let cancelled = false;
  async function fetchData() {
    const data = await fetch();
    if (!cancelled) setState(data);
  }
  fetchData();
  return () => { cancelled = true };
}, [deps]);
```

### 3. Context Values (ALWAYS memoize)

```typescript
const value = useMemo(() => ({ state, action }), [state, action]);
const action = useCallback(async () => { ... }, [deps]);
```

### 4. Auth Guards (ALWAYS use declarative Redirect)

```typescript
// DO: Declarative in layout
if (!signedIn) return <Redirect href="/sign-in" />;

// DON'T: Imperative navigation
useEffect(() => { if (!signedIn) router.replace('/sign-in'); }, [signedIn]);
```

## Package Overview

| Package | Purpose | Tests |
|---------|---------|-------|
| `@spezivibe/account` | Auth & profile management | 122 |
| `@spezivibe/questionnaire` | FHIR R4 questionnaires | 111 |
| `@spezivibe/medplum` | Medplum FHIR backend | 55 |
| `@spezivibe/firebase` | Firebase backend | 47 |
| `@spezivibe/onboarding` | Onboarding flow | 46 |
| `@spezivibe/chat` | AI chat with LLM SDK | 44 |
| `@spezivibe/scheduler` | Task scheduling | 23 |
| `cli` | Project generator | 30 |

## Backend System

Three backends available:
- **Local** - AsyncStorage (default, no server)
- **Firebase** - Cloud auth + Firestore
- **Medplum** - FHIR R4 healthcare backend

Backends are discovered from `features/*/manifest.json` with `category: "backend"`.

## CLI Development

The CLI uses a plugin system - adding a new backend requires NO code changes:

1. Create `features/<backend>/manifest.json` with `category: "backend"`
2. Add required files to the feature directory
3. CLI auto-discovers it

### Manifest Fields

```json
{
  "name": "medplum",
  "category": "backend",
  "description": "FHIR-native healthcare backend",
  "autoIncludes": ["onboarding"],
  "dependencies": { "@medplum/core": "^4.3.6" },
  "envVars": { "EXPO_PUBLIC_MEDPLUM_BASE_URL": "" },
  "replaceFiles": ["lib/services/config.ts"],
  "copyDirs": ["components/account"]
}
```

## Key Files

| File | Purpose |
|------|---------|
| `cli/src/generator.ts` | Project generation logic |
| `cli/src/config.ts` | Backend discovery |
| `template/lib/services/standard-context.tsx` | Standard pattern |
| `packages/*/src/index.ts` | Package exports |

## Testing Requirements

**All 478 tests must pass before committing.**

For account-related tests, use `InMemoryAccountService`:
```typescript
const service = new InMemoryAccountService({ startUnauthenticated: true });
await service.initialize();
```

## What NOT to Do

- Don't add tests without running them
- Don't bypass Standard for data access
- Don't use imperative navigation for auth guards
- Don't add auth methods to BackendService
- Don't add data methods to AccountService
- Don't forget cancellation tokens in async effects
- Don't forget to memoize context values

## Commit Guidelines

1. Run `npm test` first
2. Use clear messages describing the "why"
3. Don't push unless asked
4. Don't use `--force` flags
