<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# AI Coding Instructions

## Repository Purpose

This repository contains shared installable skills for digital health development.

## Key Areas

```text
skills/   Shared installable skills — the source of truth for all skill content
docs/     Docusaurus site published to spezivibe.com
```

## Expectations

- Keep root-level skills reusable and broadly useful across digital health projects.
- Prefer framework-agnostic guidance unless a skill is explicitly about platform selection.
- Keep the repository focused on helping people choose a direction, plan well, and move faster with confidence.
- When adding or renaming a skill, update the matching page in `docs/docs/skills/`, the entry in `docs/sidebars.js`, and the root `README.md` — CI checks that every skill has a docs page and sidebar entry.
- Keep `AGENTS.md` and `CLAUDE.md` identical — CI enforces this.

## Entry Skill

Use `skills/build-an-app` when a user wants to build a new digital health app or is unsure where to start. It orchestrates the other skills in the right order.

Use `skills/spezi-platform-selection` directly when the user only needs help choosing between React Native and Apple-native.
