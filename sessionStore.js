import { Redis } from '@upstash/redis';

// Connect to Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds
const MAX_MESSAGES = 50; // Keep last 50 messages per session

class SessionStore {
  constructor() {
    console.log('Session store using Upstash Redis');
  }

  // Get session key for Redis
  getSessionKey(sessionId) {
    return `session:${sessionId}`;
  }

  // Add a message to session
  async addMessage(sessionId, message) {
    try {
      const key = this.getSessionKey(sessionId);
      console.log(`[Session] 💾 Adding message to session: ${sessionId}`);
      const messages = await this.getMessages(sessionId);

      messages.push(message);

      // Keep only recent messages
      const trimmedMessages = messages.slice(-MAX_MESSAGES);

      // Save with TTL
      await redis.setex(key, SESSION_TTL, JSON.stringify(trimmedMessages));

      return trimmedMessages;
    } catch (error) {
      console.error('Error adding message:', error);
      return [];
    }
  }

  // Get all messages for a session
  async getMessages(sessionId) {
    try {
      const key = this.getSessionKey(sessionId);
      console.log(`[Session] 📖 Retrieving messages for session: ${sessionId}`);
      const messages = await redis.get(key);
      // Redis might return string or object depending on client/content
      if (typeof messages === 'string') {
        return JSON.parse(messages);
      }
      return messages || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Clear a session
  async clearSession(sessionId) {
    try {
      const key = this.getSessionKey(sessionId);
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  }

  // Get stats about active sessions
  async getStats() {
    try {
      const keys = await redis.keys('session:*');
      return {
        count: keys.length,
        activeCount: keys.length
      };
    } catch (error) {
      return {
        count: 0,
        activeCount: 0
      };
    }
  }
}

// Export a single instance
export const sessionStore = new SessionStore();
