import { Image } from 'expo-image';
import { Platform, StyleSheet, Pressable, Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScheduler, createSampleTasks } from '@/lib/scheduler';
import { SAMPLE_QUESTIONNAIRES } from '@/lib/questionnaires';
import { AccountButton } from '@/components/account/account-button';
import { AccountSheet } from '@/components/account/account-sheet';
import { useAccount } from '@spezivibe/account';
import { ONBOARDING_COMPLETED_KEY } from '@/lib/constants';

const CONSENT_KEY = '@consent_data';

export default function TabTwoScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { scheduler, refreshTasks } = useScheduler();
  const { signedIn } = useAccount();
  const [consentData, setConsentData] = useState<any>(null);
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  useEffect(() => {
    loadConsentData();
  }, []);

  const loadConsentData = async () => {
    try {
      const data = await AsyncStorage.getItem(CONSENT_KEY);
      if (data) {
        setConsentData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading consent:', error);
    }
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset the app and show the onboarding flow again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
              router.replace('/(onboarding)/welcome');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
            }
          },
        },
      ]
    );
  };

  const handleResetSchedule = async () => {
    Alert.alert(
      'Reset Schedule Tasks',
      'This will clear all tasks and completions, then reload the predefined tasks. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all existing tasks and outcomes
              await scheduler.clearAll();

              // Reinitialize with fresh tasks
              const predefinedTasks = createSampleTasks();
              for (const task of predefinedTasks) {
                await scheduler.createOrUpdateTask(task);
              }

              refreshTasks();
              Alert.alert('Success', 'Schedule has been reset with updated tasks.');
            } catch (error) {
              console.error('Error resetting schedule:', error);
              Alert.alert('Error', 'Failed to reset schedule.');
            }
          },
        },
      ]
    );
  };
  return (
    <>
      {signedIn && (
        <View style={styles.accountButtonContainer}>
          <AccountButton onPress={() => setShowAccountSheet(true)} />
        </View>
      )}

      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
      <Collapsible title="Consent Information">
        {consentData ? (
          <>
            <ThemedText style={{ marginBottom: 8 }}>
              <ThemedText type="defaultSemiBold">Name:</ThemedText>{' '}
              {consentData.givenName} {consentData.familyName}
            </ThemedText>
            <ThemedText style={{ marginBottom: 8 }}>
              <ThemedText type="defaultSemiBold">Consented:</ThemedText>{' '}
              {new Date(consentData.consentedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </ThemedText>
            <ThemedText style={{ opacity: 0.7, fontSize: 14 }}>
              Your consent information is stored securely on your device. You can withdraw consent
              at any time by resetting the onboarding.
            </ThemedText>
          </>
        ) : (
          <ThemedText style={{ opacity: 0.7 }}>
            No consent information found. Complete the onboarding flow to provide consent.
          </ThemedText>
        )}
      </Collapsible>
      <Collapsible title="Schedule Tasks">
        <ThemedText>
          The app includes a scheduler module inspired by SpeziScheduler. Tasks are predefined
          in code and automatically track completions across different days of the week.
        </ThemedText>
        <ThemedView style={styles.resetButton}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: isDark ? '#B83A4B' : '#8C1515', opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleResetSchedule}>
            <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>
              Reset Schedule Tasks
            </ThemedText>
          </Pressable>
        </ThemedView>
      </Collapsible>
      <Collapsible title="Test Questionnaires">
        <ThemedText style={{ marginBottom: 16 }}>
          Test the questionnaire forms without waiting for scheduled times. These open the same
          forms users see when completing scheduled questionnaire tasks.
        </ThemedText>
        <View style={styles.questionnaireList}>
          {SAMPLE_QUESTIONNAIRES.map((questionnaire) => (
            <Pressable
              key={questionnaire.id}
              style={({ pressed }) => [
                styles.questionnaireButton,
                {
                  backgroundColor: isDark ? '#1D1D1D' : '#F5F5F5',
                  opacity: pressed ? 0.7 : 1,
                  borderColor: isDark ? '#333' : '#E0E0E0',
                },
              ]}
              onPress={() => {
                router.push({
                  pathname: '/questionnaire/[id]',
                  params: { id: questionnaire.id },
                });
              }}>
              <View style={styles.questionnaireButtonContent}>
                <IconSymbol name="doc.text.fill" size={24} color={isDark ? '#B83A4B' : '#8C1515'} />
                <View style={styles.questionnaireButtonText}>
                  <ThemedText type="defaultSemiBold" style={styles.questionnaireTitle}>
                    {questionnaire.title}
                  </ThemedText>
                  <ThemedText style={styles.questionnaireDescription}>
                    {questionnaire.description}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color={isDark ? '#666' : '#999'} />
              </View>
            </Pressable>
          ))}
        </View>
      </Collapsible>
    </ParallaxScrollView>

      <AccountSheet
        visible={showAccountSheet}
        onClose={() => setShowAccountSheet(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  accountButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  resetButton: {
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  questionnaireList: {
    gap: 12,
  },
  questionnaireButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  questionnaireButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionnaireButtonText: {
    flex: 1,
  },
  questionnaireTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  questionnaireDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
});
