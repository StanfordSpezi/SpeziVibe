# Changelog Generator

Generate changelogs from git history following Keep a Changelog format.

## When to Use

Invoke `/changelog` when you need to:
- Generate changelog entries for a release
- Document changes since the last version
- Create release notes from commits

## Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Features that will be removed

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes
```

## Change Categories

Categorize based on commit messages and code changes:

| Category | Commit Keywords | Examples |
|----------|-----------------|----------|
| Added | add, create, implement, introduce | New features, screens |
| Changed | update, change, modify, refactor, improve | API changes, enhancements |
| Deprecated | deprecate | Features to be removed |
| Removed | remove, delete, drop | Deleted features |
| Fixed | fix, resolve, correct, patch | Bug fixes |
| Security | security, vulnerability, CVE | Security patches |

## Git Commands

```bash
# Recent commits
git log --oneline -20

# Commits between tags
git log v1.0.0..HEAD --oneline

# Full commit messages
git log --format="%h %s%n%b" HEAD~10..HEAD

# Commits since a date
git log --since="2024-01-01" --oneline
```

## Writing Guidelines

### User-Facing Descriptions

Translate technical commits to user benefits:

- **Technical**: "Refactor auth state machine"
- **User-facing**: "Improved reliability of authentication state management"

### Breaking Changes

Flag API changes clearly:

```markdown
### Changed
- **BREAKING**: `login()` now returns `Promise<User>` instead of `Promise<void>`
```

## Output Example

```markdown
## [1.2.0] - 2024-01-14

### Added
- New health data visualization screen
- Apple HealthKit integration for step counting
- Export health data to PDF

### Changed
- Improved task scheduling performance
- Updated questionnaire UI design

### Fixed
- Fixed race condition in account state initialization
- Resolved infinite loop when no tasks exist
```

## Workflow

1. Run `git log` to get commits since last release
2. Group commits by category (Added/Changed/Fixed/etc.)
3. Identify breaking changes
4. Write user-facing descriptions
5. Include PR/issue references where available
6. Format following Keep a Changelog structure
