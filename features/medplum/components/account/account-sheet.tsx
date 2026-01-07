import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AccountOverview, useAccount } from '@spezivibe/account';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

interface AccountSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * AccountSheet - A modal sheet for account management
 *
 */
export function AccountSheet({ visible, onClose }: AccountSheetProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout } = useAccount();

  const handleEditProfile = () => {
    onClose();
    // Navigate after closing - React Navigation handles the transition gracefully
    router.push('/edit-profile');
  };

  const handleChangePassword = () => {
    onClose();
    // Navigate after closing - React Navigation handles the transition gracefully
    router.push('/change-password');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              onClose();
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000' : '#f2f2f7' }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Account
          </ThemedText>
          <Pressable
            onPress={onClose}
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

        <View style={styles.content}>
          <AccountOverview
            containerStyle={styles.accountOverview}
            sectionHeaderStyle={{ color: isDark ? '#fff' : '#333' }}
            labelStyle={{ color: isDark ? '#aaa' : '#666' }}
            valueStyle={{ color: isDark ? '#fff' : '#333' }}
            onEditProfile={handleEditProfile}
            onChangePassword={handleChangePassword}
            changePasswordButtonText="Reset Password"
            onLogout={handleLogout}
            buttonStyle={{
              ...styles.button,
              backgroundColor: isDark ? '#B83A4B' : '#8C1515',
            }}
            buttonTextStyle={{
              ...styles.buttonText,
              color: isDark ? '#000' : '#fff',
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
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
  content: {
    flex: 1,
  },
  accountOverview: {
    padding: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
