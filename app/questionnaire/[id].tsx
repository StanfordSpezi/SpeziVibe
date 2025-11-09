import { useLocalSearchParams, router } from 'expo-router';
import { Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import {
  QuestionnaireForm,
  QuestionnaireResult,
  defaultLightTheme,
  defaultDarkTheme,
} from '@spezivibe/questionnaire';
import { getQuestionnaireById } from '@/lib/questionnaires/sample-questionnaires';
import { useScheduler } from '@/lib/scheduler';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStandard } from '@/lib/services/standard-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RESPONSES_KEY = '@questionnaire_responses';

export default function QuestionnaireScreen() {
  const { id, taskId, eventId } = useLocalSearchParams<{ id: string; taskId: string; eventId: string }>();
  const { scheduler } = useScheduler();
  const { backend } = useStandard();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

  const questionnaire = getQuestionnaireById(id);

  if (!questionnaire) {
    Alert.alert('Error', 'Questionnaire not found');
    router.back();
    return null;
  }

  const handleResult = async (result: QuestionnaireResult) => {
    switch (result.status) {
      case 'completed': {
        try {
          const response = result.response;

          // Generate a unique ID for this response if it doesn't have one
          if (!response.id) {
            response.id = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
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

          // Save to Firebase through the backend service
          if (backend) {
            await backend.saveQuestionnaireResponse(response);
          }

          // Mark the task as complete if we have the necessary info
          if (taskId && eventId && scheduler) {
            const event = scheduler.getEventById(taskId, parseInt(eventId, 10));
            if (event) {
              await scheduler.completeEvent(event, response);
            }
          }

          Alert.alert('Success', 'Your responses have been saved', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        } catch (error) {
          console.error('Failed to save questionnaire response:', error);
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
