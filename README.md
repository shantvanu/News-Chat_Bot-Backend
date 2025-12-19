# News Chatbot - Backend

This is the backend for the RAG-powered News Chatbot, built for the Voosh Full Stack Developer assignment.

## Tech Stack
- **Node.js (Express)**: Server framework
- **Google Gemini 1.5 Flash**: LLM for response generation
- **Gemini Embeddings**: For text vectorization
- **Qdrant**: Vector database for storage and retrieval
- **Upstash Redis**: In-memory session and history management

## Features
- **RAG Pipeline**: Semantic search over a news corpus using Gemini embeddings and Qdrant.
- **Session Management**: Persistent chat history via Redis with a 24-hour TTL.
- **REST API**: Clean endpoints for chat, history, and health checks.
- **CORS Enabled**: Ready for cross-origin requests from the frontend.

## Getting Started

### Prerequisites
- Node.js 18+
- Qdrant Cloud Account
- Google AI Studio API Key
- Upstash Redis Account

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see `.env.example`).
4. Start the server:
   ```bash
   npm run start
   ```

## API Endpoints
- `POST /api/chat`: Send a message and get an AI response.
- `GET /api/chat/history/:sessionId`: Retrieve chat history.
- `DELETE /api/chat/session/:sessionId`: Clear a session.
- `GET /api/health`: Check system status and article counts.

---
Built by Shantvanu Mutha
