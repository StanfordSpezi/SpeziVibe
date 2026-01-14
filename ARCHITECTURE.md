# Architecture

## Tech Stack

React Native 0.81, Expo 54, TypeScript 5.9, Expo Router, Formik + Yup, AsyncStorage, AI SDK

## The Standard Pattern

Inspired by [Stanford Spezi](https://github.com/StanfordSpezi). The **Standard** is the central orchestrator that:
- Provides backend service (pluggable storage)
- Provides account service (authentication)
- Syncs user ID from AccountService → BackendService automatically

**Provider hierarchy** (order matters):
```
StandardProvider      → Initialize backend + accountService
  └─ SchedulerProvider  → Uses backend from Standard
      └─ AccountProvider  → Wraps accountService for React hooks
          └─ App
```

**Separation of concerns**:
- `AccountService` - Auth ONLY (login, register, logout, profile)
- `BackendService` - Data ONLY (tasks, outcomes, questionnaires)
- Never mix these. Standard coordinates via user ID sync.

## Backends

| Backend | Storage | Auth |
|---------|---------|------|
| Local | AsyncStorage | InMemoryAccountService |
| Firebase | Firestore | Firebase Auth |
| Medplum | FHIR R4 Server | Medplum Auth |

Backends are discovered from `features/*/manifest.json` with `category: "backend"`.

## Data Models

```typescript
interface Task {
  id: string;
  title: string;
  category: 'questionnaire' | 'task' | 'reminder' | 'measurement';
  schedule: { type: 'daily' | 'weekly' | 'monthly' | 'once'; ... };
  questionnaireId?: string;
}

interface Event {
  task: Task;
  occurrence: { date: Date; ... };
  outcome?: { completedAt: Date; data: any };
}
```

## Navigation

File-based routing with Expo Router. Auth guards use declarative `<Redirect />`:

```typescript
// In app/_layout.tsx
if (!onboardingComplete) return <Redirect href="/(onboarding)/welcome" />;
if (!signedIn) return <Redirect href="/(onboarding)/sign-in" />;
```

Route groups: `(onboarding)` for auth flow, `(tabs)` for main app.

## Required Patterns

**Cancellation tokens** in async effects:
```typescript
useEffect(() => {
  let cancelled = false;
  async function load() {
    const data = await fetch();
    if (!cancelled) setState(data);
  }
  load();
  return () => { cancelled = true };
}, []);
```

**Memoized context values**:
```typescript
const value = useMemo(() => ({ state, action }), [state, action]);
return <Context.Provider value={value}>{children}</Context.Provider>;
```

## Extension Points

**New task type**: Add to `TaskCategory` union in `packages/scheduler/src/types.ts`

**New feature**: Create `features/<name>/manifest.json` with dependencies, copyFiles, transforms

**New backend**: Create feature with `category: "backend"`, implement AccountService + BackendService interfaces
