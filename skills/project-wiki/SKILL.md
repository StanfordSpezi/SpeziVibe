---
name: project-wiki
description: Set up and maintain a persistent, LLM-managed knowledge base for a digital health project — turning clinical observations, papers, interviews, and planning docs into a compounding, interlinked wiki.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Project Wiki

Set up and maintain a persistent knowledge base for a digital health project. Instead of scattering notes across chat histories, Google Docs, and Slack threads, the wiki gives your project a single, structured home for everything you learn — and the AI keeps it current.

Inspired by Andrej Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern, adapted for the Stanford Biodesign innovation process.

## When to Use

Use this skill when you want to:

- accumulate project knowledge that compounds over time instead of scattering across tools
- keep clinical observations, user interviews, literature, and competitive intelligence organized and cross-referenced
- maintain a living evidence base that updates as new information arrives
- give new team members a structured way to get up to speed on a project

Do not use this skill for one-off questions or quick research. It is designed for projects where knowledge accumulates over weeks or months.

## The Core Idea

Most teams use AI the way they use search — ask a question, get an answer, move on. The AI rediscovers context from scratch every time. Nothing compounds.

A project wiki is different. When you add a new source — an interview transcript, a paper, a clinical observation — the AI does not just file it. It reads it, extracts what matters, and integrates it into the existing wiki: updating stakeholder pages, revising the evidence landscape, flagging where new data contradicts earlier assumptions, strengthening or challenging the evolving picture.

The knowledge is compiled once and kept current, not re-derived on every conversation.

**You** curate sources, direct the analysis, and ask the right questions.
**The AI** does the summarizing, cross-referencing, filing, and bookkeeping.

## Working Style

You are a wiki maintainer and research partner. When ingesting sources, be thorough — touch every page that the new information affects. When answering queries, cite specific wiki pages and source documents. When something contradicts existing knowledge, flag it clearly rather than silently overwriting.

Keep the wiki useful, not exhaustive. A concise page with good cross-references beats a long page that nobody reads.

## Three-Layer Architecture

### Layer 1: Raw Sources

```
wiki/raw/
  interviews/
  papers/
  observations/
  competitors/
  regulatory/
  media/
```

Your curated collection of source documents. Articles, papers, interview transcripts, clinical observation notes, screenshots, data files. These are **immutable** — the AI reads from them but never modifies them. This is your source of truth.

Organize by type. Use descriptive filenames with dates: `2026-04-05-cardiac-rehab-patient-interview-03.md`.

### Layer 2: The Wiki

```
wiki/pages/
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

A directory of AI-generated and AI-maintained markdown files. Summaries, entity pages, concept pages, comparisons, evidence tables, and synthesis documents. **The AI owns this layer entirely.** It creates pages, updates them when new sources arrive, maintains cross-references, and keeps everything consistent. You read it; the AI writes it.

### Layer 3: The Schema

The `AGENTS.md` (or `CLAUDE.md`) file at the project root. It tells the AI how the wiki is structured, what the conventions are, and what workflows to follow when ingesting sources, answering questions, or maintaining the wiki. You and the AI co-evolve this over time as you figure out what works for your project.

## Setup

When a user asks to set up a project wiki, do the following:

### 1. Understand the Project

Ask:

- "What is the project about? What problem are you working on?"
- "What stage are you in — early exploration, needs-finding, prototyping, validation?"
- "What kinds of sources do you already have — interviews, papers, clinical observations, competitive research?"

### 2. Scaffold the Wiki

Create the directory structure inside the project repository:

```
wiki/
  raw/
    interviews/
    papers/
    observations/
    competitors/
    regulatory/
    media/
  pages/
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

### 3. Seed from Existing Planning Docs

If the project has SpeziVibe planning documents, ingest them as the wiki's first sources:

| Planning Document | Wiki Pages Created |
|---|---|
| `docs/planning/need-statement.md` | `overview.md` (project framing), initial `stakeholders/` pages, `questions/open-questions.md` |
| `docs/planning/ux-brief.md` | `design/user-journeys.md`, `design/onboarding.md` |
| `docs/planning/data-model-brief.md` | `design/data-model.md`, relevant `evidence/` pages |
| `docs/planning/compliance-brief.md` | `regulatory/compliance-landscape.md`, `regulatory/open-decisions.md` |
| `docs/planning/study-brief.md` | `design/study-protocol.md`, `stakeholders/participants.md` |
| `docs/planning/fhir-data-model.md` | `design/fhir-mappings.md` |
| `docs/implementation-plan.md` | `design/implementation-roadmap.md` |

Do not duplicate content — extract key facts, relationships, and open questions into wiki pages with links back to the original planning docs.

### 4. Write the Schema

Generate an `AGENTS.md` (or `CLAUDE.md`) file at the project root that describes:

- the wiki directory structure and conventions
- the project domain and key terminology
- page naming conventions
- how to handle ingestion, queries, and maintenance
- which Biodesign stage the project is in and what that means for page priorities
- cross-referencing conventions (use standard markdown links)

Tailor the schema to the specific project. A cardiac rehab app wiki has different page categories than a surgical device wiki.

### 5. Create the Index and Log

**`wiki/pages/index.md`** — A catalog of every page in the wiki. Each entry has a link, a one-line summary, and the date it was last updated. Organized by category. Update this on every ingest.

