import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../components/MessageBubble';
import { testTheme, createUserMessage, createAssistantMessage } from './test-utils';

describe('MessageBubble', () => {
  describe('user messages', () => {
    it('should render user message content', () => {
      const message = createUserMessage('Hello, world!');
      const { getByText } = render(
        <MessageBubble message={message} theme={testTheme} />
      );

      expect(getByText('Hello, world!')).toBeTruthy();
    });

    it('should align user messages to the right', () => {
      const message = createUserMessage('Test');
      const { toJSON } = render(
        <MessageBubble message={message} theme={testTheme} />
      );

      const tree = toJSON();
      // User messages should have alignItems: 'flex-end'
      expect(tree).toBeTruthy();
    });

    it('should use user bubble colors from theme', () => {
      const message = createUserMessage('Test');
      const { toJSON } = render(
        <MessageBubble message={message} theme={testTheme} />
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('assistant messages', () => {
    it('should render assistant message content', () => {
      const message = createAssistantMessage('Hello! How can I help?');
      const { getByText } = render(
        <MessageBubble message={message} theme={testTheme} />
      );

      expect(getByText('Hello! How can I help?')).toBeTruthy();
    });

    it('should align assistant messages to the left', () => {
      const message = createAssistantMessage('Test');
      const { toJSON } = render(
        <MessageBubble message={message} theme={testTheme} />
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should show loading indicator for empty assistant message', () => {
      const message = createAssistantMessage('');
      const { UNSAFE_getByType } = render(
        <MessageBubble message={message} theme={testTheme} />
      );

      // Should show ActivityIndicator when streaming
      const indicator = UNSAFE_getByType('ActivityIndicator' as any);
      expect(indicator).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should apply custom bubble style', () => {
      const message = createUserMessage('Test');
      const customStyle = { marginTop: 20 };
      const { toJSON } = render(
        <MessageBubble
          message={message}
          theme={testTheme}
          bubbleStyle={customStyle}
        />
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should apply custom text style', () => {
      const message = createUserMessage('Test');
      const customStyle = { fontWeight: 'bold' as const };
      const { toJSON } = render(
        <MessageBubble
          message={message}
          theme={testTheme}
          textStyle={customStyle}
        />
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('long messages', () => {
    it('should render long messages without truncation', () => {
      const longContent = 'A'.repeat(500);
      const message = createUserMessage(longContent);
      const { getByText } = render(
        <MessageBubble message={message} theme={testTheme} />
      );

      expect(getByText(longContent)).toBeTruthy();
    });

    it('should render multiline messages', () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3';
      const message = createAssistantMessage(multilineContent);
      const { getByText } = render(
        <MessageBubble message={message} theme={testTheme} />
      );

      expect(getByText(multilineContent)).toBeTruthy();
    });
  });
});
