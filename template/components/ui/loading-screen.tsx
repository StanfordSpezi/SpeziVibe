import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface LoadingScreenProps {
  /** Optional message to display below the spinner */
  message?: string;
}

/**
 * Full-screen loading indicator with theme support
 */
export function LoadingScreen({ message: _message }: LoadingScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color={tintColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
