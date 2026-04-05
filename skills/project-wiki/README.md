<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Project Wiki

**Turn your digital health project into a compounding knowledge base.**

Most project knowledge scatters — interview notes in Google Docs, papers in a shared drive, competitive research in Slack threads, clinical observations in someone's notebook. Ask a question six weeks in, and the team has to piece it together from memory.

Project Wiki fixes this. It sets up a persistent, AI-maintained knowledge base inside your project repo. When you add a source — a patient interview, a research paper, a clinical observation, a competitor screenshot — the AI reads it, extracts what matters, and integrates it across the wiki: updating stakeholder pages, revising the evidence landscape, flagging where new findings contradict earlier assumptions, and keeping cross-references current.

**You curate the sources. The AI does the bookkeeping.**

Inspired by Andrej Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern, adapted for the Stanford Biodesign innovation process.

## Install

```bash
npx skills add StanfordSpezi/SpeziVibe --skill project-wiki
```

## How It Works

### Three Layers

```
wiki/
  raw/          ← Your sources (immutable — AI reads but never modifies)
    interviews/
    papers/
    observations/
    competitors/
    regulatory/
    media/
  pages/        ← The wiki (AI-written and AI-maintained)
    index.md
    log.md
    overview.md
    stakeholders/
    evidence/
    landscape/
    design/
    regulatory/
    questions/
```

**Raw sources** are your source of truth — articles, transcripts, PDFs, screenshots. They go in, they don't change.

**Wiki pages** are the AI's synthesis — interlinked markdown pages that get richer with every source you add. Stakeholder maps, evidence tables, competitive landscapes, design rationale, open questions.

**The schema** (`AGENTS.md` or `CLAUDE.md` at project root) tells the AI how your specific wiki is structured and how to maintain it.

### Adding Sources

Just tell your AI coding tool:

> "Add this to my wiki" + share the file, paste the text, or drop a link

The AI classifies the source (interview, paper, observation, competitor, regulatory), saves it to the right folder with a descriptive filename, and runs the full ingestion — updating every relevant wiki page, flagging contradictions, and logging the change.

You do one thing. The AI touches 5–15 pages.

### Three Workflows

**Ingest** — Add a new source. The AI reads it, discusses key takeaways with you, writes or updates wiki pages across the project, and logs the change.

**Query** — Ask a question. The AI searches the wiki, synthesizes an answer with citations, and offers to file useful answers back into the wiki so they compound rather than disappearing into chat history.

**Lint** — Health-check the wiki. The AI looks for contradictions, stale claims, orphan pages, missing cross-references, and evidence gaps. Think of it as a code review for your knowledge base.

## Works With Other SpeziVibe Skills

If your project already has planning documents from other SpeziVibe skills, the wiki seeds from them automatically:

| Planning Document | What It Becomes |
|---|---|
| `need-statement.md` | Project overview, initial stakeholder pages, open questions |
| `ux-brief.md` | User journey and onboarding pages |
| `data-model-brief.md` | Data model design page |
| `compliance-brief.md` | Compliance landscape and open regulatory decisions |
| `study-brief.md` | Study protocol page, participant stakeholder page |
| `fhir-data-model.md` | FHIR mappings page |
| `implementation-plan.md` | Implementation roadmap page |

You start with structure, not a blank page.

## Biodesign-Specific Page Types

The wiki is organized around the innovation process:

- **Stakeholders** — One page per stakeholder group. Who they are, how the problem affects them, their role in adoption, evidence from interviews.
- **Evidence** — Clinical evidence synthesis. Current standard of care, quantitative burden, key studies, known gaps.
- **Landscape** — Competitive and market analysis. Existing solutions, adjacent technologies, IP considerations.
- **Design** — Product and technical decisions. User journeys, data model, architecture rationale, milestones.
- **Regulatory** — Applicable regulations, classification decisions, submission pathway, open questions.
- **Questions** — A living list of what you still need to find out, organized by category.

These are starting categories — the AI adapts them to your specific project domain.

## Why This Matters

Teams abandon wikis because the maintenance burden grows faster than the value. Updating cross-references, keeping summaries current, noting when new data contradicts old claims — humans stop doing this after week two.

The AI doesn't get bored. It doesn't forget to update a cross-reference. It can touch 15 files in one pass. The wiki stays maintained because the cost of maintenance is near zero.

The human's job is to curate sources, direct the analysis, ask good questions, and think about what it all means. The AI handles everything else.

## Example

A team building a cardiac rehab app three weeks in:

```
wiki/pages/
  index.md                              ← 47 pages cataloged
  log.md                                ← 23 ingestion events
  overview.md                           ← Project framing, evolved from need statement
  stakeholders/
    patients.md                         ← Synthesized from 8 patient interviews
    cardiologists.md                    ← 3 clinician interviews + literature
    caregivers.md                       ← Emerged from patient interview #3
    payers.md                           ← Insurance reimbursement landscape
  evidence/
    exercise-adherence-barriers.md      ← 4 sources, 1 flagged contradiction
    remote-monitoring-outcomes.md       ← 6 papers synthesized
    standard-of-care.md                 ← Current rehab protocols + gaps
  landscape/
    competing-apps.md                   ← 5 competitors analyzed
    adjacent-tech.md                    ← Wearables, RPM platforms
  design/
    user-journeys.md                    ← From UX brief + interview insights
    data-model.md                       ← FHIR-oriented, from data model brief
  regulatory/
    compliance-landscape.md             ← HIPAA + FDA considerations
    open-decisions.md                   ← 3 decisions pending legal review
  questions/
    open-questions.md                   ← 12 active, 8 resolved
```

Every page is interlinked. Every claim cites a source. Every contradiction is flagged. The team added 23 sources over three weeks; the AI wrote and maintained 47 pages.

## Guardrails

- **Raw sources are immutable.** The AI never modifies anything in `wiki/raw/`.
- **Contradictions are flagged, not hidden.** When new information conflicts with existing wiki content, both positions are noted with evidence.
- **Everything is cited.** Every claim traces back to a raw source or planning document.
- **No fabricated evidence.** Gaps are documented in `questions/open-questions.md`, not filled with speculation.
- **The wiki is a git repo.** Commit after significant updates. The version history is valuable.

## Compatible With

Works with any AI coding tool that supports installable skills or custom instructions:

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [OpenAI Codex](https://openai.com/codex/)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [Cursor](https://cursor.sh)
- [GitHub Copilot](https://github.com/features/copilot)

## License

This project is licensed under the MIT License. See [LICENSE](../../LICENSE.md) for details.
