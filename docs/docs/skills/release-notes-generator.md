---
sidebar_position: 12
---

# release-notes-generator

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill release-notes-generator
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="release-notes-generator" />

Creates user-facing release notes with feature highlights, fixes, breaking changes, and migration guidance.

## Output Sections

- Highlights (2-3 sentences on the most important changes)
- New Features (with usage examples)
- Improvements
- Bug Fixes (with issue references)
- Breaking Changes (with before/after code and migration steps)
- Dependencies

## Example Output

```markdown
# v1.2.0 Release Notes

## Highlights
This release adds health data visualization and improves task scheduling.
Users can now view their health trends over time and export summaries.

## New Features
- **Health Data Charts** — View step count and heart rate trends
  over the past week or month.
- **PDF Export** — Share a health data summary with your care team.

## Bug Fixes
- Fixed account initialization race condition (#45)
- Resolved infinite loop with empty task lists (#52)

## Breaking Changes
- `useHealthData()` now returns an object instead of an array.

  // Before
  const [data, isLoading] = useHealthData();

  // After
  const { data, isLoading } = useHealthData();
```

## Limitations

- Does not automatically extract breaking changes — requires manual identification
- Does not update version numbers or create tags
- Depends on commit history being reasonably structured
- Breaking changes must include migration guides with code examples
