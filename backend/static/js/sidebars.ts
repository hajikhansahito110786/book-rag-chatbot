import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro'],
    },
    {
      type: 'category',
      label: 'Book Chapters',
      items: [
        'chapters/02-mathematical-foundations/index',
        'chapters/03-robot-kinematics-dynamics/index',
      ],
    },
    {
      type: 'category',
      label: 'Chatbot Features',
      items: [
        'rag-chatbot',
        'text-selection-feature',
        'project-status',
      ],
    },
  ],
};

export default sidebars;