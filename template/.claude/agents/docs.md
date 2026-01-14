# Documentation Generator

Generate and update documentation for your digital health app.

## When to Use

Invoke `/docs` when you need to:
- Create a README for your app
- Document components and hooks
- Add usage examples for features

## Documentation Standards

### App README Structure

1. **Title** - App name with brief description
2. **Features** - Bullet list of key features
3. **Getting Started** - Setup and installation steps
4. **Configuration** - Environment variables and settings
5. **Architecture** - Key concepts and patterns
6. **Development** - How to run, test, and build

### Code Examples Requirements

- Use TypeScript with proper type annotations
- Always include imports
- Show success and error handling
- Use the cancellation token pattern for async effects:
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

### Key Patterns to Document

1. **Standard Pattern**: Always show `useStandard()` hook usage
2. **Service Separation**: Clarify AccountService (auth) vs BackendService (data)
3. **Declarative Auth Guards**: Use `<Redirect href="..." />` not `router.replace()`
4. **Memoized Context**: Show `useMemo` for provider values
5. **FHIR Compliance**: Document FHIR R4 resource mappings where relevant

### Props Tables Format

```markdown
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | Yes | Description here |
| `onPress` | `() => void` | No | Callback description |
```

## Key Files

- `lib/services/standard-context.tsx` - Standard pattern implementation
- `lib/services/types.ts` - Service interfaces
- `app/_layout.tsx` - Root layout with providers

## Workflow

1. Read the source files to understand exports and functionality
2. Identify all public components and hooks
3. Follow the README structure above
4. Include working code examples
5. Add troubleshooting for known issues

## Verification Checklist

- [ ] All public exports documented
- [ ] Code examples use correct imports
- [ ] Props tables include all properties
- [ ] Follows project conventions
- [ ] Troubleshooting section addresses common issues
