/**
 * Home Screen - Bed Bug Inspection Pro
 * LeadSnap-inspired clean, professional design
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { COPY } from '../constants/copy';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={['#1A0505', '#2D0A0A', '#1A0505']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.iconBadge}>
              <Ionicons name="bug" size={32} color={colors.primary} />
            </View>
            <Text style={styles.appName}>{COPY.APP_NAME}</Text>
            <Text style={styles.tagline}>{COPY.APP_TAGLINE}</Text>
            <Text style={styles.heroSubtitle}>{COPY.HOME_HERO_SUBTITLE}</Text>
          </View>
        </LinearGradient>

        {/* Primary CTA Card */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaCardTitle}>{COPY.HOME_HERO_TITLE}</Text>
          <Button
            title={COPY.BTN_START_SCAN}
            onPress={() => navigation.navigate('SelectRoom')}
            variant="primary"
            size="large"
            fullWidth
            icon={<Ionicons name="camera" size={22} color={colors.textOnPrimary} />}
          />
        </View>

        {/* What This App Does */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{COPY.HOME_WHAT_IS}</Text>
          
          <View style={styles.featureList}>
            <FeatureRow
              icon="images-outline"
              iconColor={colors.primary}
              title={COPY.HOME_FEATURE_1_TITLE}
              description={COPY.HOME_FEATURE_1_DESC}
            />
            <FeatureRow
              icon="location-outline"
              iconColor={colors.accent}
              title={COPY.HOME_FEATURE_2_TITLE}
              description={COPY.HOME_FEATURE_2_DESC}
            />
            <FeatureRow
              icon="call-outline"
              iconColor={colors.success}
              title={COPY.HOME_FEATURE_3_TITLE}
              description={COPY.HOME_FEATURE_3_DESC}
            />
          </View>
        </View>

        {/* Learn About Bed Bugs Card */}
        <View style={styles.educationCard}>
          <View style={styles.educationContent}>
            <Ionicons name="book-outline" size={24} color={colors.accent} />
            <View style={styles.educationText}>
              <Text style={styles.educationTitle}>Learn About Bed Bugs</Text>
              <Text style={styles.educationDesc}>Life stages, how they spread, and why they're hard to eliminate</Text>
            </View>
          </View>
          <Button
            title="Read More"
            onPress={() => navigation.navigate('BedBugEducation')}
            variant="ghost"
            size="small"
            icon={<Ionicons name="chevron-forward" size={16} color={colors.accent} />}
          />
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.privacyBadge}>{COPY.PRIVACY_BADGE}</Text>
          </View>
          <Text style={styles.privacyText}>{COPY.PRIVACY_PHOTOS_DESC}</Text>
        </View>

        {/* Important Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerIcon}>
            <Ionicons name="alert-circle" size={24} color={colors.warning} />
          </View>
          <View style={styles.disclaimerContent}>
            <Text style={styles.disclaimerTitle}>{COPY.HOME_NOT_DIAGNOSIS}</Text>
            <Text style={styles.disclaimerText}>{COPY.HOME_EDUCATIONAL}</Text>
          </View>
        </View>

        {/* Secondary CTA Section */}
        <View style={styles.expertSection}>
          <Text style={styles.expertTitle}>Need Professional Help?</Text>
          <Text style={styles.expertText}>{COPY.CTA_SUPPORTING}</Text>
          <Button
            title={COPY.CTA_BUTTON}
            onPress={() => navigation.navigate('LeadFlow', {})}
            variant="secondary"
            size="medium"
            icon={<Ionicons name="people" size={18} color={colors.textOnPrimary} />}
          />
        </View>

        {/* Footer disclaimer */}
        <Text style={styles.footerDisclaimer}>{COPY.CTA_DISCLAIMER}</Text>

        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface FeatureRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ icon, iconColor, title, description }) => (
  <View style={styles.featureRow}>
    <View style={[styles.featureIcon, { backgroundColor: iconColor + '15' }]}>
      <Ionicons name={icon} size={24} color={iconColor} />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Hero gradient section
  heroGradient: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 61, 0, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 61, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.appTitle,
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(255, 61, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    ...typography.captionBold,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    maxWidth: 320,
  },
  // CTA Card
  ctaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  ctaCardTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  // Features section
  section: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  featureList: {
    gap: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  featureTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Education card
  educationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  educationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  educationText: {
    flex: 1,
  },
  educationTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  educationDesc: {
    ...typography.small,
    color: colors.textSecondary,
  },
  // Privacy card
  privacyCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  privacyBadge: {
    ...typography.captionBold,
    color: colors.success,
  },
  privacyText: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // Disclaimer card
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 160, 0, 0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 0, 0.3)',
    gap: spacing.md,
  },
  disclaimerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 160, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  disclaimerText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  // Expert section
  expertSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expertTitle: {
    ...typography.heading3,
    color: colors.accent,
  },
  expertText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  footerDisclaimer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  legalLink: {
    ...typography.small,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: colors.textMuted,
  },
});

