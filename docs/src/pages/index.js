import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CopyBlock from '../components/CopyBlock';
import HeroScene from '../components/HeroScene';

const INSTALL_CMD = "npx skills add StanfordSpezi/SpeziVibe --skill '*'";
const FIRST_PROMPT = 'I want to build a medication tracker for post-transplant patients. Use the build-an-app skill to walk me through it.';

const STEPS = [
  {
    title: 'Describe your idea',
    body: 'Tell your AI coding tool what you want to build and who it should help. SpeziVibe asks questions to understand the need.',
    detail: 'Start with a conversation',
  },
  {
    title: 'Make a plan together',
    body: 'Work through the experience, health data, and privacy questions that fit your project. Review the written briefs as you go.',
    detail: 'Leave with decisions you can review',
  },
  {
    title: 'Build, one milestone at a time',
    body: 'Your coding agent uses the plan to implement your app. Work in an existing project or start with a Spezi template.',
    detail: 'Keep the plan alongside your code',
  },
];

const FEATURED_SKILLS = [
  {name: 'biodesign-needs-finding', title: 'Define the clinical need', category: 'Start with the problem', desc: 'Identify who needs help, what is missing, and what a better outcome looks like.'},
  {name: 'digital-health-ux-planning', title: 'Design the experience', category: 'Put people first', desc: 'Plan onboarding and everyday workflows for patients, clinicians, and care teams.'},
  {name: 'digital-health-compliance-planning', title: 'Plan for privacy', category: 'Ask the right questions', desc: 'Identify privacy, regulatory, and governance questions to resolve before implementation.'},
  {name: 'health-data-model-planning', title: 'Organize your health data', category: 'Connect the information', desc: 'Define the information your app needs, how it relates, and how it can be shared.'},
  {name: 'app-build-planner', title: 'Sequence the build', category: 'Make it actionable', desc: 'Turn your planning decisions into milestones, tasks, and checks for your coding agent.'},
  {name: 'spezi-platform-selection', title: 'Choose an app foundation', category: 'Prepare to build', desc: 'Compare React Native and Apple-native, then set up a matching Spezi starter if it fits.'},
];

