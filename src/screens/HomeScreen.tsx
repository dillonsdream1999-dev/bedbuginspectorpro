/**
 * Home Screen - Bed Bug Inspection Pro
 * LeadSnap-inspired clean, professional design
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '../components/Button';
import { COPY } from '../constants/copy';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const adminTapCount = useRef(0);
  const adminTapTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLinkPress = (route: 'Terms' | 'Privacy') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate(route);
  };

  const handleAdminAccess = () => {
    adminTapCount.current += 1;
    
    // Clear existing timeout
    if (adminTapTimeout.current) {
      clearTimeout(adminTapTimeout.current);
    }

    // If 5 taps within 2 seconds, navigate to admin
    if (adminTapCount.current >= 5) {
      adminTapCount.current = 0;
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      navigation.navigate('AdminLogin');
    } else {
      // Reset counter after 2 seconds
      adminTapTimeout.current = setTimeout(() => {
        adminTapCount.current = 0;
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Compact Hero Section */}
        <Animated.View
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#1A0505', '#2D0A0A', '#1A0505']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Pressable onPress={handleAdminAccess}>
                <View style={styles.iconBadge}>
                  <Ionicons name="bug" size={28} color={colors.primary} />
                </View>
              </Pressable>
              <Pressable onPress={handleAdminAccess}>
                <Text style={styles.appName}>{COPY.APP_NAME}</Text>
              </Pressable>
              <Text style={styles.tagline}>{COPY.APP_TAGLINE}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Primary CTA Card - Moved Up */}
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

        {/* Simplified Features - Compact Grid */}
        <View style={styles.section}>
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

        {/* Combined Learn & Help Card */}
        <View style={styles.actionCards}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.educationCardPressed,
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              navigation.navigate('BedBugEducation');
            }}
          >
            <Ionicons name="book-outline" size={20} color={colors.accent} />
            <Text style={styles.actionCardText}>Learn About Bed Bugs</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.educationCardPressed,
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              navigation.navigate('LeadFlow', {});
            }}
          >
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.actionCardText}>Contact Expert</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* Combined Privacy & Disclaimer */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={styles.infoText}>{COPY.PRIVACY_BADGE}</Text>
          </View>
          <Text style={styles.infoSmallText}>
            {COPY.HOME_NOT_DIAGNOSIS} {COPY.HOME_EDUCATIONAL}
          </Text>
        </View>

        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <Pressable
            onPress={() => handleLinkPress('Terms')}
            style={({ pressed }) => [
              pressed && styles.legalLinkPressed,
            ]}
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.legalSeparator}>•</Text>
          <Pressable
            onPress={() => handleLinkPress('Privacy')}
            style={({ pressed }) => [
              pressed && styles.legalLinkPressed,
            ]}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
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
  // Hero gradient section - More compact
  heroGradient: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 61, 0, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 61, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.appTitle,
    fontSize: 28,
    lineHeight: 34,
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
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // CTA Card - Moved closer to hero
  ctaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...(Platform.OS === 'ios' ? shadows.lg : { elevation: 8 }),
  },
  ctaCardTitle: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  // Features section - More compact
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  featureList: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  featureContent: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // Combined action cards
  actionCards: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    ...(Platform.OS === 'ios' ? shadows.sm : { elevation: 2 }),
  },
  actionCardText: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  educationCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  // Combined info card
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.success,
  },
  infoSmallText: {
    ...typography.small,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
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
  legalLinkPressed: {
    opacity: 0.6,
  },
});

