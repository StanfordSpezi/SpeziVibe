import { StyleProp, ViewStyle, TextStyle } from 'react-native';

/**
 * Consent data stored when a user agrees to terms
 */
export interface ConsentData {
  /** User's first name */
  givenName: string;
  /** User's last name */
  familyName: string;
  /** ISO timestamp when consent was given */
  consentedAt: string;
  /** Whether the user accepted the terms */
  accepted: boolean;
}

/**
 * Theme colors for onboarding components
 */
export interface OnboardingColors {
  /** Primary color for light mode */
  primaryLight: string;
  /** Primary color for dark mode */
  primaryDark: string;
  /** Inactive/muted color for light mode */
  inactiveLight: string;
  /** Inactive/muted color for dark mode */
  inactiveDark: string;
}

/**
 * Props for PaginationDots component
 */
export interface PaginationDotsProps {
  /** Total number of steps */
  total: number;
  /** Current active step (0-indexed) */
  current: number;
  /** Whether dark mode is active */
  isDark?: boolean;
  /** Custom colors */
  colors?: OnboardingColors;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Props for FeatureCard component
 */
export interface FeatureCardProps {
  /** Icon name to display */
  icon: string;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Whether dark mode is active */
  isDark?: boolean;
  /** Custom colors */
  colors?: OnboardingColors;
  /** Icon render function (for custom icon components) */
  renderIcon?: (name: string, size: number, color: string) => React.ReactNode;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Title text style */
  titleStyle?: StyleProp<TextStyle>;
  /** Description text style */
  descriptionStyle?: StyleProp<TextStyle>;
}

/**
 * Props for ConsentCheckbox component
 */
export interface ConsentCheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Called when checkbox state changes */
  onToggle: () => void;
  /** Label text for the checkbox */
  label: string;
  /** Whether dark mode is active */
  isDark?: boolean;
  /** Custom colors */
  colors?: OnboardingColors;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Label text style */
  labelStyle?: StyleProp<TextStyle>;
  /** Custom checkmark icon render function */
  renderCheckmark?: (color: string) => React.ReactNode;
}

/**
 * Props for OnboardingButton component
 */
export interface OnboardingButtonProps {
  /** Button label */
  label: string;
  /** Called when button is pressed */
  onPress: () => void;
  /** Whether dark mode is active */
  isDark?: boolean;
  /** Custom colors */
  colors?: OnboardingColors;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Label text style */
  labelStyle?: StyleProp<TextStyle>;
}

/**
 * Props for NameInputSection component
 */
export interface NameInputSectionProps {
  /** Current given name value */
  givenName: string;
  /** Current family name value */
  familyName: string;
  /** Called when given name changes */
  onGivenNameChange: (value: string) => void;
  /** Called when family name changes */
  onFamilyNameChange: (value: string) => void;
  /** Whether dark mode is active */
  isDark?: boolean;
  /** Custom label for given name field */
  givenNameLabel?: string;
  /** Custom label for family name field */
  familyNameLabel?: string;
  /** Custom placeholder for given name field */
  givenNamePlaceholder?: string;
  /** Custom placeholder for family name field */
  familyNamePlaceholder?: string;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}
