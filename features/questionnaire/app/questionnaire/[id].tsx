import React, { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import Alert from '@blazejkustra/react-native-alert';
import { ThemedView } from '@/components/themed-view';
import {
  QuestionnaireForm,
  QuestionnaireResult,
  defaultLightTheme,
  defaultDarkTheme,
} from '@spezivibe/questionnaire';
import { getQuestionnaireById } from '@/lib/questionnaires/sample-questionnaires';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStandard } from '@/lib/services/standard-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '@/lib/utils/logger';
import { SPEZIVIBE_TASK_ID_SYSTEM } from '@/lib/constants';

const logger = createLogger('Questionnaire');
const RESPONSES_KEY = '@questionnaire_responses';
const RESPONSES_BACKFILL_KEY = '@questionnaire_responses_backfill_done';

export default function QuestionnaireScreen() {
  const { id, taskId, eventId } = useLocalSearchParams<{ id: string; taskId?: string; eventId?: string }>();
  const { backend } = useStandard();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

  const questionnaire = getQuestionnaireById(id);

  if (!questionnaire) {
    Alert.alert('Error', 'Questionnaire not found');
    router.back();
    return null;
  }

  useEffect(() => {
    let cancelled = false;

    async function backfillQuestionnaireLinks() {
      if (!backend) return;

      try {
        const alreadyBackfilled = await AsyncStorage.getItem(RESPONSES_BACKFILL_KEY);
        if (alreadyBackfilled) return;

        const existingResponses = await AsyncStorage.getItem(RESPONSES_KEY);
        if (!existingResponses) {
          await AsyncStorage.setItem(RESPONSES_BACKFILL_KEY, 'true');
          return;
        }

        const responses = JSON.parse(existingResponses) as Array<{
          response: { id?: string; basedOn?: unknown };
          metadata?: { taskId?: string };
        }>;

        let updated = false;
        for (const record of responses) {
          if (!record?.metadata?.taskId || !record?.response?.id) {
            continue;
          }

          if (!record.response.basedOn) {
            record.response.basedOn = [
              {
                identifier: { system: SPEZIVIBE_TASK_ID_SYSTEM, value: record.metadata.taskId },
              },
            ];
            await backend.saveQuestionnaireResponse(record.response as unknown as { id?: string });
            updated = true;
          }
        }

        if (updated) {
          await AsyncStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
        }

        await AsyncStorage.setItem(RESPONSES_BACKFILL_KEY, 'true');
      } catch (error) {
        if (!cancelled) {
          logger.error('Failed to backfill questionnaire responses:', error);
        }
      }
    }

    backfillQuestionnaireLinks();

    return () => {
      cancelled = true;
    };
  }, [backend]);

  const handleResult = async (result: QuestionnaireResult) => {
    switch (result.status) {
      case 'completed': {
        try {
          const response = result.response;

          // Generate a unique ID for this response if it doesn't have one
          if (!response.id) {
            response.id = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          }

          if (taskId) {
            response.basedOn = [
              {
                identifier: { system: SPEZIVIBE_TASK_ID_SYSTEM, value: taskId },
              },
            ];
          }

          // Store response with app-specific metadata separately
          const responseRecord = {
            response,
            metadata: {
              taskId,
              eventId,
              savedAt: new Date().toISOString(),
            },
          };

          // Store in AsyncStorage (for offline support/backup)
          const existingResponses = await AsyncStorage.getItem(RESPONSES_KEY);
          const responses = existingResponses ? JSON.parse(existingResponses) : [];
          responses.push(responseRecord);
          await AsyncStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));

          // Save to backend service if available
          if (backend) {
            // Cast to unknown first to satisfy TypeScript - the backend handles the actual FHIR type
            await backend.saveQuestionnaireResponse(response as unknown as { id?: string });
          }

          Alert.alert('Success', 'Your responses have been saved', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        } catch (error) {
          logger.error('Failed to save questionnaire response:', error);
          Alert.alert('Error', 'Failed to save your responses. Please try again.');
        }
        break;
      }

      case 'cancelled':
        router.back();
        break;

      case 'failed':
        Alert.alert('Error', `Failed to complete questionnaire: ${result.error.message}`);
        break;
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <QuestionnaireForm
        questionnaire={questionnaire}
        onResult={handleResult}
        cancelBehavior="confirm"
        theme={theme}
      />
    </ThemedView>
  );
}
