import { users } from "@shared/schema";
import { randomUUID } from "crypto";

export class MemStorage {
  constructor() {
    this.users = new Map();
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = this.users.size + 1;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
