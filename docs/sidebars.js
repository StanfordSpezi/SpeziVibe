// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'getting-started',
    'how-it-works',
    'skills',
    {
      type: 'category',
      label: 'Planning Skills',
      items: [
        'skills/build-an-app',
        'skills/biodesign-needs-finding',
        'skills/digital-health-ux-planning',
        'skills/digital-health-study-planning',
        'skills/digital-health-compliance-planning',
        'skills/health-data-model-planning',
        'skills/fhir-data-model-design',
        'skills/app-build-planner',
        'skills/spezi-platform-selection',
      ],
    },
    {
      type: 'category',
      label: 'Integration Skills',
      items: [
        'skills/fasten-ehr-integration',
      ],
    },
    {
      type: 'category',
      label: 'Knowledge Management',
      items: [
        'skills/project-wiki',
      ],
    },
    {
      type: 'category',
      label: 'Release',
      items: [
        'skills/keep-a-changelog-generator',
        'skills/release-notes-generator',
      ],
    },
  ],
};

export default sidebars;
