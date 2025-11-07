import { useLocalSearchParams, router } from 'expo-router';
import { Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { QuestionnaireForm, defaultLightTheme, defaultDarkTheme } from '@spezivibe/questionnaire';
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

  const handleSubmit = async (answers: Record<string, any>) => {
    try {
      // Save the response with new format
      const response = {
        id: `${id}-${Date.now()}`, // Generate unique ID
        questionnaireId: id,
        completedAt: new Date(),
        answers,
        metadata: {
          taskId,
          eventId,
        },
      };

      // Store response in AsyncStorage
      const existingResponses = await AsyncStorage.getItem(RESPONSES_KEY);
      const responses = existingResponses ? JSON.parse(existingResponses) : [];
      responses.push(response);
      await AsyncStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));

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
      Alert.alert('Error', 'Failed to save your responses. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel', 'Are you sure you want to cancel? Your responses will not be saved.', [
      { text: 'Continue', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <QuestionnaireForm
        questionnaire={questionnaire}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        theme={theme}
      />
    </ThemedView>
  );
}
