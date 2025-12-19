# 🎥 Demo Video Guide & Script

This guide outlines the steps and script for recording the demonstration video for the **News Chatbot** assignment.

## 🛠 Preparation
1.  **Ensure Services are Live**: Verify your Render (Backend) and Netlify (Frontend) URLs are working.
2.  **Tools**: Use a screen recorder like OBS, Zoom, or Loom. 
3.  **Duration**: Aim for 3-5 minutes.

---

## 🎬 Video Script Overview

### Part 1: Introduction & Starting (30s)
*   **Action**: Show the browser with the Netlify URL open.
*   **Script**: "Hi, I'm Shantvanu. I'll be demonstrating my RAG-powered News Chatbot. The application is built with a React frontend, Node.js backend, and a Gemini AI engine. As you can see, the frontend is live on Netlify and successfully connected to the backend API."

### Part 2: Sending Queries (2 mins)
*   **Action**: Type a query like: *"What are the latest updates on sustainable energy?"*
*   **Observation**: Point out the loading states and the AI response appearing.
*   **Script**: "Let's ask a question. I'll search for sustainable energy trends. The system is now generating an embedding for my query, searching the Qdrant vector store, and retrieving relevant context for Gemini."
*   **Action**: Highlight the **Citations** at the bottom of the response.
*   **Script**: "Notice that the response includes specific citations from the source articles, ensuring accuracy and reducing hallucinations."

### Part 3: Chat History & Persistence (1 min)
*   **Action**: Refresh the page or open the URL in a new tab.
*   **Script**: "The chat history is persistent, powered by Upstash Redis. Even if I refresh the page, my entire conversation history is retrieved instantly from the cache."

### Part 4: Resetting the Session (30s)
*   **Action**: Click the "Reset Chat" or "New Chat" button and confirm.
*   **Script**: "If I want to start fresh, I can reset the session. This clears the chat list in the UI and resets the session ID, ensuring a clean state for the next conversation."

### Part 5: Conclusion
*   **Script**: "That concludes the demo. The project is fully functional, meeting all the assignment's technical and design requirements. Thank you!"

---

## 🚩 Key Elements to Show:
- [ ] **Starting**: The initial UI load.
- [ ] **Interaction**: Typing at least 2 different questions.
- [ ] **Citations**: Hovering or pointing out the source links.
- [ ] **History**: Refreshing to show the chat stays.
- [ ] **Reset**: The "Reset" button action.
