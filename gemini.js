// Gemini AI integration for RAG-powered responses
// Uses Google's Gemini API for generating answers
// Follow Gemini blueprint instructions

import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

// Generate a response using RAG
export async function generateResponse(
  query,
  context,
  conversationHistory = []
) {
  // Build context from search results
  const contextText = context
    .map((result, idx) => {
      return `[Source ${idx + 1}: ${result.article.title}]\n${result.chunk}`;
    })
    .join("\n\n");

  // Build conversation history for context
  const historyText = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");

  const systemPrompt = `You are a helpful news assistant that answers questions based on provided news articles. 
Your responses should be, acknowledge this and provide what you can

Always cite your sources when referring to specific information from the articles.
If you cannot find relevant information in the provided context, say so honestly.`;

  const userPrompt = `Based on the following news articles, please answer the user's question.

RELEVANT NEWS ARTICLES:
${contextText || "No relevant articles found for this query."}

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n\n` : ""}USER QUESTION:
${query}

Please provide a helpful, accurate response based on the articles above.`;

  const fullPrompt = systemPrompt + "\n\n" + userPrompt;

  console.log(`[Gemini] 🤖 Generating content with model: gemini-1.5-flash`);
  console.log(`[Gemini] 📝 Context length: ${contextText.length} chars`);
  console.log(`[Gemini] 📝 History length: ${historyText.length} chars`);

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    console.log(`[Gemini] ✅ Generated response successfully (${text.length} chars)`);

    if (text) {
      return text;
    }

    return "I apologize, but I was unable to generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    console.log(`[Gemini] ❌ API call failed: ${error.message}`);

    // Fallback response if API fails
    if (context.length > 0) {
      return `Based on the news articles I found, here's a summary:\n\n${context
        .slice(0, 3)
        .map((r) => `**${r.article.title}**: ${r.chunk.slice(0, 200)}...`)
        .join("\n\n")}\n\nFor a more detailed response, please try again in a moment.`;
    }

    return "I'm having trouble connecting to the AI service. Please try again in a moment.";
  }
}
