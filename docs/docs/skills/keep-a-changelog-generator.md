---
sidebar_position: 11
---

# keep-a-changelog-generator

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill keep-a-changelog-generator
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="keep-a-changelog-generator" />

Generates changelog entries from git history in the [Keep a Changelog](https://keepachangelog.com) format.

## How It Works

1. Reads git log since the last version
2. Groups commits by category (Added, Changed, Deprecated, Removed, Fixed, Security)
3. Translates technical commit messages into user-facing language
4. Flags breaking changes

## Example Output

```markdown
## [1.2.0] - 2026-04-05

### Added
- Health data visualization screen with weekly and monthly trend views
- Apple HealthKit integration for step count and heart rate
- Export health data summary to PDF

### Changed
- Improved task scheduling performance for large medication lists
- Updated questionnaire UI to support branching logic

### Fixed
- Fixed race condition in account state initialization (#45)
- Resolved infinite loop when no scheduled tasks exist (#52)
```

## Limitations

- Quality depends on commit message quality — vague messages produce vague entries
- Does not create version tags or bump version numbers
- Breaking change detection requires manual review
