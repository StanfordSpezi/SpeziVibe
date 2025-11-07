import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionnaireResponse, QuestionnaireStorage } from '../../types';

const INDEX_KEY = '@questionnaire_response_index';

/**
 * AsyncStorage adapter for questionnaire responses
 * This is an optional adapter that apps can use if they want local storage
 *
 * SCALABILITY: Stores each response individually instead of loading all responses
 * into memory. This prevents performance issues with large datasets.
 */
export class AsyncStorageAdapter implements QuestionnaireStorage {
  private getResponseKey(id: string): string {
    return `@questionnaire_response_${id}`;
  }

  /**
   * Get the index of all response IDs
   * The index is stored as a JSON array of response IDs
   */
  private async getIndex(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(INDEX_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get response index:', error);
      return [];
    }
  }

  /**
   * Update the index with a new response ID
   */
  private async updateIndex(id: string): Promise<void> {
    try {
      const index = await this.getIndex();
      if (!index.includes(id)) {
        index.push(id);
        await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
      }
    } catch (error) {
      console.error('Failed to update response index:', error);
      throw error;
    }
  }

  /**
   * Remove an ID from the index
   */
  private async removeFromIndex(id: string): Promise<void> {
    try {
      const index = await this.getIndex();
      const updated = index.filter((responseId) => responseId !== id);
      await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to remove from response index:', error);
      throw error;
    }
  }

  /**
   * Save a response
   * Stores the response individually and updates the index
   */
  async save(response: QuestionnaireResponse): Promise<void> {
    try {
      // Store the response
      await AsyncStorage.setItem(
        this.getResponseKey(response.id),
        JSON.stringify({
          ...response,
          completedAt: response.completedAt.toISOString(),
        })
      );

      // Update the index
      await this.updateIndex(response.id);
    } catch (error) {
      console.error('Failed to save questionnaire response:', error);
      throw error;
    }
  }

  /**
   * Get all responses
   * Note: For large datasets, consider using pagination
   */
  async getAll(): Promise<QuestionnaireResponse[]> {
    try {
      const index = await this.getIndex();
      const responses: QuestionnaireResponse[] = [];

      // Fetch each response individually
      for (const id of index) {
        const response = await this.getById(id);
        if (response) {
          responses.push(response);
        }
      }

      // Sort by completion date (most recent first)
      return responses.sort(
        (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
      );
    } catch (error) {
      console.error('Failed to get questionnaire responses:', error);
      return [];
    }
  }

  /**
   * Get responses for a specific questionnaire
   */
  async getByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]> {
    try {
      const index = await this.getIndex();
      const responses: QuestionnaireResponse[] = [];

      // Fetch each response and filter by questionnaire ID
      for (const id of index) {
        const response = await this.getById(id);
        if (response && response.questionnaireId === questionnaireId) {
          responses.push(response);
        }
      }

      // Sort by completion date (most recent first)
      return responses.sort(
        (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
      );
    } catch (error) {
      console.error('Failed to get responses by questionnaire ID:', error);
      return [];
    }
  }

  /**
   * Get a specific response by ID
   */
  async getById(id: string): Promise<QuestionnaireResponse | null> {
    try {
      const data = await AsyncStorage.getItem(this.getResponseKey(id));
      if (!data) return null;

      const response = JSON.parse(data);
      return {
        ...response,
        completedAt: new Date(response.completedAt),
      };
    } catch (error) {
      console.error('Failed to get response by ID:', error);
      return null;
    }
  }

  /**
   * Delete a response by ID
   */
  async deleteById(id: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getResponseKey(id));
      await this.removeFromIndex(id);
    } catch (error) {
      console.error('Failed to delete questionnaire response:', error);
      throw error;
    }
  }

  /**
   * Clear all responses
   */
  async clear(): Promise<void> {
    try {
      const index = await this.getIndex();

      // Delete each response
      for (const id of index) {
        await AsyncStorage.removeItem(this.getResponseKey(id));
      }

      // Clear the index
      await AsyncStorage.removeItem(INDEX_KEY);
    } catch (error) {
      console.error('Failed to clear questionnaire responses:', error);
      throw error;
    }
  }
}
