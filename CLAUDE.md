# AI Coding Instructions

## Project Structure

```
cli/           → CLI tool (npx create-spezivibe-app)
packages/      → @spezivibe/* npm packages
template/      → Base app copied to new projects
features/      → Optional features merged during generation
```

## Commands

```bash
npm test                                              # Run all tests (must pass)
npm test --workspace=@spezivibe/account               # Test specific package
npm run test:update --workspace=create-spezivibe-app  # Update CLI snapshots
```

## Critical Rules

1. **Always use Standard** - Access data via `useStandard()`, never import backends directly
2. **AccountService = auth only** - Login, register, logout, profile
3. **BackendService = data only** - Tasks, outcomes, questionnaires
4. **Cancellation tokens** - Every async effect needs `let cancelled = false`
5. **Memoize context values** - Always `useMemo` for provider values
6. **Declarative auth guards** - Use `<Redirect href="..." />`, not `router.replace()`

## Key Files

| File | Purpose |
|------|---------|
| `template/lib/services/standard-context.tsx` | Standard pattern implementation |
| `cli/src/generator.ts` | Project generation logic |
| `cli/src/config.ts` | Backend/feature discovery |
| `features/*/manifest.json` | Feature configuration |

## CLI & Features

**Generation flow**: CLI discovers backends from `features/*/manifest.json` (where `category: "backend"`), copies `template/` to output, applies feature manifests.

**Manifest fields**: `name`, `category` ("backend" or "feature"), `dependencies`, `copyFiles`, `replaceFiles`, `transforms`, `envVars`, `autoIncludes`

**Injection markers**:
- `{/* __INJECT_TABS__ */}` - Tab screens in `app/(tabs)/_layout.tsx`
- `{/* __INJECT_STACK_SCREENS__ */}` - Stack screens in `app/_layout.tsx`

**Backend-specific files**: `schedule.firebase.tsx` is used instead of `schedule.tsx` when Firebase is selected.

## Testing

Use `InMemoryAccountService` for account tests:
```typescript
const service = new InMemoryAccountService({ startUnauthenticated: true });
await service.initialize();
```

## Don't

- Commit without running `npm test`
- Add auth methods to BackendService
- Add data methods to AccountService
- Use `router.replace()` for auth guards
- Forget cleanup functions in useEffect
- Skip cancellation tokens in async effects
