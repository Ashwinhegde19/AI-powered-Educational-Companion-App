import {DefaultTheme} from 'react-native-paper';

export const colors = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
  primaryLight: '#BBDEFB',
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  accent: '#4CAF50',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  border: '#E0E0E0',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
  info: '#2196F3',
  youtube: '#FF0000',
  ncert: '#8BC34A',
  gradient: {
    primary: ['#1976D2', '#2196F3'],
    secondary: ['#FF9800', '#FFC107'],
    success: ['#4CAF50', '#8BC34A'],
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryDark,
    surface: colors.surface,
    background: colors.background,
    error: colors.error,
    onPrimary: colors.textLight,
    onSecondary: colors.textLight,
    onSurface: colors.text,
    onBackground: colors.text,
    outline: colors.border,
  },
};
