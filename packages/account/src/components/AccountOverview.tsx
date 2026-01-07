import React from 'react';
import { ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useAccount } from '../hooks/useAccount';
import { formatPersonName, isPersonNameEmpty, PersonNameStyle } from '../utils/person-name';

export interface AccountOverviewProps {
  /** Custom styles for the container */
  containerStyle?: ViewStyle;

  /** Custom styles for section headers */
  sectionHeaderStyle?: TextStyle;

  /** Custom styles for field labels */
  labelStyle?: TextStyle;

  /** Custom styles for field values */
  valueStyle?: TextStyle;

  /** Custom styles for action buttons */
  buttonStyle?: ViewStyle;

  /** Custom styles for button text */
  buttonTextStyle?: TextStyle;

  /** Show edit profile button (default: true) */
  showEditProfile?: boolean;

  /** Show change password button (default: true) */
  showChangePassword?: boolean;

  /** Show logout button (default: true) */
  showLogout?: boolean;

  /** Custom text for change password button (default: "Change Password") */
  changePasswordButtonText?: string;

  /** Callback when edit profile is pressed */
  onEditProfile?: () => void;

  /** Callback when change password is pressed */
  onChangePassword?: () => void;

  /** Callback when logout is pressed */
  onLogout?: () => void;
}

/**
 * AccountOverview - Display and manage user account information
 *
 * This component displays the current user's profile information 
 * and provides actions for account management.
 *
 * @example
 * ```tsx
 * import { AccountOverview } from '@spezivibe/account';
 *
 * function ProfileScreen() {
 *   return (
 *     <AccountOverview
 *       onEditProfile={() => navigation.navigate('EditProfile')}
 *       onChangePassword={() => navigation.navigate('ChangePassword')}
 *     />
 *   );
 * }
 * ```
 */
export function AccountOverview({
  containerStyle,
  sectionHeaderStyle,
  labelStyle,
  valueStyle,
  buttonStyle,
  buttonTextStyle,
  showEditProfile = true,
  showChangePassword = true,
  showLogout = true,
  changePasswordButtonText = 'Change Password',
  onEditProfile,
  onChangePassword,
  onLogout,
}: AccountOverviewProps) {
  const { user, logout, configuration } = useAccount();

  // Respect configuration: hide Edit Profile button if editing is not allowed
  const allowsEditing = configuration?.allowsEditing ?? true;
  const shouldShowEditProfile = showEditProfile && allowsEditing;

  if (!user) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Text
          style={styles.emptyText}
          accessibilityRole="text"
          accessibilityLabel="No account information available"
        >
          No account information available
        </Text>
      </View>
    );
  }

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  return (
    <ScrollView style={[styles.container, containerStyle]}>
      {/* Account Information Section */}
      <View style={styles.section} accessibilityRole="summary">
        <Text
          style={[styles.sectionHeader, sectionHeaderStyle]}
          accessibilityRole="header"
        >
          Account Information
        </Text>

        <View
          style={styles.field}
          accessibilityLabel={`Email: ${user.email || 'Not set'}`}
        >
          <Text style={[styles.label, labelStyle]}>Email</Text>
          <Text style={[styles.value, valueStyle]}>{user.email || 'Not set'}</Text>
        </View>

        <View
          style={styles.field}
          accessibilityLabel={`User ID: ${user.uid}`}
        >
          <Text style={[styles.label, labelStyle]}>User ID</Text>
          <Text style={[styles.value, valueStyle]}>{user.uid}</Text>
        </View>

        {user.createdAt && (
          <View
            style={styles.field}
            accessibilityLabel={`Member Since: ${user.createdAt.toLocaleDateString()}`}
          >
            <Text style={[styles.label, labelStyle]}>Member Since</Text>
            <Text style={[styles.value, valueStyle]}>
              {user.createdAt.toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Profile Information Section */}
      {(!isPersonNameEmpty(user.name) || user.dateOfBirth || user.sex) && (
        <View style={styles.section} accessibilityRole="summary">
          <Text
            style={[styles.sectionHeader, sectionHeaderStyle]}
            accessibilityRole="header"
          >
            Profile Information
          </Text>

          {!isPersonNameEmpty(user.name) && (
            <View
              style={styles.field}
              accessibilityLabel={`Name: ${formatPersonName(user.name, PersonNameStyle.Long)}`}
            >
              <Text style={[styles.label, labelStyle]}>Name</Text>
              <Text style={[styles.value, valueStyle]}>
                {formatPersonName(user.name, PersonNameStyle.Long)}
              </Text>
            </View>
          )}

          {user.dateOfBirth && (
            <View
              style={styles.field}
              accessibilityLabel={`Date of Birth: ${user.dateOfBirth.toLocaleDateString()}`}
            >
              <Text style={[styles.label, labelStyle]}>Date of Birth</Text>
              <Text style={[styles.value, valueStyle]}>
                {user.dateOfBirth.toLocaleDateString()}
              </Text>
            </View>
          )}

          {user.sex && (
            <View
              style={styles.field}
              accessibilityLabel={`Sex: ${user.sex}`}
            >
              <Text style={[styles.label, labelStyle]}>Sex</Text>
              <Text style={[styles.value, valueStyle]}>{user.sex}</Text>
            </View>
          )}

          {user.phoneNumber && (
            <View
              style={styles.field}
              accessibilityLabel={`Phone Number: ${user.phoneNumber}`}
            >
              <Text style={[styles.label, labelStyle]}>Phone Number</Text>
              <Text style={[styles.value, valueStyle]}>{user.phoneNumber}</Text>
            </View>
          )}

          {user.biography && (
            <View
              style={styles.field}
              accessibilityLabel={`Biography: ${user.biography}`}
            >
              <Text style={[styles.label, labelStyle]}>Biography</Text>
              <Text style={[styles.value, valueStyle]}>{user.biography}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions Section */}
      <View style={styles.section}>
        {shouldShowEditProfile && onEditProfile && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, buttonStyle]}
            onPress={onEditProfile}
            accessibilityRole="button"
            accessibilityLabel="Edit Profile"
            accessibilityHint="Double tap to edit your profile information"
          >
            <Text style={[styles.buttonText, styles.primaryButtonText, buttonTextStyle]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        )}

        {showChangePassword && onChangePassword && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, buttonStyle]}
            onPress={onChangePassword}
            accessibilityRole="button"
            accessibilityLabel={changePasswordButtonText}
            accessibilityHint="Double tap to change your password"
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText, buttonTextStyle]}>
              {changePasswordButtonText}
            </Text>
          </TouchableOpacity>
        )}

        {showLogout && (
          <TouchableOpacity
            style={[styles.button, styles.dangerButton, buttonStyle]}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Logout"
            accessibilityHint="Double tap to log out of your account"
          >
            <Text style={[styles.buttonText, styles.dangerButtonText, buttonTextStyle]}>
              Logout
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  dangerButtonText: {
    color: '#FF3B30',
  },
});
