import { useState } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useAccount } from '@spezivibe/account';
import { AccountButton } from '@/components/account/account-button';
import { AccountSheet } from '@/components/account/account-sheet';

export default function HomeScreen() {
  const { signedIn } = useAccount();
  const [showAccountSheet, setShowAccountSheet] = useState(false);

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
