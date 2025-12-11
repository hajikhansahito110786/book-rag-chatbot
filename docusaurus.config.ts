import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AI Book with RAG Chatbot',
  tagline: 'Learn AI with interactive chatbot',
  favicon: 'img/favicon.ico',

  url: 'https://hajikhansahito110786.github.io',
  baseUrl: '/aiproject1/',

  organizationName: 'hajikhansahito110786',
  projectName: 'aiproject1',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'warn',
    markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // SIMPLIFIED: Only one script needed
  scripts: [
    {
      src: '/aiproject1/js/chatbot-all.js',
      async: true,
    },
  ],

  stylesheets: [
    // Keep only custom CSS if needed
    {
      href: '/aiproject1/css/custom.css',
      type: 'text/css',
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    
    navbar: {
      title: 'AI Book & Chatbot',
      logo: {
        alt: 'AI Book Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Book',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'dropdown',
          label: 'Chatbot',
          position: 'right',
          items: [
            {
              label: 'Open Chatbot',
              to: '/docs/rag-chatbot', // Normal link, JavaScript will intercept
            },
            {
              to: '/docs/rag-chatbot',
              label: 'How it works',
            },
            {
              href: 'http://148.230.88.136:8900/docs',
              label: 'API Docs',
              target: '_blank',
            },
          ],
        },
        {
          href: 'https://github.com/hajikhansahito110786/aiproject1',
          label: 'GitHub',
          position: 'right',
          target: '_blank',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Book',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Chatbot Guide',
              to: '/docs/rag-chatbot',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/hajikhansahito110786/aiproject1',
              target: '_blank',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AI Book Project.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'javascript'],
    },

    announcementBar: {
      id: 'chatbot_announcement',
      content: '🚀 <strong>Try our AI Chatbot!</strong> Click the 🤖 button.',
      backgroundColor: '#667eea',
      textColor: '#ffffff',
      isCloseable: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;