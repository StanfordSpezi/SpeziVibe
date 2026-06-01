import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import {buildPrompt, TryButtons} from '../components/TryThisSkill';

const STORAGE_KEY = 'spezivibe-workshop-v1';
const INSTALL_CMD = 'npx skills add StanfordSpezi/SpeziVibe --all';

const STEPS = [
  {
    id: 'install',
    title: 'Install the planning skills',
    blurb: 'One command adds the SpeziVibe skills to your AI coding tool — Claude Code, Cursor, Copilot, Codex, Gemini, and more.',
    kind: 'command',
    text: INSTALL_CMD,
  },
  {
    id: 'need',
    title: 'Define the need',
    blurb: 'Turn your idea into a sharp problem statement using the Stanford Biodesign needs-finding process.',
    skill: 'biodesign-needs-finding',
    output: 'need-statement.md',
    prompt: (idea) =>
      `I want to build ${idea}. Use the biodesign-needs-finding skill to walk me through defining a clear problem statement.`,
  },
  {
    id: 'compliance',
    title: 'Plan for compliance',
    blurb: 'Surface the privacy, regulatory, and research questions — HIPAA, IRB, FDA, GDPR — early, before any code.',
    skill: 'digital-health-compliance-planning',
    output: 'compliance-brief.md',
    prompt: (idea) =>
      `Based on my need statement for ${idea}, run the digital-health-compliance-planning skill to identify which compliance domains and controls apply.`,
  },
  {
    id: 'data',
    title: 'Model your health data',
    blurb: 'Define the core health data entities, how they relate, and what they need for interoperability.',
    skill: 'health-data-model-planning',
    output: 'data-model-brief.md',
    prompt: (idea) =>
      `Using my planning so far for ${idea}, run the health-data-model-planning skill to define the data entities, relationships, and interoperability needs.`,
  },
  {
    id: 'ux',
    title: 'Design the experience',
    blurb: 'Map the user journeys, onboarding, and day-to-day workflows for patients and clinicians.',
    skill: 'digital-health-ux-planning',
    output: 'ux-brief.md',
    prompt: (idea) =>
      `Using my planning so far for ${idea}, run the digital-health-ux-planning skill to plan the user journeys and onboarding.`,
  },
];

function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      {threshold: 0.1},
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}

function stepText(step, idea) {
  const ideaText = idea.trim() || 'my digital health app';
  return step.kind === 'command' ? step.text : step.prompt(ideaText);
}

function CopyBlock({text, copied, onCopy}) {
  return (
    <div className="ws-code">
      <code>{text}</code>
      <button
        type="button"
        className="ws-copy"
        aria-label="Copy to clipboard"
        onClick={onCopy}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

export default function Workshop() {
  const [idea, setIdea] = useState('');
  const [done, setDone] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.idea === 'string') setIdea(saved.idea);
        if (saved.done && typeof saved.done === 'object') setDone(saved.done);
      }
    } catch (e) {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({idea, done}));
    } catch (e) {
      /* ignore */
    }
  }, [idea, done, loaded]);

  const doneCount = STEPS.filter((s) => done[s.id]).length;
  const total = STEPS.length;
  const pct = Math.round((doneCount / total) * 100);
  const activeIndex = STEPS.findIndex((s) => !done[s.id]);
  const allDone = doneCount === total;

  const copy = (step) => {
    const text = stepText(step, idea);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(step.id);
        setTimeout(() => setCopiedId((c) => (c === step.id ? null : c)), 2000);
      });
    }
  };

  const toggle = (id) => setDone((d) => ({...d, [id]: !d[id]}));
  const reset = () => {
    setIdea('');
    setDone({});
  };

  return (
    <Layout
      title="Workshop"
      description="A step-by-step workshop that takes a simple idea and walks you through planning a digital health app, right in your browser."
      wrapperClassName="landing-page"
    >
      <div className="aurora-base"></div>
      <div className="aurora-accent"></div>
      <div className="grid-pattern"></div>
      <ScrollReveal />

      <section className="ws-wrap">
        <div className="reveal">
          <p className="section-label">Workshop</p>
          <h1 className="ws-title">Plan your app, step by step</h1>
          <p className="ws-subtitle">
            Start with a simple idea. Each step gives you a prompt to paste into your AI
            coding tool — by the end you&rsquo;ll have a folder of planning briefs ready to build from.
          </p>
        </div>

        <div className="ws-idea reveal reveal-delay-1">
          <label className="ws-idea-label" htmlFor="ws-idea-input">
            What do you want to build?
          </label>
          <textarea
            id="ws-idea-input"
            className="ws-idea-input"
            rows={2}
            placeholder="e.g. a medication tracker for post-transplant patients"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
          <p className="ws-idea-hint">
            We&rsquo;ll weave this into every prompt below. You can edit it any time.
          </p>
        </div>

        <div className="ws-progress reveal">
          <div className="ws-progress-top">
            <span className="ws-progress-label">
              {doneCount} of {total} complete
            </span>
            {doneCount > 0 && (
              <button type="button" className="ws-reset" onClick={reset}>
                Reset
              </button>
            )}
          </div>
          <div className="ws-progress-bar">
            <div className="ws-progress-fill" style={{width: `${pct}%`}}></div>
          </div>
        </div>

        <ol className="ws-steps">
          {STEPS.map((step, i) => {
            const isDone = !!done[step.id];
            const isActive = !isDone && i === activeIndex;
            return (
              <li
                key={step.id}
                className={`glass-card ws-step${isDone ? ' is-done' : ''}${
                  isActive ? ' is-active' : ''
                }`}
              >
                <div className="ws-step-num" aria-hidden="true">
                  {isDone ? '✓' : i + 1}
                </div>
                <div className="ws-step-body">
                  <h3 className="ws-step-title">{step.title}</h3>
                  {step.skill && (
                    <p className="ws-step-meta">
                      <span className="ws-step-skill">{step.skill}</span>
                      <span className="ws-step-arrow">→</span>
                      <span className="ws-step-output">{step.output}</span>
                    </p>
                  )}
                  <p className="ws-step-blurb">{step.blurb}</p>
                  <CopyBlock
                    text={stepText(step, idea)}
                    copied={copiedId === step.id}
                    onCopy={() => copy(step)}
                  />
                  <div className="ws-step-actions">
                    {step.skill && (
                      <TryButtons
                        className="ws-try"
                        prompt={buildPrompt(step.skill, {context: idea})}
                      />
                    )}
                    <button
                      type="button"
                      className={`ws-done-btn${isDone ? ' is-done' : ''}`}
                      onClick={() => toggle(step.id)}
                    >
                      {isDone ? '✓ Done' : 'Mark done'}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {allDone && (
          <div className="glass-card ws-complete reveal">
            <div className="ws-complete-badge">🎉 Plan complete</div>
            <h2>You&rsquo;ve planned your app</h2>
            <p>
              You now have a <code>docs/planning/</code> folder of structured briefs — your
              need statement, compliance brief, data model, and UX plan. That&rsquo;s everything
              your AI coding agent needs to start building.
            </p>
            <p>
              Ready for the next step? <code>spezi-platform-selection</code> picks React Native
              or Apple-native and clones a matching Spezi template to build on.
            </p>
            <div className="ws-complete-links">
              <a className="btn-primary" href="/docs/how-it-works">
                See how building works
              </a>
              <a className="btn-secondary" href="/docs/skills/app-build-planner">
                Sequence the build
              </a>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
