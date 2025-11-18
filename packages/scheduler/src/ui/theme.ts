/**
 * Default theme for scheduler UI components
 */

export interface SchedulerUITheme {
  colors: {
    // Background
    background: string;

    // Cards
    cardBackground: string;
    cardBorder: string;
    cardPressed: string;

    // Event icons
    iconBackgroundCompleted: string;
    iconBackgroundPending: string;
    iconColorCompleted: string;
    iconColorPending: string;

    // Text
    primaryText: string;
    secondaryText: string;
    accentText: string;
    mutedText: string;
    selectedText: string; // Text on primary color backgrounds

    // Primary colors
    primary: string;

    // Border
    border: string;

    // Status badges
    pendingBackground: string;
    pendingText: string;
    completedBackground: string;
    completedText: string;

    // Disabled state
    disabledOpacity: number;
  };
}

export const defaultLightTheme: SchedulerUITheme = {
  colors: {
    background: '#ffffff',

    cardBackground: '#ffffff',
    cardBorder: '#e0e0e0',
    cardPressed: '#F5F5F5',

    iconBackgroundCompleted: '#D4EDDA',
    iconBackgroundPending: '#8C1515',
    iconColorCompleted: '#28A745',
    iconColorPending: '#ffffff',

    primaryText: '#000000',
    secondaryText: '#666666',
    accentText: '#8C1515',
    mutedText: '#666666',
    selectedText: '#ffffff',

    primary: '#8C1515',
    border: '#E5E5E5',

    pendingBackground: '#FFF3CD',
    pendingText: '#856404',
    completedBackground: '#D4EDDA',
    completedText: '#155724',

    disabledOpacity: 0.5,
  },
};

export const defaultDarkTheme: SchedulerUITheme = {
  colors: {
    background: '#000000',

    cardBackground: '#1D1D1D',
    cardBorder: '#333333',
    cardPressed: '#1D1D1D',

    iconBackgroundCompleted: '#2D5F3F',
    iconBackgroundPending: '#B83A4B',
    iconColorCompleted: '#7FD99B',
    iconColorPending: '#000000',

    primaryText: '#ffffff',
    secondaryText: '#999999',
    accentText: '#B83A4B',
    mutedText: '#999999',
    selectedText: '#ffffff',

    primary: '#B83A4B',
    border: '#2D2D2D',

    pendingBackground: '#4A3B1C',
    pendingText: '#FFD966',
    completedBackground: '#2D5F3F',
    completedText: '#7FD99B',

    disabledOpacity: 0.5,
  },
};
