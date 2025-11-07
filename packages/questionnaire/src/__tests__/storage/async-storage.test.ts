import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAdapter } from '../../storage/adapters/async-storage';
import { QuestionnaireResponse } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('AsyncStorageAdapter', () => {
  let adapter: AsyncStorageAdapter;

  const mockResponse: QuestionnaireResponse = {
    id: 'response-1',
    questionnaireId: 'wellness-checkin',
    completedAt: new Date('2025-01-15T10:00:00Z'),
    answers: {
      mood: 8,
      energy: 'high',
    },
    metadata: {
      taskId: 'task-1',
    },
  };

  const mockResponse2: QuestionnaireResponse = {
    id: 'response-2',
    questionnaireId: 'gratitude',
    completedAt: new Date('2025-01-16T10:00:00Z'),
    answers: {
      gratitude: 'Family',
    },
  };

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a new response to AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await adapter.save(mockResponse);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@questionnaire_responses',
        JSON.stringify([mockResponse])
      );
    });

    it('should append to existing responses', async () => {
      const existing = [mockResponse];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existing));

      await adapter.save(mockResponse2);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@questionnaire_responses',
        JSON.stringify([mockResponse, mockResponse2])
      );
    });

    it('should replace existing response with same id', async () => {
      const existing = [mockResponse];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existing));

      const updated = { ...mockResponse, answers: { mood: 9 } };
      await adapter.save(updated);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@questionnaire_responses',
        JSON.stringify([updated])
      );
    });

    it('should throw error if save fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(adapter.save(mockResponse)).rejects.toThrow('Storage error');
    });
  });

  describe('getAll', () => {
    it('should return all responses', async () => {
      const responses = [mockResponse, mockResponse2];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(responses));

      const result = await adapter.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('response-1');
      expect(result[1].id).toBe('response-2');
    });

    it('should deserialize dates', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockResponse]));

      const result = await adapter.getAll();

      expect(result[0].completedAt).toBeInstanceOf(Date);
      expect(result[0].completedAt.toISOString()).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should return empty array when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await adapter.getAll();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read error'));

      const result = await adapter.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getByQuestionnaireId', () => {
    it('should filter responses by questionnaireId', async () => {
      const responses = [mockResponse, mockResponse2];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(responses));

      const result = await adapter.getByQuestionnaireId('wellness-checkin');

      expect(result).toHaveLength(1);
      expect(result[0].questionnaireId).toBe('wellness-checkin');
    });

    it('should return empty array when no matches', async () => {
      const responses = [mockResponse];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(responses));

      const result = await adapter.getByQuestionnaireId('nonexistent');

      expect(result).toEqual([]);
    });

    it('should return all responses with matching questionnaireId', async () => {
      const response3 = { ...mockResponse, id: 'response-3' };
      const responses = [mockResponse, mockResponse2, response3];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(responses));

      const result = await adapter.getByQuestionnaireId('wellness-checkin');

      expect(result).toHaveLength(2);
    });
  });

  describe('getById', () => {
    it('should return response by id', async () => {
      const responses = [mockResponse, mockResponse2];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(responses));

      const result = await adapter.getById('response-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('response-1');
    });

    it('should return null when id not found', async () => {
      const responses = [mockResponse];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(responses));

      const result = await adapter.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('should deserialize date for single response', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockResponse]));

      const result = await adapter.getById('response-1');

      expect(result!.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('deleteById', () => {
    it('should remove response by id', async () => {
      const responses = [mockResponse, mockResponse2];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(responses));

      await adapter.deleteById('response-1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@questionnaire_responses',
        JSON.stringify([mockResponse2])
      );
    });

    it('should not fail when deleting non-existent id', async () => {
      const responses = [mockResponse];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(responses));

      await adapter.deleteById('nonexistent');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@questionnaire_responses',
        JSON.stringify([mockResponse])
      );
    });

    it('should throw error if delete fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Delete error'));

      await expect(adapter.deleteById('response-1')).rejects.toThrow('Delete error');
    });
  });

  describe('clear', () => {
    it('should remove all responses', async () => {
      await adapter.clear();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@questionnaire_responses');
    });

    it('should throw error if clear fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Clear error'));

      await expect(adapter.clear()).rejects.toThrow('Clear error');
    });
  });
});
