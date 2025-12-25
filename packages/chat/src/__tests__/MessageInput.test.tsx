import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MessageInput } from '../components/MessageInput';
import { testTheme } from './test-utils';

describe('MessageInput', () => {
  const defaultProps = {
    theme: testTheme,
    value: '',
    onChange: jest.fn(),
    onSend: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render text input', () => {
      const { getByLabelText } = render(<MessageInput {...defaultProps} />);

      expect(getByLabelText('Message input')).toBeTruthy();
    });

    it('should render with custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} placeholder="Ask a question..." />
      );

      expect(getByPlaceholderText('Ask a question...')).toBeTruthy();
    });

    it('should render default placeholder', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} />
      );

      expect(getByPlaceholderText('Type a message...')).toBeTruthy();
    });

    it('should render send button', () => {
      const { getByLabelText } = render(<MessageInput {...defaultProps} />);

      expect(getByLabelText('Send message')).toBeTruthy();
    });
  });

  describe('input handling', () => {
    it('should call onChange when text is entered', () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} onChange={onChange} />
      );

      fireEvent.changeText(getByLabelText('Message input'), 'Hello');

      expect(onChange).toHaveBeenCalledWith('Hello');
    });

    it('should display current value', () => {
      const { getByDisplayValue } = render(
        <MessageInput {...defaultProps} value="Current text" />
      );

      expect(getByDisplayValue('Current text')).toBeTruthy();
    });

    it('should disable input when disabled prop is true', () => {
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} disabled />
      );

      const input = getByLabelText('Message input');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('send button', () => {
    it('should call onSend when button is pressed with text', () => {
      const onSend = jest.fn();
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} value="Hello" onSend={onSend} />
      );

      fireEvent.press(getByLabelText('Send message'));

      expect(onSend).toHaveBeenCalled();
    });

    it('should not call onSend when input is empty', () => {
      const onSend = jest.fn();
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} value="" onSend={onSend} />
      );

      fireEvent.press(getByLabelText('Send message'));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not call onSend when input is only whitespace', () => {
      const onSend = jest.fn();
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} value="   " onSend={onSend} />
      );

      fireEvent.press(getByLabelText('Send message'));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not call onSend when disabled', () => {
      const onSend = jest.fn();
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} value="Hello" onSend={onSend} disabled />
      );

      fireEvent.press(getByLabelText('Send message'));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not call onSend when loading', () => {
      const onSend = jest.fn();
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} value="Hello" onSend={onSend} isLoading />
      );

      fireEvent.press(getByLabelText('Stop generation'));

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show stop button when loading', () => {
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} isLoading />
      );

      expect(getByLabelText('Stop generation')).toBeTruthy();
    });

    it('should call onStop when stop button is pressed', () => {
      const onStop = jest.fn();
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} isLoading onStop={onStop} />
      );

      fireEvent.press(getByLabelText('Stop generation'));

      expect(onStop).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have accessible label for input', () => {
      const { getByLabelText } = render(<MessageInput {...defaultProps} />);

      expect(getByLabelText('Message input')).toBeTruthy();
    });

    it('should have accessible label for send button', () => {
      const { getByLabelText } = render(<MessageInput {...defaultProps} />);

      expect(getByLabelText('Send message')).toBeTruthy();
    });

    it('should have accessible label for stop button when loading', () => {
      const { getByLabelText } = render(
        <MessageInput {...defaultProps} isLoading />
      );

      expect(getByLabelText('Stop generation')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should apply container style', () => {
      const { toJSON } = render(
        <MessageInput {...defaultProps} containerStyle={{ marginTop: 10 }} />
      );

      expect(toJSON()).toBeTruthy();
    });
  });
});
