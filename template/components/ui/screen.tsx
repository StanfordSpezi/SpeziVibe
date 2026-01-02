import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

const isWeb = Platform.OS === 'web';

type ScreenPreset = 'fixed' | 'scroll' | 'auto';

type StatusBarStyle = 'light' | 'dark' | 'auto';

export type ScreenProps = {
  /**
   * Children to render in the screen
   */
  children?: React.ReactNode;
  /**
   * Override the background color
   */
  backgroundColor?: string;
  /**
   * Style for the outer container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style for the inner content container
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Which edges to apply safe area insets to
   * @default ['top', 'bottom']
   */
  safeAreaEdges?: Edge[];
  /**
   * Preset determines scroll behavior:
   * - 'fixed': No scrolling, content fills available space
   * - 'scroll': Always scrollable
   * - 'auto': Scrollable only when content exceeds screen height
   * @default 'fixed'
   */
  preset?: ScreenPreset;
  /**
   * Whether to avoid the keyboard
   * @default true
   */
  keyboardAvoidingEnabled?: boolean;
  /**
   * Additional offset for keyboard avoiding behavior
   * @default 0
   */
  keyboardOffset?: number;
  /**
   * Status bar style
   * @default 'auto'
   */
  statusBarStyle?: StatusBarStyle;
  /**
   * Whether the scroll view should bounce at the edges
   * @default true
   */
  bounces?: boolean;
  /**
   * Whether to show scroll indicators
   * @default true
   */
  showsScrollIndicator?: boolean;
};

/**
 * Screen component that wraps content with safe area handling,
 * keyboard avoidance, and optional scrolling.
 */
export function Screen(props: ScreenProps) {
  const {
    children,
    backgroundColor: backgroundColorProp,
    style,
    contentContainerStyle,
    safeAreaEdges = ['top', 'bottom'],
    preset = 'fixed',
    keyboardAvoidingEnabled = true,
    keyboardOffset = 0,
    statusBarStyle = 'auto',
    bounces = true,
    showsScrollIndicator = true,
  } = props;

  const themeBackground = useThemeColor({}, 'background');
  const backgroundColor = backgroundColorProp ?? themeBackground;

  const insets = useSafeAreaInsets();

  // Calculate safe area padding based on specified edges
  const safeAreaStyle: ViewStyle = {
    paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
    paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: safeAreaEdges.includes('left') ? insets.left : 0,
    paddingRight: safeAreaEdges.includes('right') ? insets.right : 0,
  };

  // Determine status bar style (expo-status-bar uses 'light', 'dark', 'auto')
  const resolvedStatusBarStyle = statusBarStyle === 'auto'
    ? 'auto'
    : statusBarStyle;

  const containerStyles = [
    styles.container,
    { backgroundColor },
    safeAreaStyle,
    style,
  ];

  // On web, keyboard avoiding is handled by the browser
  // On iOS, use 'padding', on Android use 'height'
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';
  const shouldAvoidKeyboard = keyboardAvoidingEnabled && !isWeb;

  const renderContent = () => {
    if (preset === 'fixed') {
      return <FixedContent style={contentContainerStyle}>{children}</FixedContent>;
    }

    if (preset === 'scroll') {
      return (
        <ScrollContent
          style={contentContainerStyle}
          bounces={bounces}
          showsScrollIndicator={showsScrollIndicator}
        >
          {children}
        </ScrollContent>
      );
    }

    // Auto preset - scrolls only when content exceeds container
    return (
      <AutoContent
        style={contentContainerStyle}
        bounces={bounces}
        showsScrollIndicator={showsScrollIndicator}
      >
        {children}
      </AutoContent>
    );
  };

  return (
    <View style={containerStyles}>
      <StatusBar style={resolvedStatusBarStyle} />
      {shouldAvoidKeyboard ? (
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={keyboardBehavior}
          keyboardVerticalOffset={keyboardOffset}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      ) : (
        renderContent()
      )}
    </View>
  );
}

/**
 * Fixed content - no scrolling, fills available space
 */
function FixedContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.content, style]}>{children}</View>;
}

/**
 * Scrollable content - always scrollable
 */
function ScrollContent({
  children,
  style,
  bounces,
  showsScrollIndicator,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bounces: boolean;
  showsScrollIndicator: boolean;
}) {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, style]}
      keyboardShouldPersistTaps="handled"
      bounces={bounces}
      showsVerticalScrollIndicator={showsScrollIndicator}
    >
      {children}
    </ScrollView>
  );
}

/**
 * Auto content - scrollable only when content exceeds container height
 */
function AutoContent({
  children,
  style,
  bounces,
  showsScrollIndicator,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bounces: boolean;
  showsScrollIndicator: boolean;
}) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const shouldScroll = contentHeight > containerHeight;

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  }, []);

  const handleContentLayout = useCallback((e: LayoutChangeEvent) => {
    setContentHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.autoContent, style]}
      keyboardShouldPersistTaps="handled"
      bounces={bounces && shouldScroll}
      scrollEnabled={shouldScroll}
      showsVerticalScrollIndicator={showsScrollIndicator && shouldScroll}
      onLayout={handleContainerLayout}
    >
      <View onLayout={handleContentLayout}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  autoContent: {
    flexGrow: 1,
  },
});
