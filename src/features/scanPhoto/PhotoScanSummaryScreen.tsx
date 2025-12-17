/**
 * Photo Scan Summary Screen - Results, gallery, common misses, CTA
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { usePhotoScanStore } from './usePhotoScanStore';
import { SessionSummary } from './models';
import { PHOTO_SCAN_COPY } from './copy';
import { trackScanCompleted } from '../../services/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoScanSummary'>;

export const PhotoScanSummaryScreen: React.FC<Props> = ({ navigation }) => {
  const { session, completeSession, resetSession } = usePhotoScanStore();
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  useEffect(() => {
    const result = completeSession();
    setSummary(result);
    
    // Track scan completed
    if (result && session) {
      trackScanCompleted(
        session.roomType,
        result.completedSteps,
        result.totalSteps,
        result.photosCount,
        result.concernedPins,
        session.id
      );
    }
  }, []);

  if (!session || !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const handleContactExpert = () => {
    navigation.navigate('LeadFlow', { roomType: session.roomType });
  };

  const handleNextRoom = () => {
    resetSession();
    navigation.navigate('SelectRoom');
  };

  const photosWithUri = session.steps.filter((s) => s.photoUri);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={summary.concernedPins > 0 ? 'alert-circle' : 'checkmark-circle'}
              size={48}
              color={summary.concernedPins > 0 ? colors.warning : colors.success}
            />
          </View>
          <Text style={styles.title}>{PHOTO_SCAN_COPY.SUMMARY_COMPLETE}</Text>
          <Text style={styles.subtitle}>
            {session.roomType === 'bedroom' && 'Bedroom'}
            {session.roomType === 'hotel' && 'Hotel Room'}
            {session.roomType === 'living_room' && 'Living Room'} Inspection
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.completedSteps}</Text>
            <Text style={styles.statLabel}>of {summary.totalSteps} Steps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.photosCount}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={[styles.statCard, summary.concernedPins > 0 && styles.statCardWarning]}>
            <Text style={[styles.statValue, summary.concernedPins > 0 && styles.statValueWarning]}>
              {summary.concernedPins}
            </Text>
            <Text style={styles.statLabel}>Flagged Areas</Text>
          </View>
        </View>

        {/* Status message */}
        {summary.concernedPins > 0 ? (
          <View style={styles.warningMessage}>
            <Ionicons name="alert-circle" size={24} color={colors.warning} />
            <View style={styles.messageContent}>
              <Text style={styles.messageTitle}>Areas of Concern Noted</Text>
              <Text style={styles.messageText}>
                You marked {summary.concernedPins} area{summary.concernedPins > 1 ? 's' : ''} as concerning.
                Consider contacting a professional for evaluation.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.successMessage}>
            <Ionicons name="thumbs-up" size={24} color={colors.success} />
            <View style={styles.messageContent}>
              <Text style={styles.messageTitle}>Inspection Complete</Text>
              <Text style={styles.messageText}>
                You reviewed all areas. Remember, this is educational guidance only.
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons - Prominent placement */}
        <View style={styles.actionButtons}>
          <Button
            title="Inspect Next Room"
            onPress={handleNextRoom}
            variant="primary"
            size="large"
            icon={<Ionicons name="arrow-forward" size={20} color={colors.textOnPrimary} />}
            fullWidth
          />
          <Button
            title={PHOTO_SCAN_COPY.CTA_BUTTON}
            onPress={handleContactExpert}
            variant="outline"
            size="large"
            icon={<Ionicons name="call" size={18} color={colors.primary} />}
            fullWidth
          />
          <Button
            title="Back to Home"
            onPress={() => {
              resetSession();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }}
            variant="ghost"
            size="medium"
            icon={<Ionicons name="home-outline" size={18} color={colors.textSecondary} />}
            fullWidth
          />
        </View>

        {/* Photos Gallery */}
        {photosWithUri.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{PHOTO_SCAN_COPY.PHOTOS_GALLERY}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
              {photosWithUri.map((step) => (
                <View key={step.id} style={styles.galleryItem}>
                  <Image source={{ uri: step.photoUri }} style={styles.galleryImage} />
                  <Text style={styles.galleryLabel} numberOfLines={1}>
                    {step.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Common Misses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{PHOTO_SCAN_COPY.COMMON_MISSES_TITLE}</Text>
          <View style={styles.missesList}>
            {summary.commonMisses.map((miss, index) => (
              <View key={index} style={styles.missItem}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.missText}>{miss}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.ctaSupporting}>{PHOTO_SCAN_COPY.CTA_SUPPORTING}</Text>
          <Text style={styles.disclaimer}>{PHOTO_SCAN_COPY.CTA_DISCLAIMER}</Text>
        </View>

        {/* General caution */}
        <Text style={styles.caution}>{PHOTO_SCAN_COPY.GENERAL_CAUTION}</Text>
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
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  statCardWarning: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
  },
  statValue: {
    ...typography.heading2,
    color: colors.primary,
  },
  statValueWarning: {
    color: colors.warning,
  },
  statLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  warningMessage: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '12',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  successMessage: {
    flexDirection: 'row',
    backgroundColor: colors.success + '12',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  gallery: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  galleryItem: {
    marginRight: spacing.md,
    width: 120,
  },
  galleryImage: {
    width: 120,
    height: 90,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  galleryLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  missesList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  missItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  missText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  disclaimerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaSupporting: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  disclaimer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  caution: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

