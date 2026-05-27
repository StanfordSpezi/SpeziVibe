---
sidebar_position: 10
---

# project-wiki

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill project-wiki
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="project-wiki" />

Set up and maintain a persistent, AI-managed knowledge base for a digital health project — turning clinical observations, papers, interviews, and planning docs into a compounding, interlinked wiki.

## How It Works

The wiki uses a three-layer architecture:

- **Raw sources** (`wiki/raw/`) — Your immutable source documents: interview transcripts, papers, clinical observations, competitor research, regulatory docs. The AI reads from these but never modifies them.
- **Wiki pages** (`wiki/pages/`) — AI-generated and AI-maintained markdown pages. Summaries, stakeholder maps, evidence tables, competitive landscapes, design rationale, and open questions — all interlinked and kept current.
- **Schema** (`AGENTS.md` or `CLAUDE.md`) — Tells the AI how the wiki is structured and how to maintain it. You and the AI co-evolve this over time.

When you add a source, the AI reads it, discusses key takeaways with you, and integrates it across the wiki — updating every relevant page, flagging contradictions, and logging the change. A single source may touch 5–15 wiki pages.

### Three Workflows

**Ingest** — Add a new source. Just say "Add this to my wiki" and share the content. The AI classifies it, saves it to the right folder, writes or updates wiki pages, and logs the change.

**Query** — Ask a question. The AI searches the wiki, synthesizes an answer with citations, and offers to file useful answers back into the wiki so they compound.

**Lint** — Health-check the wiki. The AI looks for contradictions, stale claims, orphan pages, missing cross-references, and evidence gaps.

## Works With Other Skills

If your project has planning documents from other SpeziVibe skills, the wiki seeds from them automatically — need statements become project overviews, UX briefs become user journey pages, compliance briefs become regulatory landscape pages.

## Example

```
You:  Add this to my wiki — [pastes patient interview transcript]

AI:   I've saved it as wiki/raw/interviews/2026-04-05-patient-03-
      cardiac-rehab.md.

      Key takeaways:
      — Patient stopped exercising after week 2 due to fatigue
      — Caregiver wasn't aware of the exercise schedule
      — Patient preferred text reminders over app notifications

      This contradicts our earlier assumption that app-based
      reminders are preferred — I've flagged that on the
      evidence/adherence-barriers.md page.

      Updated pages:
      — stakeholders/patients.md (added fatigue as barrier)
      — stakeholders/caregivers.md (new page — caregiver role)
      — evidence/adherence-barriers.md (added contradiction flag)
      — questions/open-questions.md (added: "Should we include
        caregiver-facing features?")
      — log.md (appended ingest entry)
```

## Output

Creates a `wiki/` directory with the full three-layer structure and a schema section in your project's `AGENTS.md` or `CLAUDE.md`.

## Limitations

- Designed for projects where knowledge accumulates over weeks or months — not for one-off questions
- The AI maintains the wiki; it does not fabricate evidence or make clinical judgment calls
- Not a replacement for formal literature reviews or regulatory submissions
