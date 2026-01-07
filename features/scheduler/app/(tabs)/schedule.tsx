import { StyleSheet, View } from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Spacing } from '@/constants/theme';
import { ScheduleView, Event } from '@spezivibe/scheduler';

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, [])
  );

  const handleQuestionnaireOpen = async (_event: Event) => {
    // __QUESTIONNAIRE_HANDLER__
    // Questionnaire feature not installed - show helpful message
    Alert.alert(
      'Questionnaire Not Available',
      'The questionnaire feature is not installed. Add it via the CLI with: npx @spezivibe/cli add questionnaire',
      [{ text: 'OK' }]
    );
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
          </View>
        )}
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
