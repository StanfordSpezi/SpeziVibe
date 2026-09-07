export const STORAGE_KEY = 'spezivibe-workshop-v1';

export const STEPS = [
  {
    id: 'install',
    title: 'Prepare your coding tool',
    blurb: 'Open an existing project or an empty planning folder in your coding tool. Run this command in that folder’s terminal, then follow the installer’s prompts.',
    text: "npx skills add StanfordSpezi/SpeziVibe --skill '*'",
    check: 'Ask your coding tool to list its SpeziVibe skills. Check that it can find build-an-app before continuing.',
  },
  {
    id: 'need',
    title: 'Define the need',
    blurb: 'Clarify who needs help, the problem they face, and what a better outcome would look like.',
    skill: 'biodesign-needs-finding',
    output: 'docs/planning/need-statement.md',
    task: 'Help me define a clear need statement using the biodesign-needs-finding skill.',
    check: 'Review the population, problem, and desired outcome. Save the agreed need statement.',
  },
  {
    id: 'ux',
    title: 'Design the experience',
    blurb: 'Map the main user journey, onboarding, and the everyday actions your app should support.',
    skill: 'digital-health-ux-planning',
    output: 'docs/planning/ux-brief.md',
    task: 'Use the digital-health-ux-planning skill to plan the user journeys and onboarding.',
    check: 'Review how someone starts using the app and completes its main task. Save the UX brief.',
  },
  {
    id: 'data',
    title: 'Model your health data',
    blurb: 'Define the information your app needs, how it relates, and whether it must be shared with other systems.',
    skill: 'health-data-model-planning',
    output: 'docs/planning/data-model-brief.md',
    task: 'Use the health-data-model-planning skill to define the data entities, relationships, and interoperability needs.',
    check: 'Review what is collected, where it comes from, and how it is connected. Save the data model brief.',
  },
  {
    id: 'compliance',
    title: 'Review privacy and compliance questions',
    blurb: 'Use your planned workflows and data to identify privacy, regulatory, and governance questions that need to be resolved.',
    skill: 'digital-health-compliance-planning',
    output: 'docs/planning/compliance-brief.md',
    task: 'Use the digital-health-compliance-planning skill to identify relevant privacy and compliance questions, proposed controls, and decisions that need expert review.',
    check: 'Review the proposed controls, unresolved questions, and who needs to resolve them. Save the compliance brief.',
  },
  {
    id: 'build-plan',
    title: 'Turn the briefs into a build plan',
    blurb: 'Bring your decisions together into small milestones, tasks, and checks your coding agent can work through.',
    skill: 'app-build-planner',
    output: 'docs/implementation-plan.md',
    task: 'Use the app-build-planner skill to create a milestone-based implementation plan with tasks and verification criteria. Flag missing planning inputs and unresolved decisions instead of inventing them. Keep an undecided platform explicit.',
    check: 'Review the first milestone, its verification criteria, and the open questions. Save the implementation plan.',
  },
];

export function stepsForMode(mode) {
  return STEPS.filter((step) => mode !== 'browser' || step.id !== 'install');
}

export function canSkip(step) {
  return Boolean(step.skill) && step.id !== 'build-plan';
}

export function restoreWorkshop(raw) {
  const empty = {idea: '', mode: 'coding', done: {}, skipped: {}};
  let saved;
  try { saved = JSON.parse(raw); } catch { return empty; }
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return empty;
  return {
    idea: typeof saved.idea === 'string' ? saved.idea : '',
    mode: saved.mode === 'browser' ? 'browser' : 'coding',
    done: Object.fromEntries(STEPS.filter((step) => saved.done?.[step.id] === true).map((step) => [step.id, true])),
    skipped: Object.fromEntries(STEPS.filter((step) => canSkip(step) && saved.skipped?.[step.id] === true && saved.done?.[step.id] !== true).map((step) => [step.id, true])),
  };
}

export function stepPrompt(step, idea, mode, skipped = {}) {
  if (!step.skill) return step.text;
  const earlier = STEPS.slice(0, STEPS.indexOf(step)).filter((item) => item.output);
  const lines = [`My app idea: ${idea.trim() || 'I am still exploring a digital health app idea; help me clarify it.'}`, '', step.task];
  if (earlier.length) {
    lines.push('', `${mode === 'browser' ? 'Ask me to paste or attach' : 'Read'} the earlier planning briefs, if available:`, ...earlier.map((item) => `- ${item.output}`));
    lines.push('If any are missing, ask what has been decided so far. Do not assume you have read a document that was not provided.');
  }
  if (step.id === 'build-plan') lines.push('', 'Also ask about any additional study, FHIR, or EHR integration briefs and incorporate those if available.');
  const omitted = STEPS.filter((item) => skipped[item.id]);
  if (omitted.length) lines.push('', `I skipped these workshop steps: ${omitted.map((item) => item.title).join('; ')}. Flag any resulting gaps relevant to this step.`);
  lines.push('', 'Guide me interactively, reuse the decisions I already shared, and wait for my answers before finalizing the brief.');
  lines.push(mode === 'browser'
    ? `When we agree on the result, show the full Markdown document for me to save as ${step.output}.`
    : `When we agree on the result, save it as ${step.output}.`);
  return lines.join('\n');
}
