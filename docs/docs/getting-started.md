---
sidebar_position: 1
slug: /getting-started
---

# Getting Started

SpeziVibe is a collection of installable skills for AI coding tools. Each skill walks you through a specific digital health planning area and produces a structured markdown document you can build from.

:::info The workflow
SpeziVibe's planning skills produce structured markdown briefs. Your AI coding agent then uses those briefs (plus a Spezi template repo) to write the code. See [How SpeziVibe Works](/docs/how-it-works) for the full flow before you start.
:::

## Prerequisites

You need **Node.js** (which includes `npm` and `npx`).

1. Install a current Node.js release from [nodejs.org](https://nodejs.org/)
2. Confirm the tools are available:

```bash
node -v
npx -v
```

## Install All Skills

Install every skill with one command:

```bash
npx skills add StanfordSpezi/SpeziVibe --all
```

This installs into every detected coding tool. Skills work with **Claude Code**, **Cursor**, **GitHub Copilot**, **OpenAI Codex**, **Gemini CLI**, and any other tool that supports installable skills or custom instructions.

## List Skills Before Installing

See what's available without installing:

```bash
npx skills add StanfordSpezi/SpeziVibe --list
```

## Install a Single Skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill build-an-app
```

Every skill's docs page includes a copy-paste install command. Start with [build-an-app](/docs/skills/build-an-app) if you're unsure where to begin.

## Target a Specific Tool

By default, the install targets every detected tool. To target a specific one, add `-a <agent>`:

```bash
# Claude Code only
npx skills add StanfordSpezi/SpeziVibe --skill '*' -a claude-code

# Codex only
npx skills add StanfordSpezi/SpeziVibe --skill '*' -a codex
```

See the [`skills` tool](https://github.com/vercel-labs/skills) for the full list of supported agents.

## Manual Install (No npx)

If you prefer not to use `npx`:

1. Download the latest `spezivibe-skills.zip` from [Releases](https://github.com/StanfordSpezi/SpeziVibe/releases)
2. Unzip the archive
3. Copy the skill folders into your tool's skills directory (e.g., `.claude/skills/` for Claude Code)

## Verify the Install

Open your AI coding tool and ask it to list the available skills:

```
List the SpeziVibe skills you have access to.
```

You should see `build-an-app`, `biodesign-needs-finding`, and the other skills in the catalog.

## Next Steps

The fastest way to get started is to run `build-an-app`. Describe what you want to build and it figures out which planning skills apply, runs them in order, and hands off to implementation:

```
I want to build a medication tracking app for post-transplant
patients. Use the build-an-app skill to walk me through it.
```

Browse the [Skills reference](/docs/skills) for what each skill does individually, or check the [GitHub repository](https://github.com/StanfordSpezi/SpeziVibe) for source code and contribution info.
