/**
 * Summary Screen
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { CTASection } from '../components/CTASection';
import { COPY } from '../constants/copy';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useScanStore } from '../store/useScanStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export const SummaryScreen: React.FC<Props> = ({ navigation }) => {
  const { currentSession, completeSession, resetSession } = useScanStore();

  useEffect(() => {
    completeSession();
  }, []);

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No session data</Text>
      </SafeAreaView>
    );
  }

  const items = currentSession.items;
  const checkedCount = items.filter((i) => i.status === 'checked').length;
  const flaggedCount = items.filter((i) => i.status === 'flagged').length;
  const photosCount = items.filter((i) => i.photoUri).length;

  const handleContactExpert = () => {
    navigation.navigate('LeadFlow', { roomType: currentSession.roomType });
  };

  const handleNewScan = () => {
    resetSession();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          </View>
          <Text style={styles.title}>Scan Complete</Text>
          <Text style={styles.subtitle}>
            Here's a summary of your inspection
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={24} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {items.length}
            </Text>
            <Text style={styles.statLabel}>Areas Scanned</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-outline" size={24} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.success }]}>
              {checkedCount}
            </Text>
            <Text style={styles.statLabel}>Checked</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flag-outline" size={24} color={flaggedCount > 0 ? colors.danger : colors.textMuted} />
            <Text style={[styles.statValue, { color: flaggedCount > 0 ? colors.danger : colors.textMuted }]}>
              {flaggedCount}
            </Text>
            <Text style={styles.statLabel}>Flagged</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="camera-outline" size={24} color={colors.info} />
            <Text style={[styles.statValue, { color: colors.info }]}>
              {photosCount}
            </Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
        </View>

        {/* Status message */}
        {flaggedCount > 0 ? (
          <View style={styles.warningMessage}>
            <Ionicons name="alert-circle" size={24} color={colors.warning} />
            <View style={styles.messageContent}>
              <Text style={styles.messageTitle}>Areas of Concern Identified</Text>
              <Text style={styles.messageText}>
                You flagged {flaggedCount} area{flaggedCount > 1 ? 's' : ''} during your inspection.
                Consider contacting a professional for expert evaluation.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.successMessage}>
            <Ionicons name="thumbs-up" size={24} color={colors.success} />
            <View style={styles.messageContent}>
              <Text style={styles.messageTitle}>Inspection Complete</Text>
              <Text style={styles.messageText}>
                You checked {checkedCount} areas. Remember, this is educational
                guidance only. Regular inspections are recommended.
              </Text>
            </View>
          </View>
        )}

        {/* Room info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Room Type</Text>
            <Text style={styles.infoValue}>
              {currentSession.roomType === 'bedroom' && COPY.ROOM_BEDROOM}
              {currentSession.roomType === 'living_room' && COPY.ROOM_LIVING}
              {currentSession.roomType === 'hotel' && COPY.ROOM_HOTEL}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Completed</Text>
            <Text style={styles.infoValue}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Primary CTA */}
        <CTASection onPress={handleContactExpert} variant="full" />

        {/* Secondary actions */}
        <View style={styles.buttonGroup}>
          <Button
            title="Start New Scan"
            onPress={handleNewScan}
            variant="outline"
            size="large"
            icon={<Ionicons name="refresh" size={20} color={colors.accent} />}
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

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{COPY.GENERAL_CAUTION}</Text>
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
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.heading2,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  warningMessage: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  successMessage: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
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
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  buttonGroup: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  disclaimer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

