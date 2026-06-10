// Superbuket Brand Theme — Derived from Logo Colors
// SUPER = Red #E30613  |  BUKET = Blue #1D5FA6

export const Colors = {
  // === Brand Primary: Logo Red ===
  primary: '#E30613',
  primaryDark: '#B50010',
  primaryLight: '#FDECEA',
  primaryMid: '#FF4D57',

  // === Brand Secondary: Logo Blue ===
  secondary: '#1D5FA6',
  secondaryDark: '#154480',
  secondaryLight: '#E8F0FB',
  secondaryMid: '#3A7EC8',

  // === Accent / CTA ===
  accent: '#FF6B00',         // warm orange for CTAs
  accentLight: '#FFF3E6',

  // === Neutrals ===
  white: '#FFFFFF',
  black: '#111111',
  gray50:  '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#1A1A1A',

  // === Semantic ===
  success: '#00A550',
  successLight: '#E6F7EE',
  warning: '#F59E0B',
  warningLight: '#FFF8E1',
  danger: '#E30613',
  dangerLight: '#FDECEA',
  info: '#1D5FA6',
  infoLight: '#E8F0FB',

  // === UI Surfaces ===
  background: '#F4F6FA',
  cardBg: '#FFFFFF',
  border: '#E5E9F0',
  divider: '#ECEEF3',

  // === Text ===
  textPrimary: '#111111',
  textSecondary: '#4A4A4A',
  textMuted: '#9CA3AF',
  textOnDark: '#FFFFFF',
  textOnRed: '#FFFFFF',
  textOnBlue: '#FFFFFF',

  // === Gradient Colors (use LinearGradient) ===
  gradientRedStart: '#E30613',
  gradientRedEnd: '#B50010',
  gradientBlueStart: '#1D5FA6',
  gradientBlueEnd: '#154480',

  // === Wallet ===
  walletBg: '#1D5FA6',
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const FontSize = {
  xxs: 9,
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 19,
  xxl: 23,
  xxxl: 28,
  display: 36,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const Shadow = {
  xs: {
    shadowColor: '#1D5FA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
  redGlow: {
    shadowColor: '#E30613',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  blueGlow: {
    shadowColor: '#1D5FA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export default { Colors, Spacing, FontSize, FontWeight, Radius, Shadow };
