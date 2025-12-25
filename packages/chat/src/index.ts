/**
 * @spezivibe/chat
 *
 * Chat UI components for React Native applications with multi-provider LLM support.
 * Supports OpenAI, Anthropic (Claude), and Google (Gemini) via Vercel AI SDK.
 *
 * @example
 * ```tsx
 * import { ChatView } from '@spezivibe/chat';
 *
 * function ChatScreen() {
 *   return (
 *     <ChatView
 *       provider={{
 *         type: 'openai',
 *         apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
 *       }}
 *       placeholder="Ask me anything..."
 *       systemPrompt="You are a helpful assistant."
 *     />
 *   );
 * }
 * ```
 */

// Types
export type {
  ChatMessage,
  ChatTheme,
  ChatThemeColors,
  PartialChatTheme,
  ChatViewProps,
  MessageBubbleProps,
  MessageInputProps,
  ChatProvider,
  ChatProviderType,
  OpenAIProvider,
  AnthropicProvider,
  GoogleProvider,
} from './types';

export { DEFAULT_MODELS } from './types';

// Components
export { ChatView, MessageBubble, MessageInput } from './components';

// Theme
export {
  defaultLightChatTheme,
  defaultDarkChatTheme,
  mergeChatTheme,
} from './theme';

// Services
export { streamChatCompletion } from './services';
export type { LLMMessage, StreamCallbacks } from './services/llm';
