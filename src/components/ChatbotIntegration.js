import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const ChatbotIntegration = () => {
  return (
    <BrowserOnly>
      {() => {
        const Chatbot = require('../../chatbot/Chatbot').default;
        return <Chatbot />;
      }}
    </BrowserOnly>
  );
};

export default ChatbotIntegration;