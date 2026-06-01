import React, {useEffect} from 'react';
import Layout from '@theme/Layout';

const TEAM = [
  {name: 'Vishnu Ravi', credentials: 'MD, FAMIA', photo: '/img/team/vishnu-ravi.jpg', initials: 'VR'},
  {name: 'Oliver Aalami', credentials: 'MD', photo: '/img/team/oliver-aalami.jpg', initials: 'OA'},
  {name: 'Aydin Zahedivash', credentials: 'MD, MBA', photo: '/img/team/aydin-zahedivash.jpg', initials: 'AZ'},
];

const LINKS = [
  {label: 'Spezi website', href: 'https://spezi.stanford.edu', icon: 'globe'},
  {label: 'Spezi on GitHub', href: 'https://github.com/StanfordSpezi', icon: 'github'},
  {label: 'Stanford Mussallem Center for Biodesign', href: 'https://biodesign.stanford.edu', icon: 'landmark'},
];

function LinkIcon({name}) {
  if (name === 'github') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/>
      </svg>
    );
  }
  if (name === 'landmark') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="3" y1="22" x2="21" y2="22"></line>
        <line x1="4" y1="10" x2="4" y2="18"></line>
        <line x1="9" y1="10" x2="9" y2="18"></line>
        <line x1="15" y1="10" x2="15" y2="18"></line>
        <line x1="20" y1="10" x2="20" y2="18"></line>
        <polygon points="12 2 20 7 4 7 12 2"></polygon>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}

function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.1});
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}

function TeamMember({name, credentials, photo, initials, delayClass}) {
  return (
    <div className={`glass-card team-card reveal ${delayClass || ''}`}>
      <div className="team-avatar">
        <span className="team-initials" aria-hidden="true">{initials}</span>
        <img
          src={photo}
          alt={name}
          loading="lazy"
          onError={(e) => { e.currentTarget.remove(); }}
        />
      </div>
      <h3 className="team-name">{name}</h3>
      <p className="team-credentials">{credentials}</p>
    </div>
  );
}

export default function About() {
  return (
    <Layout
      title="About"
      description="SpeziVibe is part of the Stanford Spezi ecosystem — an open-source effort to make modern, interoperable digital health apps easier to build."
      wrapperClassName="landing-page"
    >
      <div className="aurora-base"></div>
      <div className="aurora-accent"></div>
      <div className="grid-pattern"></div>
      <ScrollReveal />

      <section className="about-wrap">
        <div className="reveal">
          <h1 className="section-label">About</h1>
        </div>

        <div className="glass-card about-intro reveal reveal-delay-1">
          <p>
            SpeziVibe and the broader <a href="https://spezi.stanford.edu" target="_blank" rel="noopener noreferrer">Spezi</a> ecosystem exist to put modern, trustworthy digital health development within reach of anyone with an idea, so good ideas reach patients faster. Created at Stanford by the Stanford Biodesign Digital Health team, it&rsquo;s open-source and free to use &mdash; for research, clinical, and commercial work alike.
          </p>
        </div>

        <div className="reveal">
          <h2 className="section-label about-eyebrow">Project leads</h2>
        </div>
        <div className="team-grid">
          {TEAM.map((m, i) => (
            <TeamMember key={m.slug} {...m} delayClass={`reveal-delay-${i + 1}`} />
          ))}
        </div>

        <div className="reveal">
          <h2 className="section-label about-links-title">Learn more</h2>
        </div>
        <div className="about-links reveal reveal-delay-1">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="about-link">
              <span className="about-link-icon"><LinkIcon name={l.icon} /></span>
              <span className="about-link-label">{l.label}</span>
              <span className="about-link-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </span>
            </a>
          ))}
        </div>
      </section>
    </Layout>
  );
}
