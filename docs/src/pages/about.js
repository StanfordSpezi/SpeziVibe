import React from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {SPEZI_CONTRIBUTORS} from '../data/speziContributors';

const TEAM = [
  {name: 'Vishnu Ravi', credentials: 'MD, FAMIA', photo: '/img/team/vishnu-ravi.jpg', initials: 'VR', linkedin: 'https://www.linkedin.com/in/vishnuravimd'},
  {name: 'Oliver Aalami', credentials: 'MD', photo: '/img/team/oliver-aalami.jpg', initials: 'OA', linkedin: 'https://www.linkedin.com/in/oliver-aalami-67035'},
  {name: 'Aydin Zahedivash', credentials: 'MD, MBA', photo: '/img/team/aydin-zahedivash.jpg', initials: 'AZ', linkedin: 'https://www.linkedin.com/in/aydin-zahedivash'},
];

const LINKS = [
  {label: 'Spezi on GitHub', href: 'https://github.com/StanfordSpezi', icon: 'github'},
  {label: 'Stanford Mussallem Center for Biodesign', href: 'https://biodesign.stanford.edu', icon: 'landmark'},
];

function LinkIcon({name}) {
  if (name === 'github') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
      </svg>
    );
  }
  if (name === 'landmark') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="3" y1="22" x2="21" y2="22"></line>
        <line x1="4" y1="10" x2="4" y2="18"></line>
        <line x1="9" y1="10" x2="9" y2="18"></line>
        <line x1="15" y1="10" x2="15" y2="18"></line>
        <line x1="20" y1="10" x2="20" y2="18"></line>
        <polygon points="12 2 20 7 4 7 12 2"></polygon>
      </svg>
    );
  }
  return null;
}

export default function About() {
  const imageBase = useBaseUrl('/img/team/');
  return (
    <Layout
      title="About"
      description="Stanford Spezi is an open-source digital health ecosystem housed at Stanford Biodesign. Meet our project leadership and contributors."
      wrapperClassName="landing-page"
    >
      <header className="page-head">
        <div className="section-rail">
          <span className="rail-label">About</span>
        </div>
        <div className="section-main">
          <h1>Good ideas should reach patients faster</h1>
          <p className="prose">
            Stanford Spezi is an open-source digital health ecosystem housed at Stanford Biodesign.
            SpeziVibe is our toolkit for turning clinical needs into working apps with AI.
          </p>
        </div>
      </header>

      <div className="band">
        <section className="section" aria-labelledby="project-leads-title">
          <div className="section-rail">
            <span className="rail-label">People</span>
          </div>
          <div className="section-main">
            <h2 className="title" id="project-leads-title">Project leadership</h2>
            <div className="team">
              {TEAM.map((m) => (
                <div className="member" key={m.name}>
                  <div className="member-avatar">
                    <span className="member-initials" aria-hidden="true">{m.initials}</span>
                    <img
                      src={`${imageBase}${m.photo.split('/').pop()}`}
                      alt=""
                      width="60"
                      height="60"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.hidden = true; }}
                    />
                  </div>
                  <div>
                    <h3 className="member-name">
                      <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn (opens in a new tab)`}>
                        {m.name} <span aria-hidden="true">↗</span>
                      </a>
                    </h3>
                    <p className="member-cred">{m.credentials}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="band">
        <section className="section" aria-labelledby="contributors-title">
          <div className="section-rail">
            <span className="rail-label">Community</span>
          </div>
          <div className="section-main">
            <h2 className="title" id="contributors-title">Spezi contributors</h2>
            <ul className="contributors-list">
              {SPEZI_CONTRIBUTORS.map((contributor) => (
                <li key={contributor.github}>
                  <a href={`https://github.com/${contributor.github}`} target="_blank" rel="noopener noreferrer"
                    aria-label={`${contributor.name} on GitHub (opens in a new tab)`}>
                    {contributor.name}
                  </a>
                </li>
              ))}
            </ul>
            <a className="text-link" href="https://github.com/StanfordSpezi/Spezi/blob/main/CONTRIBUTORS.md" target="_blank" rel="noopener noreferrer">
              View the contributor list on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </div>

      <div className="band">
        <section className="section" aria-labelledby="learn-more-title">
          <div className="section-rail">
            <span className="rail-label">Learn more</span>
          </div>
          <div className="section-main">
            <h2 className="title" id="learn-more-title">Explore the Spezi ecosystem</h2>
            <div className="links">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-row">
                  <span className="ico"><LinkIcon name={l.icon} /></span>
                  <span>{l.label}</span>
                  <span className="go" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
