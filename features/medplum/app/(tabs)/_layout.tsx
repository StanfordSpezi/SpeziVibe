import { Tabs } from 'expo-router';
import React, { useState, createContext, useContext, useCallback } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AccountSheet } from '@/components/account/account-sheet';

// Context to share account sheet state across tab screens
interface AccountSheetContextValue {
  showAccountSheet: () => void;
}

const AccountSheetContext = createContext<AccountSheetContextValue | null>(null);

export function useAccountSheet() {
  const context = useContext(AccountSheetContext);
  if (!context) {
    throw new Error('useAccountSheet must be used within TabLayout');
  }
  return context;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [accountSheetVisible, setAccountSheetVisible] = useState(false);

  const showAccountSheet = useCallback(() => {
    setAccountSheetVisible(true);
  }, []);

  const hideAccountSheet = useCallback(() => {
    setAccountSheetVisible(false);
  }, []);

  return (
    <AccountSheetContext.Provider value={{ showAccountSheet }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: 'Contacts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          }}
        />
        {/* __INJECT_TABS__ */}
      </Tabs>

      <AccountSheet
        visible={accountSheetVisible}
        onClose={hideAccountSheet}
      />
    </AccountSheetContext.Provider>
  );
}
