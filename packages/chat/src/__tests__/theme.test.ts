import {
  defaultLightChatTheme,
  defaultDarkChatTheme,
  mergeChatTheme,
} from '../theme';

describe('Chat Theme', () => {
  describe('defaultLightChatTheme', () => {
    it('should have all required color properties', () => {
      expect(defaultLightChatTheme.colors).toHaveProperty('background');
      expect(defaultLightChatTheme.colors).toHaveProperty('userBubble');
      expect(defaultLightChatTheme.colors).toHaveProperty('userBubbleText');
      expect(defaultLightChatTheme.colors).toHaveProperty('assistantBubble');
      expect(defaultLightChatTheme.colors).toHaveProperty('assistantBubbleText');
      expect(defaultLightChatTheme.colors).toHaveProperty('inputBackground');
      expect(defaultLightChatTheme.colors).toHaveProperty('inputBorder');
      expect(defaultLightChatTheme.colors).toHaveProperty('inputText');
      expect(defaultLightChatTheme.colors).toHaveProperty('sendButton');
      expect(defaultLightChatTheme.colors).toHaveProperty('error');
    });

    it('should have all required spacing properties', () => {
      expect(defaultLightChatTheme.spacing).toHaveProperty('xs');
      expect(defaultLightChatTheme.spacing).toHaveProperty('sm');
      expect(defaultLightChatTheme.spacing).toHaveProperty('md');
      expect(defaultLightChatTheme.spacing).toHaveProperty('lg');
      expect(defaultLightChatTheme.spacing).toHaveProperty('xl');
    });

    it('should have all required borderRadius properties', () => {
      expect(defaultLightChatTheme.borderRadius).toHaveProperty('sm');
      expect(defaultLightChatTheme.borderRadius).toHaveProperty('md');
      expect(defaultLightChatTheme.borderRadius).toHaveProperty('lg');
      expect(defaultLightChatTheme.borderRadius).toHaveProperty('bubble');
    });

    it('should have all required fontSize properties', () => {
      expect(defaultLightChatTheme.fontSize).toHaveProperty('sm');
      expect(defaultLightChatTheme.fontSize).toHaveProperty('md');
      expect(defaultLightChatTheme.fontSize).toHaveProperty('lg');
    });

    it('should use Stanford Cardinal color for user bubble', () => {
      expect(defaultLightChatTheme.colors.userBubble).toBe('#8C1515');
    });
  });

  describe('defaultDarkChatTheme', () => {
    it('should have dark background color', () => {
      expect(defaultDarkChatTheme.colors.background).toBe('#151718');
    });

    it('should have same spacing as light theme', () => {
      expect(defaultDarkChatTheme.spacing).toEqual(defaultLightChatTheme.spacing);
    });

    it('should have same borderRadius as light theme', () => {
      expect(defaultDarkChatTheme.borderRadius).toEqual(
        defaultLightChatTheme.borderRadius
      );
    });
  });

  describe('mergeChatTheme', () => {
    it('should return base theme when no user theme provided', () => {
      const result = mergeChatTheme(undefined);
      expect(result).toEqual(defaultLightChatTheme);
    });

    it('should return base theme when user theme is undefined', () => {
      const result = mergeChatTheme(undefined, defaultDarkChatTheme);
      expect(result).toEqual(defaultDarkChatTheme);
    });

    it('should merge partial colors with base theme', () => {
      const result = mergeChatTheme({
        colors: { background: '#FF0000' },
      });

      expect(result.colors.background).toBe('#FF0000');
      expect(result.colors.userBubble).toBe(
        defaultLightChatTheme.colors.userBubble
      );
    });

    it('should merge partial spacing with base theme', () => {
      const result = mergeChatTheme({
        spacing: { md: 20 },
      });

      expect(result.spacing.md).toBe(20);
      expect(result.spacing.sm).toBe(defaultLightChatTheme.spacing.sm);
    });

    it('should merge partial borderRadius with base theme', () => {
      const result = mergeChatTheme({
        borderRadius: { bubble: 24 },
      });

      expect(result.borderRadius.bubble).toBe(24);
      expect(result.borderRadius.sm).toBe(
        defaultLightChatTheme.borderRadius.sm
      );
    });

    it('should merge partial fontSize with base theme', () => {
      const result = mergeChatTheme({
        fontSize: { md: 18 },
      });

      expect(result.fontSize.md).toBe(18);
      expect(result.fontSize.sm).toBe(defaultLightChatTheme.fontSize.sm);
    });

    it('should merge multiple partial properties', () => {
      const result = mergeChatTheme({
        colors: { background: '#000000' },
        spacing: { lg: 24 },
        fontSize: { lg: 22 },
      });

      expect(result.colors.background).toBe('#000000');
      expect(result.spacing.lg).toBe(24);
      expect(result.fontSize.lg).toBe(22);
    });

    it('should use custom base theme', () => {
      const result = mergeChatTheme(
        { colors: { background: '#FF0000' } },
        defaultDarkChatTheme
      );

      expect(result.colors.background).toBe('#FF0000');
      expect(result.colors.assistantBubble).toBe(
        defaultDarkChatTheme.colors.assistantBubble
      );
    });
  });
});
