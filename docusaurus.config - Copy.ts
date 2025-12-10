import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'An Open Source Textbook',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://hajikhansahito110786.github.io',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/aiproject1/',
  
    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'hajikhansahito110786', // Usually your GitHub org/user name.
    projectName: 'aiproject1', // Usually your repo name.
  
    onBrokenLinks: 'throw',
  
    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },
  
    presets: [
      ['classic',
        {
          docs: {
            sidebarPath: './sidebars.ts',
            remarkPlugins: [require('remark-math')],
            rehypePlugins: [require('rehype-katex')],
            // Please change this to your repo.
            // Remove this to remove the "edit this page" links.
            editUrl:
              'https://github.com/hajikhansahito110786/aiproject1/tree/main/',
          },
          blog: {
            showReadingTime: true,
            feedOptions: {
              type: ['rss', 'atom'],
              xslt: true,
            },
            // Please change this to your repo.
            // Remove this to remove the "edit this page" links.
            editUrl:
              'https://github.com/hajikhansahito110786/aiproject1/tree/main/',
            // Useful options to enforce blogging best practices
            onInlineTags: 'warn',
            onInlineAuthors: 'warn',
            onUntruncatedBlogPosts: 'warn',
          },
          theme: {
            customCss: './src/css/custom.css',
          },
        } satisfies Preset.Options,
      ],
    ],
  
    stylesheets: [
      {
        href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
        type: 'text/css',
        integrity: 'sha384-AwFNzSTdDKNFE/u/E9/QfL2U+yQoP2fK6uB1fE5BwI5+K/qD+A/e7B3w/Bf+D/e'
      },
    ],
  
    themeConfig: {
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      metadata: [
        {name: 'keywords', content: 'physical AI, humanoid robotics, textbook, open source'},
        {name: 'description', content: 'An open-source textbook on Physical AI and Humanoid Robotics, covering fundamental concepts, advanced topics, and practical applications.'},
        {name: 'og:title', content: 'Physical AI & Humanoid Robotics - An Open Source Textbook'},
        {name: 'og:description', content: 'An open-source textbook on Physical AI and Humanoid Robotics, covering fundamental concepts, advanced topics, and practical applications.'},
        {name: 'og:type', content: 'website'},
        {name: 'og:image', content: 'https://hajikhansahito110786.github.io/aiproject1/img/docusaurus-social-card.jpg'},
        {name: 'twitter:card', content: 'summary_large_image'},
        {name: 'twitter:image', content: 'https://hajikhansahito110786.github.io/aiproject1/img/docusaurus-social-card.jpg'},
      ],
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Physical AI & Humanoid Robotics',
        logo: {
          alt: 'Physical AI & Humanoid Robotics Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Textbook',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/hajikhansahito110786/aiproject1',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Textbook',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'X',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/hajikhansahito110786/aiproject1',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'YOUR_APP_ID',
        // Public API key: it is safe to commit it
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'YOUR_INDEX_NAME',
        // Optional: path for search page that contains Algolia search box with results, default to '/search'
        // searchPagePath: 'search',
      },
    } satisfies Preset.ThemeConfig,
  };

export default config;
