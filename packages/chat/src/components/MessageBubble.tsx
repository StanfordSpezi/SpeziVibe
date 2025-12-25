import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MessageBubbleProps } from '../types';

/**
 * MessageBubble - Displays a single chat message in a styled bubble
 *
 * - User messages appear on the right with primary color
 * - Assistant messages appear on the left with neutral color
 * - Shows loading indicator when message content is empty (streaming)
 */
export function MessageBubble({
  message,
  theme,
  bubbleStyle,
  textStyle,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const bubbleColors = {
    backgroundColor: isUser
      ? theme.colors.userBubble
      : theme.colors.assistantBubble,
  };

  const textColors = {
    color: isUser
      ? theme.colors.userBubbleText
      : theme.colors.assistantBubbleText,
  };

  const content = message.content;
  const isStreaming = message.role === 'assistant' && !content;

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        { marginBottom: theme.spacing.sm },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleColors.backgroundColor,
            borderRadius: theme.borderRadius.bubble,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            maxWidth: '80%',
          },
          bubbleStyle,
        ]}
      >
        {isStreaming ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.assistantBubbleText}
          />
        ) : (
          <Text
            style={[
              styles.messageText,
              { color: textColors.color, fontSize: theme.fontSize.md },
              textStyle,
            ]}
          >
            {content}
          </Text>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {},
  messageText: {
    lineHeight: 22,
  },
});
