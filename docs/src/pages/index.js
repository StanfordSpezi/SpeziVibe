import React, {useEffect, useRef} from 'react';
import Layout from '@theme/Layout';
import {useColorMode} from '@docusaurus/theme-common';

const INSTALL_CMD = 'npx skills add StanfordSpezi/SpeziVibe --all';
const ROCKET_LOGO = 'https://raw.githubusercontent.com/StanfordSpezi/SpeziVibe/main/assets/rocket-logo.png';

function copyCommand(el) {
  const text = el.querySelector('.cmd-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const hint = el.closest('.install-block').querySelector('.copied-msg');
    if (hint) {
      hint.classList.add('show');
      setTimeout(() => hint.classList.remove('show'), 2000);
    }
  });
}

function InstallBlock() {
  return (
    <div className="install-block">
      <div className="install-cmd-wrapper">
        <div className="glow-bg"></div>
        <div
          className="install-cmd"
          onClick={(e) => copyCommand(e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              copyCommand(e.currentTarget);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Copy install command"
        >
          <div className="scanline"></div>
          <span className="prompt">$</span>
          <span className="cmd-text">{INSTALL_CMD}</span>
          <button className="copy-btn" aria-label="Copy to clipboard">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
      <p className="install-hint"><span className="copied-msg">Copied!</span></p>
    </div>
  );
}

function StepCard({num, title, description, showConnector, delayClass}) {
  return (
    <div className={`step-card-wrapper reveal ${delayClass || ''}`} style={{position: 'relative'}}>
      <div className="step-num-circle">{num}</div>
      {showConnector && <div className="step-connector"></div>}
      <div className="step-card glass-card">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function SkillCard({icon, name, description, className, children, href}) {
  const linkHref = href || `/docs/skills/${name}`;
  if (children) {
    return (
      <div className={`glass-card skill-card ${className || ''} reveal`}>
        {children}
      </div>
    );
  }
  return (
    <a href={linkHref} className={`glass-card skill-card skill-card-link ${className || ''} reveal`}>
      <div className="skill-icon">{icon}</div>
      <h3>{name}</h3>
      <p>{description}</p>
      <span className="skill-card-arrow" aria-hidden="true">&rarr;</span>
    </a>
  );
}

function CompatItem({icon, label}) {
  return (
    <div className="compat-item">
      <div className="compat-icon">{icon}</div>
      {label}
    </div>
  );
}

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const {colorMode} = useColorMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;
    let animId;
    const PARTICLE_COUNT = 90;
    const isDark = colorMode === 'dark';
    const r = isDark ? 232 : 208;
    const g = isDark ? 81 : 73;
    const b = isDark ? 26 : 23;
    const opacityScale = isDark ? 1.6 : 0.9;
    const lineOpacityBase = isDark ? 0.07 : 0.04;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 0.5,
          opacity: (Math.random() * 0.5 + 0.15) * opacityScale,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacityBase * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    const handleResize = () => { resize(); createParticles(); };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [colorMode]);

  return <canvas ref={canvasRef} id="particles" />;
}

function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}

function MouseAurora() {
  useEffect(() => {
    const handler = (e) => {
      const aurora = document.querySelector('.aurora-base');
      if (!aurora) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 80;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      aurora.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return null;
}

export default function Home() {
  return (
    <Layout
      title="Vibe Code Digital Health Apps"
      description="Installable skills that help AI coding tools plan, build, and ship digital health apps. From Stanford Spezi."
      wrapperClassName="landing-page"
    >
      {/* Environmental Layers */}
      <div className="aurora-base"></div>
      <div className="aurora-accent"></div>
      <div className="grid-pattern"></div>
      <ParticleCanvas />
      <ScrollReveal />
      <MouseAurora />

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">
          <div className="pulse-dot"></div>
          From Stanford Spezi
        </div>

        <div className="hero-rocket-wrapper">
          <div className="rocket-glow-ring"></div>
          <img src={ROCKET_LOGO} alt="SpeziVibe rocket logo" className="hero-rocket" />
        </div>

        <h1>Vibe code<br /><span className="highlight">digital health</span></h1>

        <p className="subtitle">
          Installable skills that help AI coding tools plan, build, and ship digital health apps.
        </p>

        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="line"></div>
        </div>
      </section>

      {/* What is SpeziVibe */}
      <section className="landing-section what" id="about">
        <div className="reveal">
          <p className="section-label">What is SpeziVibe</p>
          <h2 className="section-title">Skills that turn an idea into a buildable plan</h2>
          <p className="section-desc">
            SpeziVibe is a set of installable skills for your AI coding tool. Describe what you want to build, and they walk you through the decisions a digital health app needs &mdash; clinical need, compliance, data model, UX &mdash; and write them up as structured markdown briefs plus an implementation plan your agent can build from. <a href="/docs/how-it-works">How it works &rarr;</a>
          </p>
        </div>
        <div className="what-visual reveal reveal-delay-1">
          <div className="glass-card skill-card-visual">
            <span className="cmt"># What the skills produce</span><br /><br />
            docs/planning/<br />
            &nbsp;&nbsp;need-statement.md<br />
            &nbsp;&nbsp;compliance-brief.md<br />
            &nbsp;&nbsp;data-model-brief.md<br />
            &nbsp;&nbsp;ux-brief.md<br />
            docs/implementation-plan.md<br /><br />
            <span className="str">&rarr; your agent builds from these</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section" id="how">
        <div className="reveal">
          <p className="section-label">How it works</p>
          <h2 className="section-title">From idea to app in three steps</h2>
        </div>
        <div className="how-steps">
          <StepCard num="01" title="Plan" description="Install the skills, then describe your app. They ask the right questions and produce markdown briefs &mdash; needs, compliance, data model, UX &mdash; and a milestone-based implementation plan." showConnector delayClass="reveal-delay-1" />
          <StepCard num="02" title="Build" description="Clone a Spezi template (React Native or Apple-native) or use any repo. Your agent builds from the briefs, milestone by milestone." showConnector delayClass="reveal-delay-2" />
          <StepCard num="03" title="Ship &amp; maintain" description="Generate changelogs and release notes, and keep a project wiki so your team&rsquo;s knowledge stays organized as you iterate." delayClass="reveal-delay-3" />
        </div>
      </section>

      {/* Skills */}
      <section className="landing-section skills-section" id="skills">
        <div className="reveal">
          <p className="section-label">Skills</p>
          <h2 className="section-title">Two ways to use SpeziVibe</h2>
          <p className="section-desc">Let <code>build-an-app</code> run the right skills for you, or run any skill yourself. Either way, you get the same structured briefs.</p>
        </div>

        {/* Two paths */}
        <div className="skill-paths reveal">
          <a href="/docs/skills/build-an-app" className="glass-card skill-card skill-card-link skill-path">
            <div className="phase-eyebrow">
              <span className="phase-eyebrow-dot"></span>
              Guided
            </div>
            <div className="skill-icon">&#9734;</div>
            <h3>build-an-app</h3>
            <p>Describe what you want to build. It figures out which skills apply, runs them in order, and hands off to implementation. The easiest way to start.</p>
            <span className="skill-card-arrow" aria-hidden="true">&rarr;</span>
          </a>
          <div className="glass-card skill-card skill-path">
            <div className="phase-eyebrow">
              <span className="phase-eyebrow-dot"></span>
              A&nbsp;la&nbsp;carte
            </div>
            <div className="skill-icon">&#9776;</div>
            <h3>Run skills yourself</h3>
            <p>Already know what you need? Run any skill on its own, in any order. Each one works standalone and writes the same briefs.</p>
            <a href="#skills-catalog" className="skill-path-link">Browse the skills &darr;</a>
          </div>
        </div>

        {/* Full catalog */}
        <div className="skill-catalog-header reveal" id="skills-catalog">
          <p className="section-label">The full catalog</p>
          <p className="section-desc">Every skill, grouped by where it fits in your project. build-an-app runs the right ones automatically &mdash; or pick any to run on its own.</p>
        </div>

        {/* Phase 01: Plan */}
        <div className="skill-phase reveal">
          <div className="skill-phase-header">
            <span className="phase-num">01 &middot; Plan</span>
          </div>
          <div className="skill-phase-grid">
            <SkillCard icon="&#9829;" name="biodesign-needs-finding" description="Walks you through a Stanford Biodesign-style needs-finding process to define a clear problem statement. Produces a need-statement.md." />
            <SkillCard icon="&#128203;" name="digital-health-compliance-planning" description="Reasons through HIPAA, IRB, FDA, GDPR, and related compliance questions early. Produces a compliance-brief.md. Not legal advice." />
            <SkillCard icon="&#128218;" name="digital-health-study-planning" description="Plans a research protocol &mdash; enrollment, consent, data collection, assessment schedules, and outcome measures. Produces a study-brief.md." />
            <SkillCard icon="&#128241;" name="digital-health-ux-planning" description="Plans user journeys, onboarding, engagement, and day-to-day workflows for patients and clinicians. Produces a ux-brief.md." />
            <SkillCard icon="&#128202;" name="health-data-model-planning" description="Defines health data entities, relationships, lifecycle states, and interoperability needs. Produces a data-model-brief.md." />
            <SkillCard icon="&#128200;" name="fhir-data-model-design" description="Maps clinical data types to specific FHIR R4 resources, terminology bindings, and relationships. Produces a fhir-data-model.md." />
          </div>
        </div>

        {/* Phase 02: Build */}
        <div className="skill-phase reveal">
          <div className="skill-phase-header">
            <span className="phase-num">02 &middot; Build</span>
          </div>
          <div className="skill-phase-grid">
            <SkillCard icon="&#9881;" name="spezi-platform-selection" description="Chooses between React Native and Apple-native for your app, sets up your dev environment, and clones the matching Spezi template." />
            <SkillCard icon="&#128203;" name="app-build-planner" description="Reads the planning briefs from the other skills and turns them into a milestone-based implementation plan with tasks, dependencies, and verification criteria. Produces an implementation-plan.md." />
          </div>
        </div>

        {/* Phase 03: Ship */}
        <div className="skill-phase reveal">
          <div className="skill-phase-header">
            <span className="phase-num">03 &middot; Ship &amp; maintain</span>
          </div>
          <div className="skill-phase-grid">
            <SkillCard icon="&#128214;" name="project-wiki" description="Maintains a persistent knowledge base for your project. Add interviews, papers, and clinical observations, and the AI integrates them across interlinked pages." />
            <SkillCard icon="&#128196;" name="keep-a-changelog-generator" description="Generates changelog entries from git history in the Keep a Changelog format. Groups commits by category and translates messages into user-facing language." />
            <SkillCard icon="&#128172;" name="release-notes-generator" description="Creates user-facing release notes from git history with feature highlights, fixes, breaking changes, and migration guidance." />
          </div>
        </div>
      </section>

      {/* Compatible tools */}
      <section className="compat">
        <div className="compat-section-inner reveal">
          <p className="section-label">Compatible with</p>
          <h2 className="section-title" style={{margin: '0 auto'}}>Works with any AI coding tool</h2>
          <p className="section-desc" style={{margin: '0.8rem auto 0', textAlign: 'center'}}>
            Skills are tool-agnostic &mdash; they work with anything that supports installable skills or custom instructions.
          </p>
          <div className="compat-logos">
            <CompatItem label="Claude Code" icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            } />
            <CompatItem label="Cursor" icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            } />
            <CompatItem label="GitHub Copilot" icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>
            } />
            <CompatItem label="OpenAI Codex" icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
            } />
            <CompatItem label="Gemini CLI" icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            } />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta">
        <div className="cta-glow"></div>
        <div className="reveal">
          <h2>Get started</h2>
          <p className="subtitle">Add the skills to your AI coding tool and start planning your first app.</p>
          <InstallBlock />
          <div className="install-or">
            <span className="or-divider">or</span>
            <a href="https://github.com/StanfordSpezi/SpeziVibe/releases/latest/download/spezivibe-skills.zip" className="btn-zip">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download as zip
            </a>
          </div>
          <div className="action-buttons">
            <a href="https://github.com/StanfordSpezi/SpeziVibe" target="_blank" rel="noopener noreferrer" className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              View on GitHub
            </a>
            <a href="/docs/getting-started" className="btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              Read Documentation
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
