import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ChatTheme, ChatMessage } from '../types';
import { defaultLightChatTheme } from '../theme';

/**
 * Test utilities for @spezivibe/chat tests
 */

/**
 * Default theme for tests
 */
export const testTheme: ChatTheme = defaultLightChatTheme;

/**
 * Create a mock chat message
 */
export function createMockMessage(
  overrides: Partial<ChatMessage> = {}
): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: 'user',
    content: 'Test message',
    ...overrides,
  };
}

/**
 * Create a mock user message
 */
export function createUserMessage(content: string): ChatMessage {
  return createMockMessage({ role: 'user', content });
}

/**
 * Create a mock assistant message
 */
export function createAssistantMessage(content: string): ChatMessage {
  return createMockMessage({ role: 'assistant', content });
}

/**
 * Render component with default theme context
 */
export function renderWithTheme(
  ui: ReactElement,
  options?: RenderOptions
) {
  return render(ui, options);
}

/**
 * Wait for async operations
 */
export const wait = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
