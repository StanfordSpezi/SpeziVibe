// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'getting-started',
    'skills',
    {
      type: 'category',
      label: 'Planning Skills',
      items: [
        'skills/build-an-app',
        'skills/biodesign-needs-finding',
        'skills/spezi-platform-selection',
        'skills/digital-health-study-planning',
        'skills/digital-health-compliance-planning',
        'skills/health-data-model-planning',
        'skills/digital-health-ux-planning',
        'skills/fhir-data-model-design',
        'skills/app-build-planner',
      ],
    },
    {
      type: 'category',
      label: 'Knowledge Management Skills',
      items: [
        'skills/project-wiki',
      ],
    },
    {
      type: 'category',
      label: 'Release Skills',
      items: [
        'skills/keep-a-changelog-generator',
        'skills/release-notes-generator',
      ],
    },
  ],
};

export default sidebars;
