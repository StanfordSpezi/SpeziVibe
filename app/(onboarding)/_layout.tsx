import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="features" />
      <Stack.Screen name="consent" />
      <Stack.Screen name="get-started" />
    </Stack>
  );
}
