// @ts-check

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SpeziVibe',
  tagline: 'Plan and build digital health apps with AI',
  favicon: 'img/rocket-logo.png',

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
      onBrokenMarkdownLinks: 'throw',
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
      image: 'img/rocket-logo.png',
      colorMode: {
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'SpeziVibe',
        logo: {
          alt: 'SpeziVibe Logo',
          src: 'img/rocket-logo.png',
        },
        items: [
          {
            to: '/framework',
            label: 'Framework',
            position: 'left',
          },
          {
            to: '/docs/skills',
            label: 'Skills',
            position: 'left',
          },
          {
            to: '/workshop',
            label: 'Workshop',
            position: 'left',
          },
          {
            to: '/about',
            label: 'About',
            position: 'left',
          },
          {
            href: 'https://github.com/StanfordSpezi',
            label: 'GitHub',
            position: 'right',
          },
          {
            to: '/docs/getting-started',
            position: 'right',
            label: 'Get started',
            className: 'navbar-get-started',
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
                label: 'How it works',
                to: '/docs/how-it-works',
              },
              {
                label: 'Skills',
                to: '/docs/skills',
              },
              {
                label: 'Workshop',
                to: '/workshop',
              },
              {
                label: 'About',
                to: '/about',
              },
            ],
          },
          {
            title: 'Build with Spezi',
            items: [
              {
                label: 'Framework',
                to: '/framework',
              },
              {
                label: 'Apple-native template',
                href: 'https://github.com/StanfordSpezi/SpeziTemplateApplication',
              },
              {
                label: 'Developer documentation',
                href: 'https://swiftpackageindex.com/StanfordSpezi/Spezi/documentation',
              },
              {
                label: 'SpeziVibe skills on GitHub',
                href: 'https://github.com/StanfordSpezi/SpeziVibe',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Spezi on GitHub',
                href: 'https://github.com/StanfordSpezi',
              },
              {
                label: 'Discussions',
                href: 'https://github.com/orgs/StanfordSpezi/discussions',
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