**`wiki/pages/log.md`** — An append-only chronological record of what happened and when. Each entry starts with `## [YYYY-MM-DD] action | description`. Examples:

```markdown
## [2026-04-05] setup | Wiki initialized for CardioTrack project
## [2026-04-05] seed | Ingested need-statement.md, ux-brief.md, compliance-brief.md
## [2026-04-07] ingest | Patient interview #3 — post-discharge cardiac rehab
## [2026-04-07] query | "What are the main barriers to exercise adherence?" → filed as evidence/adherence-barriers.md
## [2026-04-10] lint | Found 3 orphan pages, 1 contradicted claim, 2 missing cross-references
```

## Core Workflows

### Ingest

The user should never have to think about folder structure. When they want to add something to the wiki, they can:

- paste text directly into the conversation
- share or upload a file (PDF, image, markdown, transcript)
- share a URL
- dictate or describe an observation

The AI handles everything from there:

1. **Save the source** — classify the source type (interview, paper, observation, competitor, regulatory) and save it to the correct `wiki/raw/` subfolder with a descriptive, dated filename. The user never needs to navigate the folder structure manually.
2. **Read the source** completely
3. **Discuss key takeaways** with the user — what surprised them, what confirms existing thinking, what challenges it
4. **Write or update** a summary page in the wiki
5. **Update** `wiki/pages/index.md`
6. **Update every relevant** entity, concept, and evidence page across the wiki
7. **Flag contradictions** with existing wiki content explicitly — do not silently overwrite
8. **Append an entry** to `wiki/pages/log.md`

A single source may touch 5–15 wiki pages. That is expected.

The user's job is just: **"Add this to my wiki"** + share the content. One step.

Prefer ingesting sources one at a time with the user involved. Batch ingestion is fine for catching up, but interactive ingestion produces better results.

### Query

When the user asks a question:

1. Read `wiki/pages/index.md` to find relevant pages
2. Read those pages and synthesize an answer with citations to specific wiki pages and raw sources
3. If the answer reveals a useful synthesis, comparison, or connection — offer to file it as a new wiki page so it compounds rather than disappearing into chat history

### Lint

Periodically (or when the user asks), health-check the wiki:

- **Contradictions** — pages that disagree with each other or with newer sources
- **Stale claims** — assertions that newer evidence has superseded
- **Orphan pages** — pages with no inbound links from other pages
- **Missing pages** — important concepts mentioned on other pages but lacking their own page
- **Missing cross-references** — pages that should link to each other but don't
- **Evidence gaps** — questions or claims that lack supporting sources
- **Stage alignment** — whether the wiki's depth matches the project's current Biodesign stage

Present findings as a checklist and offer to fix each one.

## Biodesign-Specific Page Types

These are starting categories. Adapt them to the project:

### Stakeholders

One page per key stakeholder group. Include:

- who they are
- how the problem affects them
- their role in adoption decisions (decision-maker, influencer, user, payer)
- evidence from interviews or observations
- links to relevant raw sources

### Evidence

Pages that synthesize what is known about specific topics:

- clinical evidence for the problem
- current standard of care and its limitations
- quantitative burden (prevalence, cost, outcomes data)
- key studies and their findings

### Landscape

Competitive and market analysis:

- existing solutions and their strengths and limitations
- adjacent technologies
- market size and dynamics
- IP considerations

### Design

Product and technical decisions:

- user journeys and workflows
- data model choices
- architecture decisions and rationale
- implementation milestones

### Regulatory

Compliance and regulatory pathway:

- applicable regulations and standards
- classification decisions
- submission pathway
- open regulatory questions

### Questions

A living list of open questions, organized by category. When a question gets answered, move it to the relevant wiki page and note the resolution.

## Integration with build-an-app

When `build-an-app` completes its planning phase, it should offer:

> "Your planning documents are ready. Would you like to set up a project wiki to keep accumulating knowledge as you build? The wiki will seed from your planning docs and grow as you add interviews, papers, and clinical observations."

If the user accepts, hand off to this skill.

## Guardrails

- **Raw sources are immutable.** Never modify anything in `wiki/raw/`. The AI reads from raw sources but only writes to `wiki/pages/`.
- **Flag contradictions, don't hide them.** When new information conflicts with existing wiki content, note both positions and the evidence for each. Let the user decide what to believe.
- **Cite everything.** Every claim in the wiki should trace back to a raw source or a planning document. Use markdown links.
- **Keep pages concise.** A wiki page should be readable in 2–3 minutes. Split long pages into focused sub-pages.
- **Don't fabricate evidence.** If the wiki has gaps, say so. Add the gap to `questions/open-questions.md` rather than filling it with speculation.
- **Respect the user's domain expertise.** The AI maintains the wiki; the user directs the analysis. Ask before making judgment calls about clinical significance or research direction.
- **The wiki is a git repo.** Encourage commits after significant updates. The version history is valuable.

## Checklist

- [ ] Project scope and stage understood
- [ ] Directory structure created
- [ ] Existing planning docs seeded into wiki
- [ ] Schema file (AGENTS.md or CLAUDE.md) written and tailored to the project
- [ ] Index and log files initialized
- [ ] At least one source ingested interactively to demonstrate the workflow
- [ ] User understands ingest, query, and lint workflows
