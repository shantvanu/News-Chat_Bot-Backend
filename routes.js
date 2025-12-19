import { createServer } from "http";
import { vectorStore } from "./vectorStore.js";
import { sessionStore } from "./sessionStore.js";
import { generateEmbedding } from "./embeddings.js";
import { generateResponse } from "./gemini.js";
import { nanoid } from "nanoid";

// Setup API routes for the chatbot
export function registerRoutes(httpServer, app) {

  // Main chat endpoint - handles user messages and returns AI responses
  app.post("/api/chat", async (req, res) => {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        console.log(`[API] ⚠️ Missing sessionId or message in request body`);
        return res.status(400).json({ error: "Missing sessionId or message" });
      }

      console.log(`[API] 📩 Received chat request for session: ${sessionId}`);
      console.log(`[API] 💬 User message: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`);

      // Save user message to session
      await sessionStore.addMessage(sessionId, {
        id: nanoid(),
        role: "user",
        content: message,
        timestamp: Date.now()
      });

      // Convert user query to embedding for vector search
      console.log(`[API] 🧠 Generating embedding for user query...`);
      const queryEmbedding = await generateEmbedding(message);
      console.log(`[API] ✅ Embedding generated successfully`);

      // Find relevant article chunks from Qdrant
      console.log(`[API] 🔍 Searching vector store for relevant context...`);
      const searchResults = await vectorStore.search(queryEmbedding, 3);
      console.log(`[API] ✅ Found ${searchResults.length} relevant chunks`);

      // Get recent chat history for context
      const history = await sessionStore.getMessages(sessionId);
      const recentHistory = history.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Generate AI response using Gemini with retrieved context
      console.log(`[API] 🤖 Sending request to Gemini AI...`);
      const aiResponse = await generateResponse(message, searchResults, recentHistory);
      console.log(`[API] ✅ Received response from Gemini AI`);

      // Save AI response to session
      await sessionStore.addMessage(sessionId, {
        id: nanoid(),
        role: "assistant",
        content: aiResponse,
        sources: searchResults,
        timestamp: Date.now()
      });

      // Return response with sources
      res.json({
        response: aiResponse,
        sources: searchResults.slice(0, 3).map(r => ({
          title: r.article?.title || "Unknown",
          source: r.article?.source || "Unknown",
          url: r.article?.url || "",
          snippet: (r.chunk || "").substring(0, 150) + "..."
        })),
        timestamp: Date.now()
      });

    } catch (error) {
      console.error("Error in chat:", error);
      console.log(`[API] ❌ Error processing chat request: ${error.message}`);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Get chat history for a session
  app.get("/api/chat/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await sessionStore.getMessages(sessionId);
      res.json({ messages }); // Wrap in object as expected by Chat.jsx:28
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Clear a session's chat history
  app.delete("/api/chat/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await sessionStore.clearSession(sessionId);
      res.json({ success: true, message: "Session cleared" });
    } catch (error) {
      console.error("Error clearing session:", error);
      res.status(500).json({ error: "Failed to clear session" });
    }
  });

  // Health check endpoint - shows system status
  app.get("/api/health", async (_req, res) => {
    try {
      const stats = await vectorStore.getStats();
      const sessionStats = await sessionStore.getStats();

      res.json({
        status: "ok",
        vectorStore: stats,
        sessions: sessionStats,
        timestamp: Date.now()
      });
    } catch (error) {
      res.json({
        status: "error",
        message: error.message,
        timestamp: Date.now()
      });
    }
  });

  return httpServer;
}
