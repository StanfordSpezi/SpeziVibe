import { ChatTheme, PartialChatTheme } from '../types';

/**
 * Default light theme for chat components
 * Uses Stanford Cardinal colors to match the app theme
 */
export const defaultLightChatTheme: ChatTheme = {
  colors: {
    background: '#FFFFFF',
    userBubble: '#8C1515', // Stanford Cardinal
    userBubbleText: '#FFFFFF',
    assistantBubble: '#F0F0F0',
    assistantBubbleText: '#11181C',
    inputBackground: '#FFFFFF',
    inputBorder: '#E0E0E0',
    inputText: '#11181C',
    placeholderText: '#687076',
    sendButton: '#8C1515',
    sendButtonDisabled: '#CCCCCC',
    error: '#DC3545',
    timestamp: '#687076',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    bubble: 18,
  },
  fontSize: {
    sm: 12,
    md: 16,
    lg: 18,
  },
};

/**
 * Default dark theme for chat components
 */
export const defaultDarkChatTheme: ChatTheme = {
  colors: {
    background: '#151718',
    userBubble: '#8C1515', // Stanford Cardinal
    userBubbleText: '#FFFFFF',
    assistantBubble: '#2C2C2E',
    assistantBubbleText: '#ECEDEE',
    inputBackground: '#1C1C1E',
    inputBorder: '#38383A',
    inputText: '#ECEDEE',
    placeholderText: '#8E8E93',
    sendButton: '#B83A4B', // Cardinal Light for better visibility
    sendButtonDisabled: '#48484A',
    error: '#FF453A',
    timestamp: '#8E8E93',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    bubble: 18,
  },
  fontSize: {
    sm: 12,
    md: 16,
    lg: 18,
  },
};

/**
 * Merge a partial theme with a base theme
 */
export function mergeChatTheme(
  userTheme?: PartialChatTheme,
  baseTheme: ChatTheme = defaultLightChatTheme
): ChatTheme {
  if (!userTheme) return baseTheme;

  return {
    colors: { ...baseTheme.colors, ...userTheme.colors },
    spacing: { ...baseTheme.spacing, ...userTheme.spacing },
    borderRadius: { ...baseTheme.borderRadius, ...userTheme.borderRadius },
    fontSize: { ...baseTheme.fontSize, ...userTheme.fontSize },
  };
}
