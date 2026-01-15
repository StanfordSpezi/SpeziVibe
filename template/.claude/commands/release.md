# Release Notes Generator

Create release notes summarizing features, fixes, and breaking changes for releases.

## When to Use

Invoke `/release` when you need to:
- Prepare release notes for a new version
- Summarize changes for users/stakeholders
- Document migration steps for breaking changes

## Release Notes Structure

```markdown
# Release v1.2.0

## Highlights

Brief summary of the most important changes (2-3 sentences).

## New Features

### Feature Name
Description of what it does and why it matters.

**Usage:**
```typescript
// Code example
```

## Improvements

- Improvement 1
- Improvement 2

## Bug Fixes

- Fixed issue with X (#123)
- Resolved Y when Z

## Breaking Changes

### Change Name

**What changed:** Description

**Migration:**
```typescript
// Before
oldMethod();

// After
newMethod();
```

## Dependencies

- Updated `package-name` from 1.0.0 to 2.0.0
```

## Information Gathering

### Git Commands

```bash
# Commits since last release
git log v1.1.0..HEAD --oneline

# Detailed commit messages
git log v1.1.0..HEAD --format="%h %s%n%b%n---"

# Files changed
git diff v1.1.0..HEAD --stat

# Contributors
git log v1.1.0..HEAD --format="%an" | sort | uniq
```

## Writing Guidelines

### Highlights Section

Focus on user value:
- What can users do now that they couldn't before?
- What problems are solved?
- Why should they upgrade?

### Feature Descriptions

Include:
- What it does
- Why it matters
- Basic usage example

### Breaking Changes

Must include:
- Clear description of what changed
- Why it changed
- Step-by-step migration guide
- Code examples (before/after)

### Version Numbers

Follow semantic versioning:
- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features, backward compatible
- **Patch (0.0.1)**: Bug fixes, backward compatible

## Example Release Notes

```markdown
# Release v1.2.0

## Highlights

This release adds health data visualization and improves task scheduling
performance. Users can now view their health trends over time.

## New Features

### Health Data Visualization

View your health metrics in interactive charts.

**Usage:**
```typescript
import { HealthChart } from './components/health';

<HealthChart data={healthData} timeRange="week" />
```

## Improvements

- Task scheduling is now 50% faster
- Improved error messages for authentication failures

## Bug Fixes

- Fixed race condition in account state initialization (#45)
- Resolved infinite loop when no tasks exist (#52)

## Breaking Changes

### useHealthData Hook

**What changed:** `useHealthData()` now returns an object instead of array

**Migration:**
```typescript
// Before
const [data, isLoading] = useHealthData();

// After
const { data, isLoading } = useHealthData();
```
```

## Checklist

- [ ] Highlights summarize key changes
- [ ] All new features documented with examples
- [ ] Breaking changes have migration guides
- [ ] Bug fixes reference issue numbers
- [ ] Version number follows semver
