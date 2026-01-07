import {
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { EditProfileForm } from '@spezivibe/account';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleClose = () => router.back();

  const handleError = (error: Error) => {
    Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000' : '#f2f2f7' }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Edit Profile
        </ThemedText>
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons
            name="close"
            size={28}
            color={isDark ? '#fff' : '#000'}
          />
        </Pressable>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <EditProfileForm
            onSuccess={handleClose}
            onError={handleError}
            containerStyle={styles.form}
            inputStyle={{
              ...styles.input,
              backgroundColor: isDark ? '#000' : '#f5f5f5',
              color: isDark ? '#fff' : '#000',
              borderColor: isDark ? '#333' : '#e0e0e0',
            }}
            labelStyle={styles.label}
            buttonStyle={{
              ...styles.saveButton,
              backgroundColor: isDark ? '#B83A4B' : '#8C1515',
            }}
            buttonTextStyle={{
              ...styles.saveButtonText,
              color: isDark ? '#000' : '#fff',
            }}
            buttonText="Save Changes"
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
