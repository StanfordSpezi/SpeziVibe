import { useLocalSearchParams, router } from 'expo-router';
import { Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { QuestionnaireForm } from '@/components/questionnaire-form';
import { getQuestionnaireById } from '@/lib/questionnaires/sample-questionnaires';
import { useScheduler } from '@/lib/scheduler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RESPONSES_KEY = '@questionnaire_responses';

export default function QuestionnaireScreen() {
  const { id, taskId, eventId } = useLocalSearchParams<{ id: string; taskId: string; eventId: string }>();
  const { scheduler } = useScheduler();

  const questionnaire = getQuestionnaireById(id);

  if (!questionnaire) {
    Alert.alert('Error', 'Questionnaire not found');
    router.back();
    return null;
  }

  const handleSubmit = async (answers: Record<string, any>) => {
    try {
      // Save the response
      const response = {
        questionnaireId: id,
        taskId,
        completedAt: new Date().toISOString(),
        answers,
      };

      // Store response in AsyncStorage
      const existingResponses = await AsyncStorage.getItem(RESPONSES_KEY);
      const responses = existingResponses ? JSON.parse(existingResponses) : [];
      responses.push(response);
      await AsyncStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));

      // Mark the task as complete if we have the necessary info
      if (taskId && eventId) {
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
      />
    </ThemedView>
  );
}
