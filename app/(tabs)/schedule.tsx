import { StyleSheet, View } from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Spacing } from '@/constants/theme';
import { ScheduleView, Event } from '@spezivibe/scheduler';
import { AccountButton } from '@/components/account/account-button';
import { AccountSheet } from '@/components/account/account-sheet';
import { useAccount } from '@spezivibe/account';

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signedIn } = useAccount();
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh when screen comes into focus (e.g., returning from questionnaire)
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, [])
  );

  const handleQuestionnaireOpen = async (event: Event) => {
    if (event.task.questionnaireId) {
      try {
        router.push({
          pathname: '/questionnaire/[id]',
          params: {
            id: event.task.questionnaireId,
            taskId: event.task.id,
            eventId: event.occurrence.index.toString()
          },
        });
      } catch {
        Alert.alert('Error', 'Failed to open questionnaire');
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScheduleView
        isDark={isDark}
        onQuestionnaireOpen={handleQuestionnaireOpen}
        refreshKey={refreshKey}
        renderHeader={() => (
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Schedule
            </ThemedText>
            {signedIn && (
              <AccountButton onPress={() => setShowAccountSheet(true)} />
            )}
          </View>
        )}
      />

      <AccountSheet
        visible={showAccountSheet}
        onClose={() => setShowAccountSheet(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.screenTop,
    paddingBottom: Spacing.elementGap,
  },
  title: {
    fontSize: 34,
  },
});
