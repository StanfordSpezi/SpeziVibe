// @ts-check

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SpeziVibe',
  tagline: 'Vibe Code Digital Health Apps',
  favicon: 'https://raw.githubusercontent.com/StanfordSpezi/SpeziVibe/main/assets/rocket-logo.png',

  future: {
    v4: true,
  },

  url: 'https://spezivibe.com',
  baseUrl: '/',

  organizationName: 'StanfordSpezi',
  projectName: 'SpeziVibe',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/StanfordSpezi/SpeziVibe/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'https://raw.githubusercontent.com/StanfordSpezi/SpeziVibe/main/assets/rocket-logo.png',
      colorMode: {
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'SpeziVibe',
        logo: {
          alt: 'SpeziVibe Logo',
          src: 'https://raw.githubusercontent.com/StanfordSpezi/SpeziVibe/main/assets/rocket-logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/StanfordSpezi/SpeziVibe',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
              {
                label: 'Skills',
                to: '/docs/skills',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/StanfordSpezi/SpeziVibe',
              },
              {
                label: 'Stanford Biodesign',
                href: 'https://biodesign.stanford.edu',
              },
            ],
          },
        ],
        copyright: `Built by Stanford Mussallem Center for Biodesign. MIT License.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
