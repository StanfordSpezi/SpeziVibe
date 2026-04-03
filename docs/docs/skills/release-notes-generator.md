---
sidebar_position: 11
---

# release-notes-generator

Creates user-facing release notes with feature highlights, fixes, breaking changes, and migration guidance.

## Output Sections

- Highlights (2-3 sentences on the most important changes)
- New Features (with usage examples)
- Improvements
- Bug Fixes (with issue references)
- Breaking Changes (with before/after code and migration steps)
- Dependencies

## Limitations

- Does not automatically extract breaking changes — requires manual identification
- Does not update version numbers or create tags
- Depends on commit history being reasonably structured
- Breaking changes must include migration guides with code examples
