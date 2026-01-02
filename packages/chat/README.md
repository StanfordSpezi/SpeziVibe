# @spezivibe/chat

A React Native chat component library with multi-provider LLM support using the Vercel AI SDK. Supports **OpenAI**, **Anthropic (Claude)**, and **Google (Gemini)**. Built with full TypeScript support and customizable theming.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Providers](#providers)
- [Components](#components)
- [Theming](#theming)
- [API Reference](#api-reference)
- [Platform Support](#platform-support)
- [Examples](#examples)
- [Security Considerations](#security-considerations)

## Features

- **Multi-Provider Support** - OpenAI, Anthropic (Claude), and Google (Gemini)
- **AI SDK Integration** - Built on Vercel AI SDK for reliable LLM communication
- **Streaming Support** - Real-time streaming responses on all platforms
- **Themeable** - Fully customizable theme system with light/dark defaults
- **Cross-Platform** - iOS, Android, and Web support via Expo
- **TypeScript** - Full TypeScript support with exported types
- **Accessible** - Built-in accessibility labels and hints

## Installation

```bash
# Core package
npm install @spezivibe/chat ai

# Install provider(s) you need
npm install @ai-sdk/openai      # For OpenAI (GPT-4, etc.)
npm install @ai-sdk/anthropic   # For Anthropic (Claude)
npm install @ai-sdk/google      # For Google (Gemini)
```

### Peer Dependencies

```json
{
  "react": ">=18.0.0",
  "react-native": ">=0.70.0",
  "expo": ">=52.0.0",
  "@expo/vector-icons": ">=14.0.0",
  "ai": ">=4.0.0"
}
```

## Quick Start

### 1. Set Up Environment Variable

Add your API key to your `.env` file:

```bash
# Choose one or more:
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here
EXPO_PUBLIC_GOOGLE_API_KEY=AIza-your-key-here
```

> **Warning:** See [Security Considerations](#security-considerations) below for production deployments.

### 2. Create a Chat Screen

```tsx
import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChatView,
  defaultLightChatTheme,
  defaultDarkChatTheme
} from '@spezivibe/chat';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark'
    ? defaultDarkChatTheme
    : defaultLightChatTheme;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ChatView
        provider={{
          type: 'openai',
          apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
        }}
        theme={theme}
        placeholder="Ask me anything..."
        systemPrompt="You are a helpful assistant."
      />
    </SafeAreaView>
  );
}
```

## Providers

### OpenAI

```tsx
<ChatView
  provider={{
    type: 'openai',
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
    model: 'gpt-4o',  // Optional, defaults to 'gpt-4o-mini'
  }}
/>
```

### Anthropic (Claude)

```tsx
<ChatView
  provider={{
    type: 'anthropic',
    apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
    model: 'claude-sonnet-4-20250514',  // Optional, defaults to 'claude-sonnet-4-20250514'
  }}
/>
```

### Google (Gemini)

```tsx
<ChatView
  provider={{
    type: 'google',
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY!,
    model: 'gemini-2.0-flash',  // Optional, defaults to 'gemini-2.0-flash'
  }}
/>
```

### Default Models

| Provider | Default Model |
|----------|---------------|
| OpenAI | `gpt-4o-mini` |
| Anthropic | `claude-sonnet-4-20250514` |
| Google | `gemini-2.0-flash` |

## Components

### ChatView

The main chat interface component that combines message list and input.

```tsx
import { ChatView } from '@spezivibe/chat';

<ChatView
  provider={{
    type: 'openai',
    apiKey: 'sk-...',
    model: 'gpt-4o-mini',
  }}
  theme={customTheme}           // Optional, uses light theme by default
  placeholder="Type a message..." // Optional
  systemPrompt="You are helpful." // Optional
  header={<CustomHeader />}     // Optional, rendered above messages
  emptyState={<EmptyView />}    // Optional, shown when no messages
  containerStyle={{ flex: 1 }}  // Optional
/>
```

### MessageBubble

Individual message bubble component for custom layouts.

```tsx
import { MessageBubble, ChatMessage, ChatTheme } from '@spezivibe/chat';

const message: ChatMessage = {
  id: '1',
  role: 'user',
  content: 'Hello!',
};

<MessageBubble
  message={message}
  theme={theme}
  bubbleStyle={{ marginVertical: 4 }}  // Optional
  textStyle={{ fontSize: 16 }}          // Optional
/>
```

### MessageInput

Text input with send/stop button.

```tsx
import { MessageInput } from '@spezivibe/chat';

<MessageInput
  theme={theme}
  value={inputText}
  onChange={setInputText}
  onSend={handleSend}
  onStop={handleStop}          // Optional, shown during loading
  isLoading={false}            // Optional
  disabled={false}             // Optional
  placeholder="Type here..."   // Optional
  containerStyle={{}}          // Optional
/>
```

## Theming

### Using Default Themes

```tsx
import {
  defaultLightChatTheme,
  defaultDarkChatTheme
} from '@spezivibe/chat';
import { useColorScheme } from 'react-native';

function ChatScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark'
    ? defaultDarkChatTheme
    : defaultLightChatTheme;

  return (
    <ChatView
      provider={{ type: 'openai', apiKey }}
      theme={theme}
    />
  );
}
```

### Custom Theme

```tsx
import { mergeChatTheme, defaultLightChatTheme } from '@spezivibe/chat';

const customTheme = mergeChatTheme(
  {
    colors: {
      userBubble: '#007AFF',
      userBubbleText: '#FFFFFF',
      assistantBubble: '#E5E5EA',
    },
    borderRadius: {
      bubble: 20,
    },
  },
  defaultLightChatTheme
);

<ChatView provider={provider} theme={customTheme} />
```

### Complete Theme Structure

```typescript
interface ChatTheme {
  colors: {
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
  };
  spacing: {
    xs: number;  // 4
    sm: number;  // 8
    md: number;  // 12
    lg: number;  // 16
    xl: number;  // 24
  };
  borderRadius: {
    sm: number;  // 4
    md: number;  // 8
    lg: number;  // 16
    bubble: number;  // 18
  };
  fontSize: {
    sm: number;  // 12
    md: number;  // 16
    lg: number;  // 18
  };
}
```

## API Reference

### ChatViewProps

```typescript
interface ChatViewProps {
  /** LLM provider configuration (required) */
  provider: ChatProvider;

  /** Custom theme */
  theme?: PartialChatTheme;

  /** Placeholder text for input */
  placeholder?: string;

  /** Header component rendered above messages */
  header?: ReactNode;

  /** Empty state component shown when no messages */
  emptyState?: ReactNode;

  /** System prompt sent to LLM */
  systemPrompt?: string;

  /** Custom container style */
  containerStyle?: ViewStyle;
}
```

### ChatProvider

```typescript
type ChatProvider =
  | { type: 'openai'; apiKey: string; model?: string }
  | { type: 'anthropic'; apiKey: string; model?: string }
  | { type: 'google'; apiKey: string; model?: string };
```

### ChatMessage

```typescript
interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### Exported Functions

```typescript
// Theme utilities
function mergeChatTheme(
  userTheme?: PartialChatTheme,
  baseTheme?: ChatTheme
): ChatTheme;

// LLM service (for custom implementations)
function streamChatCompletion(
  messages: LLMMessage[],
  provider: ChatProvider,
  callbacks: StreamCallbacks,
  abortSignal?: AbortSignal
): Promise<void>;

// Default models
const DEFAULT_MODELS: Record<ChatProviderType, string>;
```

## Platform Support

| Platform | Streaming | Notes |
|----------|-----------|-------|
| Web | Yes | Full streaming support |
| iOS | Yes | Via expo/fetch polyfill |
| Android | Yes | Via expo/fetch polyfill |

### Expo Requirements

This package uses `expo/fetch` for streaming support on mobile platforms. Requires Expo SDK 52 or higher.

## Examples

### Basic Chat with OpenAI

```tsx
import { ChatView, defaultLightChatTheme } from '@spezivibe/chat';

export default function BasicChat() {
  return (
    <ChatView
      provider={{
        type: 'openai',
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
      }}
      theme={defaultLightChatTheme}
    />
  );
}
```

### Chat with Claude

```tsx
import { ChatView, defaultLightChatTheme } from '@spezivibe/chat';

export default function ClaudeChat() {
  return (
    <ChatView
      provider={{
        type: 'anthropic',
        apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
        model: 'claude-sonnet-4-20250514',
      }}
      theme={defaultLightChatTheme}
      systemPrompt="You are Claude, a helpful AI assistant."
    />
  );
}
```

### Chat with Gemini

```tsx
import { ChatView, defaultLightChatTheme } from '@spezivibe/chat';

export default function GeminiChat() {
  return (
    <ChatView
      provider={{
        type: 'google',
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY!,
        model: 'gemini-2.0-flash',
      }}
      theme={defaultLightChatTheme}
      systemPrompt="You are a helpful assistant."
    />
  );
}
```

### With Custom Empty State

```tsx
import { ChatView, defaultLightChatTheme } from '@spezivibe/chat';
import { View, Text } from 'react-native';

export default function ChatWithEmptyState() {
  return (
    <ChatView
      provider={{
        type: 'openai',
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
      }}
      theme={defaultLightChatTheme}
      placeholder="Ask me anything..."
      emptyState={
        <View style={{ alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '600' }}>
            AI Assistant
          </Text>
          <Text style={{ color: '#666', marginTop: 8 }}>
            Start a conversation
          </Text>
        </View>
      }
    />
  );
}
```

### With Header

```tsx
import { ChatView } from '@spezivibe/chat';
import { View, Text } from 'react-native';

function ChatWithHeader() {
  return (
    <ChatView
      provider={{
        type: 'openai',
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
      }}
      header={
        <View style={{ padding: 16, borderBottomWidth: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            AI Assistant
          </Text>
        </View>
      }
    />
  );
}
```

## Why No Message Persistence?

Following the **Spezi architecture pattern**, this module focuses on UI and real-time chat functionality. Message persistence is the responsibility of the consuming application. This provides:

1. **Flexibility** - Use any storage solution (AsyncStorage, SQLite, cloud, etc.)
2. **Simplicity** - Fewer dependencies and simpler module
3. **Control** - You decide what to persist and when

## Security Considerations

### Client-Side API Keys

When using `EXPO_PUBLIC_*` environment variables in React Native/Expo apps, **API keys are embedded in the JavaScript bundle and visible to end users**. This is a security risk because:

1. **Bundle Inspection** - Users can extract the bundle and find your keys
2. **Network Inspection** - API keys are sent in plain text with each request
3. **Key Abuse** - Malicious users can use your keys for unauthorized requests

### Production Recommendations

For production deployments, implement a **backend proxy** that:

1. Keeps API keys on your server (never exposed to clients)
2. Authenticates users before allowing LLM requests
3. Applies rate limiting to prevent abuse
4. Logs usage for monitoring and billing

**Example Architecture:**

```
Mobile App → Your Backend (with auth) → LLM Provider
                     ↑
            API key stored here
```

### Backend Proxy Options

- **Firebase Cloud Functions** - If using Firebase backend
- **Vercel Edge Functions** - If hosting web version on Vercel
- **AWS Lambda / API Gateway** - For serverless deployments
- **Custom Express/Fastify server** - For full control

### When Client-Side Keys Are Acceptable

- **Development and prototyping**
- **Internal/enterprise apps** with trusted users
- **Apps with strict API key restrictions** (IP allowlist, usage caps)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
