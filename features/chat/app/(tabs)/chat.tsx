import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatView, defaultLightChatTheme, defaultDarkChatTheme } from '@spezivibe/chat';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? defaultDarkChatTheme : defaultLightChatTheme;

  if (!OPENAI_API_KEY) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centeredContent}>
          <Text style={[styles.emptyTitle, { color: theme.colors.error }]}>
            API Key Missing
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.timestamp }]}>
            Set EXPO_PUBLIC_OPENAI_API_KEY in your .env file
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ChatView
        provider={{
          type: 'openai',
          apiKey: OPENAI_API_KEY,
        }}
        theme={theme}
        placeholder="Ask me anything..."
        systemPrompt="You are ChatGPT, a large language model trained by OpenAI, based on the GPT architecture."
        emptyState={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.colors.assistantBubbleText }]}>
              Welcome to Chat
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.timestamp }]}>
              Ask me anything
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
