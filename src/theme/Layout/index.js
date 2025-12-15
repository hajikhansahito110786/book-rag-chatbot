import React from 'react';
import Layout from '@theme-original/Layout';
import ChatbotIntegration from '@site/src/components/ChatbotIntegration';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <ChatbotIntegration />
    </>
  );
}