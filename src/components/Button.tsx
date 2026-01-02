/**
 * Custom Button Component - Native App Feel
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
  Platform,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing, shadows } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  icon,
  fullWidth = false,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`${size}Size` as keyof typeof styles],
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
  ];

  const handlePressIn = () => {
    if (!disabled && !loading && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  };

  const flattenedStyle = RNStyleSheet.flatten(buttonStyle) as ViewStyle;

  return (
    <Pressable
      style={({ pressed }) => 
        pressed && !disabled && !loading 
          ? [flattenedStyle, styles.pressed] 
          : flattenedStyle
      }
      onPress={handlePress}
      onPressIn={handlePressIn}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  iconWrapper: {
    marginRight: 2,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.accent,
    ...(Platform.OS === 'ios' ? shadows.md : { elevation: 4 }),
  },
  secondary: {
    backgroundColor: colors.primary,
    ...(Platform.OS === 'ios' ? shadows.md : { elevation: 4 }),
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  smallSize: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 4,
    minHeight: 40,
  },
  mediumSize: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg + 4,
    minHeight: 52,
  },
  largeSize: {
    paddingVertical: spacing.lg - 4,
    paddingHorizontal: spacing.xl,
    minHeight: 60,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: colors.textOnPrimary,
  },
  secondaryText: {
    color: colors.textOnPrimary,
  },
  outlineText: {
    color: colors.accent,
  },
  ghostText: {
    color: colors.accent,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

