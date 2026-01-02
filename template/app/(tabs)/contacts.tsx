import { StyleSheet, ScrollView, View, Pressable, Linking } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Spacing } from '@/constants/theme';

interface ContactOption {
  type: 'call' | 'text' | 'email' | 'website';
  icon: IconSymbolName;
  label: string;
  value: string;
}

interface Contact {
  id: string;
  name: string;
  title: string;
  organization: string;
  description: string;
  icon: IconSymbolName;
  options: ContactOption[];
}

const CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Vishnu Ravi, MD',
    title: 'Principal Investigator',
    organization: 'SpeziVibe Research Team',
    description: 'Lead researcher and primary contact for study-related questions and support.',
    icon: 'person.circle.fill',
    options: [
      { type: 'call', icon: 'phone.fill', label: 'Call', value: '+1 (555) 123-4567' },
      { type: 'text', icon: 'message.fill', label: 'Text', value: '+1 (555) 123-4567' },
      { type: 'email', icon: 'envelope.fill', label: 'Email', value: 'vishnu.ravi@spezivibe.com' },
    ],
  },
  {
    id: '2',
    name: 'Technical Support',
    title: 'IT Support Team',
    organization: 'SpeziVibe',
    description: 'Get help with technical issues, app functionality, and account management.',
    icon: 'questionmark.circle.fill',
    options: [
      { type: 'email', icon: 'envelope.fill', label: 'Email', value: 'support@spezivibe.com' },
      { type: 'website', icon: 'safari.fill', label: 'Help Center', value: 'https://spezivibe.com/help' },
    ],
  },
  {
    id: '3',
    name: 'Emergency Contact',
    title: '24/7 Crisis Support',
    organization: 'Crisis Hotline',
    description: 'If you are experiencing a mental health emergency, please call this number immediately.',
    icon: 'exclamationmark.triangle.fill',
    options: [
      { type: 'call', icon: 'phone.fill', label: 'Call Now', value: '988' },
    ],
  },
];

export default function ContactsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleContactAction = (option: ContactOption) => {
    switch (option.type) {
      case 'call':
        Linking.openURL(`tel:${option.value}`);
        break;
      case 'text':
        Linking.openURL(`sms:${option.value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${option.value}`);
        break;
      case 'website':
        Linking.openURL(option.value);
        break;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.title}>
            Contacts
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Get in touch with your support team
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {CONTACTS.map((contact) => (
          <View
            key={contact.id}
            style={[
              styles.contactCard,
              {
                backgroundColor: isDark ? '#1D1D1D' : '#fff',
                borderColor: isDark ? '#333' : '#e0e0e0',
              },
            ]}>
            <View style={styles.contactHeader}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      contact.id === '3'
                        ? isDark
                          ? '#5F2D2D'
                          : '#FFE5E5'
                        : isDark
                        ? '#8C1515'
                        : '#B83A4B',
                  },
                ]}>
                <IconSymbol
                  name={contact.icon}
                  size={32}
                  color={
                    contact.id === '3'
                      ? isDark
                        ? '#FF6B6B'
                        : '#DC3545'
                      : isDark
                      ? '#000'
                      : '#fff'
                  }
                />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText type="defaultSemiBold" style={styles.contactName}>
                  {contact.name}
                </ThemedText>
                <ThemedText style={styles.contactTitle}>{contact.title}</ThemedText>
                <ThemedText style={styles.contactOrg}>{contact.organization}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.contactDescription}>{contact.description}</ThemedText>

            <View style={styles.optionsContainer}>
              {contact.options.map((option, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.optionButton,
                    {
                      backgroundColor: isDark ? '#B83A4B' : '#8C1515',
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => handleContactAction(option)}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.label} ${contact.name}`}>
                  <IconSymbol name={option.icon} size={20} color={isDark ? '#000' : '#fff'} />
                  <ThemedText style={[styles.optionLabel, { color: isDark ? '#000' : '#fff' }]}>{option.label}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.infoBox}>
          <IconSymbol name="info.circle.fill" size={20} color={isDark ? '#999' : '#666'} />
          <ThemedText style={styles.infoText}>
            All contacts are available during business hours (9 AM - 5 PM PST) unless otherwise noted.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.screenTop,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  contactCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 20,
    marginBottom: 4,
  },
  contactTitle: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: 2,
  },
  contactOrg: {
    fontSize: 14,
    opacity: 0.6,
  },
  contactDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
});
