# AI Coding Instructions

## Stack

React Native, Expo 54, TypeScript, Expo Router, Formik + Yup

## Commands

```bash
npx expo start    # Start dev server (press i for iOS, a for Android)
npm test          # Run tests
```

## Provider Hierarchy

Order matters - don't rearrange:
```
StandardProvider → SchedulerProvider → AccountProvider → App
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
| `lib/services/standard-context.tsx` | Standard pattern - provides backend & auth |
| `app/_layout.tsx` | Root layout with providers and auth guards |
| `app/(tabs)/_layout.tsx` | Tab navigation |

## Don't

- Import backends directly - use `useStandard()`
- Add auth methods to BackendService
- Add data methods to AccountService
- Use `router.replace()` for auth guards
- Forget cleanup functions in useEffect
- Skip cancellation tokens in async effects

## Development Agents

Claude Code agents for common tasks. Invoke with `/agent-name`.

### Development

| Agent | Command | Purpose |
|-------|---------|---------|
| docs | `/docs` | Generate documentation and READMEs |
| changelog | `/changelog` | Generate changelogs from git history |
| test | `/test` | Generate Jest tests following project patterns |
| fhir | `/fhir` | Validate FHIR R4 compliance in code |
| fhir-mapping | `/fhir-mapping` | Generate FHIR resource mappings |
| feature | `/feature` | Create new app features and screens |
| release | `/release` | Create release notes for new versions |

### Planning

| Agent | Command | Purpose |
|-------|---------|---------|
| study-planner | `/study-planner` | Plan health studies and research protocols |
| compliance | `/compliance` | Plan HIPAA, IRB, and regulatory compliance |
| data-model | `/data-model` | Design health data models and FHIR structures |
| ux-planner | `/ux-planner` | Design user flows and engagement strategies |

Agent definitions are in `.claude/agents/`.
