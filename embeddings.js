import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "embedding-001" });

// Cache for embeddings to reduce API calls
const embeddingCache = new Map();

// Generate embeddings using Google Gemini API
export async function generateEmbedding(text) {
  // Check cache first
  const cacheKey = text.slice(0, 200);
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  try {
    const result = await model.embedContent(text);
    const embedding = result.embedding.values;

    // Ensure it's the right dimension for our vector store (768 or 1536)
    // Gemini embedding-001 is 768.

    embeddingCache.set(cacheKey, embedding);
    return embedding;
  } catch (error) {
    console.error("[Embeddings] ❌ Error generating embedding:", error);
    // Fallback to simple hash if API fails, but log it
    return simpleHashEmbedding(text);
  }
}

// Generate batch embeddings
export async function generateBatchEmbeddings(texts) {
  const embeddings = [];
  for (const text of texts) {
    embeddings.push(await generateEmbedding(text));
  }
  return embeddings;
}

// Simple hash-based embedding for basic semantic similarity
// Creates a 768-dimensional vector (to match Jina/Qdrant default)
function simpleHashEmbedding(text, dimensions = 768) {
  const embedding = new Array(dimensions).fill(0);
  const normalizedText = text.toLowerCase();

  // Character n-gram features
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText.charCodeAt(i);
    const idx = char % dimensions;
    embedding[idx] += 1;

    // Bigram features
    if (i < normalizedText.length - 1) {
      const bigram = char * 256 + normalizedText.charCodeAt(i + 1);
      embedding[(bigram % dimensions)] += 0.5;
    }
  }

  // Word-level features
  const words = normalizedText.split(/\s+/);
  for (const word of words) {
    if (word.length > 0) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash = hash & hash;
      }
      embedding[Math.abs(hash) % dimensions] += 1;
    }
  }

  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

// Chunk text into smaller pieces for better retrieval
export function chunkText(text, chunkSize = 500, overlap = 100) {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);

  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Keep some overlap
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(" ") + " " + sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}