import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { defaultLightTheme } from '../theme/default-theme';
import type { QuestionnaireTheme } from '../types';

interface Props {
  children: React.ReactNode;
  fallback?: (error: Error, resetError: () => void) => React.ReactNode;
  theme?: QuestionnaireTheme;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for questionnaire components
 * Catches errors and displays a fallback UI instead of crashing the app
 *
 * Usage:
 * ```tsx
 * <QuestionnaireErrorBoundary>
 *   <QuestionnaireForm questionnaire={q} onResult={handleResult} />
 * </QuestionnaireErrorBoundary>
 * ```
 */
export class QuestionnaireErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Questionnaire Error:', error);
    console.error('Error Info:', errorInfo);

    // You can also log to an error reporting service here
    // e.g., Sentry.captureException(error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      const theme = this.props.theme || defaultLightTheme;

      return (
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}>
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.xl,
                  marginBottom: theme.spacing.md,
                },
              ]}>
              Something went wrong
            </Text>

            <Text
              style={[
                styles.message,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSize.md,
                  marginBottom: theme.spacing.xl,
                },
              ]}>
              {this.state.error.message || 'An unexpected error occurred'}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.xl,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={this.resetError}
              accessibilityRole="button"
              accessibilityLabel="Try Again"
              accessibilityHint="Resets the error and tries to reload the questionnaire">
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme.colors.selectedBackground,
                    fontSize: theme.fontSize.lg,
                  },
                ]}>
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    alignItems: 'center',
    minWidth: 120,
  },
  buttonText: {
    fontWeight: '600',
  },
});
