/**
 * Bed Bug Inspection Pro - "Infestation Alert" Theme
 * Dark, ominous design with emergency red & amber accents
 */

export const colors = {
  // Primary palette - Alert red (emergency feel)
  primary: '#FF3D00',
  primaryDark: '#D32F2F',
  primaryLight: '#FF6E40',
  
  // Accent colors - Warning amber
  accent: '#FFA000',
  accentDark: '#FF8F00',
  accentLight: '#FFCA28',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFA000',
  danger: '#FF3D00',
  info: '#29B6F6',
  
  // Neutrals - Dark slate theme
  background: '#0F1419',
  surface: '#192028',
  surfaceLight: '#242D38',
  surfaceDark: '#0A0E12',
  
  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',
  textDark: '#0F1419',
  
  // Pin colors
  pinUnchecked: '#FF5252',
  pinChecked: '#4CAF50',
  pinActive: '#FFA000',
  
  // Borders
  border: '#2D3748',
  borderLight: '#1E2530',
  
  // Overlays
  overlay: 'rgba(15, 20, 25, 0.92)',
  overlayLight: 'rgba(15, 20, 25, 0.7)',
  
  // Gradient components
  gradientStart: '#1A0A0A',
  gradientEnd: '#2D1810',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Font families - Poppins for clean, readable text
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extraBold: 'Poppins_800ExtraBold',
};

export const typography = {
  // App title - extra bold and large for hero
  appTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  heading1: {
    fontFamily: fonts.bold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  heading2: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  heading3: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
  },
  bodyBold: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 26,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  captionBold: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 22,
  },
  small: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

