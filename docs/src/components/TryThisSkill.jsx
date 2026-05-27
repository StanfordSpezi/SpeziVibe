import React from 'react';

const SKILL_BASE = 'https://raw.githubusercontent.com/StanfordSpezi/SpeziVibe/main/skills';

function buildPrompt(skill) {
  const skillUrl = `${SKILL_BASE}/${skill}/SKILL.md`;
  return [
    `Please act as the SpeziVibe \`${skill}\` skill and walk me through it interactively.`,
    '',
    'Fetch the skill instructions from this URL and follow them step by step:',
    skillUrl,
    '',
    "When a step would normally save a markdown file to a project, show the file content in a code block instead so I can copy it. Don't simulate my answers — wait for me to respond.",
  ].join('\n');
}

const TARGETS = [
  {
    key: 'claude',
    label: 'Try in Claude',
    url: (encoded) => `https://claude.ai/new?q=${encoded}`,
  },
  {
    key: 'chatgpt',
    label: 'Try in ChatGPT',
    url: (encoded) => `https://chatgpt.com/?q=${encoded}`,
  },
];

const ExternalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="try-button-ext">
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="6 4 20 12 6 20 6 4" />
  </svg>
);

export default function TryThisSkill({skill}) {
  const encoded = encodeURIComponent(buildPrompt(skill));
  return (
    <div className="try-this-skill">
      {TARGETS.map(({key, label, url}) => (
        <a
          key={key}
          href={url(encoded)}
          target="_blank"
          rel="noopener noreferrer"
          className={`try-button try-button--${key}`}
          aria-label={`${label} — opens in a new tab`}
        >
          <PlayIcon />
          <span>{label}</span>
          <ExternalIcon />
        </a>
      ))}
    </div>
  );
}
