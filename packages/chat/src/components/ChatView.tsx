import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatViewProps, ChatMessage } from '../types';
import { defaultLightChatTheme, mergeChatTheme } from '../theme';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { streamChatCompletion, LLMMessage } from '../services';

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * ChatView - Full chat interface with message list and input
 *
 * Supports multiple LLM providers (OpenAI, Anthropic, Google) via Vercel AI SDK.
 */
export function ChatView({
  provider,
  theme: userTheme,
  placeholder = 'Type a message...',
  header,
  emptyState,
  systemPrompt,
  containerStyle,
}: ChatViewProps) {
  const theme = useMemo(
    () => mergeChatTheme(userTheme, defaultLightChatTheme),
    [userTheme]
  );

  const flatListRef = useRef<FlatList>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    // Build messages for LLM
    const llmMessages: LLMMessage[] = [];
    if (systemPrompt) {
      llmMessages.push({ role: 'system', content: systemPrompt });
    }
    // Add previous messages
    messages.forEach((msg) => {
      if (msg.role !== 'system') {
        llmMessages.push({ role: msg.role, content: msg.content });
      }
    });
    llmMessages.push({ role: 'user', content: userMessage.content });

    abortControllerRef.current = new AbortController();

    await streamChatCompletion(
      llmMessages,
      provider,
      {
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        onComplete: () => {
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        onError: (error) => {
          setIsLoading(false);
          abortControllerRef.current = null;
          // Update the assistant message with error
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: `Error: ${error.message}` }
                : msg
            )
          );
        },
      },
      abortControllerRef.current.signal
    );
  }, [input, isLoading, messages, provider, systemPrompt]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    return <MessageBubble message={item} theme={theme} />;
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        containerStyle,
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {header}

      {messages.length === 0 && emptyState ? (
        <View style={styles.emptyContainer}>{emptyState}</View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.messageList,
            { padding: theme.spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <MessageInput
        theme={theme}
        placeholder={placeholder}
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onStop={handleStop}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    flexGrow: 1,
  },
});
