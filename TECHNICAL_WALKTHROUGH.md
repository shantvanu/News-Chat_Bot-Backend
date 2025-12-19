# 📄 Technical Walkthrough: News-Chat_Bot
**Prepared by: Shantvanu Mutha**

This document details the end-to-end technical architecture and design decisions for the RAG-powered News Chatbot.

---

## 1. Retrieval-Augmented Generation (RAG) Pipeline

### 🧠 Embedding Creation & Storage
1.  **Ingestion & Chunking**: The backend processes a curated dataset of 49 news articles. Each article's content is split into manageable chunks (approx. 500 characters) using a recursive character splitter. This ensures that the context provided to the LLM is focused and relevant.
2.  **Vector Generation**: For each chunk, we generate a 768-dimensional numerical representation (embedding) using the **Google Gemini `embedding-001`** model. 
    *   *Note*: To handle Google's free tier rate limits (15 requests/min), the ingestion process includes a 4.5-second delay between requests in production.
3.  **Indexing**: We utilize **Qdrant** as our vector database. It uses HNSW (Hierarchical Navigable Small World) indexing, allowing for ultra-fast semantic similarity searches across the stored vectors.
4.  **Storage**: Both the vectors and their corresponding metadata (title, text, source, URL) are stored in Qdrant collections.

---

## 2. Caching & Session Management

### ⚡ Upstash Redis Implementation
- **Context Persistence**: We use **Upstash Redis** to maintain conversation history. Each user is assigned a unique `sessionId` (generated via `nanoid`).
- **Data Structure**: Messages are stored as JSON strings in Redis lists. This allows for chronological retrieval of the entire conversation.
- **Optimization (TTL)**: To ensure efficiency and privacy, each session has a **24-hour TTL (Time To Live)**. This automatically purges old data while keeping current conversations fast and accessible.
- **Performance**: Fetching history from Redis takes milliseconds, significantly improving the user experience compared to traditional database queries.

---

## 3. Frontend-Backend Architecture

### 🌐 Communication Flow
- **API Strategy**: The frontend (React + Vite) communicates with the backend via a REST API. We use **TanStack Query** for state management, providing built-in handling for loading states and error retries.
- **End-to-End Request Cycle**:
    1.  User submits a query via the chat interface.
    2.  The backend generates an embedding for the question.
    3.  A similarity search is performed in Qdrant to retrieve the top 3 most relevant snippets.
    4.  The retrieved context, current message, and conversation history (from Redis) are passed to **Gemini 1.5 Flash**.
    5.  The AI returns a response structured with citations.
    6.  The backend saves the full interaction to Redis and sends it back to the client.

---

## 4. Design Decisions & Improvements

### ✅ Noteworthy Decisions
- **Standalone API Mode**: The backend is built to run as a clean, independent API server. This simplified the deployment on Render and ensures the backend remains lightweight.
- **Human-Made Aesthetics**: Avoided default UI libraries where possible to create a bespoke, premium look featuring glassmorphism, smooth CSS transitions, and an "alive" interactive feel.
- **CORS & Environment Management**: Fully production-ready with flexible CORS policies and strict environment variable validation.

### 🚀 Potential Improvements
- **Real-time Streaming**: Implementing Server-Sent Events (SSE) to stream AI responses word-by-word for a more natural interaction feel.
- **Enhanced Citations**: Adding a visual "source drawer" or hoverable tooltips to show the exact text snippet being cited.
- **Multi-Modal Capabilities**: Leveraging Gemini's ability to process images or documents alongside the text news articles.
