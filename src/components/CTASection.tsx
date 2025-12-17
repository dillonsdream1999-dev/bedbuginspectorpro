/**
 * CTA Section Component - LeadSnap style
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { COPY } from '../constants/copy';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

interface CTASectionProps {
  onPress: () => void;
  variant?: 'full' | 'compact';
  style?: object;
}

export const CTASection: React.FC<CTASectionProps> = ({
  onPress,
  variant = 'full',
  style,
}) => {
  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <Button
          title={COPY.CTA_BUTTON}
          onPress={onPress}
          variant="primary"
          size="medium"
          icon={<Ionicons name="people" size={18} color={colors.textOnPrimary} />}
        />
        <Text style={styles.disclaimer}>{COPY.CTA_DISCLAIMER}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name="headset" size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>Need Expert Help?</Text>
      <Text style={styles.supportingText}>{COPY.CTA_SUPPORTING}</Text>
      <Button
        title={COPY.CTA_BUTTON}
        onPress={onPress}
        variant="primary"
        size="large"
        fullWidth
        icon={<Ionicons name="people" size={20} color={colors.textOnPrimary} />}
      />
      <Text style={styles.disclaimer}>{COPY.CTA_DISCLAIMER}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  supportingText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  disclaimer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

