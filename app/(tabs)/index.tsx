import { useState } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, Pressable, Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccount } from '@spezivibe/account';
import { AccountButton } from '@/app/(account)/_components/account-button';
import { AccountSheet } from '@/app/(account)/_components/account-sheet';
import { ONBOARDING_COMPLETED_KEY } from '@/lib/constants';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signedIn } = useAccount();
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  const handleViewOnboarding = async () => {
    Alert.alert(
      'View Onboarding',
      'This will clear the onboarding state and show the onboarding flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Onboarding',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);

              // Add a small delay to ensure the root layout picks up the change
              setTimeout(() => {
                router.push('/(onboarding)/welcome');
              }, 150);
            } catch (error) {
              // Silent error
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
        headerBackgroundColor={{ light: '#F5E6D3', dark: '#8C1515' }}
        headerImage={
          <Image
            source={require('@/assets/images/spezivibe-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: View Onboarding</ThemedText>
        <ThemedText>
          Want to see the onboarding flow? Tap the button below to clear the onboarding state
          and view it again.
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: isDark ? '#B83A4B' : '#8C1515', opacity: pressed ? 0.8 : 1, marginTop: 12 },
          ]}
          onPress={handleViewOnboarding}>
          <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>
            View Onboarding Flow
          </ThemedText>
        </Pressable>
      </ThemedView>

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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  logo: {
    height: 200,
    width: 200,
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -100 }],
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
});
