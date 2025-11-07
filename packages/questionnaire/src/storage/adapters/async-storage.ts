import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionnaireResponse, QuestionnaireStorage } from '../../types';

const STORAGE_KEY = '@questionnaire_responses';

/**
 * AsyncStorage adapter for questionnaire responses
 * This is an optional adapter that apps can use if they want local storage
 */
export class AsyncStorageAdapter implements QuestionnaireStorage {
  async save(response: QuestionnaireResponse): Promise<void> {
    try {
      const existing = await this.getAll();
      const updated = [...existing.filter((r) => r.id !== response.id), response];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save questionnaire response:', error);
      throw error;
    }
  }

  async getAll(): Promise<QuestionnaireResponse[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const responses = JSON.parse(data);
      // Deserialize dates
      return responses.map((r: any) => ({
        ...r,
        completedAt: new Date(r.completedAt),
      }));
    } catch (error) {
      console.error('Failed to get questionnaire responses:', error);
      return [];
    }
  }

  async getByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]> {
    const all = await this.getAll();
    return all.filter((r) => r.questionnaireId === questionnaireId);
  }

  async getById(id: string): Promise<QuestionnaireResponse | null> {
    const all = await this.getAll();
    return all.find((r) => r.id === id) || null;
  }

  async deleteById(id: string): Promise<void> {
    try {
      const existing = await this.getAll();
      const updated = existing.filter((r) => r.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete questionnaire response:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear questionnaire responses:', error);
      throw error;
    }
  }
}
