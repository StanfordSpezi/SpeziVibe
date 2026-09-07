import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {buildPrompt, TryButtons} from '../components/TryThisSkill';
import CopyBlock from '../components/CopyBlock';
import {STORAGE_KEY, stepsForMode, canSkip, restoreWorkshop, stepPrompt} from '../components/workshopFlow';

export default function Workshop() {
  const [run, setRun] = useState(() => restoreWorkshop(null));
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [previousRun, setPreviousRun] = useState(null);
  const {idea, mode, done, skipped} = run;

  useEffect(() => {
    try { setRun(restoreWorkshop(localStorage.getItem(STORAGE_KEY))); }
    catch { setStorageAvailable(false); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(run));
      setStorageAvailable(true);
    } catch { setStorageAvailable(false); }
  }, [run, loaded]);

  const steps = stepsForMode(mode);
  const doneCount = steps.filter((step) => done[step.id]).length;
  const skipCount = steps.filter((step) => skipped[step.id]).length;
  const finishedCount = doneCount + skipCount;
  const activeStep = steps.find((step) => !done[step.id] && !skipped[step.id]);
  const allDone = finishedCount === steps.length;
  const browser = mode === 'browser';
  const reviewedOutputs = steps.filter((step) => done[step.id] && step.output);
  const hasProgress = Object.values(done).some(Boolean) || Object.values(skipped).some(Boolean);

  const update = (values) => {
    setPreviousRun(null);
    setRun((current) => ({...current, ...values}));
  };
  const mark = (id, status) => {
    setPreviousRun(null);
    setRun((current) => ({
      ...current,
      done: {...current.done, [id]: status === 'done' && !current.done[id]},
      skipped: {...current.skipped, [id]: status === 'skipped' && !current.skipped[id]},
    }));
  };
  const reset = () => {
    setPreviousRun(run);
    setRun({...restoreWorkshop(null), mode});
  };

  return (
    <Layout
      title="Workshop"
      description="Plan a digital health app with a guided checklist and prompts for your AI coding tool or browser chat. Review each brief, then make an implementation plan."
      wrapperClassName="landing-page workshop-page"
    >
      <header className="page-head">
        <div className="section-rail"><span className="rail-label">Workshop</span></div>
        <div className="section-main">
          <h1>Plan your app, step by step</h1>
          <p className="prose">Bring an idea and an AI tool. Work through a conversation at each step,
            review the result, and save a set of briefs you can build from. You can pause and return later.</p>
        </div>
      </header>

      <section className="ws-body" aria-label="Your workshop">
        <div className="section-rail"><span className="rail-label">Your run</span></div>
        <div className="ws-main">
          <fieldset className="ws-mode" disabled={!loaded}>
            <legend>Where will you do the planning?</legend>
            <label><input type="radio" name="workshop-mode" value="coding" checked={!browser} onChange={() => update({mode: 'coding'})} />
              <span><strong>In my coding tool</strong><small>Save briefs directly into your project.</small></span>
            </label>
            <label><input type="radio" name="workshop-mode" value="browser" checked={browser} onChange={() => update({mode: 'browser'})} />
              <span><strong>In browser chat</strong><small>No installation. Save the briefs yourself.</small></span>
            </label>
          </fieldset>

          <div className="ws-guidance">
            {browser ? <>
              <p>Copy each prompt into Claude, ChatGPT, or another chat that can read links. Keep using the same conversation so it has your earlier decisions.</p>
              <p>The “Try in” buttons open a new chat. Paste or attach your earlier briefs there when asked. If the prompt doesn’t appear, copy it below. If the chat cannot read a skill link, open its instructions below and paste them into the chat.</p>
            </> : <>
              <p>You’ll need <strong>Node.js, Git, and an AI coding tool that supports skills</strong>. <Link to="/docs/getting-started">Follow the setup guide</Link> if you haven’t prepared them yet.</p>
              <p>Use the same project folder and conversation throughout. Answer the tool’s questions, review each brief, and check that it was saved before marking the step done.</p>
            </>}
            <p>This is a common planning route. Skip a planning step if it doesn’t apply or you already have that brief. For a route tailored to your project, <Link to="/docs/getting-started">start with the build-an-app skill</Link>.</p>
          </div>

          <div className="ws-idea">
            <label className="ws-idea-label" htmlFor="ws-idea-input">What do you want to build?</label>
            <textarea id="ws-idea-input" className="ws-idea-input" rows={3}
              placeholder="e.g. a medication tracker for post-transplant patients"
              value={idea} disabled={!loaded} aria-describedby="ws-idea-hint"
              onChange={(event) => update({idea: event.target.value})} />
            <p className="ws-idea-hint" id="ws-idea-hint">Your idea goes into every prompt. Leave it blank if you want help exploring.
              {hasProgress && ' Refining it keeps your progress; choose Start over for a different project.'}</p>
          </div>

          <p className="ws-storage" role="status">{!loaded ? 'Loading your workshop…' : storageAvailable
            ? 'Your idea and checklist are saved in this browser. Save the actual briefs in your AI tool or project; this page does not store them.'
            : 'This browser cannot save your workshop. You can continue, but your checklist may be lost when you leave. Keep your briefs separately.'}</p>

          <div className="ws-progress">
            <div className="ws-progress-top">
              <span className="ws-progress-label" role="status">{doneCount} done{skipCount > 0 ? ` · ${skipCount} skipped` : ''} · {steps.length} steps</span>
              {loaded && (idea || hasProgress) && <button type="button" className="ws-reset" onClick={reset}>Start over</button>}
            </div>
            <div className="ws-progress-bar" role="progressbar" aria-label="Workshop progress"
              aria-valuenow={finishedCount} aria-valuemin={0} aria-valuemax={steps.length}
              aria-valuetext={`${doneCount} done, ${skipCount} skipped, ${steps.length - finishedCount} remaining`}>
              <div className="ws-progress-fill" style={{width: `${finishedCount / steps.length * 100}%`}} />
            </div>
            {previousRun && <div className="ws-undo"><span role="status">Workshop cleared.</span>{' '}
              <button type="button" className="ws-reset" onClick={() => { setRun(previousRun); setPreviousRun(null); }}>Undo start over</button>
            </div>}
            {activeStep && <p className="ws-next">Next: <a href={`#workshop-${activeStep.id}`}>{activeStep.title} <span aria-hidden="true">↓</span></a></p>}
          </div>

          <ol className="ws-steps">
            {steps.map((step, index) => {
              const isDone = Boolean(done[step.id]);
              const isSkipped = Boolean(skipped[step.id]);
              const prompt = stepPrompt(step, idea, mode, skipped);
              const browserPrompt = step.skill && browser
                ? `${buildPrompt(step.skill)}\n\nWORKSHOP CONTEXT AND DELIVERABLE\n${prompt}`
                : null;
              return (
                <li key={step.id} id={`workshop-${step.id}`} aria-current={activeStep?.id === step.id ? 'step' : undefined}
                  className={`ws-step${isDone ? ' is-done' : ''}${activeStep?.id === step.id ? ' is-active' : ''}`}>
                  <div className="ws-step-num" aria-hidden="true">{isDone ? '✓' : isSkipped ? '–' : index + 1}</div>
                  <div className="ws-step-body">
                    <h2 className="ws-step-title">{step.title}{isSkipped && <span className="ws-skipped-label">Skipped</span>}</h2>
                    <p className="ws-step-blurb">{step.blurb}</p>
                    {step.id === 'build-plan' && <aside className="ws-extra" aria-label="Additional planning">
                      <p>For a study, consider <Link to="/docs/skills/digital-health-study-planning">study planning</Link> first.
                        For clinical records, consider <Link to="/docs/skills/fhir-data-model-design">FHIR design</Link> or <Link to="/docs/skills/fasten-ehr-integration">EHR integration</Link>.
                        Bring any extra briefs into this step too.</p>
                    </aside>}
                    {step.skill && <p className="ws-step-meta"><span>Save as</span> <code className="ws-step-output">{step.output}</code></p>}
                    {browser ? <details className="ws-browser-prompt">
                      <summary>View and copy this step’s prompt</summary>
                      <CopyBlock text={browserPrompt} label={`Browser prompt: ${step.title}`} />
                    </details> : <CopyBlock text={prompt} label={step.skill ? `Prompt: ${step.title}` : 'Terminal command'} />}
                    {step.skill && <p className="ws-skill-help"><Link to={`/docs/skills/${step.skill}`}>About this skill</Link>
                      {browser && <> · <a href={`https://github.com/StanfordSpezi/SpeziVibe/blob/main/skills/${step.skill}/SKILL.md`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${step.skill} instructions in a new tab`}>Open skill instructions <span aria-hidden="true">↗</span></a></>}
                    </p>}
                    <p className="ws-review" id={`ws-review-${step.id}`}><strong>Before marking done:</strong> {step.check}</p>
                    <div className="ws-step-actions">
                      {browser && <TryButtons className="ws-try" prompt={browserPrompt} />}
                      <button type="button" disabled={!loaded} className={`ws-done-btn${isDone ? ' is-done' : ''}`}
                        onClick={() => mark(step.id, 'done')} aria-pressed={isDone} aria-describedby={`ws-review-${step.id}`}
                        aria-label={`${isDone ? 'Mark incomplete' : 'Mark done'}: ${step.title}`}>
                        {isDone ? '✓ Done' : 'Mark done'}
                      </button>
                      {canSkip(step) && <button type="button" disabled={!loaded} className="ws-reset" onClick={() => mark(step.id, 'skipped')}
                        aria-pressed={isSkipped} aria-label={`${isSkipped ? 'Restore step' : 'Skip step'}: ${step.title}`}>
                        {isSkipped ? 'Restore step' : 'Skip this step'}
                      </button>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {allDone && <section className="ws-complete" aria-labelledby="ws-complete-title">
            <div className="ws-complete-badge">Checklist complete</div>
            <h2 id="ws-complete-title">Bring your plan into the build</h2>
            <p>You’ve marked the steps complete. Before building, check that these reviewed documents are saved in your project:</p>
            <ul>{reviewedOutputs.map((step) => <li key={step.id}><code>{step.output}</code></li>)}</ul>
            {skipCount > 0 && <p>Include any briefs you already had for the skipped steps. Keep remaining gaps visible in your implementation plan.</p>}
            {browser && <p>Move your saved Markdown documents into a project folder and <Link to="/docs/getting-started">set up your coding tool with the skills</Link>. Browser chat prepared the plan; the next step happens in your coding tool.</p>}
            <p>Use your existing project or choose a framework with your agent. Spezi starter templates are optional.</p>
            <CopyBlock label="Build handoff prompt" text="Use the build-an-app skill to resume from docs/planning/ and docs/implementation-plan.md. Check the documents that actually exist, summarize unresolved decisions, and help me prepare the project and implement the first agreed milestone. Ask me about any missing context before building." />
            <div className="ws-complete-links">
              <Link className="btn-primary" to="/docs/how-it-works">See how building works</Link>
              <Link className="btn-secondary" to="/docs/skills/spezi-platform-selection">Explore optional templates</Link>
            </div>
          </section>}
        </div>
      </section>
    </Layout>
  );
}
