// Interaction checks without a browser dependency. Run with npm run check:workshop.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const React = require('react');
const root = path.resolve(__dirname, '..');

function compile(relative, imports = {}, globals = {}) {
  const {code} = babel.transformSync(fs.readFileSync(path.join(root, relative), 'utf8'), {
    babelrc: false, configFile: false,
    presets: [require.resolve('@babel/preset-react')],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  const module = {exports: {}};
  new Function('require', 'module', 'exports', ...Object.keys(globals), code)(
    (name) => imports[name] || require(name), module, module.exports, ...Object.values(globals),
  );
  return module.exports;
}

const flow = compile('src/components/workshopFlow.js');
const CopyBlock = () => null;
const trySkill = compile('src/components/TryThisSkill.jsx', {'./CopyBlock': CopyBlock});

// Keep React elements intact; drive hook updates and effects to exercise page handlers.
function mount(relative, {raw = null, storageFails = false, clipboard} = {}) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  let dirty = false;
  let tree;
  let saved = raw;
  let props = relative.includes('CopyBlock') ? {text: 'A useful prompt', label: 'Test prompt'} : undefined;
  const mockReact = {...React,
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = {value: typeof initial === 'function' ? initial() : initial};
      return [slots[index].value, (next) => {
        const value = typeof next === 'function' ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = {current: initial};
      return slots[index];
    },
    useEffect(effect, deps) {
      const index = cursor++;
      const old = slots[index];
      if (!old || deps.some((value, i) => !Object.is(value, old.deps[i]))) {
        slots[index] = {deps};
        effects.push(() => { old?.cleanup?.(); slots[index].cleanup = effect(); });
      }
    },
  };
  const Component = compile(relative, {
    react: mockReact,
    '@theme/Layout': 'layout',
    '@docusaurus/Link': 'a',
    '../components/TryThisSkill': trySkill,
    '../components/CopyBlock': CopyBlock,
    '../components/workshopFlow': flow,
  }, {
    localStorage: {
      getItem() { if (storageFails) throw Error('Unavailable'); return saved; },
      setItem(key, value) { assert.equal(key, flow.STORAGE_KEY); if (storageFails) throw Error('Unavailable'); saved = value; },
    },
    navigator: {clipboard},
  }).default;
  function render() {
    let passes = 0;
    do {
      assert(++passes < 10, 'State updates settle');
      cursor = 0; effects = []; dirty = false;
      tree = Component(props);
      effects.forEach((effect) => effect());
    } while (dirty);
    return tree;
  }
  render();
  return {
    render, get tree() { return tree; }, get saved() { return saved; },
    setProps(next) { props = next; render(); },
    dispose() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap((node) => nodes(node, predicate));
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join('');
  if (tree && typeof tree === 'object') return text(tree.props?.children);
  return tree == null || typeof tree === 'boolean' ? '' : String(tree);
}
function find(app, predicate) {
  const found = nodes(app.tree, predicate);
  assert.equal(found.length, 1, 'Expected one matching control');
  return found[0];
}
function click(app, label) {
  const button = find(app, (node) => node.type === 'button' && (node.props['aria-label'] || text(node)) === label);
  assert(!button.props.disabled);
  button.props.onClick(); app.render();
}
function mode(app, value) {
  find(app, (node) => node.type === 'input' && node.props.value === value).props.onChange(); app.render();
}
function progress(app) { return find(app, (node) => node.props?.role === 'progressbar').props; }

async function main() {
  for (const raw of [null, '{}', 'null', '[]', 'bad JSON', '42']) {
    assert.deepEqual(flow.restoreWorkshop(raw), {idea: '', mode: 'coding', done: {}, skipped: {}});
  }
  const legacy = JSON.stringify({idea: 'a medication tracker', done: {install: true, need: true, ux: 'false', unknown: true}});
  const guidedPrompt = trySkill.buildPrompt('build-an-app');
  for (const skill of fs.readdirSync(path.join(root, '..', 'skills'))) {
    if (['build-an-app', 'keep-a-changelog-generator', 'release-notes-generator'].includes(skill)) continue;
    assert(guidedPrompt.includes(`/skills/${skill}/SKILL.md`), `Browser guide can fetch ${skill}`);
  }
  assert.deepEqual(flow.restoreWorkshop(legacy).done, {install: true, need: true});
  assert.deepEqual(flow.restoreWorkshop(JSON.stringify({skipped: {install: true, 'build-plan': true, ux: true}})).skipped, {ux: true});

  const app = mount('src/pages/workshop.js', {raw: legacy});
  assert.equal(progress(app)['aria-valuenow'], 2, 'Legacy progress survives');
  assert.equal(progress(app)['aria-valuemax'], 6);
  assert.deepEqual(nodes(app.tree, (node) => node.type === 'li').map((node) => node.props.id),
    ['install', 'need', 'ux', 'data', 'compliance', 'build-plan'].map((id) => `workshop-${id}`));
  mode(app, 'browser');
  assert.equal(progress(app)['aria-valuemax'], 5, 'Browser has no fake installation step');
  assert.equal(progress(app)['aria-valuenow'], 1);
  assert(!text(app.tree).includes('npx skills'));
  const copies = nodes(app.tree, (node) => node.type === CopyBlock);
  const buttons = nodes(app.tree, (node) => node.type === trySkill.TryButtons);
  assert.equal(copies.length, 5);
  copies.forEach((copy, index) => {
    const prompt = copy.props.text;
    assert.equal(buttons[index].props.prompt, prompt, 'Copy and launch use the same context');
    assert(prompt.includes('a medication tracker'));
    assert(prompt.includes('raw.githubusercontent.com/StanfordSpezi/SpeziVibe/main/skills/'));
    assert(prompt.includes('ask me to paste them before proceeding'));
    const targets = nodes(trySkill.TryButtons({prompt}), (node) => node.type === 'a');
    targets.forEach((target) => assert.equal(new URL(target.props.href).searchParams.get('q'), prompt));
  });
  assert(copies.at(-1).props.text.includes('Ask me to paste or attach'));
  assert(copies.at(-1).props.text.includes('docs/planning/ux-brief.md'));
  assert(copies.at(-1).props.text.includes('references/milestone-patterns.md'));

  click(app, 'Skip step: Design the experience');
  assert.equal(progress(app)['aria-valuenow'], 2);
  click(app, 'Mark done: Design the experience');
  assert.equal(progress(app)['aria-valuenow'], 2, 'Done replaces skip without double counting');
  click(app, 'Mark incomplete: Design the experience');
  click(app, 'Skip step: Design the experience');
  click(app, 'Skip step: Model your health data');
  click(app, 'Skip step: Review privacy and compliance questions');
  assert(!text(app.tree).includes('Checklist complete'), 'Build plan remains required');
  click(app, 'Mark done: Turn the briefs into a build plan');
  assert(text(app.tree).includes('Checklist complete'));
  const completion = find(app, (node) => node.props?.className === 'ws-complete');
  assert(text(completion).includes('docs/implementation-plan.md'));
  assert(!text(completion).includes('docs/planning/ux-brief.md'), 'Skipped files are not claimed complete');
  const completedRun = app.saved;
  const resumed = mount('src/pages/workshop.js', {raw: completedRun});
  assert(text(resumed.tree).includes('Checklist complete'), 'Completion and mode survive reload');
  click(app, 'Start over');
  assert.equal(progress(app)['aria-valuenow'], 0);
  assert.equal(find(app, (node) => node.type === 'textarea').props.value, '');
  click(app, 'Undo start over');
  assert.equal(app.saved, completedRun, 'Undo restores the complete run');
  mode(app, 'coding');
  assert.equal(progress(app)['aria-valuemax'], 6);
  assert.equal(progress(app)['aria-valuenow'], 6, 'Switching mode keeps installation progress');

  const unavailable = mount('src/pages/workshop.js', {storageFails: true});
  assert(text(unavailable.tree).includes('cannot save your workshop'));
  click(unavailable, 'Mark done: Prepare your coding tool');
  assert.equal(progress(unavailable)['aria-valuenow'], 1, 'Storage failures do not block work');
  const blank = flow.stepPrompt(flow.STEPS[1], '  ', 'coding');
  assert(blank.includes('help me clarify it'));
  for (const step of flow.STEPS.filter((step) => step.skill)) {
    const source = fs.readFileSync(path.join(root, '..', 'skills', step.skill, 'SKILL.md'), 'utf8');
    assert(source.includes(step.output), `${step.skill} saves the advertised output`);
    assert(flow.stepPrompt(step, 'My idea.', 'coding').includes('My app idea: My idea.'));
  }

  let copied;
  const copy = mount('src/components/CopyBlock.jsx', {clipboard: {async writeText(value) { copied = value; }}});
  await find(copy, (node) => node.type === 'button').props.onClick(); copy.render();
  assert.equal(copied, 'A useful prompt');
  assert(text(copy.tree).includes('Copied!'));
  copy.setProps({text: 'An updated prompt', label: 'Test prompt'});
  assert(!text(copy.tree).includes('Copied!'), 'Editing a prompt clears stale copy feedback');
  let resolveCopy;
  const pendingCopy = mount('src/components/CopyBlock.jsx', {clipboard: {writeText() { return new Promise((resolve) => { resolveCopy = resolve; }); }}});
  const pending = find(pendingCopy, (node) => node.type === 'button').props.onClick();
  pendingCopy.setProps({text: 'A different prompt', label: 'Test prompt'});
  resolveCopy(); await pending; pendingCopy.render();
  assert(!text(pendingCopy.tree).includes('Copied!'), 'Late clipboard completion cannot claim the edited prompt was copied');
  const blockedCopy = mount('src/components/CopyBlock.jsx');
  await find(blockedCopy, (node) => node.type === 'button').props.onClick(); blockedCopy.render();
  assert(text(blockedCopy.tree).includes('copy it manually'));
  [app, resumed, unavailable, copy, pendingCopy, blockedCopy].forEach((item) => item.dispose());
  console.log('Workshop checks passed: both paths, prompt parity and context, skill outputs, skip/done, completion, persistence, reset/undo, unavailable storage, and clipboard fallback.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
