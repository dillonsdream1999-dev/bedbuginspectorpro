/**
 * Bed Bug Education Screen
 * Educational content about bed bugs, life stages, spread, and difficulty of removal
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';
import { trackPageView } from '../services/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'BedBugEducation'>;

const LIFE_STAGES = [
  {
    stage: 'Eggs',
    size: '1mm (grain of salt)',
    color: 'Pearly white',
    duration: 'Hatch in 6-10 days',
    icon: 'ellipse',
    description: 'Nearly invisible to the naked eye. Laid in clusters of 10-50 in cracks and crevices.',
  },
  {
    stage: 'Nymphs (5 stages)',
    size: '1.5mm - 4.5mm',
    color: 'Translucent to tan',
    duration: '5-8 weeks to mature',
    icon: 'bug-outline',
    description: 'Must feed on blood to molt to next stage. Can survive weeks without feeding.',
  },
  {
    stage: 'Adults',
    size: '5-7mm (apple seed)',
    color: 'Reddish-brown',
    duration: 'Live 4-6 months (up to 1 year)',
    icon: 'bug',
    description: 'Flat, oval-shaped. Females lay 1-5 eggs per day, up to 500 in lifetime.',
  },
];

const SPREAD_METHODS = [
  {
    title: 'Travel & Hotels',
    icon: 'airplane',
    description: 'Hitchhike in luggage, clothing, and personal items. Hotels, motels, and rentals are common pickup points.',
  },
  {
    title: 'Used Furniture',
    icon: 'bed',
    description: 'Infested mattresses, couches, and furniture brought into homes. Even "clean looking" items can harbor bugs.',
  },
  {
    title: 'Visitors & Guests',
    icon: 'people',
    description: 'Can travel on clothing, bags, or personal items of visitors. One overnight guest can start an infestation.',
  },
  {
    title: 'Multi-Unit Buildings',
    icon: 'business',
    description: 'Spread through walls, electrical outlets, and plumbing between apartments. One unit can infest the building.',
  },
  {
    title: 'Secondhand Items',
    icon: 'pricetag',
    description: 'Thrift store clothing, library books, and other used items can carry eggs or live bugs.',
  },
];

const WHY_HARD_TO_ELIMINATE = [
  {
    title: 'Pesticide Resistance',
    icon: 'shield',
    description: 'Many bed bug populations have developed resistance to common over-the-counter pesticides.',
  },
  {
    title: 'Expert Hiders',
    icon: 'eye-off',
    description: 'Can hide in cracks as thin as a credit card. Hide in walls, electronics, picture frames, and more.',
  },
  {
    title: 'Survive Without Food',
    icon: 'hourglass',
    description: 'Adults can survive 6-12 months without feeding. Waiting them out doesn\'t work.',
  },
  {
    title: 'Rapid Reproduction',
    icon: 'trending-up',
    description: 'A single pregnant female can create an infestation of 300+ adults in 3 months.',
  },
  {
    title: 'Missed Eggs',
    icon: 'close-circle',
    description: 'DIY treatments often miss eggs, which hatch and restart the cycle. Professionals use multiple treatments.',
  },
];

export const BedBugEducationScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    trackPageView('education');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="bug" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Know Your Enemy</Text>
          <Text style={styles.subtitle}>
            Understanding bed bugs is the first step to eliminating them
          </Text>
        </View>

        {/* Life Stages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="git-branch-outline" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>Life Stages</Text>
          </View>
          <Text style={styles.sectionIntro}>
            Bed bugs go through 7 life stages. Recognizing each helps identify infestations early.
          </Text>
          
          {LIFE_STAGES.map((stage, index) => (
            <View key={stage.stage} style={styles.stageCard}>
              <View style={styles.stageHeader}>
                <View style={styles.stageIcon}>
                  <Ionicons name={stage.icon as any} size={24} color={colors.primary} />
                </View>
                <View style={styles.stageInfo}>
                  <Text style={styles.stageName}>{stage.stage}</Text>
                  <View style={styles.stageStats}>
                    <Text style={styles.statText}>📏 {stage.size}</Text>
                    <Text style={styles.statText}>🎨 {stage.color}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.stageDescription}>{stage.description}</Text>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={12} color={colors.accent} />
                <Text style={styles.durationText}>{stage.duration}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* How They Spread Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="swap-horizontal" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>How They Spread</Text>
          </View>
          <Text style={styles.sectionIntro}>
            Bed bugs are expert hitchhikers. They don't fly or jump—they travel with us.
          </Text>
          
          {SPREAD_METHODS.map((method) => (
            <View key={method.title} style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name={method.icon as any} size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{method.title}</Text>
                <Text style={styles.infoDescription}>{method.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Why Hard to Eliminate Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Why DIY Fails</Text>
          </View>
          <Text style={styles.sectionIntro}>
            Over 90% of DIY bed bug treatments fail. Here's why professionals are essential:
          </Text>
          
          {WHY_HARD_TO_ELIMINATE.map((reason) => (
            <View key={reason.title} style={styles.warningCard}>
              <View style={styles.warningIcon}>
                <Ionicons name={reason.icon as any} size={18} color={colors.primary} />
              </View>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>{reason.title}</Text>
                <Text style={styles.warningDescription}>{reason.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Key Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>The Numbers Don't Lie</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>500</Text>
              <Text style={styles.statLabel}>eggs per female lifetime</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12mo</Text>
              <Text style={styles.statLabel}>survival without food</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>90%</Text>
              <Text style={styles.statLabel}>DIY treatments fail</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>3-4</Text>
              <Text style={styles.statLabel}>treatments typically needed</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Ionicons name="alert-circle" size={32} color={colors.accent} />
          <Text style={styles.ctaTitle}>Don't Wait Until It's Worse</Text>
          <Text style={styles.ctaText}>
            Early detection saves time, money, and stress. A professional inspection can confirm or rule out an infestation quickly.
          </Text>
          <Button
            title="Contact a Local Expert"
            onPress={() => navigation.navigate('LeadFlow', {})}
            variant="primary"
            size="large"
            fullWidth
            icon={<Ionicons name="call" size={20} color={colors.textOnPrimary} />}
          />
          <Button
            title="Start Room Inspection"
            onPress={() => navigation.navigate('SelectRoom')}
            variant="outline"
            size="medium"
            style={styles.secondaryButton}
            icon={<Ionicons name="search" size={18} color={colors.accent} />}
          />
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This information is for educational purposes only. Always consult with a licensed pest control professional for diagnosis and treatment.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 61, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 61, 0, 0.3)',
  },
  title: {
    ...typography.heading1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
  },
  sectionIntro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  // Life Stage Cards
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 61, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  stageStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  stageDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  durationText: {
    ...typography.small,
    color: colors.accent,
  },
  // Info Cards (Spread Methods)
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  infoDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Warning Cards (Why Hard)
  warningCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 61, 0, 0.06)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  warningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 61, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  warningDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Stats Section
  statsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    ...typography.heading3,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    width: '48%',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.heading1,
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // CTA Section
  ctaSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  ctaText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  secondaryButton: {
    marginTop: spacing.md,
  },
  disclaimer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
