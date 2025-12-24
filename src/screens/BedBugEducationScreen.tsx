/**
 * Bed Bug Education Screen
 * Educational content about bed bugs, life stages, prevention, and professional treatment
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';
import { trackPageView } from '../services/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'BedBugEducation'>;

// Import local images
const eggsImage = require('../../assets/education/bed-bug-eggs.jpg');
const nymphsImage = require('../../assets/education/bed-bug-nymphs.jpg');
const adultsImage = require('../../assets/education/adult-bed-bugs.jpg');

const LIFE_STAGES = [
  {
    stage: 'Eggs',
    size: '1mm (grain of salt)',
    color: 'Pearly white',
    duration: 'Hatch in 6-10 days',
    icon: 'ellipse',
    description: 'Nearly invisible to the naked eye. Laid in clusters of 10-50 in cracks and crevices. A single female can lay 200-500 eggs in her lifetime.',
    hasImage: true,
    image: eggsImage,
  },
  {
    stage: 'Nymphs (5 Instars)',
    size: '1.5mm - 4.5mm',
    color: 'Translucent to tan',
    duration: '5-8 weeks to mature',
    icon: 'bug-outline',
    description: 'Baby bed bugs must feed on blood between each of their 5 molting stages. They become more visible as they grow and after feeding when they turn reddish.',
    hasImage: true,
    image: nymphsImage,
  },
  {
    stage: 'Adults',
    size: '5-7mm (apple seed)',
    color: 'Reddish-brown',
    duration: 'Live 4-6 months (up to 1 year)',
    icon: 'bug',
    description: 'Flat, oval-shaped when unfed, swollen and elongated after feeding. Females lay 1-5 eggs daily. Males are slightly smaller with a pointed abdomen.',
    hasImage: true,
    image: adultsImage,
  },
];

const PREVENTION_TIPS = [
  {
    title: 'Inspect Hotel Rooms',
    icon: 'search',
    description: 'Check mattress seams, headboards, and furniture before unpacking. Keep luggage on hard surfaces, never on the bed or carpet.',
  },
  {
    title: 'Use Protective Encasements',
    icon: 'shield-checkmark',
    description: 'Encase mattresses and box springs in bed bug-proof covers. This traps existing bugs and prevents new ones from hiding inside.',
  },
  {
    title: 'Inspect Secondhand Items',
    icon: 'eye',
    description: 'Carefully examine used furniture, clothing, and books before bringing them home. Avoid picking up furniture from curbs or dumpsters.',
  },
  {
    title: 'Reduce Clutter',
    icon: 'trash',
    description: 'Clutter provides hiding spots. Keep areas around beds clear. Store items in sealed plastic containers instead of cardboard boxes.',
  },
  {
    title: 'Vacuum Regularly',
    icon: 'sparkles',
    description: 'Vacuum mattresses, box springs, and floors regularly. Immediately dispose of the vacuum bag in a sealed plastic bag outside.',
  },
  {
    title: 'Be Careful with Laundry',
    icon: 'shirt',
    description: 'When returning from travel, wash and dry all clothes on HIGH heat (120°F+) for at least 30 minutes. Heat kills all life stages.',
  },
  {
    title: 'Seal Entry Points',
    icon: 'construct',
    description: 'Caulk cracks around baseboards, electrical outlets, and pipes. In apartments, this helps prevent spread from neighboring units.',
  },
  {
    title: 'Use Interceptor Traps',
    icon: 'locate',
    description: 'Place bed bug interceptor traps under bed legs. These catch bugs trying to climb up and help detect early infestations.',
  },
];

const SIGNS_OF_INFESTATION = [
  {
    title: 'Fecal Spots',
    description: 'Dark brown or black spots (digested blood) on mattresses, sheets, walls, or furniture. Often found in clusters.',
  },
  {
    title: 'Blood Stains',
    description: 'Small rusty or reddish stains on sheets from crushed bugs or bites that bled.',
  },
  {
    title: 'Shed Skins',
    description: 'Translucent, empty exoskeletons left behind as nymphs molt through their 5 growth stages.',
  },
  {
    title: 'Eggs & Eggshells',
    description: 'Tiny (1mm) white eggs or pale yellow shells in cracks, seams, and hidden areas.',
  },
  {
    title: 'Musty Odor',
    description: 'A sweet, musty smell from bed bug scent glands. Heavy infestations have a noticeable odor.',
  },
  {
    title: 'Live Bugs',
    description: 'Adult bugs are visible to the naked eye. Check mattress seams, headboards, and furniture joints.',
  },
];

const SPREAD_METHODS = [
  {
    title: 'Travel & Hotels',
    icon: 'airplane',
    description: 'Bed bugs hitchhike in luggage, clothing, and personal items. Hotels, motels, Airbnbs, and even cruise ships are common pickup points.',
  },
  {
    title: 'Used Furniture',
    icon: 'bed',
    description: 'Infested mattresses, couches, bed frames, and furniture brought into homes. Even clean-looking items can harbor bugs deep in crevices.',
  },
  {
    title: 'Visitors & Guests',
    icon: 'people',
    description: 'Bugs travel on clothing, bags, or belongings of visitors. A single overnight guest from an infested home can start an infestation.',
  },
  {
    title: 'Multi-Unit Buildings',
    icon: 'business',
    description: 'Spread through walls, electrical outlets, plumbing, and shared laundry. One infested unit can spread to the entire building.',
  },
  {
    title: 'Public Transportation',
    icon: 'bus',
    description: 'Buses, trains, planes, and taxis can harbor bed bugs. They attach to clothing and bags during your commute.',
  },
  {
    title: 'Workplaces & Schools',
    icon: 'briefcase',
    description: 'Offices, schools, and daycares can spread infestations as bugs travel home with employees, students, and children.',
  },
];

const WHY_DIY_FAILS = [
  {
    title: 'Pesticide Resistance',
    icon: 'shield',
    description: 'Most bed bug populations have developed strong resistance to over-the-counter sprays and pesticides. What worked 20 years ago is now ineffective.',
  },
  {
    title: 'Expert Hiders',
    icon: 'eye-off',
    description: 'Bed bugs hide in cracks as thin as a credit card—inside walls, electronics, picture frames, outlets, and places sprays can\'t reach.',
  },
  {
    title: 'Survive Without Food',
    icon: 'hourglass',
    description: 'Adults survive 6-12 months without feeding. You can\'t starve them out by sleeping elsewhere or leaving your home vacant.',
  },
  {
    title: 'Rapid Reproduction',
    icon: 'trending-up',
    description: 'One pregnant female creates 300+ adults in 3 months. Missing even a few bugs means the infestation returns quickly.',
  },
  {
    title: 'Missed Eggs',
    icon: 'close-circle',
    description: 'DIY treatments miss eggs hidden in crevices. Eggs hatch 6-10 days later, restarting the cycle. Professionals use multiple treatments.',
  },
  {
    title: 'Spreading the Problem',
    icon: 'git-branch',
    description: 'Improper treatment can scatter bugs to other rooms. Bug bombs are especially bad—they spread infestations without killing bugs.',
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
            Understanding bed bugs is the first step to protecting your home
          </Text>
        </View>

        {/* Life Stages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="git-branch-outline" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>Life Stages</Text>
          </View>
          <Text style={styles.sectionIntro}>
            Bed bugs go through 7 life stages: egg, 5 nymph stages, and adult. Recognizing each stage helps identify infestations early.
          </Text>
          
          {LIFE_STAGES.map((stage) => (
            <View key={stage.stage} style={styles.stageCard}>
              {stage.hasImage && stage.image && (
                <View style={styles.stageImageContainer}>
                  <Image source={stage.image} style={styles.stageImage} resizeMode="contain" />
                </View>
              )}
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

        {/* Signs of Infestation Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Signs of Infestation</Text>
          </View>
          <Text style={styles.sectionIntro}>
            Bed bugs leave evidence of their presence. Learn to spot these warning signs early.
          </Text>
          
          <View style={styles.signsGrid}>
            {SIGNS_OF_INFESTATION.map((sign) => (
              <View key={sign.title} style={styles.signCard}>
                <Text style={styles.signTitle}>{sign.title}</Text>
                <Text style={styles.signDescription}>{sign.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Prevention Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.sectionTitle}>Prevention Tips</Text>
          </View>
          <Text style={styles.sectionIntro}>
            The best defense is prevention. Follow these tips to reduce your risk of bringing bed bugs home.
          </Text>
          
          {PREVENTION_TIPS.map((tip) => (
            <View key={tip.title} style={styles.preventionCard}>
              <View style={styles.preventionIcon}>
                <Ionicons name={tip.icon as any} size={20} color={colors.success} />
              </View>
              <View style={styles.preventionContent}>
                <Text style={styles.preventionTitle}>{tip.title}</Text>
                <Text style={styles.preventionDescription}>{tip.description}</Text>
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
            Bed bugs are expert hitchhikers. They don't fly or jump—they travel with us and our belongings.
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
              <Text style={styles.statNumber}>97%</Text>
              <Text style={styles.statLabel}>pest pros treated bed bugs this year</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>$1.5-3K</Text>
              <Text style={styles.statLabel}>average treatment cost</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Ionicons name="checkmark-circle" size={32} color={colors.success} />
          <Text style={styles.ctaTitle}>Early Detection is Key</Text>
          <Text style={styles.ctaText}>
            The sooner you catch an infestation, the easier and cheaper it is to eliminate. A professional inspection can confirm or rule out bed bugs quickly.
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

        {/* Why DIY Fails Section - At the bottom */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Why DIY Treatments Fail</Text>
          </View>
          <Text style={styles.sectionIntro}>
            Over 90% of DIY bed bug treatments fail completely. Here's why professional treatment is essential:
          </Text>
          
          {WHY_DIY_FAILS.map((reason) => (
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

          {/* Heat Treatment Callout */}
          <View style={styles.heatCallout}>
            <View style={styles.heatIcon}>
              <Ionicons name="flame" size={28} color={colors.accent} />
            </View>
            <View style={styles.heatContent}>
              <Text style={styles.heatTitle}>Professional Heat Treatment</Text>
              <Text style={styles.heatDescription}>
                Heat treatment raises room temperature to 120-140°F, killing all bed bugs and eggs in a single treatment. It's chemical-free, reaches hidden areas, and is the most effective solution available.
              </Text>
            </View>
          </View>
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
    lineHeight: 24,
  },
  // Life Stage Cards with Images
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageImageContainer: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    padding: spacing.sm,
  },
  stageImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.8,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
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
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  durationText: {
    ...typography.small,
    color: colors.accent,
  },
  // Signs Grid
  signsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  signCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  signDescription: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // Prevention Cards
  preventionCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.success + '30',
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  preventionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  preventionContent: {
    flex: 1,
  },
  preventionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  preventionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
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
    lineHeight: 18,
  },
  // Warning Cards (Why DIY Fails)
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
    lineHeight: 18,
  },
  // Heat Treatment Callout
  heatCallout: {
    flexDirection: 'row',
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  heatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  heatContent: {
    flex: 1,
  },
  heatTitle: {
    ...typography.heading3,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  heatDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
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
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.success + '40',
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
    lineHeight: 24,
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
