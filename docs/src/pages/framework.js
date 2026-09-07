import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import SpeziScreens from '../components/SpeziScreens';
import SpeziProjectCards from '../components/SpeziProjectCards';
import {FRAMEWORK_REPO, FRAMEWORK_DOCS, TEMPLATE_REPO, SPEZI_MODULES, SPEZI_PROJECTS} from '../data/speziFramework';

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
      description="Build digital health apps with Stanford Spezi. Explore reusable Swift modules, the Apple-native template, developer documentation, and apps built with Spezi."
      wrapperClassName="landing-page framework-page">
      <header className="page-head">
        <div className="section-rail"><span className="rail-label">The framework</span></div>
        <div className="section-main">
          <p className="eyebrow">Stanford Spezi · Free & open source</p>
          <h1>The building blocks<br />for better health apps.</h1>
          <p className="prose">
            Spezi is a modular framework for building digital health apps. Combine reusable Swift
            packages for accounts, consent, questionnaires, connected devices, and more in your Apple-native app.
          </p>
          <div className="buttons framework-actions">
            <a href={TEMPLATE_REPO} className="btn-primary">Explore the template <span aria-hidden="true">↗</span></a>
            <a href={FRAMEWORK_DOCS} className="btn-secondary">Developer docs <span aria-hidden="true">↗</span></a>
          </div>
          <div className="framework-preview">
            <SpeziScreens />
            <p className="framework-note">Module examples from the Spezi GitHub repositories. Select a screen to explore its module.</p>
          </div>
        </div>
      </header>

      <Section id="modules" label="Make it yours">
        <h2 className="title" id="modules-title">Choose what your app needs.</h2>
        <p className="prose">
          Each module handles a part of your app. Spezi helps those modules work together,
          so you can build on existing functionality and add your own.
        </p>
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
        <a href="https://github.com/StanfordSpezi" className="text-link">Explore the full ecosystem on GitHub <span aria-hidden="true">↗</span></a>
      </Section>

      <Section id="start-building" label="Your starting point">
        <h2 className="title" id="start-building-title">From an idea to your first build.</h2>
        <p className="prose">
          Spezi provides the building blocks. SpeziVibe helps you plan and build with AI.
          Choose the starting point that fits where you are today.
        </p>
        <div className="framework-start-grid">
          <article className="framework-start">
            <p className="eyebrow">Plan with SpeziVibe</p>
            <h3>I have an app idea.</h3>
            <p>Use our skills to work through the clinical need, user experience, health data, and build plan with your AI coding tool.</p>
            <Link to="/docs/getting-started" className="text-link">Get started with AI <span aria-hidden="true">→</span></Link>
          </article>
          <article className="framework-start">
            <p className="eyebrow">Build with Spezi</p>
            <h3>I’m ready to write code.</h3>
            <p>Start with the Apple-native template to see modules working together. Follow its setup guide to run and adapt it in Xcode on a Mac.</p>
            <a href="https://stanfordspezi.github.io/SpeziTemplateApplication" className="text-link">Follow the template guide <span aria-hidden="true">↗</span></a>
          </article>
        </div>
        <p className="framework-note">
          Already have a Swift app? <a href="https://swiftpackageindex.com/stanfordspezi/spezi/documentation/spezi/initial-setup">Add Spezi to your project.</a>{' '}
          Considering iOS and Android? <Link to="/docs/skills/spezi-platform-selection">Compare Apple-native and React Native.</Link>{' '}
          SpeziVibe’s planning skills also work with other frameworks and existing codebases.
        </p>
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
