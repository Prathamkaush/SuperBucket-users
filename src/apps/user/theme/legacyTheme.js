export const Colors = {
  primary: '#1A6B3C',       // Deep Green
  primaryLight: '#E8F5ED',
  primaryDark: '#0F4425',
  secondary: '#FF6B00',     // Orange accent
  secondaryLight: '#FFF0E6',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  success: '#2E7D32',
  warning: '#F57C00',
  danger: '#C62828',
  info: '#1565C0',
  background: '#F7F9F7',
  cardBg: '#FFFFFF',
  border: '#E8EDE8',
  textPrimary: '#1A1A1A',
  textSecondary: '#616161',
  textMuted: '#9E9E9E',
  walletGreen: '#1A6B3C',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default { Colors, Spacing, FontSize, Radius, Shadow };
