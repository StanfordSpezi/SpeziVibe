import type { ReactNode } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';

/**
 * Supported LLM provider types
 */
export type ChatProviderType = 'openai' | 'anthropic' | 'google';

/**
 * OpenAI provider configuration
 */
export interface OpenAIProvider {
  type: 'openai';
  apiKey: string;
  model?: string;
}

/**
 * Anthropic (Claude) provider configuration
 */
export interface AnthropicProvider {
  type: 'anthropic';
  apiKey: string;
  model?: string;
}

/**
 * Google (Gemini) provider configuration
 */
export interface GoogleProvider {
  type: 'google';
  apiKey: string;
  model?: string;
}

/**
 * Chat provider configuration - supports OpenAI, Anthropic, and Google
 */
export type ChatProvider = OpenAIProvider | AnthropicProvider | GoogleProvider;

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS: Record<ChatProviderType, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-20250514',
  google: 'gemini-2.0-flash',
};

/**
 * A chat message
 */
export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Theme colors for chat components
 */
export interface ChatThemeColors {
  background: string;
  userBubble: string;
  userBubbleText: string;
  assistantBubble: string;
  assistantBubbleText: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholderText: string;
  sendButton: string;
  sendButtonDisabled: string;
  error: string;
  timestamp: string;
}

/**
 * Chat theme configuration
 */
export interface ChatTheme {
  colors: ChatThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    bubble: number;
  };
  fontSize: {
    sm: number;
    md: number;
    lg: number;
  };
}

/**
 * Partial theme for customization
 */
export interface PartialChatTheme {
  colors?: Partial<ChatThemeColors>;
  spacing?: Partial<ChatTheme['spacing']>;
  borderRadius?: Partial<ChatTheme['borderRadius']>;
  fontSize?: Partial<ChatTheme['fontSize']>;
}

/**
 * Props for ChatView component
 */
export interface ChatViewProps {
  /** LLM provider configuration (OpenAI, Anthropic, or Google) */
  provider: ChatProvider;
  /** Custom theme */
  theme?: PartialChatTheme;
  /** Placeholder text for input */
  placeholder?: string;
  /** Header component */
  header?: ReactNode;
  /** Empty state component shown when no messages */
  emptyState?: ReactNode;
  /** System prompt to send to LLM */
  systemPrompt?: string;
  /** Custom container style */
  containerStyle?: ViewStyle;
}

/**
 * Props for MessageBubble component
 */
export interface MessageBubbleProps {
  /** The message to display */
  message: ChatMessage;
  /** Theme configuration */
  theme: ChatTheme;
  /** Custom bubble style */
  bubbleStyle?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
}

/**
 * Props for MessageInput component
 */
export interface MessageInputProps {
  /** Theme configuration */
  theme: ChatTheme;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Current input value */
  value: string;
  /** Callback when input changes */
  onChange: (value: string) => void;
  /** Callback when send is pressed */
  onSend: () => void;
  /** Callback when stop is pressed during generation */
  onStop?: () => void;
  /** Whether generation is in progress */
  isLoading?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
}
