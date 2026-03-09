/**
 * SecureStorage wrapper
 *
 * Provides a consistent interface for secure token/key storage.
 * Uses expo-secure-store when available, falls back to in-memory storage.
 */

export interface SecureStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

/**
 * In-memory secure storage fallback (for development/testing)
 */
export class InMemorySecureStorage implements SecureStorageAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async deleteItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}
