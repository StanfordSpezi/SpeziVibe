// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation & Tabs
  'house.fill': 'home',
  'calendar': 'event',
  'person.2.fill': 'people',
  'paperplane.fill': 'send',

  // UI Elements
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'info.circle.fill': 'info',

  // Features & Welcome
  'heart.fill': 'favorite',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'bell.badge.fill': 'notifications',
  'sparkles': 'auto-awesome',
  'lock.shield.fill': 'security',
  'star.fill': 'star',

  // Contacts & Communication
  'person.circle.fill': 'account-circle',
  'phone.fill': 'phone',
  'message.fill': 'chat',
  'envelope.fill': 'email',
  'questionmark.circle.fill': 'help',
  'safari.fill': 'language',
  'exclamationmark.triangle.fill': 'warning',

  // Documents
  'doc.text.fill': 'description',
} satisfies Record<string, MaterialIconName>;

export type IconSymbolName = keyof typeof MAPPING;

export interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: IconSymbolProps) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
