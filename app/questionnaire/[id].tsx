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
import AsyncStorage from '@react-native-async-storage/async-storage';

const RESPONSES_KEY = '@questionnaire_responses';

export default function QuestionnaireScreen() {
  const { id, taskId, eventId } = useLocalSearchParams<{ id: string; taskId: string; eventId: string }>();
  const { scheduler } = useScheduler();
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
          // Add app-specific metadata to the response
          const responseWithMetadata = {
            ...result.response,
            metadata: {
              ...result.response.metadata,
              taskId,
              eventId,
            },
          };

          // Store response in AsyncStorage
          const existingResponses = await AsyncStorage.getItem(RESPONSES_KEY);
          const responses = existingResponses ? JSON.parse(existingResponses) : [];
          responses.push(responseWithMetadata);
          await AsyncStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));

          // Mark the task as complete if we have the necessary info
          if (taskId && eventId && scheduler) {
            const event = scheduler.getEventById(taskId, parseInt(eventId, 10));
            if (event) {
              await scheduler.completeEvent(event, responseWithMetadata);
            }
          }

          Alert.alert('Success', 'Your responses have been saved', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        } catch (error) {
          Alert.alert('Error', 'Failed to save your responses. Please try again.');
        }
        break;
      }

      case 'cancelled':
        // User cancelled - just go back
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
