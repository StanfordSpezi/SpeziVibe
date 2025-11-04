import { Stack } from 'expo-router';

export default function QuestionnaireLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
