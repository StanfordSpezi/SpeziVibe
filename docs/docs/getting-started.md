---
sidebar_position: 1
slug: /getting-started
description: Set up SpeziVibe, describe your app idea, and work with your AI coding tool from a first planning conversation to your first build milestone.
---

# Get started with SpeziVibe

SpeziVibe gives your AI coding tool a digital health playbook. You describe an idea; the tool helps you plan it and build it. **Skills** are the reusable instructions that guide those conversations.

Start with **`build-an-app`**. It chooses the skills your project needs and walks you through them. You don’t need to learn the skill catalog or choose a framework first.

:::tip Just want to explore an idea?
Open the [workshop](/workshop) and select **In browser chat**. You can work through planning without installing anything. Save the resulting briefs, then return here when you’re ready to build in a coding tool.
:::

## 1. Prepare your workspace

You’ll need:

- **An AI coding tool with skills support**, such as Claude Code, Cursor, GitHub Copilot, Codex, or Gemini CLI. Install your chosen tool and sign in. Use a coding environment that can work with files in a project folder.
- **The current LTS version of [Node.js](https://nodejs.org/en/download)**. It includes `npm` and `npx`, which run the skills installer.
- **[Git](https://git-scm.com/install)**, which the installer uses to download the skills repository.

**A terminal is where you type commands. Your AI tool’s chat is where you describe your app.** The guide labels which one to use at each step. You can use your coding tool’s built-in terminal, Terminal on macOS, or PowerShell on Windows.

In the **terminal**, run these commands one at a time:

```bash
node -v
npm -v
npx -v
git --version
```

Each should print a version number. If one says “command not found” or “not recognized,” install the missing tool, close and reopen the terminal, then try again.

### Make a folder for your work

If you already have an app project, open that folder in your coding tool and use its terminal. Otherwise, run:

```bash
mkdir my-health-app
cd my-health-app
```

This creates a folder named `my-health-app` in the terminal’s current location, then moves into it. You can choose another name. Open that same folder in your coding tool using its **Open folder** or **Open project** option. To see the folder’s full path in Terminal or PowerShell, run `pwd`.

You can start with an empty folder. SpeziVibe will help set up the app later, after planning. You don’t need to clone the SpeziVibe repository or run the website code.

## 2. Add the skills

In the **terminal**, inside your project folder, run:

```bash
npx skills add StanfordSpezi/SpeziVibe --skill '*'
```

Keep the quotes around `'*'`: this selects every SpeziVibe skill, including the supporting skills that `build-an-app` uses.

If `npx` asks to download the `skills` package, confirm to continue. When the installer offers choices:

1. Select the coding tool you use. Follow the on-screen keyboard hints to select it and continue.
2. Choose **Project** scope to keep the skills with this project.
3. Keep the recommended **Symlink** method. A symlink is a shortcut to a shared copy; use **Copy** if your system cannot create those shortcuts.
4. Review the destination and finish the installation.

Some choices may be automatic when the installer recognizes your environment. Wait for the success summary before continuing. These options come from the [skills installer](https://github.com/vercel-labs/skills#options).

:::note Already used the `--all` command?
That also installs the skills, but targets **all supported agents** and skips prompts. You don’t need to reinstall just to follow this guide. The command above lets you choose the target tool instead.
:::

### Check that it worked

In the **terminal**, run:

```bash
npx skills list
```

Look for `build-an-app` and the other SpeziVibe skills. Then, in your **coding tool’s chat**, ask:

```text
Can you find and read the build-an-app skill installed in this project?
Tell me which file you read before we start.
```

This checks that the coding tool can actually read the instructions. If it cannot, use the troubleshooting section below before starting your app.

## 3. Describe your app

In your **coding tool’s chat**, paste this and replace the example with your idea:

```text
I want to build a medication tracker for post-transplant patients.
Use the build-an-app skill to walk me through it.
```

One sentence is enough. It’s fine to be unsure about the details.

The skill will:

1. Ask about your idea and suggest relevant planning steps.
2. Let you add or remove steps before proceeding.
3. Guide each conversation, reuse your earlier answers, and save the results.
4. Turn the decisions into an implementation plan with small build milestones.

**Answer the questions and review each result before moving on.** You can ask to revise a brief or pause at any point. If you already have planning documents, the skill checks them and picks up from there.

### Find your planning documents

Look in your project’s file list for `docs/planning/` and `docs/implementation-plan.md`. The tool creates these as the planning work finishes; you don’t need to create them yourself.

For example, a project that uses needs-finding and UX planning might have:

```text
my-health-app/
└─ docs/
   ├─ planning/
   │  ├─ need-statement.md
   │  └─ ux-brief.md
   └─ implementation-plan.md
```

`.md` means Markdown: a text document you can open in your editor. Your set of briefs depends on the selected skills. The implementation plan lists milestones, tasks, and checks for the build.

## 4. Build your first milestone

Once you’ve reviewed the plan, the guide helps prepare the app project:

- **Existing app:** continue in that project.
- **New app with a Spezi starter:** the optional platform skill helps choose React Native or Apple-native and sets up the starter.
- **Another framework:** the guide helps create a project in your chosen framework.

For React Native, the setup script runs `create-spezivibe-app` to generate an app. For Apple-native, it clones the Spezi Template Application. You don’t need to run these setup commands yourself; let the skill guide you through the requirements for your chosen platform.

If setup creates a new folder, open that folder in your coding tool and check that the planning documents came with it. Because skills were installed for the original project, check that `build-an-app` is still available and repeat step 2 in the new folder if needed.

Then paste this into the **coding tool’s chat**:

```text
Read docs/planning/ and docs/implementation-plan.md.
Review any unresolved decisions with me, then implement the first agreed milestone.
Show me how to run it and check that it works before moving on.
```

Your first milestone is a small part of the app. Run it, review it, and work through the plan one milestone at a time. See [How SpeziVibe Works](/docs/how-it-works) for the complete flow.

## Come back later

Your saved documents let the guide resume even in a new conversation. Open the **same app project** and ask:

```text
Use the build-an-app skill to resume this project.
Read the existing planning briefs and implementation plan.
Ask me what has already been built, then help me choose the next step.
```

## If something gets stuck

<details>
<summary>The terminal cannot find node, npm, npx, or git</summary>

Install the missing tool from the links in step 1, then reopen both your terminal and coding tool. Recheck the version commands. If an old Node.js version causes an error, update to the current LTS release.

On Windows, if PowerShell specifically blocks `npx.ps1`, use `npx.cmd` in place of `npx` for the commands on this page.

</details>

<details>
<summary>The installer fails or stops before finishing</summary>

Check the final error message and your internet connection. The installer needs to reach npm and GitHub. If it reports a missing Git executable, install Git; if it reports a symlink problem, choose **Copy** or rerun the install command with `--copy` added at the end.

You can paste the error into your coding tool and ask it to explain the next step. A cancelled or failed install is not a completed setup.

</details>

<details>
<summary>The skills are listed, but my coding tool cannot find them</summary>

Check that the coding tool is open in the folder where you installed the skills. Try a new conversation or restart the tool. If you installed into another tool’s location, use the targeted command below to install for the tool you’re using.

If only `build-an-app` is installed and it cannot find another skill, repeat step 2 to install the full set. The guide needs those supporting instructions to do the planning.

</details>

<details>
<summary>The AI answered, but I can’t find the planning files</summary>

Ask: “Save the agreed brief at the path specified by the skill, and show me its full path.” Check that the tool is working in your project folder and can write files there.

In browser chat, save the Markdown content yourself at the paths shown in the workshop. Chat output alone does not create files in your local project.

</details>

## Other installation options

<details>
<summary>Choose a coding tool explicitly</summary>

Run **one** command for your tool. `-a` selects the agent; `--skill '*'` keeps all the skills:

```bash
# Claude Code
npx skills add StanfordSpezi/SpeziVibe --skill '*' -a claude-code

# Codex
npx skills add StanfordSpezi/SpeziVibe --skill '*' -a codex

# Cursor
npx skills add StanfordSpezi/SpeziVibe --skill '*' -a cursor
```

See the installer’s [supported agents](https://github.com/vercel-labs/skills#supported-agents) for other tool names.

</details>

<details>
<summary>List available skills or install just one</summary>

To see what this repository offers without installing:

```bash
npx skills add StanfordSpezi/SpeziVibe --list
```

To use needs-finding on its own:

```bash
npx skills add StanfordSpezi/SpeziVibe --skill biodesign-needs-finding
```

Use the full set from step 2 for the guided `build-an-app` workflow.

</details>

<details>
<summary>Install manually without npx</summary>

1. Download `spezivibe-skills.zip` from [Releases](https://github.com/StanfordSpezi/SpeziVibe/releases).
2. Unzip it. Each top-level folder is a skill containing `SKILL.md` and, where needed, supporting files.
3. Copy the **complete skill folders**, including their `references/` and `scripts/` folders, into your coding tool’s skills directory. For Claude Code, a project location is `.claude/skills/`.
4. Open the project in your coding tool and ask it to find and read `build-an-app`, as in step 2.

</details>

## Choose your next step

- **Follow a checklist:** open the [workshop](/workshop).
- **Understand the full process:** read [How SpeziVibe Works](/docs/how-it-works).
- **Get help with one decision:** browse the [skills catalog](/docs/skills).