function Section({id, label, children, dark = false}) {
  return (
    <section id={id} className={`band${dark ? ' band--ink' : ''}`} aria-labelledby={`${id}-title`}>
      <div className="section">
        <div className="section-rail"><span className="rail-label">{label}</span></div>
        <div className="section-main">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Vibe coding for digital health"
      description="Vibe code digital health apps with a clear plan. SpeziVibe gives your AI coding tool a digital health playbook, from clinical need to working app. Free and open source, from Stanford Spezi."
      wrapperClassName="landing-page home-page"
    >
      <header className="launch-hero">
        <div className="masthead">
        <div className="masthead-lede">
          <p className="eyebrow"><span className="brand-dot" aria-hidden="true" />Vibe coding for digital health</p>
          <h1>From clinical need <span className="accent">to working app.</span></h1>
          <p className="masthead-sub">
            Describe your idea. Build with AI. SpeziVibe gives your coding tool a digital health
            playbook to help you ask the right questions, make a clear plan, and build one milestone at a time.
          </p>
          <div className="buttons hero-buttons">
            <Link to="/docs/getting-started" className="btn-primary">Get started <span aria-hidden="true">→</span></Link>
            <Link to="/workshop" className="btn-secondary">Explore the workshop</Link>
          </div>
          <p className="hero-note">From Stanford Spezi <span aria-hidden="true">·</span> Free & open source</p>
        </div>
        <HeroScene />
        <a className="hero-scroll" href="#how-it-works">An idea worth building <span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <div className="compatibility-strip">
        <div className="compatibility-inner">
          <p>Bring the coding tool you use</p>
          <ul aria-label="Compatible AI coding tools">
            {['Claude Code', 'Cursor', 'GitHub Copilot', 'OpenAI Codex', 'Gemini CLI'].map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </div>
      </div>

      <Section id="how-it-works" label="The workflow">
        <h2 className="title" id="how-it-works-title">Big ideas.<br />Clear next steps.</h2>
        <p className="prose">
          A skill is a reusable set of instructions for your AI coding tool. SpeziVibe’s skills
          bring digital health planning into that conversation, so your agent has a clear plan to build from.
        </p>
        <ol className="workflow-steps">
          {STEPS.map((step, index) => (
            <li className="workflow-step" key={step.title}>
              <span className="step-num" aria-hidden="true">0{index + 1}</span>
              <span className="workflow-stage">{['Need', 'Plan', 'Build'][index]}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <span className="step-detail">{step.detail}</span>
            </li>
          ))}
        </ol>
        <Link className="text-link" to="/docs/how-it-works">See the full workflow <span aria-hidden="true">→</span></Link>
      </Section>

      <Section id="example" label="An idea in motion">
        <div className="section-heading-row">
          <h2 className="title" id="example-title">See what a plan<br />can become.</h2>
          <span className="example-label">Illustrative concept</span>
        </div>
        <p className="prose">One medication-tracking idea, from the question that starts it to a screen you could build.</p>
        <div className="example-journey">
          <div className="example-need">
            <p className="example-kicker">01 / The need</p>
            <blockquote>“Did I take my morning medication?”</blockquote>
            <p>Help people keep track of their daily routine, without adding another thing to remember.</p>
            <span className="example-connector" aria-hidden="true">→</span>
          </div>
          <div className="example-plan">
            <p className="example-kicker">02 / The planning brief</p>
            <h3>A calmer daily check-in.</h3>
            <dl>
              <div><dt>For whom</dt><dd>People managing a daily medication routine.</dd></div>
              <div><dt>First milestone</dt><dd>A daily list, a way to record a dose, and a clear history.</dd></div>
              <div><dt>Decisions to resolve</dt><dd>Reminders, data storage, and who can see the record.</dd></div>
            </dl>
          </div>
          <div className="example-app">
            <p className="example-kicker">03 / A possible experience</p>
            <div className="concept-screen" role="img" aria-label="Illustrative medication tracker screen. Today, one of two medications recorded. Morning medication recorded at 8:04 AM. Evening medication not yet recorded.">
              <div className="concept-brand"><span aria-hidden="true">✳</span> Day by day <span className="concept-avatar">J</span></div>
              <p className="concept-date">YOUR DAILY CHECK-IN</p>
              <p className="concept-title">A little more<br />peace of mind.</p>
              <div className="concept-progress"><span>Today</span><strong>1 of 2 recorded</strong><div><i /></div></div>
              <div className="concept-medication"><span className="concept-check">✓</span><div><strong>Morning medication</strong><span>Recorded at 8:04 AM</span></div></div>
              <div className="concept-medication"><span className="concept-check is-pending">◷</span><div><strong>Evening medication</strong><span>Not yet recorded</span></div></div>
              <p className="concept-history">Your routine, one day at a time.</p>
            </div>
          </div>
        </div>
        <p className="example-caption">A sample brief and interface to show the process. Your agent builds from the decisions you review together.</p>
      </Section>

      <Section id="start" label="Your first session">
        <h2 className="title" id="start-title">Start with the app you have in mind.</h2>
        <p className="prose">
          Install the skills, then ask your coding tool to use <code>build-an-app</code>.
          It guides you through the skills your project needs, in the right order.
        </p>
        <div className="quickstart-steps">
          <div className="quickstart-step">
            <h3><span>01</span> Add the skills</h3>
            <p>Run this in your project’s terminal. You’ll need Node.js, Git, and an AI coding tool.</p>
            <CopyBlock text={INSTALL_CMD} label="Terminal command" />
          </div>
          <div className="quickstart-step">
            <h3><span>02</span> Describe your app</h3>
            <p>Paste this into your coding tool’s chat, replacing the example with your idea.</p>
            <CopyBlock text={FIRST_PROMPT} label="First prompt" />
          </div>
        </div>
        <div className="start-help">
          <p>New to AI coding tools? <Link to="/docs/getting-started">Follow the setup guide →</Link></p>
        </div>
      </Section>

      <section className="workshop-invitation" aria-labelledby="workshop-invitation-title">
        <div className="workshop-invitation-inner">
          <span className="eyebrow">A little guidance goes a long way</span>
          <h2 id="workshop-invitation-title">Bring your idea.<br />We’ll bring the questions.</h2>
          <div><p>Work through the decisions in a guided workshop, from the people you want to help to your first build milestone.</p>
            <Link to="/workshop" className="btn-primary">Enter the workshop <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <Section id="catalog" label="Explore the skills">
        <div className="section-heading-row">
          <h2 className="title" id="catalog-title">Help for your next decision.</h2>
          <Link to="/docs/skills" className="text-link">Browse all skills <span aria-hidden="true">→</span></Link>
        </div>
        <p className="prose">Already know where you need help? Use any skill on its own.</p>
        <div className="skill-directory">
          {FEATURED_SKILLS.map((skill, index) => (
            <Link to={`/docs/skills/${skill.name}`} className="skill-directory-row" key={skill.name}>
              <span className="skill-directory-number" aria-hidden="true">0{index + 1}</span>
              <h3>{skill.title}</h3>
              <p>{skill.desc}</p>
              <span className="skill-directory-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <p className="catalog-note">Also in the catalog: research studies, FHIR data modeling, EHR integration, project knowledge, and release tools.</p>
      </Section>

      <section className="closer band--ink" aria-labelledby="closer-title">
        <div className="closer-inner">
          <div className="section-rail"><span className="rail-label">Built in the open</span></div>
          <div className="section-main">
            <h2 id="closer-title">Better health apps start with better questions.</h2>
            <p className="prose">Created by the Stanford Biodesign Digital Health team. Free to use, adapt, and contribute to under the MIT license.</p>
            <div className="buttons">
              <Link to="/docs/getting-started" className="btn-primary">Start your first project <span aria-hidden="true">→</span></Link>
              <Link to="/about" className="btn-secondary">Meet the team</Link>
              <a className="text-link" href="https://github.com/StanfordSpezi/SpeziVibe">View on GitHub <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
