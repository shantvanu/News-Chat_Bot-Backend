import { QdrantClient } from '@qdrant/js-client-rest';

// Setup Qdrant client with credentials from environment
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'news_articles_v3';
const EMBEDDING_DIM = 768; // Jina embeddings dimension

class VectorStore {
  constructor() {
    this.initialized = false;
    this.articles = new Map(); // Keep articles in memory for quick access
  }

  async initialize() {
    try {
      // Check if collection exists, create if not
      const collections = await qdrantClient.getCollections();
      const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

      if (!exists) {
        await qdrantClient.createCollection(COLLECTION_NAME, {
          vectors: { size: EMBEDDING_DIM, distance: 'Cosine' }
        });
        console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
      }

      this.initialized = true;
      console.log('Qdrant vector store ready');
    } catch (error) {
      console.error('Failed to initialize Qdrant:', error);
      // Don't throw, just log. We might be offline or have bad creds.
      // throw error; 
    }
  }

  // Add chunks with their embeddings to Qdrant
  async addChunks(chunks) {
    if (!this.initialized) {
      console.log(`[VectorStore] ⚠️ Vector store not initialized, initializing now...`);
      await this.initialize();
    }

    console.log(`[VectorStore] 📥 Adding ${chunks.length} chunks to vector store`);

    const points = chunks.map((chunk, index) => ({
      id: Date.now() + index, // Simple ID generation
      vector: chunk.embedding,
      payload: {
        articleId: chunk.articleId,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex
      }
    }));

    try {
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points
      });

      // Store article metadata in memory
      chunks.forEach(chunk => {
        if (chunk.article && !this.articles.has(chunk.articleId)) {
          this.articles.set(chunk.articleId, chunk.article);
        }
      });

      console.log(`Added ${chunks.length} chunks to Qdrant`);
    } catch (error) {
      console.error('Error adding chunks:', error);
      // throw error;
    }
  }

  // Search for similar chunks using Qdrant
  async search(queryEmbedding, topK = 3) {
    if (!this.initialized) {
      console.log(`[VectorStore] ⚠️ Vector store not initialized, initializing now...`);
      await this.initialize();
    }

    console.log(`[VectorStore] 🔍 Searching for similar vectors (topK=${topK})`);

    try {
      const searchResult = await qdrantClient.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        limit: topK,
        with_payload: true
      });

      // Format results with article info
      const results = searchResult.map(result => {
        const article = this.articles.get(result.payload.articleId);
        return {
          article: article || {},
          chunk: result.payload.content,
          score: result.score,
          chunkIndex: result.payload.chunkIndex
        };
      });

      return results;
    } catch (error) {
      console.error('Error searching vectors:', error);
      console.log(`[VectorStore] ❌ Vector search failed: ${error.message}`);
      return [];
    }
  }

  // Get stats about the vector store
  async getStats() {
    try {
      const collection = await qdrantClient.getCollection(COLLECTION_NAME);

      return {
        initialized: this.initialized,
        articleCount: this.articles.size,
        chunkCount: collection.points_count || 0
      };
    } catch (error) {
      return {
        initialized: this.initialized,
        articleCount: this.articles.size,
        chunkCount: 0
      };
    }
  }

  setInitialized(value) {
    this.initialized = value;
  }
}

// Export a single instance
export const vectorStore = new VectorStore();
