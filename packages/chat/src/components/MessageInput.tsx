import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageInputProps } from '../types';

/**
 * MessageInput - Text input with send/stop button for chat messages
 *
 * - Multiline text input
 * - Send button (disabled when empty or loading)
 * - Stop button shown during generation
 */
export function MessageInput({
  theme,
  placeholder = 'Type a message...',
  disabled = false,
  value,
  onChange,
  onSend,
  onStop,
  isLoading = false,
  containerStyle,
}: MessageInputProps) {

  const handleSend = () => {
    if (!value.trim() || disabled || isLoading) return;
    onSend();
  };

  const handleStop = () => {
    onStop?.();
  };

  const canSend = value.trim().length > 0 && !disabled && !isLoading;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.inputBackground,
          borderTopColor: theme.colors.inputBorder,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
            borderRadius: theme.borderRadius.lg,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.inputText,
              fontSize: theme.fontSize.md,
              paddingHorizontal: theme.spacing.md,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholderText}
          value={value}
          onChangeText={onChange}
          multiline
          maxLength={4000}
          editable={!disabled}
          onSubmitEditing={Platform.OS === 'web' ? handleSend : undefined}
          blurOnSubmit={false}
          accessibilityLabel="Message input"
          accessibilityHint="Type your message here"
        />

        <TouchableOpacity
          style={[styles.sendButton, { marginRight: theme.spacing.sm }]}
          onPress={isLoading ? handleStop : handleSend}
          disabled={!isLoading && !canSend}
          accessibilityLabel={isLoading ? 'Stop generation' : 'Send message'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isLoading ? 'stop-circle' : 'send'}
            size={24}
            color={
              isLoading
                ? theme.colors.error
                : canSend
                  ? theme.colors.sendButton
                  : theme.colors.sendButtonDisabled
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingVertical: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
});
