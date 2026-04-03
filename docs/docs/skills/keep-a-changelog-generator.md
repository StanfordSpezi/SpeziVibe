---
sidebar_position: 10
---

# keep-a-changelog-generator

Generates changelog entries from git history in the [Keep a Changelog](https://keepachangelog.com) format.

## How It Works

1. Reads git log since the last version
2. Groups commits by category (Added, Changed, Deprecated, Removed, Fixed, Security)
3. Translates technical commit messages into user-facing language
4. Flags breaking changes

## Limitations

- Quality depends on commit message quality — vague messages produce vague entries
- Does not create version tags or bump version numbers
- Breaking change detection requires manual review
