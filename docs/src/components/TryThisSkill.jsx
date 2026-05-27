import React from 'react';

const SKILL_BASE = 'https://raw.githubusercontent.com/StanfordSpezi/SpeziVibe/main/skills';

// Skills with hard dependencies on other files/skills. Listing them upfront
// makes the assistant fetch eagerly instead of improvising mid-conversation.
const DEPENDENCIES = {
  'build-an-app': {
    kind: 'orchestrator',
    subSkills: [
      'biodesign-needs-finding',
      'spezi-platform-selection',
      'digital-health-ux-planning',
      'digital-health-study-planning',
      'health-data-model-planning',
      'fhir-data-model-design',
      'digital-health-compliance-planning',
      'app-build-planner',
    ],
  },
  'app-build-planner': {
    kind: 'references',
    files: [
      'references/react-native-packages.md',
      'references/apple-native-modules.md',
      'references/milestone-patterns.md',
    ],
  },
  'spezi-platform-selection': {
    kind: 'references',
    files: [
      'references/platform-decision.md',
      'references/setup-guide.md',
    ],
  },
};

function buildPrompt(skill) {
  const skillUrl = `${SKILL_BASE}/${skill}/SKILL.md`;
  const dep = DEPENDENCIES[skill];

  const lines = [
    `Please act as the SpeziVibe \`${skill}\` skill and walk me through it interactively.`,
    '',
    'STEP 1 — Fetch the skill instructions from this URL and read them carefully:',
    skillUrl,
    '',
  ];

  if (dep && dep.kind === 'orchestrator') {
    lines.push(
      `STEP 2 — This skill is an orchestrator. It will instruct you to run other skills in sequence. When it tells you to run a sub-skill, you MUST fetch that sub-skill's SKILL.md first and follow ITS instructions before continuing — do not improvise based on the skill name alone.`,
      '',
      'Sub-skill URLs (fetch each when the orchestrator tells you to run it):',
      ...dep.subSkills.map((s) => `- ${s}: ${SKILL_BASE}/${s}/SKILL.md`),
      '',
      `If any sub-skill references additional files (e.g. \`references/foo.md\`), fetch them from ${SKILL_BASE}/<sub-skill-name>/<relative-path>.`,
      '',
    );
  } else if (dep && dep.kind === 'references') {
    lines.push(
      'STEP 2 — This skill references additional files. When the instructions tell you to read one, fetch it from these URLs:',
      ...dep.files.map((f) => `- ${f}: ${SKILL_BASE}/${skill}/${f}`),
      '',
    );
  } else {
    lines.push(
      'If the skill references other files or other skills by name, fetch them from the same repository:',
      `- Files inside this skill (e.g. \`references/foo.md\`): ${SKILL_BASE}/${skill}/<relative-path>`,
      `- Other skills (e.g. \`biodesign-needs-finding\`): ${SKILL_BASE}/<skill-name>/SKILL.md`,
      '',
    );
  }

  lines.push(
    "STEP 3 — Walk me through the skill interactively. When a step would normally save a markdown file to a project, show the file content in a code block instead so I can copy it. Don't simulate my answers — wait for me to respond.",
  );

  return lines.join('\n');
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
