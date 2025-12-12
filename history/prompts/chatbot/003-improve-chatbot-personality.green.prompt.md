---
id: 003
title: Improve Chatbot Personality and Expectation Management
stage: green
date: 2025-12-12
surface: agent
model: gemini
feature: chatbot
branch: main
user: {{USER}}
command: |-
  still not happy asking jumbo pizza
labels: [chatbot, backend, UX, prompt-engineering]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/main.py
  - backend/seed_data.json
tests:
  - none
---

## Prompt

{{PROMPT_TEXT}}

## Response snapshot

I have updated the chatbot to have a clearer personality and to better manage user expectations. I have named the chatbot "Docus" and updated its introduction to be very clear that it can only answer questions about the documents it has been given. When asked a question it cannot answer, it will now respond in a friendly way that reinforces its role.

## Outcome

- ✅ Impact: The chatbot now has a clearer personality and does a better job of managing user expectations about its capabilities.
- 🧪 Tests: No new tests were added.
- 📁 Files: Updated the backend prompt and seed data to create the 'Docus' persona and clarify its role as a RAG-only chatbot.
- 🔁 Next prompts: None.
- 🧠 Reflection: The user's continued dissatisfaction showed that simply making the 'I don't know' message friendlier wasn't enough. The core issue was a mismatch in expectations about the chatbot's function. Giving it a name and explicitly defining its limitations in its introductory messages and system prompt is a better solution.

## Evaluation notes (flywheel)

- Failure modes observed: User might still be unhappy that the chatbot can't answer general questions.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): If the user is still unhappy, consider implementing a hybrid approach where out-of-domain questions are routed to a general-purpose model.
