import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import SpeziScreens from '../components/SpeziScreens';
import SpeziProjectCards from '../components/SpeziProjectCards';
import PlatformOptions from '../components/PlatformOptions';
import {FRAMEWORK_REPO, FRAMEWORK_DOCS, REACT_NATIVE_TEMPLATE_REPO, SPEZI_MODULES, SPEZI_PROJECTS} from '../data/speziFramework';

function Section({id, label, children}) {
  const brokenLinks = useBrokenLinks();
  brokenLinks.collectAnchor(id);
  return (
    <section className="band" id={id} aria-labelledby={`${id}-title`}>
      <div className="section">
        <div className="section-rail"><span className="rail-label">{label}</span></div>
        <div className="section-main">{children}</div>
      </div>
    </section>
  );
}

export default function Framework() {
  return (
    <Layout title="Spezi framework"
      description="Start with SpeziVibe, then explore Stanford Spezi’s React Native template, Apple-native Swift framework, and real digital health projects."
      wrapperClassName="landing-page framework-page">
      <header className="page-head">
        <div className="section-rail"><span className="rail-label">The framework</span></div>
        <div className="section-main">
          <p className="eyebrow">Stanford Spezi · Free & open source</p>
          <h1>The building blocks<br />for better health apps.</h1>
          <p className="prose">
            Stanford Spezi brings together tools for building digital health apps.
            Start with SpeziVibe to plan and build with AI, then choose a React Native template,
            the Apple-native Spezi framework, or your own stack.
          </p>
          <div className="buttons framework-actions">
            <Link to="/docs/getting-started" className="btn-primary">Get started with SpeziVibe <span aria-hidden="true">→</span></Link>
            <a href={FRAMEWORK_DOCS} className="btn-secondary">Swift framework docs <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </header>

      <Section id="start-building" label="Your foundation">
        <h2 className="title" id="start-building-title">Choose the platform that fits.</h2>
        <p className="prose">
          SpeziVibe guides the planning and implementation across all three paths.
          The templates give you an app foundation; your needs determine which one to use.
        </p>
        <PlatformOptions />
        <p className="framework-note">
          For help choosing a starter, <Link to="/docs/skills/spezi-platform-selection">compare React Native and Apple-native.</Link>{' '}
          The React Native template includes its own implementation skills. Bridges to native Spezi modules are on its{' '}
          <a href={`${REACT_NATIVE_TEMPLATE_REPO}#contributing`}>roadmap</a>; the Swift modules below are for Apple-native apps.
        </p>
      </Section>

      <Section id="modules" label="Apple-native">
        <h2 className="title" id="modules-title">Build with Spezi’s Swift modules.</h2>
        <p className="prose">
          For Swift and SwiftUI apps, the Spezi framework provides reusable packages for
          accounts, consent, questionnaires, connected devices, and more.
          Each module handles a part of your app, and Spezi helps them work together.
        </p>
        <div className="framework-preview">
          <SpeziScreens />
          <p className="framework-note">Apple-native module examples from the Spezi GitHub repositories. Select a screen to explore its module.</p>
        </div>
        <div className="spezi-module-grid">
          {SPEZI_MODULES.map((module, index) => (
            <article className="spezi-module" key={module.title}>
              <span className="spezi-module-number" aria-hidden="true">0{index + 1}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <ul className="spezi-package-links" aria-label={`${module.title} packages`}>
                {module.packages.map((name) => (
                  <li key={name}><a href={`https://github.com/StanfordSpezi/${name}`}>{name} <span aria-hidden="true">↗</span></a></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="framework-note">
          Follow the <a href="https://stanfordspezi.github.io/SpeziTemplateApplication">Apple-native template guide</a> to run and adapt an app in Xcode on a Mac, or{' '}
          <a href="https://swiftpackageindex.com/stanfordspezi/spezi/documentation/spezi/initial-setup">add Spezi to an existing Swift project.</a>
        </p>
        <a href="https://github.com/StanfordSpezi" className="text-link">Explore the full ecosystem on GitHub <span aria-hidden="true">↗</span></a>
      </Section>

      <Section id="built-with-spezi" label="In practice">
        <h2 className="title" id="built-with-spezi-title">See Spezi in real projects.</h2>
        <p className="prose">From cardiac research to accessible spatial computing: apps and study integrations from Stanford Biodesign Digital Health and its collaborators.</p>
        <SpeziProjectCards projects={SPEZI_PROJECTS} />
        <p className="framework-note">Project images are from their repositories and <a href="https://bdh.stanford.edu/projects">Stanford Biodesign Digital Health</a>.</p>
        <a href="https://github.com/StanfordBDHG" className="text-link">Explore more Stanford Biodesign Digital Health projects <span aria-hidden="true">↗</span></a>
      </Section>

      <Section id="framework-community" label="Built together">
        <h2 className="title" id="framework-community-title">Open source. Open to you.</h2>
        <p className="prose">
          Spezi is housed at Stanford Biodesign and released under the MIT license.
          Explore the code, ask a question, or contribute a module of your own.
        </p>
        <div className="buttons framework-actions">
          <a href={FRAMEWORK_REPO} className="btn-primary">Spezi on GitHub <span aria-hidden="true">↗</span></a>
          <a href="https://github.com/orgs/StanfordSpezi/discussions" className="btn-secondary">Join the discussion <span aria-hidden="true">↗</span></a>
          <Link to="/about" className="text-link">Meet the people <span aria-hidden="true">→</span></Link>
        </div>
      </Section>
    </Layout>
  );
}
