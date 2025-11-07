import {
  defaultLightTheme,
  defaultDarkTheme,
  mergeTheme,
} from '../../theme/default-theme';
import { QuestionnaireTheme } from '../../types';

describe('Default Themes', () => {
  describe('defaultLightTheme', () => {
    it('should have all required color properties', () => {
      expect(defaultLightTheme.colors).toHaveProperty('background');
      expect(defaultLightTheme.colors).toHaveProperty('text');
      expect(defaultLightTheme.colors).toHaveProperty('textSecondary');
      expect(defaultLightTheme.colors).toHaveProperty('primary');
      expect(defaultLightTheme.colors).toHaveProperty('primaryLight');
      expect(defaultLightTheme.colors).toHaveProperty('border');
      expect(defaultLightTheme.colors).toHaveProperty('error');
      expect(defaultLightTheme.colors).toHaveProperty('cardBackground');
      expect(defaultLightTheme.colors).toHaveProperty('selectedBackground');
    });

    it('should have all required spacing properties', () => {
      expect(defaultLightTheme.spacing).toHaveProperty('xs');
      expect(defaultLightTheme.spacing).toHaveProperty('sm');
      expect(defaultLightTheme.spacing).toHaveProperty('md');
      expect(defaultLightTheme.spacing).toHaveProperty('lg');
      expect(defaultLightTheme.spacing).toHaveProperty('xl');
    });

    it('should have all required borderRadius properties', () => {
      expect(defaultLightTheme.borderRadius).toHaveProperty('sm');
      expect(defaultLightTheme.borderRadius).toHaveProperty('md');
      expect(defaultLightTheme.borderRadius).toHaveProperty('lg');
    });

    it('should have all required fontSize properties', () => {
      expect(defaultLightTheme.fontSize).toHaveProperty('sm');
      expect(defaultLightTheme.fontSize).toHaveProperty('md');
      expect(defaultLightTheme.fontSize).toHaveProperty('lg');
      expect(defaultLightTheme.fontSize).toHaveProperty('xl');
    });

    it('should have light theme colors', () => {
      expect(defaultLightTheme.colors.background).toBe('#FFFFFF');
      expect(defaultLightTheme.colors.text).toBe('#000000');
    });
  });

  describe('defaultDarkTheme', () => {
    it('should have all required properties', () => {
      expect(defaultDarkTheme.colors).toBeDefined();
      expect(defaultDarkTheme.spacing).toBeDefined();
      expect(defaultDarkTheme.borderRadius).toBeDefined();
      expect(defaultDarkTheme.fontSize).toBeDefined();
    });

    it('should have dark theme colors', () => {
      expect(defaultDarkTheme.colors.background).toBe('#000000');
      expect(defaultDarkTheme.colors.text).toBe('#FFFFFF');
    });

    it('should have same spacing as light theme', () => {
      expect(defaultDarkTheme.spacing).toEqual(defaultLightTheme.spacing);
    });

    it('should have same borderRadius as light theme', () => {
      expect(defaultDarkTheme.borderRadius).toEqual(defaultLightTheme.borderRadius);
    });

    it('should have same fontSize as light theme', () => {
      expect(defaultDarkTheme.fontSize).toEqual(defaultLightTheme.fontSize);
    });
  });
});

describe('mergeTheme', () => {
  it('should return base theme when no user theme provided', () => {
    const result = mergeTheme(undefined, defaultLightTheme);
    expect(result).toEqual(defaultLightTheme);
  });

  it('should merge user colors with base theme', () => {
    const userTheme: Partial<QuestionnaireTheme> = {
      colors: {
        primary: '#FF0000',
        background: '#F0F0F0',
      } as any,
    };

    const result = mergeTheme(userTheme, defaultLightTheme);

    expect(result.colors.primary).toBe('#FF0000');
    expect(result.colors.background).toBe('#F0F0F0');
    expect(result.colors.text).toBe(defaultLightTheme.colors.text); // Unchanged
    expect(result.spacing).toEqual(defaultLightTheme.spacing); // Unchanged
  });

  it('should merge user spacing with base theme', () => {
    const userTheme: Partial<QuestionnaireTheme> = {
      spacing: {
        sm: 12,
        md: 24,
      } as any,
    };

    const result = mergeTheme(userTheme, defaultLightTheme);

    expect(result.spacing.sm).toBe(12);
    expect(result.spacing.md).toBe(24);
    expect(result.spacing.xs).toBe(defaultLightTheme.spacing.xs); // Unchanged
    expect(result.colors).toEqual(defaultLightTheme.colors); // Unchanged
  });

  it('should merge user borderRadius with base theme', () => {
    const userTheme: Partial<QuestionnaireTheme> = {
      borderRadius: {
        md: 16,
      } as any,
    };

    const result = mergeTheme(userTheme, defaultLightTheme);

    expect(result.borderRadius.md).toBe(16);
    expect(result.borderRadius.sm).toBe(defaultLightTheme.borderRadius.sm);
  });

  it('should merge user fontSize with base theme', () => {
    const userTheme: Partial<QuestionnaireTheme> = {
      fontSize: {
        lg: 20,
      } as any,
    };

    const result = mergeTheme(userTheme, defaultLightTheme);

    expect(result.fontSize.lg).toBe(20);
    expect(result.fontSize.md).toBe(defaultLightTheme.fontSize.md);
  });

  it('should merge multiple theme properties', () => {
    const userTheme: Partial<QuestionnaireTheme> = {
      colors: {
        primary: '#FF0000',
      } as any,
      spacing: {
        lg: 32,
      } as any,
    };

    const result = mergeTheme(userTheme, defaultLightTheme);

    expect(result.colors.primary).toBe('#FF0000');
    expect(result.spacing.lg).toBe(32);
    expect(result.borderRadius).toEqual(defaultLightTheme.borderRadius);
  });

  it('should use defaultLightTheme when baseTheme not specified', () => {
    const userTheme: Partial<QuestionnaireTheme> = {
      colors: {
        primary: '#FF0000',
      } as any,
    };

    const result = mergeTheme(userTheme);

    expect(result.colors.primary).toBe('#FF0000');
    expect(result.colors.background).toBe(defaultLightTheme.colors.background);
  });

  it('should work with empty user theme', () => {
    const userTheme: Partial<QuestionnaireTheme> = {};

    const result = mergeTheme(userTheme, defaultDarkTheme);

    expect(result).toEqual(defaultDarkTheme);
  });
});
