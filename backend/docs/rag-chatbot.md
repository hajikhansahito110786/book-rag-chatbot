--- 
sidebar_position: 1 
title: RAG Chatbot Guide 
description: How to use the AI-powered chatbot with this book 
--- 
ECHO is on.
# RAG Chatbot Integration 
ECHO is on.
This book features an AI-powered chatbot that can answer questions about the content. 
ECHO is on.
## Features 
ECHO is on.
1. **Ask about entire book** - Questions about any topic in the book 
2. **Selected text mode** - Select specific text and ask questions about it 
3. **AI-powered answers** - Uses OpenAI to generate context-aware responses 
ECHO is on.
## How to Use 
ECHO is on.
1. Click the ?? **Ask AI** button in bottom right corner 
2. Type your question in the chat input 
3. Select text from the book for specific questions 
4. Switch between "Entire Book" and "Selected Text" modes 
ECHO is on.
## Backend API 
ECHO is on.
The chatbot connects to a FastAPI backend at \`http://localhost:8000\` 
ECHO is on.
\`\`\`bash 
# Start backend 
cd backend 
uvicorn main:app --reload --host 0.0.0.0 --port 8000 
\`\`\` 
